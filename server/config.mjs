import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });
const database = process.env.DB_NAME || 'themor_20602';
if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error('DB_NAME에는 영문, 숫자, 밑줄만 사용할 수 있습니다.');
export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database,
  charset: 'utf8mb4',
  dateStrings: true,
  decimalNumbers: true,
  connectTimeout: 7000,
};
export const port = Number(process.env.PORT || 3002);
export const host = process.env.HOST || '127.0.0.1';
