import mongoose from 'mongoose';
import env from './env.js';

/**
 * MongoDB Connection Engine
 * Configures connection pooling, connection timeouts, retries, and database health status monitoring.
 */

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection lost. Retrying...');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error event: ${err.message}`);
    });

    return conn;
  } catch (error) {
    console.error(`❌ Primary Database Connection Error: ${error.message}`);
    
    // Retry fallback to local MongoDB if primary Atlas connection fails
    try {
      console.log('🔄 Retrying database connection with local MongoDB fallback (mongodb://127.0.0.1:27017/ai_interview_platform)...');
      const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/ai_interview_platform', {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 3000
      });
      console.log(`🔌 Local MongoDB Connected: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (fallbackErr) {
      console.error(`❌ Local Database Fallback Error: ${fallbackErr.message}`);
      console.warn('⚠️ Server operating with offline database mode until MongoDB comes online.');
      return null;
    }
  }
}

/**
 * Helper returning connection state for health checks.
 */
export function getDbHealth() {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    status: states[state] || 'unknown',
    isConnected: state === 1
  };
}

export default connectDB;
