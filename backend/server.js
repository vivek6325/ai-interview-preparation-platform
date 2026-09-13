import 'dotenv/config';
import dns from 'node:dns';
import express from 'express';
import compression from 'compression';
import { connectDB, getDbHealth } from './src/config/db.js';
import env, { validateEnv } from './src/config/env.js';
import { helmetSecurity, corsSecurity, generalLimiter, strictLimiter, requestTimer } from './src/middleware/security.js';
import { notFoundHandler, globalErrorHandler } from './src/middleware/errorHandler.js';

import interviewRoutes from './src/routes/interviewRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import resumeRoutes from './src/routes/resumeRoutes.js';

// Configure DNS servers safely if allowed by OS network
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use default system DNS resolver if custom DNS set fails
}

// Validate environment setup
validateEnv();

// Connect to MongoDB Database
await connectDB();

const app = express();

// Security & Optimization Middleware Pipeline
app.use(helmetSecurity);
app.use(corsSecurity);
app.use(compression());
app.use(requestTimer);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply General Rate Limiter to all API routes
app.use('/api', generalLimiter);

// Sensitive endpoints get strict rate limiting
app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/ai/generate', strictLimiter);

// Register API Domain Routes
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resume', resumeRoutes);

/**
 * API Root Welcome Endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    name: 'PrepAI Career Intelligence Platform API',
    version: '1.0.0',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString()
  });
});

/**
 * Enhanced Health Check Endpoint
 * Checks server status, uptime, environment mode, and database connection state.
 */
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

// 404 & Global Error Handling Middleware Pipeline
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Express Server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT} (${env.NODE_ENV} mode)`);
  console.log(`🏥 Health check: http://localhost:${env.PORT}/api/health`);
});

// Graceful Shutdown Listener
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('🛑 Express HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
