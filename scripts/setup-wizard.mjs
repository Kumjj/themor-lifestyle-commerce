import mysql from 'mysql2/promise';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const envPath = fileURLToPath(new URL('../server/.env', import.meta.url));

function printBanner() {
  console.log('\n============================================================');
  console.log('   THEMOR 라이프스타일 커머스 원클릭 자동 설치 & 이식 마법사');
  console.log('   대상 데이터베이스: themor_20602 (MySQL 8.0+)');
  console.log('============================================================\n');
}

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--password=')) args.password = arg.split('=')[1];
    if (arg.startsWith('--user=')) args.user = arg.split('=')[1];
    if (arg.startsWith('--host=')) args.host = arg.split('=')[1];
    if (arg.startsWith('--port=')) args.port = Number(arg.split('=')[1]);
  }
  return args;
}

function ask(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans.trim()); }));
}

async function testConnection(config) {
  try {
    const conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: 3000,
    });
    await conn.query('SELECT 1');
    await conn.end();
    return true;
  } catch {
    return false;
  }
}

async function resolveCredentials() {
  const cliArgs = parseArgs();
  const host = cliArgs.host || process.env.DB_HOST || '127.0.0.1';
  const port = cliArgs.port || Number(process.env.DB_PORT || 3306);
  const user = cliArgs.user || process.env.DB_USER || 'root';

  console.log(`[1/4] MySQL 연결 정보를 확인하는 중입니다... (${host}:${port}, 계정: ${user})`);

  let existingPassword = null;
  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, 'utf8');
      const match = content.match(/^DB_PASSWORD=["']?(.*?)["']?$/m);
      if (match) existingPassword = match[1];
    } catch {}
  }

  const candidates = [
    cliArgs.password,
    process.env.DB_PASSWORD,
    existingPassword,
    '',
    'Aa7!CVU2L6n-mMpZhPYwxQ76iRFka1oyR9r4',
    '1234',
    'root',
  ].filter(p => p !== undefined && p !== null);

  for (const candidate of candidates) {
    process.stdout.write(`  - 비밀번호 시도 중 (${candidate ? '설정된 비밀번호' : '빈 비밀번호'})... `);
    const ok = await testConnection({ host, port, user, password: candidate });
    if (ok) {
      console.log('✓ 연결 성공!');
      return { host, port, user, password: candidate };
    }
    console.log('실패');
  }

  if (process.stdin.isTTY) {
    console.log('\n자동 감지 후보로 접속되지 않았습니다.');
    const inputPwd = await ask(`MySQL '${user}' 계정의 비밀번호를 입력해 주세요: `);
    const ok = await testConnection({ host, port, user, password: inputPwd });
    if (ok) {
      console.log('✓ 사용자 입력 비밀번호로 연결 성공!');
      return { host, port, user, password: inputPwd };
    }
  }

  throw new Error(`MySQL (${host}:${port}) 접속에 실패했습니다. MySQL 서버가 실행 중인지, root 비밀번호가 맞는지 확인해 주세요.`);
}

async function writeEnvFile({ host, port, user, password }) {
  console.log('\n[2/4] server/.env 설정 파일을 생성 및 저장합니다...');
  const envContent = [
    `DB_HOST=${host}`,
    `DB_PORT=${port}`,
    `DB_USER=${user}`,
    `DB_PASSWORD=${JSON.stringify(password)}`,
    `DB_NAME=themor_20602`,
    `PORT=3002`,
    `HOST=127.0.0.1`,
  ].join('\n') + '\n';

  writeFileSync(envPath, envContent, 'utf8');
  console.log('✓ server/.env 설정 파일 저장 완료 (DB_NAME=themor_20602)');
}

async function setupDatabase() {
  console.log('\n[3/4] themor_20602 스키마 및 초기 데이터를 데이터베이스에 이식합니다...');
  const { initializeDatabase, pool } = await import('../server/database.mjs');
  const { seedDatabase } = await import('../server/seed.mjs');

  await initializeDatabase();
  console.log('✓ 테이블 스키마 생성 및 필드 구조화 완료');

  await seedDatabase();
  console.log('✓ 상품, 회원, 카테고리, 배너, 공지사항 기초 데이터 이식 완료');

  console.log('\n[4/4] 이식 결과 검증 중...');
  const [[{ userCount }]] = await pool.query('SELECT COUNT(*) AS userCount FROM users');
  const [[{ prodCount }]] = await pool.query('SELECT COUNT(*) AS prodCount FROM products');
  const [[{ bannerCount }]] = await pool.query('SELECT COUNT(*) AS bannerCount FROM banners');
  const [[{ noticeCount }]] = await pool.query('SELECT COUNT(*) AS noticeCount FROM notices');
  const [[{ orderCount }]] = await pool.query('SELECT COUNT(*) AS orderCount FROM orders');

  console.log(`  - 등록된 회원: ${userCount}명`);
  console.log(`  - 등록된 상품: ${prodCount}개`);
  console.log(`  - 배너/공지: 배너 ${bannerCount}개, 공지 ${noticeCount}개`);
  console.log(`  - 기본 주문내역: ${orderCount}건`);

  await pool.end();
}

async function run() {
  printBanner();
  try {
    const creds = await resolveCredentials();
    await writeEnvFile(creds);
    await setupDatabase();

    console.log('\n============================================================');
    console.log('🎉 THEMOR 이식 및 설치가 성공적으로 완료되었습니다!');
    console.log('============================================================');
    console.log('\n[서버 시작 방법]');
    console.log('  1. 윈도우 탐색기에서 start.bat 더블클릭');
    console.log('  2. 또는 터미널에서: npm run dev\n');
    console.log('[접속 주소]');
    console.log('  ➜ 쇼핑몰 웹사이트: http://localhost:3001');
    console.log('  ➜ REST API 서버:   http://localhost:3002\n');
    console.log('[기본 테스트 계정]');
    console.log('  - 일반회원:    아이디: sunrin  /  비밀번호: 1234');
    console.log('  - 사내관리자:  아이디: kjj     /  비밀번호: 1234\n');
  } catch (error) {
    console.error('\n❌ 설치 마법사 실행 중 오류가 발생했습니다:');
    console.error(error.message);
    process.exit(1);
  }
}

run();
