import express from 'express';
import {
  getAnalytics,
  getSummary,
  getSkillMetrics,
  getChartData,
  getHistoryAnalytics,
  getInsights,
  getRecommendations,
  getWeaknesses,
  getPracticePlan,
  exportAnalytics,
  getDashboardAnalytics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Apply JWT authentication middleware to all analytics routes.
 */
router.use(protect);

/**
 * Analytics API Routes
 */
router.get('/', getAnalytics);
router.get('/dashboard', getDashboardAnalytics);
router.get('/summary', getSummary);
router.get('/skills', getSkillMetrics);
router.get('/charts', getChartData);
router.get('/history', getHistoryAnalytics);
router.get('/insights', getInsights);
router.get('/recommendations', getRecommendations);
router.get('/weaknesses', getWeaknesses);
router.get('/practice-plan', getPracticePlan);
router.get('/export', exportAnalytics);

export default router;
