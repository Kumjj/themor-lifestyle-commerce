import express from 'express';
import { randomUUID, timingSafeEqual, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pool, transaction } from './database.mjs';
import { dbConfig } from './config.mjs';
import { ApiError, hashPassword, verifyPassword, publicUser, tokenHash, newToken, text, integer } from './security.mjs';
import { getProducts, getProduct, assertOwner, productFields, productRow, getOrders, getRequests, bannerRow, noticeRow } from './store.mjs';
import { reports } from './reports.mjs';
import { importLegacyData } from './import-legacy.mjs';

const cookieName = 'themor_session';
const id = prefix => `${prefix}-${randomUUID()}`;
const requireLogin = (req, _res, next) => req.user ? next() : next(new ApiError(401, '로그인 후 이용해 주세요.'));
const requireAdmin = (req, _res, next) => req.user?.role === 'admin' ? next() : next(new ApiError(403, '관리자만 이용할 수 있습니다.'));
function sessionToken(req) {
  const value = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`));
  return value?.slice(cookieName.length + 1) || '';
}
function setSessionCookie(res, token, req, clear = false) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(cookieName, token, { httpOnly: true, sameSite: 'lax', secure, maxAge: clear ? 0 : 7 * 24 * 3600 * 1000, path: '/' });
}
async function createSession(req, res, user) {
  const previous = sessionToken(req);
  if (previous) await pool.execute('DELETE FROM sessions WHERE token_hash = ?', [tokenHash(previous)]);
  const token = newToken();
  await pool.execute('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))', [tokenHash(token), user.id]);
  setSessionCookie(res, token, req);
  res.json(publicUser(user));
}

export function createApp({ production = false } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8mb' }));
  app.use('/api', (req, _res, next) => {
    if (Array.isArray(req.body) || (req.body != null && typeof req.body !== 'object')) return next(new ApiError(400, '요청 형식이 올바르지 않습니다.'));
    req.body ||= {};
    next();
  });
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers['x-themor-client'] !== 'web') return next(new ApiError(403, '올바른 사이트 요청이 아닙니다.'));
    next();
  });
  app.use('/api', async (req, _res, next) => {
    const token = sessionToken(req);
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      const [[user]] = await pool.execute('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.deleted_at IS NULL', [tokenHash(token)]);
      req.user = user ? publicUser(user) : null;
    }
    next();
  });
  app.get('/api/health', async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({ ok: true, storage: 'mysql', database: dbConfig.database });
  });
  app.get('/api/auth/me', (req, res) => res.json(req.user || null));
  const attempts = new Map();
  const attemptsTimer = setInterval(() => { const now = Date.now(); for (const [key, value] of attempts) if (value.until < now) attempts.delete(key); }, 60000);
  attemptsTimer.unref();
  app.locals.dispose = () => clearInterval(attemptsTimer);
  app.post('/api/auth/login', async (req, res) => {
    const account = text(req.body.account, '아이디 또는 이메일', 100, true).toLowerCase();
    const password = text(req.body.password, '비밀번호', 256, true);
    const attempt = attempts.get(req.ip) || { count: 0, until: Date.now() + 5 * 60000 };
    if (attempt.until < Date.now()) { attempt.count = 0; attempt.until = Date.now() + 5 * 60000; }
    attempts.set(req.ip, attempt);
    if (++attempt.count > 40) throw new ApiError(429, '로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.');
    const [[user]] = await pool.execute('SELECT * FROM users WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND deleted_at IS NULL LIMIT 1', [account, account]);
    let valid = user && await verifyPassword(password, user.password);
    // Upgrade legacy plaintext passwords from the supplied SQL only after a matching login.
    if (user && !user.password.startsWith('scrypt$') && !user.password.startsWith('$')) {
      valid = timingSafeEqual(createHash('sha256').update(password).digest(), createHash('sha256').update(user.password).digest());
      if (valid) await pool.execute('UPDATE users SET password = ? WHERE id = ?', [await hashPassword(password), user.id]);
    }
    if (!valid) throw new ApiError(401, '아이디 또는 비밀번호가 올바르지 않습니다.');
    attempts.delete(req.ip);
    await createSession(req, res, user);
  });
  app.post('/api/auth/register', async (req, res) => {
    const email = text(req.body.email, '이메일', 100, true).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, '이메일 주소를 확인해 주세요.');
    const password = text(req.body.password, '비밀번호', 256, true);
    if (password.length < 8) throw new ApiError(400, '비밀번호는 8자 이상 입력해 주세요.');
    const user = { id: id('user'), username: email, email, name: text(req.body.name, '이름', 50, true), role: 'user', phone: text(req.body.phone, '연락처', 30), address: text(req.body.address, '주소', 255) };
    // username in the existing schema is 50 characters; use a unique opaque login ID for longer emails.
    if (user.username.length > 50) user.username = user.id;
    await pool.execute('INSERT INTO users (id, username, password, name, email, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [user.id, user.username, await hashPassword(password), user.name, user.email, user.role, user.phone, user.address]);
    await createSession(req, res, user);
  });
  app.post('/api/auth/logout', async (req, res) => {
    const token = sessionToken(req);
    if (token) await pool.execute('DELETE FROM sessions WHERE token_hash = ?', [tokenHash(token)]);
    setSessionCookie(res, '', req, true);
    res.json({ ok: true });
  });
  app.patch('/api/auth/profile', requireLogin, async (req, res) => {
    const name = text(req.body.name ?? req.user.name, '이름', 50, true);
    const phone = text(req.body.phone ?? req.user.phone, '연락처', 30);
    const address = text(req.body.address ?? req.user.address, '주소', 255);
    await pool.execute('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [name, phone, address, req.user.id]);
    res.json({ ...req.user, name, phone, address });
  });
  app.delete('/api/auth/me', requireLogin, async (req, res) => {
    await transaction(async connection => {
      await connection.execute('UPDATE users SET deleted_at = NOW() WHERE id = ?', [req.user.id]);
      await connection.execute('UPDATE products SET is_draft = TRUE WHERE seller_id = ?', [req.user.id]);
      await connection.execute('DELETE FROM sessions WHERE user_id = ?', [req.user.id]);
    });
    setSessionCookie(res, '', req, true);
    res.json({ ok: true });
  });

  app.get('/api/products', async (req, res) => res.json(await getProducts(req.user)));
  app.get('/api/products/:id', async (req, res) => {
    const products = await getProducts(req.user);
    const product = products.find(p => p.id === req.params.id);
    if (!product) throw new ApiError(404, '상품을 찾을 수 없습니다.');
    res.json(product);
  });
  app.post('/api/products', requireLogin, async (req, res) => {
    const fields = productFields(req.body);
    const productId = id('prod');
    await pool.execute(`INSERT INTO products (id, name, subtitle, category_id, subcategory, price, stock, rating, review_count,
      badge, is_free_shipping, seller_id, seller, is_official, is_draft, image_url, description, specs)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?, ?, ?, FALSE, ?, ?, ?, ?)`,
      [productId, fields.name, fields.subtitle, fields.category, fields.subcategory, fields.price, fields.stock, fields.isDraft ? '초안' : 'NEW', fields.isFreeShipping, req.user.id, req.user.name, fields.isDraft, fields.imageUrl, fields.description, JSON.stringify({})]);
    res.status(201).json(productRow(await getProduct(productId)));
  });
  app.patch('/api/products/:id', requireLogin, async (req, res) => {
    const product = await getProduct(req.params.id);
    assertOwner(req.user, product);
    const fields = productFields(req.body, product);
    await pool.execute('UPDATE products SET name = ?, subtitle = ?, category_id = ?, subcategory = ?, price = ?, stock = ?, is_draft = ?, is_free_shipping = ?, image_url = ?, description = ?, badge = ? WHERE id = ? AND deleted_at IS NULL',
      [fields.name, fields.subtitle, fields.category, fields.subcategory, fields.price, fields.stock, fields.isDraft, fields.isFreeShipping, fields.imageUrl, fields.description, fields.isDraft ? '초안' : (req.body.badge === 'NEW' ? 'NEW' : product.badge), product.id]);
    res.json(productRow(await getProduct(product.id)));
  });
  app.delete('/api/products/:id', requireLogin, async (req, res) => {
    const product = await getProduct(req.params.id);
    assertOwner(req.user, product);
    // Retain order-item foreign keys and historical SQL joins.
    await pool.execute('UPDATE products SET deleted_at = NOW(), is_draft = TRUE WHERE id = ?', [product.id]);
    res.json({ ok: true });
  });

  app.get('/api/orders', async (req, res) => res.json(await getOrders(req.user)));
  app.post('/api/orders', requireLogin, async (req, res) => {
    if (!Array.isArray(req.body.items) || !req.body.items.length || req.body.items.length > 100) throw new ApiError(400, '주문 상품을 확인해 주세요.');
    const items = new Map();
    for (const item of req.body.items) {
      const itemId = text(item.id, '상품 ID', 50, true);
      items.set(itemId, integer((items.get(itemId) || 0) + integer(item.quantity, '주문 수량', 1, 10000), '주문 수량', 1, 10000));
    }
    const orderId = id('ORD');
    const address = text(req.body.shippingAddress, '배송지', 255, true);
    const recipient = text(req.body.recipient, '수령인', 255, true);
    await transaction(async connection => {
      const products = [];
      // Deterministic lock order prevents cross-cart deadlocks.
      for (const [productId, quantity] of [...items.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        const [[product]] = await connection.execute('SELECT * FROM products WHERE id = ? AND deleted_at IS NULL FOR UPDATE', [productId]);
        if (!product || product.is_draft) throw new ApiError(409, '판매 중인 상품인지 확인해 주세요.');
        if (product.seller_id === req.user.id) throw new ApiError(403, '본인이 등록한 상품은 구매할 수 없습니다.');
        if (product.stock < quantity) throw new ApiError(409, `'${product.name}' 상품의 재고가 부족합니다.`);
        products.push({ ...product, quantity });
      }
      const subtotal = products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
      const shipping = subtotal >= 50000 || products.every(p => p.is_free_shipping) ? 0 : 3000;
      await connection.execute('INSERT INTO orders (id, user_id, status, recipient, phone, recipient_detail, shipping_address, payment_method, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, req.user.id, '결제완료', recipient.split('(')[0].trim().slice(0, 50), req.user.phone || '', recipient, address, text(req.body.paymentMethod || '신용/체크카드', '결제 수단', 255), subtotal + shipping]);
      for (const p of products) {
        await connection.execute('INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name, image_url) VALUES (?, ?, ?, ?, ?, ?)', [orderId, p.id, p.quantity, p.price, p.name, p.image_url || '']);
        await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [p.quantity, p.id]);
      }
    });
    res.status(201).json((await getOrders(req.user)).find(order => order.orderId === orderId));
  });

  app.get('/api/requests', async (req, res) => res.json(await getRequests(req.user)));
  app.post('/api/requests', requireLogin, async (req, res) => {
    const type = text(req.body.type, '신청 유형', 20, true);
    if (!['banner', 'store', 'proposal', 'restock', 'report', 'inquiry'].includes(type)) throw new ApiError(400, '지원하지 않는 신청 유형입니다.');
    let targetProductId = req.body.targetProductId || null;
    if (type === 'report') {
      if (!targetProductId) {
        const [[target]] = await pool.execute('SELECT id FROM products WHERE name = ? AND deleted_at IS NULL LIMIT 1', [text(req.body.targetItem, '대상 상품', 150, true)]);
        targetProductId = target?.id;
      }
      if (!targetProductId) throw new ApiError(404, '신고 대상 상품을 찾을 수 없습니다.');
      const target = await getProduct(targetProductId);
      if (target.seller_id === req.user.id) throw new ApiError(403, '본인이 등록한 상품은 신고할 수 없습니다.');
    }
    const requestId = id('REQ');
    await pool.execute('INSERT INTO partner_requests (id, user_id, type, type_label, title, target_item, details, applicant_name, applicant_email, target_product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [requestId, req.user.id, type, text(req.body.typeLabel || type, '유형 이름', 50, true), text(req.body.title, '제목', 150, true), text(req.body.targetItem, '대상', 100), text(req.body.details, '내용', 60000, true), req.user.name, text(req.body.applicantEmail || req.user.email, '답변 이메일', 100, true), targetProductId]);
    res.status(201).json((await getRequests(req.user)).find(r => r.id === requestId));
  });
  app.patch('/api/requests/:id', requireAdmin, async (req, res) => {
    if (!['received', 'reviewing', 'approved', 'rejected'].includes(req.body.status)) throw new ApiError(400, '처리 상태를 확인해 주세요.');
    const [result] = await pool.execute('UPDATE partner_requests SET status = ?, admin_note = ? WHERE id = ?', [req.body.status, text(req.body.adminNote, '답변', 60000), req.params.id]);
    if (!result.affectedRows) throw new ApiError(404, '접수 내역을 찾을 수 없습니다.');
    res.json((await getRequests(req.user)).find(r => r.id === req.params.id));
  });

  app.get('/api/banners', async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM banners${req.user?.role === 'admin' ? '' : ' WHERE active = TRUE'} ORDER BY created_at, id`);
    res.json(rows.map(bannerRow));
  });
  const bannerFields = body => [text(body.title, '제목', 255, true), text(body.subtitle, '설명', 60000), text(body.imageUrl, '이미지 주소', 4000), text(body.ctaText || '자세히 보기', '버튼 이름', 100), text(body.categoryLink || 'all', '연결 카테고리', 50), text(body.badgeText, '배너 문구', 100), text(body.bgColor, '배경', 100), text(body.textColor, '글자색', 100), body.active !== false];
  app.post('/api/banners', requireAdmin, async (req, res) => {
    const bannerId = id('ban');
    await pool.execute('INSERT INTO banners (id, title, subtitle, image_url, cta_text, category_link, badge_text, bg_color, text_color, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [bannerId, ...bannerFields(req.body)]);
    const [[row]] = await pool.execute('SELECT * FROM banners WHERE id = ?', [bannerId]); res.status(201).json(bannerRow(row));
  });
  app.patch('/api/banners/:id', requireAdmin, async (req, res) => {
    const [[row]] = await pool.execute('SELECT * FROM banners WHERE id = ?', [req.params.id]);
    if (!row) throw new ApiError(404, '배너를 찾을 수 없습니다.');
    await pool.execute('UPDATE banners SET title = ?, subtitle = ?, image_url = ?, cta_text = ?, category_link = ?, badge_text = ?, bg_color = ?, text_color = ?, active = ? WHERE id = ?', [...bannerFields({ ...bannerRow(row), ...req.body }), row.id]);
    const [[updated]] = await pool.execute('SELECT * FROM banners WHERE id = ?', [row.id]); res.json(bannerRow(updated));
  });
  app.delete('/api/banners/:id', requireAdmin, async (req, res) => { await pool.execute('DELETE FROM banners WHERE id = ?', [req.params.id]); res.json({ ok: true }); });
  app.get('/api/notices', async (_req, res) => { const [rows] = await pool.query('SELECT * FROM notices ORDER BY created_at DESC'); res.json(rows.map(noticeRow)); });
  const noticeFields = body => [text(body.title, '제목', 255, true), text(body.category || '공지', '분류', 50), text(body.author || 'THEMOR 운영팀', '작성자', 100), text(body.content, '내용', 60000), Boolean(body.isImportant)];
  app.post('/api/notices', requireAdmin, async (req, res) => {
    const noticeId = id('not');
    await pool.execute('INSERT INTO notices (id, title, category, author, content, is_important) VALUES (?, ?, ?, ?, ?, ?)', [noticeId, ...noticeFields(req.body)]);
    const [[row]] = await pool.execute('SELECT * FROM notices WHERE id = ?', [noticeId]); res.status(201).json(noticeRow(row));
  });
  app.patch('/api/notices/:id', requireAdmin, async (req, res) => {
    const [[row]] = await pool.execute('SELECT * FROM notices WHERE id = ?', [req.params.id]);
    if (!row) throw new ApiError(404, '공지사항을 찾을 수 없습니다.');
    await pool.execute('UPDATE notices SET title = ?, category = ?, author = ?, content = ?, is_important = ? WHERE id = ?', [...noticeFields({ ...noticeRow(row), ...req.body }), row.id]);
    const [[updated]] = await pool.execute('SELECT * FROM notices WHERE id = ?', [row.id]); res.json(noticeRow(updated));
  });
  app.delete('/api/notices/:id', requireAdmin, async (req, res) => { await pool.execute('DELETE FROM notices WHERE id = ?', [req.params.id]); res.json({ ok: true }); });
  app.get('/api/admin/reports/:id', requireAdmin, async (req, res) => {
    const report = reports.find(item => item.id === Number(req.params.id));
    if (!report) throw new ApiError(404, '조회 항목을 찾을 수 없습니다.');
    const [rows, fields] = await pool.query(report.sql);
    res.json({ ...report, columns: fields.map(field => field.name), rows: rows.map(row => fields.map(field => row[field.name])) });
  });
  app.post('/api/admin/import-legacy', requireAdmin, async (req, res) => res.json(await importLegacyData(req.body)));
  app.use('/api', (_req, _res, next) => next(new ApiError(404, 'API 주소를 찾을 수 없습니다.')));
  if (production) {
    const dist = fileURLToPath(new URL('../dist', import.meta.url));
    app.use(express.static(dist));
    app.get('/{*path}', (_req, res) => res.sendFile(`${dist}/index.html`));
  }
  app.use((error, _req, res, _next) => {
    if (error instanceof ApiError) return res.status(error.status).json({ error: error.message });
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: '이미 등록된 아이디 또는 이메일입니다.' });
    if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: '카테고리 또는 연결 데이터를 확인해 주세요.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: '한 번에 저장할 수 있는 데이터 크기를 초과했습니다.' });
    console.error('[API]', error.code || error.name);
    res.status(500).json({ error: '저장소 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
  });
  return app;
}
