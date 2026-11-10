# THEMOR MySQL 연동

사이트 코드는 상품·회원·주문·문의·배너·공지를 MySQL API로 읽고 저장하도록 구성돼 있습니다. 실제 DB 인증과 연결 확인은 `server/.env` 설정 후 진행합니다. 장바구니와 관심 상품은 브라우저별로 보관합니다. DB 접속 계정 `root`와 사이트에서 로그인하는 관리자 `kjj`는 서로 다른 계정입니다. Workbench에 저장된 `KJJ`는 연결 설정에 입력돼 있던 값이며, 실제 DB 사용자 생성 여부가 확인된 것은 아닙니다.

## 처음 연결하기

1. Windows의 MySQL80 서비스가 실행 중인지 확인합니다. Workbench 창을 열어둘 필요는 없습니다.
2. `server/.env`의 `DB_PASSWORD=`에 실제 MySQL `root` 계정의 비밀번호를 입력합니다. `#`, 공백 등이 포함되면 전체 값을 큰따옴표로 감싸세요. 이 파일은 Git에서 제외되며 브라우저에 전달되지 않습니다.
3. 프로젝트 폴더에서 실행합니다.

```powershell
npm run db:setup
npm run db:check
npm run dev
```

사이트: `http://localhost:3001` / 개발 API: `http://127.0.0.1:3002/api/health`

`npm run dev`는 API와 Vite를 함께 실행합니다. 기존 Vite가 3001 포트를 사용 중이면 이전 터미널을 Ctrl+C로 종료한 뒤 실행하세요. 두 프로그램을 따로 실행하려면 `npm run dev:api`, `npm run dev:web`를 사용합니다.

발표용 빌드로 실행하려면 `npm start`를 사용합니다. 빌드 후 하나의 서버에서 사이트와 API를 `http://localhost:3001`로 제공합니다. 공개 터널 설정은 아직 포함하지 않습니다.

## 기존 DB 보존

연결 시 기존 테이블을 삭제하지 않습니다. 없는 테이블과 필요한 열만 추가합니다. 상품 테이블에 자료가 이미 있으면 프로젝트 기본 상품으로 덮어쓰지 않습니다. 초기 데이터가 한 번 저장되면 서버를 다시 실행해도 삭제한 상품이 다시 생기지 않습니다.

**`themor_mysql_init.sql` 전체를 기존 DB에 실행하지 마세요.** 이 파일에는 기존 테이블 삭제 구문이 있습니다. 새 API는 이 파일에서 CREATE TABLE 정의만 추출해 `IF NOT EXISTS`로 실행하고, DROP 및 기존 INSERT 구문은 실행하지 않습니다.

새 DB에 생성되는 사이트 테스트 계정은 일반 회원 `sunrin`, 관리자 `kjj`이며 초기 비밀번호는 둘 다 `1234`입니다. 기존 회원이 있으면 비밀번호와 회원 정보는 덮어쓰지 않습니다. 신규 회원가입 비밀번호는 8자 이상입니다. DB에 새로 저장되는 비밀번호는 scrypt 해시입니다. 기존 SQL의 평문 비밀번호는 올바른 로그인 시 해시로 전환됩니다.

## 이전 브라우저 자료 가져오기

이전에 상품을 등록했던 **같은 브라우저·같은 사이트 주소**로 접속하고 관리자 로그인 후 관리자 화면의 **MySQL로 가져오기**를 누릅니다. 브라우저에 있던 상품·주문·신청·배너·공지를 추가합니다. 같은 ID는 건너뛰고 기존 MySQL 자료와 브라우저 원본은 삭제하지 않습니다. 이관한 후기 없는 상품에는 임의의 평점과 후기를 생성하지 않습니다. 삭제된 상품을 참조해 관계를 복구할 수 없는 이전 주문은 건너뜁니다.

## 명령어로 조회하기

```powershell
npm run db:query -- "SELECT id, name, price, stock, seller_id FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 20"
npm run db:query -- "SELECT id, username, name, role FROM users WHERE deleted_at IS NULL"
npm run db:query -- "SELECT id, user_id, total_amount, status FROM orders ORDER BY order_date DESC"
npm run db:report -- 1
npm run db:report -- 2
```

`db:report`의 1~5번은 상품 JOIN, 주문 JOIN, 카테고리 집계, 회원 주문 집계, 판매자 집계입니다. 사이트 관리자 화면의 SQL 조회와 같은 SQL을 실행합니다. 서버에 임의 SQL을 보내는 공개 API는 없습니다.

MySQL 자체 명령 프롬프트에서 확인하려면 다음 명령을 사용합니다. 비밀번호는 프롬프트에서 입력하며 명령에 직접 쓰지 않습니다.

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h 127.0.0.1 -P 3306 -u root -p --default-character-set=utf8mb4 themor_20602
```

접속 후:

```sql
SHOW TABLES;
SELECT id, name, price, stock FROM products WHERE deleted_at IS NULL;
SELECT o.id, p.name, oi.quantity, oi.unit_price
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id;
```

상품 삭제는 `deleted_at`을 기록해 주문 이력을 유지합니다. 일반 상품 조회에는 `WHERE deleted_at IS NULL` 조건을 사용합니다. 주문은 서버에서 단가와 재고를 확인하고 트랜잭션으로 주문·주문 품목 저장과 재고 차감을 처리합니다. 실제 카드 결제망은 연결하지 않았습니다.

## 확인 명령

```powershell
npm run test:api
npm run test:db
npm run build
```

`test:db`는 동일한 MySQL 계정으로 별도의 `themor_test_...` 임시 DB를 만들어 실제 API와 SQL을 검증하고 제거합니다. 따라서 임시 DB 생성·삭제 권한이 필요하며 `themor_db`를 초기화하지 않습니다.

연결 오류 `ER_ACCESS_DENIED_ERROR`는 계정·비밀번호·접속 호스트를, `ECONNREFUSED`는 MySQL 서비스와 포트를 확인하세요. `CREATE`/`ALTER` 권한 오류는 해당 DB 계정의 테이블 생성·변경 권한을 확인하세요. 연결이 실패하면 브라우저 저장소로 몰래 전환하지 않고 오류를 표시합니다.
