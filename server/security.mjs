import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  if (!stored?.startsWith('scrypt$')) return false;
  const [, salt, encoded] = stored.split('$');
  if (!salt || !encoded || encoded.length !== 128) return false;
  const key = await scrypt(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(encoded, 'hex'));
}
export const tokenHash = token => createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('hex');
export function publicUser(row) {
  return { id: row.id, username: row.username, name: row.name, email: row.email, role: row.role, phone: row.phone || '', address: row.address || '' };
}
export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function text(value, label, max = 255, required = false) {
  if (typeof value !== 'string' && value != null) throw new ApiError(400, `${label} 형식이 올바르지 않습니다.`);
  const result = (value || '').trim();
  if ((required && !result) || result.length > max) throw new ApiError(400, `${label}을(를) 확인해 주세요. (최대 ${max}자)`);
  return result;
}
export function integer(value, label, min = 0, max = 999999999) {
  if (value === '' || value == null || !Number.isSafeInteger(Number(value)) || Number(value) < min || Number(value) > max) throw new ApiError(400, `${label}을(를) 확인해 주세요.`);
  return Number(value);
}
