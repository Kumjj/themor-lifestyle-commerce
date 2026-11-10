import { pool, initializeDatabase } from './database.mjs';
import { seedDatabase } from './seed.mjs';
import { dbConfig } from './config.mjs';
import { reports } from './reports.mjs';

try {
  const command = process.argv[2] || 'check';
  if (command === 'setup') { await initializeDatabase(); await seedDatabase(); console.log('테이블 준비 및 초기 자료 저장 완료. 기존 행은 덮어쓰거나 삭제하지 않았습니다.'); }
  else if (command === 'check') {
    const [[row]] = await pool.query('SELECT CURRENT_USER() AS account, DATABASE() AS db, VERSION() AS version');
    console.table([row]);
    const [tables] = await pool.query('SHOW TABLES'); console.table(tables);
  } else if (command === 'query') {
    const sql = process.argv.slice(3).join(' ').trim();
    if (!/^(SELECT|SHOW|DESCRIBE|DESC|EXPLAIN)\b/i.test(sql) || /\bINTO\s+(OUTFILE|DUMPFILE)\b/i.test(sql)) throw new Error('SELECT, SHOW, DESCRIBE, EXPLAIN 조회문을 입력해 주세요.');
    const [rows] = await pool.query(sql); console.table(rows);
  } else if (command === 'report') {
    const report = reports.find(item => item.id === Number(process.argv[3] || 1));
    if (!report) throw new Error('조회 번호는 1~5입니다.');
    console.log(report.sql); const [rows] = await pool.query(report.sql); console.table(rows);
  } else throw new Error('지원하지 않는 명령입니다.');
} catch (error) {
  console.error(`DB 작업 실패: ${error.code || error.message}`);
  if (error.code === 'ER_ACCESS_DENIED_ERROR') console.error(`server/.env에서 ${dbConfig.user} 계정의 비밀번호를 확인해 주세요.`);
  process.exitCode = 1;
} finally { await pool.end(); }
