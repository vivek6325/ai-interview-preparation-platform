import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
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

/**
 * Route: PATCH /api/interviews/:id
 * Description: Update an interview session (status, questions, scores, feedback)
 * Access: Public
 */
router.patch('/:id', updateInterview);

/**
 * Route: DELETE /api/interviews/:id
 * Description: Delete an interview session by MongoDB _id
 * Access: Public
 */
router.delete('/:id', deleteInterview);

export default router;
