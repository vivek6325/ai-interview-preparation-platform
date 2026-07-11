import 'dotenv/config';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log("ENV URI:", process.env.MONGODB_URI);
import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import interviewRoutes from './src/routes/interviewRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';

// Connect to MongoDB database before starting the web server
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for API communication with React frontend
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Register API Routes
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);

// Simple health check route to verify server status
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend server is running successfully!',
    timestamp: new Date().toISOString(),
  });
});

// Start listening on configured port
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
});
