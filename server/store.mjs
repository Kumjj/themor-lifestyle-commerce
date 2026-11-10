import { pool } from './database.mjs';
import { ApiError, text, integer } from './security.mjs';

export const parseJson = value => typeof value === 'string' ? JSON.parse(value) : value;
export const day = value => String(value || '').slice(0, 10);
export function productRow(row) {
  return {
    id: row.id, name: row.name, subtitle: row.subtitle || '', category: row.category_id,
    subcategory: row.subcategory || '', price: Number(row.price), originalPrice: row.original_price == null ? null : Number(row.original_price),
    discountRate: Number(row.discount_rate || 0), stock: Number(row.stock), rating: row.review_count > 0 && row.rating != null ? Number(row.rating) : null,
    reviewCount: Number(row.review_count || 0), badge: row.badge, isFreeShipping: Boolean(row.is_free_shipping),
    sellerId: row.seller_id, seller: row.seller || row.seller_name || '', isOfficial: Boolean(row.is_official), isDraft: Boolean(row.is_draft),
    imageUrl: row.image_url || '', description: row.description || '', specs: parseJson(row.specs) || {}, createdAt: row.created_at, reviews: [],
  };
}
export function requestRow(row) {
  return { id: row.id, userId: row.user_id, type: row.type, typeLabel: row.type_label, title: row.title,
    applicantName: row.applicant_name || row.user_name || '', applicantEmail: row.applicant_email || row.user_email || '',
    targetItem: row.target_item || '', targetProductId: row.target_product_id, status: row.status,
    date: day(row.created_at), details: row.details || '', adminNote: row.admin_note || '' };
}
export const bannerRow = row => ({ id: row.id, title: row.title, subtitle: row.subtitle || '', imageUrl: row.image_url || '', ctaText: row.cta_text || '', categoryLink: row.category_link || 'all', badgeText: row.badge_text || '', bgColor: row.bg_color || '', textColor: row.text_color || '', active: Boolean(row.active) });
export const noticeRow = row => ({ id: row.id, title: row.title, category: row.category, author: row.author, content: row.content || '', isImportant: Boolean(row.is_important), date: day(row.created_at) });

export async function getProducts(user, connection = pool) {
  const permission = user?.role === 'admin' ? '' : ' AND (p.is_draft = FALSE OR p.seller_id = ?)';
  const [rows] = await connection.execute(`SELECT p.*, u.name AS seller_name FROM products p JOIN users u ON u.id = p.seller_id WHERE p.deleted_at IS NULL${permission} ORDER BY p.created_at DESC, p.id`, user?.role === 'admin' ? [] : [user?.id || '']);
  const products = rows.map(productRow);
  const [reviews] = await connection.query('SELECT r.*, u.name AS author FROM reviews r JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC');
  const byId = new Map(products.map(p => [p.id, p]));
  for (const review of reviews) byId.get(review.product_id)?.reviews.push({ id: review.id, author: review.author, rating: Number(review.rating), content: review.content, date: day(review.created_at) });
  return products;
}
export async function getProduct(id, connection = pool) {
  const [[row]] = await connection.execute('SELECT p.*, u.name AS seller_name FROM products p JOIN users u ON u.id = p.seller_id WHERE p.id = ? AND p.deleted_at IS NULL', [id]);
  if (!row) throw new ApiError(404, '상품을 찾을 수 없습니다.');
  return row;
}
export function assertOwner(user, product) {
  if (user.role !== 'admin' && product.seller_id !== user.id) throw new ApiError(403, '본인이 등록한 상품만 변경할 수 있습니다.');
}
export function productFields(body, existing) {
  const value = (key, fallback) => body[key] === undefined ? fallback : body[key];
  const name = text(value('name', existing?.name), '상품명', 150, true);
  const category = text(value('category', existing?.category_id), '카테고리', 30, true);
  const imageUrl = text(value('imageUrl', existing?.image_url), '이미지 주소', 4000);
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) throw new ApiError(400, '이미지 주소는 http 또는 https로 시작해야 합니다.');
  return { name, subtitle: text(value('subtitle', existing?.subtitle), '요약', 255), category,
    subcategory: text(value('subcategory', existing?.subcategory), '세부 카테고리', 50),
    price: integer(value('price', existing?.price), '판매가'), stock: integer(value('stock', existing?.stock ?? 0), '재고'),
    imageUrl, description: text(value('description', existing?.description), '상품 설명', 60000),
    isDraft: Boolean(value('isDraft', existing?.is_draft ?? false)),
    isFreeShipping: Boolean(value('isFreeShipping', existing?.is_free_shipping ?? true)),
  };
}
export async function getOrders(user, connection = pool) {
  if (!user) return [];
  const [orders] = await connection.execute(`SELECT * FROM orders${user.role === 'admin' ? '' : ' WHERE user_id = ?'} ORDER BY order_date DESC`, user.role === 'admin' ? [] : [user.id]);
  if (!orders.length) return [];
  const [items] = await connection.execute(`SELECT oi.*, p.name, p.image_url AS current_image_url FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id IN (${orders.map(() => '?').join(',')}) ORDER BY oi.id`, orders.map(o => o.id));
  return orders.map(order => ({ id: order.id, orderId: order.id, userId: order.user_id, orderDate: day(order.order_date), status: order.status,
    items: items.filter(item => item.order_id === order.id).map(item => ({ id: item.product_id, name: item.product_name || item.name, price: Number(item.unit_price), quantity: item.quantity, imageUrl: item.image_url || item.current_image_url || '' })),
    totalAmount: Number(order.total_amount), shippingAddress: order.shipping_address, recipient: order.recipient_detail || `${order.recipient} (${order.phone})`, paymentMethod: order.payment_method || '',
  }));
}
export async function getRequests(user) {
  if (!user) return [];
  const [rows] = await pool.execute(`SELECT r.*, u.name AS user_name, u.email AS user_email FROM partner_requests r JOIN users u ON u.id = r.user_id${user.role === 'admin' ? '' : ' WHERE r.user_id = ?'} ORDER BY r.created_at DESC`, user.role === 'admin' ? [] : [user.id]);
  return rows.map(requestRow);
}
