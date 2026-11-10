import { createApp } from './app.mjs';
import { pool, initializeDatabase } from './database.mjs';
import { seedDatabase } from './seed.mjs';
import { port, host, dbConfig } from './config.mjs';

const production = process.argv.includes('--production');
try {
  await initializeDatabase();
  await seedDatabase();
  const app = createApp({ production });
  const listenPort = production ? Number(process.env.WEB_PORT || 3001) : port;
  const server = app.listen(listenPort, host, () => {
    console.log(`THEMOR ${production ? '사이트' : 'API'}: http://${host}:${listenPort}`);
    console.log(`MySQL 연결: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (${dbConfig.user})`);
  });
  server.on('error', async error => { console.error(error.code === 'EADDRINUSE' ? `${listenPort} 포트가 사용 중입니다.` : '서버를 열 수 없습니다.'); await pool.end(); process.exit(1); });
  const shutdown = () => { app.locals.dispose(); server.close(async () => { await pool.end(); process.exit(0); }); server.closeIdleConnections(); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error(`MySQL 연결 준비 실패 (${error.code || error.name}).`);
  if (error.code === 'ER_ACCESS_DENIED_ERROR') console.error('server/.env의 DB_USER와 DB_PASSWORD를 확인해 주세요.');
  else if (error.code === 'ECONNREFUSED') console.error('MySQL 서버 서비스와 DB_HOST/DB_PORT를 확인해 주세요.');
  else console.error('DB 계정 권한과 테이블 구조를 확인해 주세요. 기존 테이블은 삭제하지 않았습니다.');
  await pool.end();
  process.exit(1);
}
