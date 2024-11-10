import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import path from 'path';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const GITHUB_CONFIG = {
  owner: 'drvince00',
  repo: 'drvince-quiz',
  branch: 'main',
};

// GitHub 이미지 업로드 함수
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

// GitHub 이미지 삭제 함수
async function deleteImageFromGitHub(filePath) {
  try {
    const { data: fileData } = await octokit.repos.getContent({
      ...GITHUB_CONFIG,
      path: `public${filePath}`,
    });
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

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const question = searchParams.get('question');
  const questTypes = searchParams.getAll('questType');
  const limit = parseInt(searchParams.get('limit')) || 10;
  const page = parseInt(searchParams.get('page')) || 1;
  const offset = (page - 1) * limit;
  const isRandom = searchParams.get('random') === 'true';

  try {
    const db = await createConnection();

    // ID로 검색하는 경우 (다른 조건 무시)
    if (searchParams.has('id')) {
      const [quiz] = await db.query('SELECT * FROM QUIZ WHERE id = ?', [id]);
      if (quiz.length === 0) {
        return NextResponse.json({ message: '퀴즈를 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json(quiz[0]);
    }

    // 퀴즈 목록 조회 (ID 검색이 아닌 경우)
    let sql = 'SELECT * FROM QUIZ';
    let countSql = 'SELECT COUNT(*) as total FROM QUIZ';
    const sqlParams = [];
    const countSqlParams = [];

    // WHERE 절 구성 (기존 questTypes 조건)
    if (questTypes.length > 0) {
      const placeholders = questTypes.map(() => '?').join(', ');
      sql += ` WHERE quest_type IN (${placeholders})`;
      countSql += ` WHERE quest_type IN (${placeholders})`;
      sqlParams.push(...questTypes);
      countSqlParams.push(...questTypes);
    }

    // question 검색 조건 추가 (ID 검색이 아닌 경우에만)
    if (searchParams.has('question')) {
      const whereClause = sql.includes('WHERE') ? ' AND' : ' WHERE';
      sql += `${whereClause} question LIKE ?`;
      countSql += `${whereClause} question LIKE ?`;
      sqlParams.push(`%${question}%`);
      countSqlParams.push(`%${question}%`);
    }

    // 정렬 및 페이징
    if (isRandom) {
      sql += ' ORDER BY RAND() LIMIT ?';
      sqlParams.push(limit);
    } else {
      sql += ' ORDER BY id ASC LIMIT ? OFFSET ?';
      sqlParams.push(limit, offset);
    }

    console.log('sql:', sql);
    const [quiz] = await db.query(sql, sqlParams);
    const [countResult] = await db.query(countSql, countSqlParams);
    const total = countResult[0].total;

    return NextResponse.json({
      quiz,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error('DB 에러:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      pic_path = await uploadImageToGitHub(buffer, filename);
    }

    // MySQL에 데이터 저장
    const sql = `
      INSERT INTO QUIZ(question, option1, option2, option3, option4, ans, type, pic_path, quest_type)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    return NextResponse.json({ message: '퀴즈가 성공적으로 추가되었습니다.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const db = await createConnection();

    const [result] = await db.query(
      'UPDATE QUIZ SET question = ?, option1 = ?, option2 = ?, option3 = ?, option4 = ?, ans = ?, quest_type = ? WHERE id = ?',
      [
        data.question,
        data.option1,
        data.option2,
        data.option3,
        data.option4,
        data.ans,
        data.quest_type,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: '퀴즈를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '퀴즈가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    const db = await createConnection();

    // 이미지 경로 조회
    const [quiz] = await db.query('SELECT pic_path FROM QUIZ WHERE id = ?', [id]);

    if (quiz[0]?.pic_path) {
      // GitHub에서 이미지 삭제
      await deleteImageFromGitHub(quiz[0].pic_path);
    }

    // DB에서 레코드 삭제
    await db.query('DELETE FROM QUIZ WHERE id = ?', [id]);

    return NextResponse.json({ message: '퀴즈가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
