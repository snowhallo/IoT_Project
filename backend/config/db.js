import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo Connection Pool kết nối MySQL
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iot_project_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Hàm kiểm tra kết nối Database
export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] MySQL connected successfully to database: ${process.env.DB_NAME || 'iot_project_db'}`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[DB] Cannot connect to MySQL (${error.message}). Please ensure MySQL service is running.`);
    return false;
  }
}
