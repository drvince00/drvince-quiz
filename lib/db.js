import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 3307,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
export async function createConnection() {
    try {
      // 연결 테스트
      await pool.getConnection();
      console.log('DB 연결 풀 생성 성공');
    return pool;
  } catch (error) {
    console.error('DB 연결 풀 생성 실패:', error);
    throw error;
  }
}
