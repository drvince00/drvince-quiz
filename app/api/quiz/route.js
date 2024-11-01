import {
  createConnection
} from "@/lib/db";
import {
  NextResponse
} from "next/server";
import {
  Octokit
} from "@octokit/rest";
import path from 'path';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const GITHUB_CONFIG = {
  owner: "drvince00",
  repo: "drvince-quiz",
  branch: "main"
};

let quizSessions = {};

// GitHub에 이미지 업로드 함수
async function uploadImageToGitHub(imageBuffer, fileName) {
  try {
    const content = imageBuffer.toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      ...GITHUB_CONFIG,
      path: `public/quiz/${fileName}`,
      message: `Add quiz image ${fileName}`,
      content: content,
    });

    return `/quiz/${fileName}`;
  } catch (error) {
    console.error('GitHub 업로드 에러:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// GitHub에서 이미지 삭제 함수
async function deleteImageFromGitHub(filePath) {
  try {
    // 현재 파일의 SHA 가져오기
    const {
      data: fileData
    } = await octokit.repos.getContent({
      ...GITHUB_CONFIG,
      path: `public${filePath}`,
    });

    // 파일 삭제
    await octokit.repos.deleteFile({
      ...GITHUB_CONFIG,
      path: `public${filePath}`,
      message: `Delete quiz image ${path.basename(filePath)}`,
      sha: fileData.sha,
    });
  } catch (error) {
    console.error('GitHub 삭제 에러:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function GET(request) {
  console.log('GET 요청 시작');
  const {
    searchParams
  } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const questType = searchParams.get('questType') || 'All';
  const order = searchParams.get('order') || 'RAND()';
  const limit = parseInt(searchParams.get('limit')) || 10;
  const page = parseInt(searchParams.get('page')) || 1;
  const offset = (page - 1) * limit;

  // 기존 세션 처리 로직 유지
  if (sessionId && quizSessions[sessionId]) {
    return NextResponse.json(quizSessions[sessionId]);
  }

  try {
    console.log('데이터베이스 연결 시도...');
    const db = await createConnection();
    console.log('데이터베이스 연결 성공!');

    let sql = "SELECT * FROM QUIZ";
    let countSql = "SELECT COUNT(*) as total FROM QUIZ";
    const sqlParams = [];
    const countSqlParams = [];

    // questType 파라미터 처리
    if (questType !== 'All') {
      sql += " WHERE quest_type = ?";
      countSql += " WHERE quest_type = ?";
      sqlParams.push(questType);
      countSqlParams.push(questType);
    }

    // order 파라미터 처리
    if (order === 'id') {
      sql += " ORDER BY id";
    } else {
      sql += " ORDER BY RAND()";
    }

    sql += " LIMIT ? OFFSET ?";
    sqlParams.push(limit, offset);

    const [quiz] = await db.query(sql, sqlParams);
    // console.log('쿼리 결과:', quiz);

    const [countResult] = await db.query(countSql, countSqlParams);
    console.log('카운트 결과:', countResult);

    const total = countResult[0].total;
    console.log('총 레코드 수:', total);

    // 세션 ID가 없는 경우에만 새 세션 생성 (기존 로직 유지)
    if (!sessionId) {
      const newSessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
      quizSessions[newSessionId] = {
        quiz,
        createdAt: new Date()
      };

      // 오래된 세션 정리 (기존 로직 유지)
      const now = new Date();
      Object.keys(quizSessions).forEach(key => {
        if (now - quizSessions[key].createdAt > 3600000) {
          delete quizSessions[key];
        }
      });

      return NextResponse.json({
        sessionId: newSessionId,
        quiz,
        currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
      });
    }

    // 세션 ID가 있지만 quizSessions에 없는 경우 (기존 로직 유지)
    return NextResponse.json({
      quiz,
      currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
    });

  } catch (error) {
    console.error('상세 에러 정보:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    return NextResponse.json({
      error: error.message,
        details: {
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        }
    }, {
      status: 500
    });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const db = await createConnection();

    // 이미지 처리
    const image = formData.get('image');
    let pic_path = '';
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = Date.now() + '_' + image.name.split('\\').pop().split('/').pop();
      // GitHub에 이미지 업로드
      pic_path = await uploadImageToGitHub(buffer, filename);
    }

    // MySQL에 데이터 저장
    const sql = `
      INSERT INTO QUIZ(question, option1, option2, option3, option4, ans, type, pic_path, quest_type)
      VALUES( ? , ? , ? , ? , ? , ? , ? , ? , ? )
    `;
    const values = [
      formData.get('question'),
      formData.get('option1'),
      formData.get('option2'),
      formData.get('option3'),
      formData.get('option4'),
      formData.get('ans'),
      formData.get('type'),
      pic_path,
      formData.get('quest_type'),
    ];

    await db.query(sql, values);

    return NextResponse.json({
      message: '퀴즈가 성공적으로 추가되었습니다.'
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
    }
    }

    export async function DELETE(request) {
        try {
          const {
            searchParams
          } = new URL(request.url);
          const id = searchParams.get('id');
          const db = await createConnection();

          // 이미지 경로 조회
          const [quiz] = await db.query('SELECT pic_path FROM QUIZ WHERE id = ?', [id]);

          if (quiz[0] ? .pic_path) {
            // GitHub에서 이미지 삭제
            await deleteImageFromGitHub(quiz[0].pic_path);
          }

          // DB에서 레코드 삭제
          await db.query('DELETE FROM QUIZ WHERE id = ?', [id]);

    return NextResponse.json({
      message: '퀴즈가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
  }
}
