import { randomUUID } from 'node:crypto';
import { transaction } from './database.mjs';
import { ApiError, hashPassword, text, integer } from './security.mjs';
import { productFields } from './store.mjs';

// Imports are additive: matching IDs are skipped and no existing rows are overwritten.
export async function importLegacyData(body) {
  const arrays = ['products', 'requests', 'orders', 'banners', 'notices'];
  for (const key of arrays) if (body[key] != null && (!Array.isArray(body[key]) || body[key].length > 5000)) throw new ApiError(400, '가져올 데이터의 형식과 개수를 확인해 주세요.');
  const lockedPassword = await hashPassword(randomUUID());
  return transaction(async connection => {
    const counts = Object.fromEntries(arrays.map(key => [key, 0]));
    const owner = async (userId, name, email) => {
      const [[existing]] = await connection.execute('SELECT id FROM users WHERE id = ? OR name = ? OR email = ? LIMIT 1', [userId || '', name || '', email || '']);
      if (existing) return existing.id;
      const newId = `user-${randomUUID()}`;
      await connection.execute('INSERT INTO users (id, username, password, name, email, role) VALUES (?, ?, ?, ?, ?, ?)', [newId, newId, lockedPassword, text(name || '이전 판매자', '이름', 50), email || `${newId}@import.themor.local`, 'user']);
      return newId;
    };
    const exists = async (table, id) => {
      const [[row]] = await connection.execute(`SELECT id FROM ${table} WHERE id = ?`, [id]);
      return !!row;
    };
    for (const p of body.products || []) {
      const productId = text(p.id, '상품 ID', 50, true);
      if (await exists('products', productId)) continue;
      const f = productFields(p);
      const sellerId = await owner(p.sellerId, p.seller);
      await connection.execute('INSERT INTO products (id, name, subtitle, category_id, subcategory, price, stock, rating, review_count, badge, is_free_shipping, seller_id, seller, is_official, is_draft, image_url, description, specs) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?, ?, ?, FALSE, ?, ?, ?, ?)',
        [productId, f.name, f.subtitle, f.category, f.subcategory, f.price, f.stock, f.isDraft ? '초안' : 'NEW', f.isFreeShipping, sellerId, text(p.seller, '판매자', 150), f.isDraft, f.imageUrl, f.description, JSON.stringify(p.specs || {})]);
      counts.products++;
    }
    for (const r of body.requests || []) {
      const requestId = text(r.id, '접수번호', 50, true);
      if (await exists('partner_requests', requestId)) continue;
      if (!['banner', 'store', 'proposal', 'restock', 'report', 'inquiry'].includes(r.type)) continue;
      const userId = await owner(r.userId, r.applicantName, r.applicantEmail);
      await connection.execute('INSERT INTO partner_requests (id, user_id, type, type_label, title, target_item, status, details, admin_note, applicant_name, applicant_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [requestId, userId, r.type, text(r.typeLabel || r.type, '신청 유형', 50), text(r.title, '제목', 150, true), text(r.targetItem, '대상', 100), ['received', 'reviewing', 'approved', 'rejected'].includes(r.status) ? r.status : 'received', text(r.details, '내용', 60000), text(r.adminNote, '답변', 60000), text(r.applicantName, '이름', 100), text(r.applicantEmail, '이메일', 100)]);
      counts.requests++;
    }
    for (const o of body.orders || []) {
      const orderId = text(o.orderId || o.id, '주문번호', 50, true);
      if (await exists('orders', orderId)) continue;
      if (!Array.isArray(o.items) || !o.items.length) continue;
      // Keep only complete historical orders; do not invent missing product relations.
      let complete = true;
      for (const item of o.items) if (!await exists('products', text(item.id, '상품 ID', 50, true))) complete = false;
      if (!complete) continue;
      const userId = await owner(o.userId || 'user-sunrin', o.recipient?.split('(')[0].trim());
      const recipient = text(o.recipient || '수령인', '수령인', 255);
      const total = o.items.reduce((sum, item) => sum + integer(item.price, '주문단가') * integer(item.quantity, '수량', 1, 10000), 0);
      await connection.execute('INSERT INTO orders (id, user_id, recipient, phone, recipient_detail, shipping_address, payment_method, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, userId, recipient.slice(0, 50), '', recipient, text(o.shippingAddress || '주소 미등록', '주소', 255), text(o.paymentMethod || '기존 주문', '결제 수단', 255), total, ['결제완료', '상품준비중', '배송중', '배송완료', '취소됨'].includes(o.status) ? o.status : '결제완료']);
      for (const item of o.items) await connection.execute('INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name, image_url) VALUES (?, ?, ?, ?, ?, ?)', [orderId, item.id, Number(item.quantity), Number(item.price), text(item.name, '상품명', 150), text(item.imageUrl, '이미지', 4000)]);
      counts.orders++;
    }
    for (const b of body.banners || []) {
      const bannerId = text(b.id, '배너 ID', 50, true);
      if (await exists('banners', bannerId)) continue;
      await connection.execute('INSERT INTO banners (id, title, subtitle, image_url, cta_text, category_link, badge_text, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [bannerId, text(b.title, '제목', 255, true), text(b.subtitle, '설명', 60000), text(b.imageUrl, '이미지', 4000), text(b.ctaText || '자세히 보기', '버튼', 100), text(b.categoryLink || 'all', '카테고리', 50), text(b.badgeText, '문구', 100), b.active !== false]);
      counts.banners++;
    }
    for (const n of body.notices || []) {
      const noticeId = text(n.id, '공지 ID', 50, true);
      if (await exists('notices', noticeId)) continue;
      await connection.execute('INSERT INTO notices (id, title, category, author, content, is_important) VALUES (?, ?, ?, ?, ?, ?)', [noticeId, text(n.title, '제목', 255, true), text(n.category || '공지', '분류', 50), text(n.author || 'THEMOR 운영팀', '작성자', 100), text(n.content, '내용', 60000), Boolean(n.isImportant)]);
      counts.notices++;
    }
    return { imported: counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) };
  });
}
