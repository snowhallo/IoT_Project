import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('[DB Init] Initializing MySQL Database for IoT Project...');

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('[DB Init] Connected to MySQL Server.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('[DB Init] Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('[DB Init] Created database `iot_project_db` and tables successfully.');

    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('[DB Init] Executing seed.sql...');
    await connection.query(seedSql);
    console.log('[DB Init] Seed data inserted successfully.');

    await connection.end();
    console.log('[DB Init] Database setup completed successfully.');
  } catch (error) {
    console.error('[DB Init Error]:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Hint: MySQL service is not running or port 3306 is inaccessible.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Hint: Access denied for MySQL user. Check DB_PASSWORD in `backend/.env`.');
    }
  }
}

initDatabase();
