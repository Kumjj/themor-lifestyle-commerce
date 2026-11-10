import { INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_NOTICES, INITIAL_REQUESTS } from '../src/data/mockData.js';
import { CATEGORIES } from '../src/data/categories.js';
import { pool, transaction } from './database.mjs';
import { hashPassword } from './security.mjs';

export async function seedDatabase() {
  const [applied] = await pool.execute('SELECT id FROM app_migrations WHERE id = ?', ['initial-project-data-v1']);
  if (applied.length) return;
  const hashed = await hashPassword('1234');
  await transaction(async connection => {
    const users = [
      { id: 'user-sunrin', username: 'sunrin', name: '선린 (sunrin)', email: 'sunrin@themor.kr', role: 'user', phone: '010-1234-5678', address: '서울특별시 마포구 월드컵북로 400 더모어타워 7층' },
      { id: 'admin-kjj', username: 'kjj', name: 'KJJ (시스템 관리자)', email: 'kjj@themor.corp', role: 'admin', phone: '02-1899-xxxx', address: '서울특별시 강남구 테헤란로 152 THEMOR 본사 12층' },
    ];
    for (const product of INITIAL_PRODUCTS) if (!users.some(user => user.id === product.sellerId)) users.push({ id: product.sellerId, username: product.sellerId, name: product.seller || 'THEMOR', email: `${product.sellerId}@seed.themor.local`, role: 'user' });
    for (const [index, request] of INITIAL_REQUESTS.entries()) if (!users.some(user => user.email === request.applicantEmail || user.name === request.applicantName)) users.push({ id: `seed-applicant-${index}`, username: `seed-applicant-${index}`, name: request.applicantName, email: request.applicantEmail, role: 'user' });
    for (const user of users) {
      const [[exists]] = await connection.execute('SELECT id FROM users WHERE id = ? OR username = ? OR email = ? LIMIT 1', [user.id, user.username, user.email]);
      if (!exists) await connection.execute('INSERT INTO users (id, username, password, name, email, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [user.id, user.username, hashed, user.name, user.email, user.role, user.phone || '', user.address || '']);
    }
    for (const category of CATEGORIES.filter(c => c.id !== 'all')) {
      const [[exists]] = await connection.execute('SELECT id FROM categories WHERE id = ?', [category.id]);
      if (!exists) await connection.execute('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)', [category.id, category.name, category.icon || 'Package']);
      for (const subcategory of category.subcategories || []) {
        const [[sub]] = await connection.execute('SELECT id FROM subcategories WHERE category_id = ? AND name = ? LIMIT 1', [category.id, subcategory]);
        if (!sub) await connection.execute('INSERT INTO subcategories (category_id, name) VALUES (?, ?)', [category.id, subcategory]);
      }
    }
    // Preserve an existing catalogue. Seed the supplied project catalogue only when empty.
    const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM products');
    if (Number(count) === 0) for (const p of INITIAL_PRODUCTS) {
      await connection.execute(`INSERT INTO products
        (id, name, subtitle, category_id, subcategory, price, original_price, discount_rate, stock, rating,
         review_count, badge, is_free_shipping, seller_id, seller, is_official, is_draft, image_url, description, specs)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.subtitle || '', p.category, p.subcategory || null, p.price, p.originalPrice || null,
          p.discountRate || 0, p.stock || 0, p.reviewCount > 0 ? p.rating : null, p.reviewCount || 0, p.badge || null,
          Boolean(p.isFreeShipping), p.sellerId, p.seller || null, Boolean(p.isOfficial), Boolean(p.isDraft), p.imageUrl || '', p.description || '', JSON.stringify(p.specs || {})]);
    }
    for (const b of INITIAL_BANNERS) {
      const [[exists]] = await connection.execute('SELECT id FROM banners WHERE id = ?', [b.id]);
      if (!exists) await connection.execute('INSERT INTO banners (id, title, subtitle, image_url, cta_text, category_link, badge_text, bg_color, text_color, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [b.id, b.title, b.subtitle || '', b.imageUrl || '', b.ctaText || '자세히 보기', b.categoryLink || 'all', b.badgeText || '', b.bgColor || '', b.textColor || '', Boolean(b.active)]);
    }
    for (const n of INITIAL_NOTICES) {
      const [[exists]] = await connection.execute('SELECT id FROM notices WHERE id = ?', [n.id]);
      if (!exists) await connection.execute('INSERT INTO notices (id, title, category, author, content, is_important, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [n.id, n.title, n.category || '공지', n.author || 'THEMOR 운영팀', n.content || '', Boolean(n.isImportant), `${n.date} 00:00:00`]);
    }
    for (const r of INITIAL_REQUESTS) {
      const [[exists]] = await connection.execute('SELECT id FROM partner_requests WHERE id = ?', [r.id]);
      const [[user]] = await connection.execute('SELECT id FROM users WHERE email = ? OR name = ? LIMIT 1', [r.applicantEmail, r.applicantName]);
      if (!exists && user) await connection.execute('INSERT INTO partner_requests (id, user_id, type, type_label, title, target_item, status, details, admin_note, applicant_name, applicant_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [r.id, user.id, r.type, r.typeLabel, r.title, r.targetItem || '', r.status, r.details || '', r.adminNote || '', r.applicantName, r.applicantEmail, `${r.date} 00:00:00`]);
    }
    await connection.execute('INSERT INTO app_migrations (id) VALUES (?)', ['initial-project-data-v1']);
  });
}
