import mysql from 'mysql2/promise';

export async function createConnection() {
    try {
      const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      connectTimeout: 10000 // 타임아웃 시간 증가
      });
    console.log('DB 연결 성공');
    return connection;
  } catch (error) {
    console.error('DB 연결 실패:', error);
    throw error;
  }
}
