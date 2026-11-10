# 데이터베이스 스키마 조회 및 조작 과제 SQL 명령어 (themor_20602)

USE themor_20602;


## 1. 회원가입 (INSERT): 새로운 회원의 아이디, 비밀번호, 이름, 이메일 등 정보를 데이터베이스에 등록한다.

USE themor_20602;

INSERT INTO themor_20602.users (id, username, password, name, email, role, phone, address) 
VALUES ('user-newbie', 'newbie2026', 'hashed_pwd_1234', '홍길동', 'newbie@themor.kr', 'user', '010-9876-5432', '서울특별시 마포구 상암동 123')
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), address = VALUES(address);

SELECT id, username, name, email, role, phone, address, created_at 
FROM themor_20602.users 
WHERE id = 'user-newbie';


## 2. 회원조회 (SELECT): 탈퇴하지 않은 회원들의 정보를 조회하고, 최근 가입한 순서대로 정렬한다.

USE themor_20602;

SELECT id, username, name, email, role, phone, address, created_at 
FROM themor_20602.users 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC;


## 3. 회원정보 수정 (UPDATE): 특정 회원의 이름, 전화번호, 주소를 변경한다.

USE themor_20602;

UPDATE themor_20602.users 
SET name = '홍길동 (개명)', phone = '010-1111-2222', address = '서울특별시 마포구 상암동 456' 
WHERE id = 'user-newbie';

SELECT id, username, name, phone, address, created_at 
FROM themor_20602.users 
WHERE id = 'user-newbie';


## 4. 회원탈퇴 (DELETE): 특정 회원의 정보를 데이터베이스에서 삭제하고, 삭제 여부를 확인한다.

USE themor_20602;

DELETE FROM themor_20602.users 
WHERE id = 'user-newbie';

SELECT id, username, name, email 
FROM themor_20602.users 
WHERE id = 'user-newbie';


## 5. 핵심데이터 등록 (INSERT): 새로운 상품의 이름, 가격, 재고, 판매자 등의 정보를 등록한다.

USE themor_20602;

INSERT INTO themor_20602.products (id, name, subtitle, category_id, subcategory, price, original_price, discount_rate, stock, seller_id, seller, is_free_shipping, is_official, is_draft, description) 
VALUES ('prod-custom-1', '미니멀 프리미엄 원목 데스크 오거나이저', '북미산 월넛 원목을 정밀 가공한 3단 펜 트레이', 'living', '수납/서랍', 38000, 48000, 20, 50, 'user-sunrin', '선린 (sunrin)', TRUE, FALSE, FALSE, '책상 위를 정갈하게 정돈해 주는 수제 원목 데스크 오거나이저입니다.')
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), stock = VALUES(stock);

SELECT id, name, subtitle, category_id, subcategory, price, original_price, stock, seller_id, seller, created_at 
FROM themor_20602.products 
WHERE id = 'prod-custom-1';


## 6. 핵심데이터 조회 (SELECT): 삭제되지 않은 특정 카테고리에 등록된 상품들의 정보와 등록일을 조회한다.

USE themor_20602;

SELECT id, name, price, stock, category_id, subcategory, seller_id, seller, created_at 
FROM themor_20602.products 
WHERE category_id = 'living' AND deleted_at IS NULL 
ORDER BY created_at DESC;


## 7. 핵심데이터 수정 (UPDATE): 특정 상품의 이름, 가격, 재고 수량을 변경한다.

USE themor_20602;

UPDATE themor_20602.products 
SET name = '미니멀 프리미엄 원목 데스크 오거나이저 (리뉴얼)', price = 35000, stock = 80 
WHERE id = 'prod-custom-1';

SELECT id, name, price, stock, category_id, subcategory, seller_id, seller 
FROM themor_20602.products 
WHERE id = 'prod-custom-1';


## 8. 핵심데이터 삭제 (DELETE): 특정 상품의 데이터를 삭제하고, 삭제 여부를 확인한다.

USE themor_20602;

DELETE FROM themor_20602.products 
WHERE id = 'prod-custom-1';

SELECT id, name, price, stock 
FROM themor_20602.products 
WHERE id = 'prod-custom-1';


## 9. 회원·핵심데이터 조인 (INNER JOIN): 회원과 상품 테이블을 판매자 ID로 연결하여 회원 정보와 판매 상품 정보를 함께 조회한다.

USE themor_20602;

SELECT 
  u.id AS seller_user_id, 
  u.username, 
  u.name AS seller_name, 
  u.email, 
  p.id AS product_id, 
  p.name AS product_name, 
  p.price, 
  p.stock, 
  p.category_id, 
  p.created_at AS product_created_at 
FROM themor_20602.users u 
INNER JOIN themor_20602.products p ON u.id = p.seller_id 
WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL 
ORDER BY p.created_at DESC;
