import { test, describe } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import generateToken from '../src/utils/generateToken.js';
import env from '../src/config/env.js';

describe('Authentication & JWT Utility Suite', () => {
  test('generateToken produces a valid signed JWT', () => {
    const userId = 'user_test_id_12345';
    const token = generateToken(userId);
    
    assert.ok(token, 'Token string should be generated');
    assert.strictEqual(typeof token, 'string');

    const decoded = jwt.verify(token, env.JWT_SECRET);
    assert.strictEqual(decoded.id, userId);
  });

  test('JWT verification throws error for invalid signature', () => {
    const token = generateToken('user_test_id_12345');
    assert.throws(() => {
      jwt.verify(token, 'invalid_secret_key_xyz');
    });
  });
});
