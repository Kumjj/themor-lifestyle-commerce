import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { dbConfig } from './config.mjs';

export const pool = mysql.createPool({ ...dbConfig, connectionLimit: 8, waitForConnections: true, enableKeepAlive: true });

const extraTables = [
  `CREATE TABLE IF NOT EXISTS banners (
    id VARCHAR(50) PRIMARY KEY, title VARCHAR(255) NOT NULL, subtitle TEXT,
    image_url TEXT, cta_text VARCHAR(100), category_link VARCHAR(50), badge_text VARCHAR(100),
    bg_color VARCHAR(100), text_color VARCHAR(100), active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(50) PRIMARY KEY, title VARCHAR(255) NOT NULL, category VARCHAR(50),
    author VARCHAR(100), content TEXT, is_important BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash CHAR(64) PRIMARY KEY, user_id VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id), INDEX (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY, product_id VARCHAR(50) NOT NULL, user_id VARCHAR(50) NOT NULL,
    rating TINYINT NOT NULL, content TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (product_id), FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS app_migrations (
    id VARCHAR(100) PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

export async function initializeDatabase() {
  // Only CREATE statements are extracted. The destructive DROP/INSERT script is never executed.
  try { await pool.query('SELECT 1'); }
  catch (error) {
    if (error.code !== 'ER_BAD_DB_ERROR') throw error;
    const bootstrap = await mysql.createConnection({ ...dbConfig, database: undefined });
    try { await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); }
    finally { await bootstrap.end(); }
  }
  const source = await readFile(new URL('../themor_mysql_init.sql', import.meta.url), 'utf8');
  const definitions = [...source.matchAll(/CREATE TABLE `\w+`\s*\([\s\S]*?ENGINE=InnoDB[^;]*;/g)];
  if (definitions.length !== 7) throw new Error('기본 테이블 정의 7개를 확인할 수 없습니다.');
  for (const [statement] of definitions) await pool.query(statement.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS '));
  const additions = {
    users: { deleted_at: 'DATETIME NULL' },
    products: { seller: 'VARCHAR(150) NULL', specs: 'JSON NULL', deleted_at: 'DATETIME NULL' },
    orders: { recipient_detail: 'VARCHAR(255) NULL', payment_method: 'VARCHAR(255) NULL' },
    order_items: { product_name: 'VARCHAR(150) NULL', image_url: 'TEXT NULL' },
    partner_requests: { applicant_name: 'VARCHAR(100) NULL', applicant_email: 'VARCHAR(255) NULL', target_product_id: 'VARCHAR(50) NULL' },
  };
  for (const [table, columns] of Object.entries(additions)) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
    for (const [column, type] of Object.entries(columns)) {
      if (!rows.some(row => row.Field === column)) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${type}`);
    }
  }
  for (const statement of extraTables) await pool.query(statement);
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
}

export async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
