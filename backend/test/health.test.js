import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getDbHealth } from '../src/config/db.js';
import env from '../src/config/env.js';

describe('Health & System Config Verification Suite', () => {
  test('Environment abstraction provides valid defaults', () => {
    assert.strictEqual(typeof env.PORT, 'number');
    assert.ok(env.MONGODB_URI, 'MONGODB_URI should be defined');
    assert.ok(env.JWT_SECRET, 'JWT_SECRET should be defined');
    assert.ok(Array.isArray(env.ALLOWED_ORIGINS), 'ALLOWED_ORIGINS should be an array');
  });

  test('Database health monitor returns status schema', () => {
    const health = getDbHealth();
    assert.ok(health.status, 'Health object should have a status property');
    assert.strictEqual(typeof health.isConnected, 'boolean');
  });
});
