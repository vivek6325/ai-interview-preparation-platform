import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment Configuration Abstraction & Validation
 * Centralized module for managing and validating all environment configuration variables.
 */

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_interview_platform',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_change_in_production_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',')
};

/**
 * Validates that all required environment variables are configured.
 */
export function validateEnv() {
  const missing = [];

  if (!env.MONGODB_URI) missing.push('MONGODB_URI');
  if (env.NODE_ENV === 'production' && !process.env.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    console.warn(`⚠️ [Config] Missing recommended environment variables: ${missing.join(', ')}`);
  } else {
    console.log(`✅ [Config] Environment loaded cleanly (${env.NODE_ENV} mode).`);
  }
}

export default env;
