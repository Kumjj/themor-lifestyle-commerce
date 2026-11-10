export const reports = [
  {
    id: 1, title: '상품·카테고리·판매자 조회',
    headers: ['상품 ID', '상품명', '카테고리', '판매자', '판매가', '재고', '평점', '공개 상태'],
    sql: `SELECT p.id, p.name, c.name AS category_name, COALESCE(p.seller, u.name) AS seller_name,
  p.price, p.stock, IF(p.review_count > 0, p.rating, NULL) AS rating,
  IF(p.is_draft = 1, '임시저장', '공개') AS display_status
FROM products p
INNER JOIN categories c ON c.id = p.category_id
INNER JOIN users u ON u.id = p.seller_id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at DESC, p.id`,
  },
  {
    id: 2, title: '주문·회원·주문 상품 조회',
    headers: ['주문번호', '주문일시', '상태', '회원명', '상품명', '수량', '주문단가', '소계', '배송지'],
    sql: `SELECT o.id, o.order_date, o.status, u.name AS customer_name,
  COALESCE(oi.product_name, p.name) AS product_name, oi.quantity, oi.unit_price,
  oi.quantity * oi.unit_price AS line_total, o.shipping_address
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p ON p.id = oi.product_id
ORDER BY o.order_date DESC, oi.id`,
  },
  {
    id: 3, title: '카테고리별 상품·가격·재고 집계',
    headers: ['카테고리 ID', '카테고리명', '공개 상품 수', '평균가격', '최저가', '최고가', '재고합계'],
    sql: `SELECT c.id, c.name, COUNT(p.id) AS product_count,
  COALESCE(ROUND(AVG(p.price)), 0) AS average_price, COALESCE(MIN(p.price), 0) AS minimum_price,
  COALESCE(MAX(p.price), 0) AS maximum_price, COALESCE(SUM(p.stock), 0) AS stock_total
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_draft = FALSE AND p.deleted_at IS NULL
GROUP BY c.id, c.name
ORDER BY product_count DESC`,
  },
  {
    id: 4, title: '회원별 주문 횟수와 누적 주문금액',
    headers: ['회원 ID', '회원명', '이메일', '주문 수', '누적 주문금액'],
    sql: `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total_amount), 0) AS total_order_amount
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status <> '취소됨'
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email
ORDER BY total_order_amount DESC`,
  },
  {
    id: 5, title: '판매자별 공개·임시저장 상품 집계',
    headers: ['판매자', '등록 상품 수', '공개 상품', '임시저장', '재고합계'],
    sql: `SELECT COALESCE(p.seller, u.name) AS seller_name, COUNT(p.id) AS total_items,
  SUM(p.is_draft = FALSE) AS live_items, SUM(p.is_draft = TRUE) AS draft_items, SUM(p.stock) AS stock_total
FROM products p
INNER JOIN users u ON u.id = p.seller_id
WHERE p.deleted_at IS NULL
GROUP BY p.seller_id, COALESCE(p.seller, u.name)
ORDER BY total_items DESC`,
  },
];
