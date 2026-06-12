import express from 'express';
import { createInterview } from '../controllers/interviewController.js';

// Create a new router instance
const router = express.Router();

/**
 * Route: POST /api/interviews
 * Description: Creates a new interview session
 * Access: Public
 */
router.post('/', createInterview);

export default router;
