import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import 'dotenv/config';

export const pool: Pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'Info2009',
  database: process.env.MYSQL_DATABASE || 'suivi_pedagogique',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

export async function query<T extends RowDataPacket[] | ResultSetHeader>(sql: string, values: unknown[] = []): Promise<T> {
  const [rows] = await pool.query<T>(sql, values);
  return rows;
}

export async function checkDatabase(): Promise<void> {
  await pool.query('SELECT 1');
}
