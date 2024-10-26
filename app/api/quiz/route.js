import {
  createConnection
} from "@/lib/db";
import {
  NextResponse
} from "next/server";
import {
  writeFile,
  unlink
} from 'fs/promises';
import path from 'path';

let quizSessions = {};

export async function GET(request) {
  const {
    searchParams
  } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const cat = searchParams.get('cat') || 'all';
  const order = searchParams.get('order') || 'RAND()';
  const limit = searchParams.get('limit') || 10;

  // 기존 세션이 있으면 해당 퀴즈 데이터 반환
  if (sessionId && quizSessions[sessionId]) {
    return NextResponse.json(quizSessions[sessionId]);
  }

  try {
    const db = await createConnection();
    let sql = "SELECT * FROM TOPIK";
    const sqlParams = [];

    if (cat !== 'all') {
      sql += " WHERE level = ?";
      sqlParams.push(cat);
    }

    // order 파라미터 처리
    if (order === 'id') {
      sql += " ORDER BY id";
    } else {
      sql += " ORDER BY RAND()";
    }

    sql += " LIMIT ?";
    sqlParams.push(Number(limit));

    const [quiz] = await db.query(sql, sqlParams);

    // 세션 ID가 없는 경우에만 새 세션 생성
    if (!sessionId) {
      const newSessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      quizSessions[newSessionId] = {
        quiz,
        createdAt: new Date()
      };

      // 오래된 세션 정리 (예: 1시간 이상 된 세션)
      const now = new Date();
      Object.keys(quizSessions).forEach(key => {
        if (now - quizSessions[key].createdAt > 3600000) {
          delete quizSessions[key];
        }
      });

      return NextResponse.json({
        sessionId: newSessionId,
        quiz
      });
    }

    // 세션 ID가 있지만 quizSessions에 없는 경우 (예: 서버 재시작 후)
    return NextResponse.json({
      quiz
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
      pic_path = `/quiz/${filename}`;
      const filepath = path.join(process.cwd(), 'public', 'quiz', filename);
      await writeFile(filepath, buffer);
    }

    // MySQL에 데이터 저장
    const sql = `
      INSERT INTO TOPIK (question, option1, option2, option3, option4, ans, level, type, pic_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      formData.get('question'),
      formData.get('option1'),
      formData.get('option2'),
      formData.get('option3'),
      formData.get('option4'),
      formData.get('ans'),
      formData.get('level'),
      formData.get('type'),
      pic_path,
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
