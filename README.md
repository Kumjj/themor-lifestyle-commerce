# THEMOR — 라이프스타일 커머스 플랫폼

일상의 균형과 미니멀한 공간 가치를 제안하는 라이프스타일 커머스 웹 애플리케이션입니다.  
React 18, Vite, Tailwind CSS 기반의 세련된 프론트엔드와 Node.js Express, MySQL 8.0 기반의 강력한 관계형 데이터베이스 백엔드로 구성되어 있습니다.

---

## 🛠️ 기술 스택 및 환경 요구사항

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js Express, mysql2
- **Database**: MySQL Server 8.0+ (기본 스키마: `themor_20602`)
- **필수 환경**:
  - Node.js (v18.0.0 이상 권장)
  - MySQL Server (실행 상태 유지)

---

## 🚀 초간단 원클릭 설치 및 실행 가이드 (새 컴퓨터 이식)

새로운 PC나 환경으로 프로젝트를 옮겼을 때, 아래 방법으로 손쉽게 환경을 구축할 수 있습니다.

```bash
# 저장소 복제 (새 컴퓨터에서)
git clone https://github.com/Kumjj/themor-lifestyle-commerce.git
cd themor-lifestyle-commerce
```

### 방법 1. 윈도우 환경 (더블클릭 실행)
1. **`setup.bat` 더블클릭**:
   - `npm install` 패키지 자동 설치
   - 대상 PC의 MySQL 접속 자동 감지 및 `server/.env` 생성
   - `themor_20602` 데이터베이스 자동 생성 및 전체 데이터(상품 48종, 회원, 배너, 공지 등) 이식
2. **`start.bat` 더블클릭**:
   - 프론트엔드(Vite)와 백엔드(Express API) 동시 실행

### 방법 2. 명령 프롬프트 / 터미널 환경
```bash
# 1. 패키지 설치
npm install

# 2. 데이터베이스 자동 생성 및 데이터 이식 마법사 실행
npm run setup

# (특정 MySQL 비밀번호를 바로 지정하려면)
node scripts/setup-wizard.mjs --password=내비밀번호

# 3. 서비스 실행
npm run dev
```

---

## 🌐 접속 주소 안내

- **쇼핑몰 웹사이트 (프론트엔드)**: [http://localhost:3001](http://localhost:3001)
- **REST API 서버 (백엔드)**: [http://localhost:3002](http://localhost:3002)

---

## 👤 기본 테스트 계정

설치 마법사 실행 시 데이터베이스에 기본 회원과 관리자 계정이 자동으로 등록됩니다.

| 구분 | 아이디 (Username) | 이메일 (Email) | 비밀번호 | 권한 |
| :--- | :--- | :--- | :--- | :--- |
| **일반회원** | `sunrin` | `sunrin@themor.kr` | `1234` | 일반 사용자 (구매, 관심상품, 마이페이지) |
| **사내관리자** | `kjj` | `kjj@themor.corp` | `1234` | 관리자 (상품 관리, 배너/공지 등록, SQL 리포트) |

---

## 📂 프로젝트 주요 구조

```
├── setup.bat                   # 윈도우 원클릭 자동 설치 스크립트
├── start.bat                   # 윈도우 원클릭 서버 실행 스크립트
├── scripts/
│   ├── dev.mjs                 # 프론트엔드 & 백엔드 동시 실행 런처
│   └── setup-wizard.mjs        # DB 자동 감지 및 데이터 이식 마법사
├── server/
│   ├── app.mjs                 # Express REST API 라우트
│   ├── database.mjs            # MySQL Connection Pool 및 스키마 초기화
│   ├── seed.mjs                # 기초 카탈로그 및 사용자 데이터 시딩
│   └── index.mjs               # API 서버 엔트리포인트
├── src/                        # React SPA 소스코드
│   ├── components/             # UI 공통 및 쇼핑몰 전용 컴포넌트
│   ├── context/                # Auth, Shop, Theme 전역 Context
│   └── pages/                  # 페이지 뷰 (홈, 상품목록, 상세, 장바구니, 마이페이지 등)
├── themor_mysql_init.sql       # 전체 MySQL DDL 및 시드 데이터 DML
└── SCHEMA_ASSIGNMENT_QUERIES.md # 스키마 조회 및 CRUD 과제 검증 SQL 모음
```

---

## 📝 데이터베이스 과제 및 스키마 검증

스키마(`themor_20602`) 조작 및 조회용 SQL 명령어는 [SCHEMA_ASSIGNMENT_QUERIES.md](SCHEMA_ASSIGNMENT_QUERIES.md)에 상세히 정리되어 있습니다.
