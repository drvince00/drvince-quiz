import mysql from 'mysql2/promise';

export async function createConnection() {
    try {
      console.log('DB 연결 설정 확인:', {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        // password: "***", // 보안상 실제 값은 로그에 출력하지 않음
        database: process.env.DATABASE_NAME
      });

      const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectTimeout: 60000, // 타임아웃 시간 증가
      waitForConnections: true
    });
    return connection;
  } catch (error) {
    console.error('DB 연결 에러:', error);
    throw error;
  }
  }
