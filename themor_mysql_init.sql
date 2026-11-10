-- ====================================================================
-- THEMOR Shopping Mall — Relational Database Schema & Seed Data
-- ====================================================================
-- Target Server    : MySQL 8.0+
-- Hostname         : localhost
-- Port             : 3306
-- Username         : KJJ
-- ConnectionName   : THEMOR-MySQL
-- Database Name    : themor_20602
-- Character Set    : utf8mb4
-- Collation        : utf8mb4_unicode_ci
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `themor_20602` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `themor_20602`;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS `partner_requests`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `subcategories`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------------------
-- 1. Table: users (회원 및 관리자 정보)
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL COMMENT '사용자 고유 식별자',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 아이디',
  `password` VARCHAR(255) NOT NULL COMMENT '비밀번호 해시 또는 임시 평문',
  `name` VARCHAR(50) NOT NULL COMMENT '사용자 이름/상호',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일 주소',
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT '권한 (user: 일반회원, admin: 사내관리자)',
  `phone` VARCHAR(30) DEFAULT NULL COMMENT '연락처',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '배송지 주소',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. Table: categories (대분류 카테고리)
-- --------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` VARCHAR(30) NOT NULL COMMENT '카테고리 코드 (living, kitchen, etc.)',
  `name` VARCHAR(50) NOT NULL COMMENT '카테고리 한글명',
  `icon` VARCHAR(30) DEFAULT 'Package' COMMENT 'UI 아이콘 명',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. Table: subcategories (소분류 카테고리)
-- --------------------------------------------------------------------
CREATE TABLE `subcategories` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `category_id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. Table: products (상품 정보 — 판매자, 카테고리 외래키 참조)
-- --------------------------------------------------------------------
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL COMMENT '상품 고유 코드',
  `name` VARCHAR(150) NOT NULL COMMENT '상품명',
  `subtitle` VARCHAR(255) DEFAULT NULL COMMENT '간단 설명 문구',
  `category_id` VARCHAR(30) NOT NULL COMMENT '소속 카테고리 ID',
  `subcategory` VARCHAR(50) DEFAULT NULL COMMENT '소분류 명칭',
  `price` DECIMAL(12, 0) NOT NULL COMMENT '판매 가격',
  `original_price` DECIMAL(12, 0) DEFAULT NULL COMMENT '정상 가격',
  `discount_rate` INT DEFAULT 0 COMMENT '할인율 (%)',
  `stock` INT NOT NULL DEFAULT 0 COMMENT '재고 수량',
  `rating` DECIMAL(3, 1) DEFAULT 5.0 COMMENT '평점 (0.0 ~ 5.0)',
  `review_count` INT DEFAULT 0 COMMENT '리뷰 수',
  `badge` VARCHAR(20) DEFAULT NULL COMMENT '배지 (BEST, MD추천, NEW, etc.)',
  `is_free_shipping` BOOLEAN DEFAULT TRUE COMMENT '무료배송 여부',
  `seller_id` VARCHAR(50) NOT NULL COMMENT '등록 판매자/회원 ID (users.id 참조)',
  `is_official` BOOLEAN DEFAULT FALSE COMMENT 'THEMOR 직영 공식 상품 여부',
  `is_draft` BOOLEAN DEFAULT FALSE COMMENT '임시저장 초안 여부 (네이버 게시글 방식)',
  `image_url` TEXT DEFAULT NULL COMMENT '대표 상품 이미지 URL',
  `description` TEXT DEFAULT NULL COMMENT '상품 상세 설명',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '상품 등록일시',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. Table: orders (주문 기본 정보)
-- --------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL COMMENT '주문 번호 (ORD-YYYYMMDD-XXXX)',
  `user_id` VARCHAR(50) NOT NULL COMMENT '주문 고객 ID (users.id 참조)',
  `order_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '주문 일시',
  `status` ENUM('결제완료', '상품준비중', '배송중', '배송완료', '취소됨') NOT NULL DEFAULT '결제완료',
  `recipient` VARCHAR(50) NOT NULL COMMENT '수령인 성명',
  `phone` VARCHAR(30) NOT NULL COMMENT '수령인 연락처',
  `shipping_address` VARCHAR(255) NOT NULL COMMENT '배송지 주소',
  `memo` VARCHAR(255) DEFAULT '부재 시 문 앞에 놓아주세요' COMMENT '배송 요청사항',
  `total_amount` DECIMAL(12, 0) NOT NULL COMMENT '총 결제 금액',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. Table: order_items (주문 상품 상세 — N:M 관계 해소)
-- --------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL COMMENT '주문 번호',
  `product_id` VARCHAR(50) NOT NULL COMMENT '상품 코드',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '주문 수량',
  `unit_price` DECIMAL(12, 0) NOT NULL COMMENT '주문 당시 단가',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. Table: partner_requests (사용자 참여 신청: 배너, 입점, 제안, 신고 등)
-- --------------------------------------------------------------------
CREATE TABLE `partner_requests` (
  `id` VARCHAR(50) NOT NULL COMMENT '신청 접수 번호',
  `user_id` VARCHAR(50) NOT NULL COMMENT '신청자 ID',
  `type` ENUM('banner', 'store', 'proposal', 'restock', 'report', 'inquiry') NOT NULL,
  `type_label` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `target_item` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('received', 'reviewing', 'approved', 'rejected') NOT NULL DEFAULT 'received',
  `details` TEXT DEFAULT NULL,
  `admin_note` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================================================================
-- DML: Initial Seed Data
-- ====================================================================

-- 1. Insert Users (선린 일반회원 & KJJ 관리자 포함)
INSERT INTO `users` (`id`, `username`, `password`, `name`, `email`, `role`, `phone`, `address`) VALUES
('user-sunrin', 'sunrin', '1234', '선린 (sunrin)', 'sunrin@themor.kr', 'user', '010-1234-5678', '서울특별시 마포구 월드컵북로 400 더모어타워 7층'),
('admin-kjj', 'kjj', '1234', 'KJJ (시스템 관리자)', 'kjj@themor.corp', 'admin', '02-1899-xxxx', '서울특별시 강남구 테헤란로 152 THEMOR 본사 12층'),
('user-official-1', 'themor_lab', '1234', 'THEMOR Lab', 'lab@themor.corp', 'admin', '02-1899-xxxx', '서울특별시 마포구 월드컵북로 400'),
('user-official-2', 'themor_kitchen', '1234', 'THEMOR Kitchen', 'kitchen@themor.corp', 'admin', '02-1899-xxxx', '서울특별시 마포구 월드컵북로 400'),
('user-lumiere', 'lumiere', '1234', '루미에르 아뜰리에', 'contact@lumiere.kr', 'user', '010-9988-7766', '경기도 성남시 분당구 판교역로 100'),
('user-techmore', 'techmore', '1234', '테크모어 파트너스', 'partner@techmore.kr', 'user', '010-5544-3322', '서울특별시 금천구 가산디지털1로 200'),
('user-urbangreen', 'urbangreen', '1234', '어반그린 스튜디오', 'studio@urbangreen.kr', 'user', '010-7766-5544', '서울특별시 마포구 독막로 12'),
('user-roastery', 'roastery', '1234', '더모어 로스터리', 'beans@themor.corp', 'admin', '02-1899-xxxx', '강원도 강릉시 해안로 300');

-- 2. Insert Categories
INSERT INTO `categories` (`id`, `name`, `icon`) VALUES
('living', '가구 & 홈데코', 'Armchair'),
('kitchen', '주방 & 다이닝', 'UtensilsCrossed'),
('lifestyle', '생활 & 수납', 'Package'),
('digital', '디지털 & 소형가전', 'Laptop'),
('fashion', '패션 & 오피스', 'Briefcase'),
('food', '신선 & 가공식품', 'Coffee');

-- 3. Insert Subcategories
INSERT INTO `subcategories` (`category_id`, `name`) VALUES
('living', '소파/체어'), ('living', '수납/서랍'), ('living', '침실가구'), ('living', '조명/홈데코'),
('kitchen', '식기/그릇'), ('kitchen', '조리도구'), ('kitchen', '밀폐/보관용기'), ('kitchen', '주방수납'),
('lifestyle', '욕실용품'), ('lifestyle', '세탁/청소'), ('lifestyle', '정리박스'), ('lifestyle', '일용잡화'),
('digital', '스마트홈'), ('digital', '공기청정/계절'), ('digital', '음향/충전기'), ('digital', '데스크테리어'),
('fashion', '가방/파우치'), ('fashion', '문구/사무용품'), ('fashion', '의류케어'), ('fashion', '여행용품'),
('food', '커피/티'), ('food', '건강간식'), ('food', '밀키트/양념'), ('food', '산지직송');

-- 4. Insert Products (23 items)
INSERT INTO `products` (`id`, `name`, `subtitle`, `category_id`, `subcategory`, `price`, `original_price`, `discount_rate`, `stock`, `rating`, `review_count`, `badge`, `is_free_shipping`, `seller_id`, `is_official`, `is_draft`, `image_url`, `description`) VALUES
('prod-1', 'THEMOR 모듈러 3단 미니멀 수납 선반', '조립이 간편한 친환경 자작나무 프레임의 공간 맞춤형 선반장', 'living', '수납/서랍', 89000, 119000, 25, 45, 4.8, 142, 'BEST', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&auto=format&fit=crop&q=80', '공간의 크기에 맞춰 자유롭게 확장 가능한 모듈러 디자인. 견고한 알루미늄 조인트와 E0 등급 친환경 자작나무를 사용하여 거실, 서재, 주방 어디서나 감각적인 공간을 연출합니다.'),
('prod-7', '솔리드 우드 미니멀 티테이블 600', '간결한 라운드 상판과 안정적인 삼각 프레임 원목 테이블', 'living', '소파/체어', 128000, 160000, 20, 12, 4.7, 64, 'NEW', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80', '북미산 화이트 오크 원목의 결을 그대로 살린 라운드 테이블. 방수 천연 오일 피니시로 커피를 쏟아도 얼룩지지 않습니다.'),
('prod-9', '아치형 플로어 스탠드 조명 (소프트 웜 LED)', '부드러운 곡선 스틸 암과 은은한 패브릭 갓의 감성 조명', 'living', '조명/홈데코', 74000, 92000, 19, 28, 4.9, 95, 'BEST', TRUE, 'user-lumiere', FALSE, FALSE, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', '공간에 아늑한 그림자를 드리우는 아치형 플로어 램프. 풋 스위치로 편리하게 점등하며 3단계 색온도 조절 전구가 기본 동봉됩니다.'),
('prod-10', '호텔식 80수 고밀도 순면 베딩 세트 (Q)', '바이오 워싱 가공으로 부드럽고 쾌적한 사계절 차렵 이불', 'living', '침실가구', 115000, 145000, 20, 30, 4.8, 178, 'MD추천', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80', '먼지 날림이 적은 80수 고밀도 원단으로 알레르기 케어 인증을 완료했습니다. 깃털처럼 가볍고 포근한 마이크로화이버 솜을 충전재로 사용했습니다.'),

('prod-2', '스탠다드 스택 내열 유리 머그 400ml (2P 세트)', '차곡차곡 쌓아 공간 효율을 극대화하는 브런치 필수 머그', 'kitchen', '식기/그릇', 18500, 24000, 22, 82, 4.9, 310, 'MD추천', FALSE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', '붕규산 내열유리로 제작되어 -20도에서 150도까지 급격한 온도 변화에도 안전합니다. 식기세척기와 전자레인지 사용이 가능하며 심플한 직선 라인이 돋보입니다.'),
('prod-11', '모노크롬 논스틱 세라믹 쿡웨어 3종 세트', '인덕션 완벽 대응 PFOA Free 친환경 세라믹 코팅 냄비/프라이팬', 'kitchen', '조리도구', 98000, 135000, 27, 19, 4.7, 88, 'BEST', TRUE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80', '열전도율이 우수한 알루미늄 다이캐스팅 공법과 천연 광물 세라믹 코팅. 조리 후 식탁 위에 그대로 올려도 고급스러운 플레이팅이 완성됩니다.'),
('prod-12', '진공 밀폐 내열유리 반찬용기 6종 풀세트', '원터치 에어밸브로 신선함을 3배 오래 유지하는 보관용기', 'kitchen', '밀폐/보관용기', 36000, 48000, 25, 65, 4.8, 204, '가성비', TRUE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80', '뚜껑의 밸브를 누르면 내부 공기가 차단되어 식재료의 산화를 막아줍니다. 냄새 배임과 색 배임이 전혀 없어 반영구적으로 청결하게 사용 가능합니다.'),
('prod-13', '스테인리스 304 마그네틱 나이프 바 & 키친랙', '강력한 네오디뮴 자석으로 칼과 가위를 위생적으로 보관', 'kitchen', '주방수납', 24500, 32000, 23, 54, 4.6, 71, 'NEW', FALSE, 'user-sunrin', FALSE, FALSE, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80', '벽면에 3M 강력 폼테이프 또는 나사로 고정할 수 있는 위생적인 칼걸이. 물기가 닿아도 녹슬지 않는 프리미엄 SUS304 스테인리스를 적용했습니다.'),

('prod-5', '투명 아크릴 멀티 데스크 오거나이저 (4단)', '사무용품과 화장품을 한눈에 찾아 정리하는 투명 수납함', 'lifestyle', '정리박스', 15900, 19900, 20, 120, 4.8, 420, '가성비', FALSE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80', '황변 없는 고투명 프리미엄 아크릴 소재로 책상 위를 호텔 라운지처럼 정돈해 드립니다. 부드러운 서랍 레일 구조로 소음이 없습니다.'),
('prod-14', '규조토 소프트 흡수 드라이 발매트 (마블 그레이)', '밟는 순간 3초 쾌속 건조, 세탁기 물세척 가능한 신소재 규조토', 'lifestyle', '욕실용품', 16800, 23000, 26, 85, 4.8, 230, 'BEST', FALSE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80', '깨질 걱정 없는 유연한 롤업 규조토 매트. 미끄럼 방지 고무 바닥면 처리로 안전하며 통째로 세탁기에 넣어 빨아 쓸 수 있어 위생적입니다.'),
('prod-15', '슬라이딩 무소음 페달 분리수거 휴지통 30L', '댐퍼 장착으로 뚜껑이 천천히 닫히는 스테인리스 분리수거함', 'lifestyle', '세탁/청소', 49000, 62000, 21, 42, 4.7, 115, 'MD추천', TRUE, 'user-urbangreen', FALSE, FALSE, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80', '지문 방지 무광 코팅된 스테인리스 보디. 내부 분리형 이너 버킷으로 종량제 봉투 교체가 간편하며 냄새 밀폐 설계가 적용되었습니다.'),
('prod-16', '미니멀 우드 접이식 빨래 건조대 2단', '원목 프레임의 따뜻한 감성과 좁은 베란다에 딱 맞는 콤팩트 수납', 'lifestyle', '세탁/청소', 39000, 52000, 25, 25, 4.6, 68, 'NEW', TRUE, 'user-sunrin', FALSE, FALSE, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80', '접었을 때 두께 7cm로 틈새 수납이 용이한 접이식 건조대. 녹슬지 않는 알루미늄 건조살과 방수 원목 다리로 튼튼합니다.'),

('prod-3', '사일런트 슬림 버티컬 무선 마우스 (듀얼 블루투스)', '손목 부담을 줄여주는 인체공학 57도 각도와 저소음 클릭 스위치', 'digital', '데스크테리어', 38000, 48000, 20, 24, 4.8, 112, '인기', TRUE, 'user-techmore', FALSE, FALSE, 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=800&auto=format&fit=crop&q=80', '손목 피로도를 최소화하는 자연스러운 악수 형태의 57도 버티컬 디자인. 도서관과 조용한 사무실에 적합한 90% 소음 감소 클릭과 3단계 DPI 조절, 블루투스 5.0 + 2.4Ghz 동글 멀티 페어링을 지원합니다.'),
('prod-8', '무소음 울트라슬림 듀얼 무선 키보드 & 마우스 콤보', '블루투스 5.2 + 2.4Ghz 동글 지원, 3대 기기 멀티페어링', 'digital', '데스크테리어', 46000, 59000, 22, 0, 4.5, 88, '품절임박', TRUE, 'user-techmore', FALSE, FALSE, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', '도서관이나 사무실에서도 소음 걱정 없는 시저 스위치 구조. C타입 충전 방식으로 한 번 충전 시 최대 90일간 연속 사용이 가능합니다.'),
('prod-17', '데스크탑 미니 초음파 가습기 500ml (무드등 겸용)', '시간당 50ml 미세 안개 분사와 무소음 작동의 콤팩트 가습기', 'digital', '공기청정/계절', 24000, 32000, 25, 58, 4.7, 140, 'BEST', FALSE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80', '물 부족 시 자동 전원 차단 기능으로 안전하며, 2단 밝기 조절의 따뜻한 전구색 무드등이 탑재되어 취침 시 탁상용 조명으로 훌륭합니다.'),
('prod-18', '스마트 알루미늄 모니터 스탠드 라이저 (USB 허브 내장)', '바른 거북목 자세 유도와 4포트 고속 데이터 전송 허브 탑재', 'digital', '데스크테리어', 43000, 55000, 21, 36, 4.8, 92, 'MD추천', TRUE, 'user-techmore', FALSE, FALSE, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', '최대 25kg 하중을 지지하는 견고한 아노다이징 알루미늄 받침대. 스탠드 하단에 풀사이즈 키보드를 밀어 넣어 깔끔한 책상 정리가 가능합니다.'),

('prod-4', '올데이 리사이클 캔버스 토트 & 숄더백', '100% 재생 면사로 짠 튼튼한 데일리 백, 내부 방수 코팅', 'fashion', '가방/파우치', 34000, 42000, 19, 60, 4.6, 77, '친환경', FALSE, 'user-urbangreen', FALSE, FALSE, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80', '15인치 노트북과 텀블러 전용 포켓이 내장된 실용적인 데일리 백. 탈부착 가능한 크로스 스트랩으로 2way 스타일링이 가능합니다.'),
('prod-19', '베지터블 가죽 슬림 카드 월렛 (RFID 차단)', '시간이 지날수록 멋스럽게 에이징되는 이탈리아 베지터블 천연 가죽', 'fashion', '문구/사무용품', 29000, 38000, 24, 40, 4.9, 153, 'BEST', FALSE, 'user-urbangreen', FALSE, FALSE, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80', '주머니에 쏙 들어가는 두께 5mm의 슬림한 디자인. 신용카드 불법 스캔을 방지하는 차폐 필름이 내장되어 있습니다.'),
('prod-20', '워터프루프 하드쉘 16인치 비즈니스 백팩', '경량 충격 흡수 쉘과 기내용 캐리어 결합 스트랩 장착', 'fashion', '여행용품', 78000, 99000, 21, 22, 4.8, 65, 'NEW', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', '비와 눈을 완벽히 튕겨내는 방수 폴리우레탄 코팅. 180도 전면 오픈 구조로 수납이 빠르고 어깨 피로를 덜어주는 에어메시 등판을 적용했습니다.'),

('prod-6', '콜드브루 시그니처 블렌드 원두 500g', '에티오피아 예가체프와 콜롬비아 수프리모의 다크 초콜릿 풍미', 'food', '커피/티', 22000, 28000, 21, 35, 4.9, 195, '신선식품', TRUE, 'user-roastery', TRUE, FALSE, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', '당일 주문 확인 후 로스팅되는 신선한 스페셜티 원두. 은은한 베리류의 산미와 묵직한 카카오 피니시가 매력적입니다.'),
('prod-21', '유기농 제주 첫물 어린잎 녹차 & 호지차 세트', '화산회토에서 자란 유기농 어린 녹찻잎을 로스팅한 고소한 차', 'food', '커피/티', 19500, 25000, 22, 45, 4.8, 84, '친환경', FALSE, 'user-roastery', TRUE, FALSE, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80', '삼각 생분해 필터 티백으로 찻잎 본연의 깊은 향이 풍부하게 우러납니다. 카페인 부담 없이 식후 편안하게 즐기실 수 있습니다.'),
('prod-22', '지중해 엑스트라 버진 콜드프레스 올리브오일 500ml', '스페인 하엔 지역 코르니카브라 단일 품종 산도 0.2% 미만', 'food', '밀키트/양념', 28000, 35000, 20, 50, 4.9, 162, 'BEST', TRUE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80', '수확 후 4시간 이내에 27도 이하에서 저온 압착한 최고 등급 엑스트라 버진 오일. 신선한 풀향과 쌉싸름한 폴리페놀의 풍미를 느낄 수 있습니다.'),

-- 확장 세부 컬렉션 보강 상품 (24개 신규 추가)
('prod-23', '노르딕 라운지 패브릭 1인 암체어', '포근한 부클레 원단과 애쉬 원목 다리로 완성한 안식처', 'living', '소파/체어', 189000, 249000, 24, 18, 4.8, 94, 'BEST', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80', '인체 굴곡을 감싸는 인체공학적 등받이 각도와 고밀도 폼 쿠션.'),
('prod-24', '솔리드 비치우드 다이닝 체어 (2P 세트)', '천연 너도밤나무 원목의 유려한 곡선과 편안한 착좌감', 'living', '소파/체어', 154000, 198000, 22, 25, 4.7, 58, 'NEW', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&auto=format&fit=crop&q=80', '전통 짜맞춤 결구 방식을 계승한 고강도 원목 다이닝 체어 2개 세트.'),
('prod-25', '슬림 모던 4단 이동식 철제 트롤리', '좁은 틈새를 200% 활용하는 저소음 우레탄 바퀴 수납 카트', 'living', '수납/서랍', 48000, 62000, 22, 50, 4.9, 168, '가성비', FALSE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80', '두께 18cm 슬림 디자인으로 냉장고 옆, 세탁기 옆 자투리 공간에 최적화된 트롤리.'),
('prod-26', '내추럴 원목 평상형 저상 침대 프레임 (Q)', '헤드리스 미니멀 디자인과 통원목 갈빗살의 삐걱임 없는 지지력', 'living', '침실가구', 298000, 380000, 21, 14, 4.8, 76, 'MD추천', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80', '방을 넓어 보이게 하는 로우 프로파일 평상 침대.'),
('prod-27', '오브제 세라믹 무선 버섯 단스탠드', '조각품 같은 실루엣과 3단 터치 디밍의 충전식 무드 조명', 'living', '조명/홈데코', 42000, 56000, 25, 62, 4.9, 142, 'BEST', TRUE, 'user-lumiere', FALSE, FALSE, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80', '선 없이 어디든 자유롭게 놓는 포터블 램프.'),
('prod-28', '어반 세라믹 매트 파스타 & 샐러드 볼 (4P)', '깊이감 있는 라인과 무광 유약 마감의 브런치 플레이트 세트', 'kitchen', '식기/그릇', 34000, 45000, 24, 45, 4.8, 98, 'MD추천', TRUE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800&auto=format&fit=crop&q=80', '파스타, 리조또, 샐러드, 국물 요리까지 다채롭게 담아내는 다목적 깊은 볼.'),
('prod-29', '헤비 통주물 에나멜 무쇠 스킬렛 26cm', '강력한 열보존력으로 스테이크와 오븐 요리의 풍미를 극대화', 'kitchen', '조리도구', 68000, 89000, 23, 22, 4.7, 82, 'BEST', TRUE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', '시즈닝이 필요 없는 매트 블랙 에나멜 코팅 무쇠팬.'),
('prod-30', '올스테인리스 원터치 밀폐 캐니스터 3종', '원두와 건어물, 파스타면을 빛과 습기로부터 완벽 차단', 'kitchen', '밀폐/보관용기', 39500, 52000, 24, 40, 4.8, 114, '인기', FALSE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80', '식품 등급 304 스테인리스와 실리콘 패킹 클립 잠금 구조.'),
('prod-31', '슬라이딩 2단 싱크대 하부장 선반 드로어', '배수관을 피해 설치하는 서랍형 하부 수납 시스템', 'kitchen', '주방수납', 32000, 42000, 23, 55, 4.7, 88, '가성비', TRUE, 'user-official-2', TRUE, FALSE, 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=800&auto=format&fit=crop&q=80', '당기면 부드럽게 나오는 슬라이딩 서랍 레일로 편리한 하부장 수납.'),
('prod-32', '스마트 벽걸이 UV-C 칫솔 살균기 & 무타공 거치대', '99.9% 듀얼 살균 램프와 면도기 겸용 마그네틱 양치컵 포함', 'lifestyle', '욕실용품', 28000, 38000, 26, 75, 4.9, 220, 'BEST', FALSE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80', '초음파 건조 팬과 275nm 자외선 LED로 칫솔모를 상시 뽀송하게 유지.'),
('prod-33', '마이크로화이버 롱핸들 정전기 먼지털이개 세트', '천장 몰딩과 에어컨 위까지 240cm 길이 조절 벤더블 청소포', 'lifestyle', '세탁/청소', 14500, 19000, 23, 110, 4.8, 310, '가성비', FALSE, 'user-urbangreen', FALSE, FALSE, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80', '정전기 유도 원사로 먼지가 날리지 않고 흡착.'),
('prod-34', '패브릭 접이식 의류 보관 리빙박스 66L (3P)', '두꺼운 와이어 프레임과 투명 전면창으로 한눈에 찾는 옷정리', 'lifestyle', '정리박스', 35000, 48000, 27, 65, 4.8, 185, 'BEST', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80', '계절 이불과 겨울 옷을 먼지 없이 단정하게 수납.'),
('prod-35', '핸드메이드 천연 룸 슈즈 & 린넨 코스터 세트', '통기성 좋은 천연 황마 바닥과 층간소음 방지 소프트 쿠션', 'lifestyle', '일용잡화', 17000, 22000, 22, 90, 4.7, 135, '친환경', FALSE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80', '발바닥에 땀이 차지 않는 쾌적한 내추럴 섬유 룸 슬리퍼.'),
('prod-36', '피톤치드 편백수 룸 & 패브릭 스프레이 500ml', '전남 장흥 편백림에서 추출한 인공 향료 없는 100% 천연 증류액', 'lifestyle', '일용잡화', 13500, 18000, 25, 140, 4.9, 420, 'BEST', FALSE, 'user-urbangreen', FALSE, FALSE, 'https://images.unsplash.com/photo-1631867675167-90a456a90863?w=800&auto=format&fit=crop&q=80', '침구, 커튼, 소파에 뿌리는 것만으로 숲속의 맑은 공기를 선사.'),
('prod-37', 'IoT 스마트 온습도계 블루투스 모니터', '스위스 고정밀 센서와 시야각 178도 전자잉크(E-ink) 디스플레이', 'digital', '스마트홈', 19800, 26000, 23, 80, 4.8, 154, '인기', FALSE, 'user-techmore', FALSE, FALSE, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80', '실내 쾌적도를 실시간으로 감지하여 스마트폰 앱에 기록.'),
('prod-38', '지그비 무선 스마트 원격 전원 플러그 16A', '대기 전력 자동차단 및 실시간 소비전력 모니터링 콘센트', 'digital', '스마트홈', 18500, 24000, 22, 95, 4.7, 96, '가성비', FALSE, 'user-techmore', FALSE, FALSE, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80', '외출 중에도 스마트폰으로 전열기구나 조명을 원격 차단.'),
('prod-39', '360도 H13 헤파 콤팩트 데스크탑 공기청정기', '초미세먼지 99.97% 포집과 독서실 수준의 24dB 저소음 수면모드', 'digital', '공기청정/계절', 59000, 79000, 25, 35, 4.9, 167, 'MD추천', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80', '원룸, 서재, 침대 머리맡에 놓기 좋은 원통형 공기청정기.'),
('prod-40', '시그니처 아티장 빈투바 다크 초콜릿 3종 세트', '에콰도르·마다가스카르 싱글 오리진 72% 수제 프리미엄 다크 카카오', 'food', '건강간식', 34000, 42000, 19, 48, 4.8, 240, 'BEST', TRUE, 'user-cacao', FALSE, FALSE, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80', '엄선된 에콰도르 및 마다가스카르 싱글 오리진 카카오빈을 로스팅부터 콘칭까지 직접 완성한 수제 프리미엄 다크 초콜릿입니다.'),
('prod-41', '북유럽 감성 우드 블루투스 5.3 포터블 스피커', '천연 월넛 우드 캐비닛과 듀얼 패시브 라디에이터의 풍부한 베이스', 'digital', '음향/충전기', 49000, 65000, 24, 32, 4.9, 118, 'NEW', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', '목재 특유의 울림통 구조가 전하는 왜곡 없는 아날로그 사운드.'),
('prod-42', '초경량 접이식 핸디형 퀵 스팀다리미', '25초 고속 예열과 99.9% 고온 살균 스팀의 콤팩트 다리미', 'fashion', '의류케어', 36000, 48000, 25, 60, 4.8, 172, 'BEST', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80', '접었을 때 생수통 크기로 보관이 용이한 접이식 손잡이.'),
('prod-43', '원터치 6중날 충전식 보풀제거기 (디지털 잔량표시)', '의류 손상 방지 허니콤 메쉬망과 고속 8000RPM 회전 모터', 'fashion', '의류케어', 22000, 29000, 24, 85, 4.8, 245, '가성비', FALSE, 'user-urbangreen', FALSE, FALSE, 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80', '니트와 코트의 잔보풀을 새 옷처럼 정리.'),
('prod-44', '황동 미니멀 자 & 알루미늄 만년필 기프트 세트', '손에 닿을수록 깊어지는 황동 에이징과 독일 이리듐 EF 촉', 'fashion', '문구/사무용품', 31000, 42000, 26, 45, 4.9, 88, 'MD추천', TRUE, 'user-official-1', TRUE, FALSE, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80', '절제된 미학의 메탈 필기구 세트.'),
('prod-45', '매일 신선한 프리미엄 구운 견과 30팩 (30일분)', '구운 아몬드, 호두, 마카다미아, 피칸, 캐슈넛 5종 황금 배합', 'food', '건강간식', 27500, 35000, 21, 90, 4.9, 380, 'BEST', TRUE, '더모어 로스터리', TRUE, FALSE, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&auto=format&fit=crop&q=80', '첨가물과 소금 없이 원적외선으로 바삭하게 구워낸 하루 한 봉 견과.'),
('prod-46', '경북 청송 고당도 꿀사과 3kg (11-13과 가정용)', '주왕산 자락의 큰 일교차가 빚은 아삭한 과육과 14브릭스 고당도', 'food', '산지직송', 26000, 32000, 18, 40, 4.8, 195, '신선식품', TRUE, '더모어 로스터리', TRUE, FALSE, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80', '새벽 수확 후 산지 직배송되는 비파괴 당도 선별 청송 사과.'),

-- 셀러 임시저장(Draft) 샘플 (선린 계정 소유)
('prod-draft-1', '[임시저장] 핸드크래프트 천연 월넛 원목 코스터 세트', '아직 스토어에 공개되지 않은 셀러 임시저장 초안 상품입니다.', 'living', '조명/홈데코', 18000, 22000, 18, 30, NULL, 0, '초안', TRUE, 'user-sunrin', FALSE, TRUE, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80', '수작업으로 깎아 만든 호두나무 코스터 4P 세트. 네이버 스마트스토어처럼 임시저장 상태로 보관 중이며, 셀러 센터에서 즉시 공개 전환할 수 있습니다.');

-- 5. Insert Sample Orders
INSERT INTO `orders` (`id`, `user_id`, `order_date`, `status`, `recipient`, `phone`, `shipping_address`, `memo`, `total_amount`) VALUES
('ORD-20261102-0041', 'user-sunrin', '2026-11-02 14:20:00', '배송중', '선린 (sunrin)', '010-1234-5678', '서울특별시 마포구 월드컵북로 400 더모어타워 7층', '경비실에 맡겨주세요', 107500),
('ORD-20261028-0119', 'user-sunrin', '2026-10-28 09:45:00', '배송완료', '선린 (sunrin)', '010-1234-5678', '서울특별시 마포구 월드컵북로 400 더모어타워 7층', '부재 시 문 앞', 46000);

-- 6. Insert Order Items
INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `unit_price`) VALUES
('ORD-20261102-0041', 'prod-1', 1, 89000),
('ORD-20261102-0041', 'prod-2', 1, 18500),
('ORD-20261028-0119', 'prod-8', 1, 46000);

-- 7. Insert Partner Requests
INSERT INTO `partner_requests` (`id`, `user_id`, `type`, `type_label`, `title`, `target_item`, `status`, `details`, `admin_note`, `created_at`) VALUES
('REQ-2026-081', 'user-sunrin', 'banner', '광고 배너 신청', '친환경 코르크 오피스 데스크 패드 런칭 배너 게재', '코르크 데스크 매트', 'reviewing', '새롭게 런칭한 친환경 천연 코르크 데스크 매트의 메인 배너 1주일 광고 게재를 희망합니다.', '담당 MD 배정 및 이미지 규격 심사 중입니다.', '2026-11-02 11:30:00'),
('REQ-2026-074', 'user-lumiere', 'store', '입점/협찬 신청', '수제 천연 소이 캔들 & 디퓨저 라인 입점 제안', '프래그런스 컬렉션', 'approved', '프랑스 그라스 향료를 사용한 수제 디퓨저 브랜드입니다. THEMOR 홈데코 카테고리 입점을 희망합니다.', '입점 적격 판정. 계약서 발송 및 상품 등록 권한 부여 완료.', '2026-10-29 16:40:00'),
('REQ-2026-068', 'user-sunrin', 'proposal', '신제품 제안', '자취생을 위한 접이식 벽걸이 빨래건조대 개발 건의', '원룸 생활용품', 'received', '원룸 발코니나 벽면에 접어서 보관할 수 있는 컴팩트한 알루미늄 건조대를 PB 상품으로 개발해주시면 좋겠습니다.', NULL, '2026-11-03 08:15:00');


-- ====================================================================
-- Relational SQL Queries for Assignment Demonstration (JOIN Examples)
-- ====================================================================

-- 쿼리 1: 상품 카탈로그 + 카테고리명 + 판매자 정보 조회 (INNER JOIN)
-- 목적: 상품 목록 화면 출력 시 카테고리 명칭과 판매자 회사/이름을 조인하여 결합
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    u.name AS seller_name,
    p.price,
    p.stock,
    p.rating,
    CASE WHEN p.is_draft = 1 THEN '초안(비공개)' ELSE '공개판매중' END AS display_status
FROM products p
INNER JOIN categories c ON p.category_id = c.id
INNER JOIN users u ON p.seller_id = u.id
ORDER BY p.price DESC;

-- 쿼리 2: 주문 상세 내역 및 주문된 상품 정보 조회 (orders + order_items + products JOIN)
-- 목적: 마이페이지 또는 관리자 주문내역에서 주문마다 담긴 상품명과 수량, 소계를 조회
SELECT 
    o.id AS order_id,
    o.order_date,
    o.status AS order_status,
    u.name AS customer_name,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total,
    o.shipping_address
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
ORDER BY o.order_date DESC;

-- 쿼리 3: 카테고리별 등록 상품 수 및 가격 통계 집계 (LEFT JOIN + GROUP BY)
-- 목적: 대시보드에서 카테고리별 입점 현황 및 평균 판매 가격 분석
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(p.id) AS total_products,
    COALESCE(AVG(p.price), 0) AS avg_price,
    COALESCE(MIN(p.price), 0) AS min_price,
    COALESCE(MAX(p.price), 0) AS max_price,
    COALESCE(SUM(p.stock), 0) AS total_inventory
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_draft = FALSE
GROUP BY c.id, c.name
ORDER BY total_products DESC;

-- 쿼리 4: 회원별 누적 주문 금액 및 구매 건수 순위 집계 (users + orders LEFT JOIN)
-- 목적: VIP 회원 분석 및 마케팅 타겟팅을 위한 고객별 결제 실적 산출
SELECT 
    u.id AS user_id,
    u.name AS customer_name,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.role = 'user'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;

-- 쿼리 5: 입점 판매자별 등록 상품 현황 및 임시저장 건수 집계 (users + products)
-- 목적: 오픈 마켓 플랫폼에서 셀러별 활동 내역과 상품 재고 건전성 모니터링
SELECT 
    u.name AS seller_name,
    u.email AS seller_email,
    COUNT(p.id) AS total_items,
    SUM(CASE WHEN p.is_draft = 0 THEN 1 ELSE 0 END) AS live_items,
    SUM(CASE WHEN p.is_draft = 1 THEN 1 ELSE 0 END) AS draft_items,
    SUM(p.stock) AS total_stock_count
FROM users u
INNER JOIN products p ON u.id = p.seller_id
GROUP BY u.id, u.name, u.email
ORDER BY total_items DESC;
