import express from 'express';
import { generateSession, evaluateSession } from '../controllers/aiController.js';

const router = express.Router();

/**
 * Route: POST /api/ai/generate
 * Description: Dynamically generates interview questions using Gemini and stores them in MongoDB
 * Access: Public
 */
router.post('/generate', generateSession);

/**
 * Route: POST /api/ai/evaluate
 * Description: Evaluates candidate answers using Gemini and saves the scorecard/feedback to MongoDB
 * Access: Public
 */
router.post('/evaluate', evaluateSession);

export default router;
