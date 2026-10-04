import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import express from 'express';
import { helmetSecurity, corsSecurity } from '../src/middleware/security.js';
import { notFoundHandler, globalErrorHandler } from '../src/middleware/errorHandler.js';
import interviewRoutes from '../src/routes/interviewRoutes.js';
import aiRoutes from '../src/routes/aiRoutes.js';
import authRoutes from '../src/routes/authRoutes.js';
import analyticsRoutes from '../src/routes/analyticsRoutes.js';
import resumeRoutes from '../src/routes/resumeRoutes.js';
import env from '../src/config/env.js';
import { getDbHealth } from '../src/config/db.js';
import generateToken from '../src/utils/generateToken.js';

describe('HTTP API Express Integration Suite', () => {
  let server;
  let baseUrl;
  let authToken;

  before(async () => {
    authToken = generateToken('test_user_id_999');

    return new Promise((resolve) => {
      const app = express();
      app.use(helmetSecurity);
      app.use(corsSecurity);
      app.use(express.json({ limit: '10mb' }));

      app.get('/', (req, res) => {
        res.status(200).json({
          status: 'success',
          name: 'StackScreen AI Career Intelligence Platform API',
          version: '1.0.0',
          healthCheck: '/api/health',
          timestamp: new Date().toISOString()
        });
      });

      app.get('/api/health', (req, res) => {
        const dbHealth = getDbHealth();
        res.status(200).json({
          status: 'success',
          message: 'Backend API service is operating cleanly.',
          environment: env.NODE_ENV,
          uptimeSeconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
          database: dbHealth
        });
      });

      app.use('/api/auth', authRoutes);
      app.use('/api/interviews', interviewRoutes);
      app.use('/api/ai', aiRoutes);
      app.use('/api/analytics', analyticsRoutes);
      app.use('/api/resume', resumeRoutes);

      app.use(notFoundHandler);
      app.use(globalErrorHandler);

      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    return new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });
  });

  test('GET / returns 200 with platform API info', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.name.includes('StackScreen'));
  });

  test('GET /api/health returns 200 with system status & database schema', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.database);
    assert.strictEqual(typeof body.database.isConnected, 'boolean');
  });

  test('GET /api/interviews returns 401 without auth header and 200 with valid JWT', async () => {
    const unauthRes = await fetch(`${baseUrl}/api/interviews`);
    assert.strictEqual(unauthRes.status, 401);

    const authRes = await fetch(`${baseUrl}/api/interviews`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(authRes.status, 200);
    const body = await authRes.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.data);
    assert.ok(Array.isArray(body.data.interviews));
  });

  test('POST /api/ai/generate returns 401 without auth and 201 with valid JWT', async () => {
    const unauthRes = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'Backend Engineer' })
    });
    assert.strictEqual(unauthRes.status, 401);

    const authRes = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        role: 'Fullstack Developer',
        difficulty: 'medium',
        experience: 'senior',
        technologies: 'React, Node, Express, MongoDB'
      })
    });
    assert.strictEqual(authRes.status, 201);
    const body = await authRes.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.data);
    assert.ok(body.data.interviewId);
  });

  test('GET /api/analytics returns 401 without auth and 200 with valid JWT', async () => {
    const unauthRes = await fetch(`${baseUrl}/api/analytics`);
    assert.strictEqual(unauthRes.status, 401);

    const authRes = await fetch(`${baseUrl}/api/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(authRes.status, 200);
    const body = await authRes.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data);
    assert.ok(body.data.summary);
    assert.ok(body.data.categories);
    assert.ok(body.data.weaknesses);
    assert.ok(body.data.practicePlan);
  });

  test('GET /api/unknown-endpoint returns 404 with standard error format', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-endpoint`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.message.includes('Resource Not Found'));
  });
});
