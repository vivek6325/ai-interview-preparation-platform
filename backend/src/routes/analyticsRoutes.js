import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

// Create a new router instance
const router = express.Router();

/**
 * Apply JWT authentication middleware to all analytics routes.
 * Every request below requires a valid Bearer token.
 */
router.use(protect);

/**
 * Route: GET /api/analytics/dashboard
 * Description: Fetch dashboard analytics and recent interview sessions for the authenticated user
 * Access: Private
 */
router.get('/dashboard', getDashboardAnalytics);

export default router;
