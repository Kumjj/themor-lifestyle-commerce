import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, text, integer, publicUser } from '../security.mjs';

test('password hashes are salted and reject incorrect input', async () => {
  const first = await hashPassword('test-only-password');
  const second = await hashPassword('test-only-password');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('test-only-password', first), true);
  assert.equal(await verifyPassword('incorrect-password', first), false);
  assert.equal(await verifyPassword('1234', '1234'), false);
});
test('API numeric validation rejects fractions, negatives, and empty values', () => {
  for (const value of [-1, 1.5, '', null, 'not-a-number']) assert.throws(() => integer(value, '수량'));
  assert.equal(integer('3', '수량'), 3);
  assert.throws(() => text('x'.repeat(51), '상품 ID', 50));
});
test('API user response omits password and client-supplied privilege fields', () => {
  const user = publicUser({ id: 'test', name: '테스트', password: 'private', role: 'user', sqlAdmin: true });
  assert.equal(user.password, undefined);
  assert.equal(user.sqlAdmin, undefined);
});
