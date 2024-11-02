import mysql from 'mysql2/promise';

export async function createConnection() {
    try {
    //   console.log('DB 연결 설정 확인:', {
    //     host: process.env.DATABASE_HOST,
    //     user: process.env.DATABASE_USER,
    //     // password: "***", // 보안상 실제 값은 로그에 출력하지 않음
    //     database: process.env.DATABASE_NAME
    //   });

    //   const connection = await mysql.createConnection({
    //   host: process.env.DATABASE_HOST,
    //   user: process.env.DATABASE_USER,
    //   password: process.env.DATABASE_PASSWORD,
    //   database: process.env.DATABASE_NAME,
    //   connectTimeout: 60000, // 연결 타임아웃
    //     waitForConnections: true, // 연결 대기 허용
    //     connectionLimit: 10, // 최대 연결 수
    //     queueLimit: 0 // 큐 제한 없음
    // });
    // return connection;
    if (!pool) {
      pool = mysql.createPool({
            host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT || 3307,
        user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
        waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });
    }
    return pool;
  } catch (error) {
    console.error('DB 연결 에러:', error);
    throw error;
  }
  }
