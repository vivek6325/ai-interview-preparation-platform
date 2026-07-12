import express from 'express';
import { generateSession, evaluateSession } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Route: POST /api/ai/generate
 * Description: Dynamically generates interview questions using Gemini and stores them in MongoDB
 * Access: Private
 */
router.post('/generate', protect, generateSession);

/**
 * Route: POST /api/ai/evaluate
 * Description: Evaluates candidate answers using Gemini and saves the scorecard/feedback to MongoDB
 * Access: Private
 */
router.post('/evaluate', protect, evaluateSession);

export default router;