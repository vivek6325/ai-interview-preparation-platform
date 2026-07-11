import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using Mongoose.
 * This is exported as a function to be invoked during the server startup sequence.
 */
export async function connectDB() {
  try {

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // Timeout after 2s instead of hanging
    });
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
}
