import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
} from '../controllers/interviewController.js';

// Create a new router instance
const router = express.Router();

/**
 * Route: POST /api/interviews
 * Description: Creates a new interview session
 * Access: Public
 */
router.post('/', createInterview);

/**
 * Route: GET /api/interviews
 * Description: Fetch all interview sessions sorted by newest first
 * Access: Public
 */
router.get('/', getInterviews);

/**
 * Route: GET /api/interviews/:id
 * Description: Fetch a single interview session by MongoDB _id
 * Access: Public
 */
router.get('/:id', getInterviewById);

export default router;
