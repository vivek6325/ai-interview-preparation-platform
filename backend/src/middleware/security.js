import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import env from '../config/env.js';

/**
 * Enterprise Security Middleware Configuration
 * Configures Helmet HTTP headers, CORS domain whitelisting, rate limiting, and request timing headers.
 */

// 1. Helmet HTTP Security Headers
export const helmetSecurity = helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
});

// 2. CORS Whitelist Configuration
export const corsSecurity = cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      env.ALLOWED_ORIGINS.includes(origin) ||
      env.NODE_ENV === 'development'
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `CORS Error: Origin ${origin} is not allowed by security policy.`
        )
      );
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// 3. General API Rate Limiter (100 requests per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many requests sent from this IP address. Please try again after 15 minutes.'
  }
});

// 4. Strict Rate Limiter for Auth & AI Generation (20 requests per 15 minutes)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Rate limit reached for sensitive AI/Auth operations. Please wait a few minutes before retrying.'
  }
});

// 5. Request Response Time Performance Logger
// Logs request duration after the response has been sent.
// NOTE:
// Do NOT call res.setHeader() inside the "finish" event.
// At that point, the headers have already been sent and Node.js
// will throw ERR_HTTP_HEADERS_SENT.
export const requestTimer = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    console.log(
      `${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`
    );
  });

  next();
};

export default {
  helmetSecurity,
  corsSecurity,
  generalLimiter,
  strictLimiter,
  requestTimer
};