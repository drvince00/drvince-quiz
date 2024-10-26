import {
  createConnection
} from "@/lib/db";
import {
  NextResponse
} from "next/server";
import path from 'path';
import fs from 'fs/promises';

export async function GET(request) {
  const id = request.nextUrl.pathname.split('/').pop();

  try {
    const db = await createConnection();

    const [quiz] = await db.query("SELECT * FROM TOPIK WHERE id = ?", [id]);

    if (quiz.length === 0) {
      return NextResponse.json({
        message: "퀴즈를 찾을 수 없습니다."
      }, {
        status: 404
      });
    }

    return NextResponse.json(quiz[0]);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
  }
}

export async function DELETE(request) {
  const id = request.nextUrl.pathname.split('/').pop();

  try {
    const db = await createConnection();

    // 퀴즈 정보 가져오기
    const [quiz] = await db.query("SELECT * FROM TOPIK WHERE id = ?", [id]);

    if (quiz.length === 0) {
      return NextResponse.json({
        message: "퀴즈를 찾을 수 없습니���."
      }, {
        status: 404
      });
    }

    // 이미지가 있다면 삭제
    if (quiz[0].pic_path) {
      const imagePath = path.join(process.cwd(), 'public', quiz[0].pic_path);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('이미지 파일 삭제 실패:', error);
      }
    }

    // 데이터베이스에서 퀴즈 삭제
    await db.query("DELETE FROM TOPIK WHERE id = ?", [id]);

    return NextResponse.json({
      message: "퀴즈가 성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
  }
}

export async function PUT(request) {
  const id = request.nextUrl.pathname.split('/').pop();
  const data = await request.json();

  try {
    const db = await createConnection();

    // 퀴즈 업데이트 (이미지와 타입은 변경하지 않음)
    const [result] = await db.query(
      "UPDATE TOPIK SET question = ?, option1 = ?, option2 = ?, option3 = ?, option4 = ?, ans = ?, level = ? WHERE id = ?",
      [data.question, data.option1, data.option2, data.option3, data.option4, data.ans, data.level, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({
        message: "퀴즈를 찾을 수 없습니다."
      }, {
        status: 404
      });
    }

    return NextResponse.json({
      message: "퀴즈가 성공적으로 수정되었습니다."
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({
      error: error.message
    }, {
      status: 500
    });
  }
}
