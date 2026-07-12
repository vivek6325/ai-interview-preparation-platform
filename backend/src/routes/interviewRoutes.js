import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

// Create a new router instance
const router = express.Router();

/**
 * Apply JWT authentication middleware to all interview routes.
 * Every request below requires a valid Bearer token.
 */
router.use(protect);

/**
 * Route: POST /api/interviews
 * Description: Creates a new interview session
 * Access: Private
 */
router.post('/', createInterview);

/**
 * Route: GET /api/interviews
 * Description: Fetch all interview sessions belonging to the authenticated user
 * Access: Private
 */
router.get('/', getInterviews);

/**
 * Route: GET /api/interviews/:id
 * Description: Fetch a single interview session by MongoDB _id
 * Access: Private
 */
router.get('/:id', getInterviewById);

/**
 * Route: PATCH /api/interviews/:id
 * Description: Update an interview session (status, questions, scores, feedback)
 * Access: Private
 */
router.patch('/:id', updateInterview);

/**
 * Route: DELETE /api/interviews/:id
 * Description: Delete an interview session by MongoDB _id
 * Access: Private
 */
router.delete('/:id', deleteInterview);

export default router;