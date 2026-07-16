import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import { mockDatabase } from './interviewController.js';

/**
 * Helper to check if MongoDB is active
 */
const isDbConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

/**
 * Helper to compute analytics from the in-memory mock database
 */
const getMockAnalytics = (userId, startOfMonth) => {
  // Filter interviews by current user
  const userInterviews = mockDatabase.filter(
    (i) => i.userId && i.userId.toString() === userId.toString()
  );

  const totalInterviews = userInterviews.length;
  const completedList = userInterviews.filter((i) => i.status === 'completed');
  const completedInterviews = completedList.length;

  const monthlyInterviews = userInterviews.filter(
    (i) => new Date(i.createdAt) >= startOfMonth
  ).length;

  let rawAvgScore = 0;
  let rawMaxScore = 0;

  if (completedList.length > 0) {
    const scoresWithVals = completedList.filter(
      (i) => i.overallScore !== null && i.overallScore !== undefined
    );
    if (scoresWithVals.length > 0) {
      const sum = scoresWithVals.reduce((acc, curr) => acc + curr.overallScore, 0);
      rawAvgScore = sum / scoresWithVals.length;
      rawMaxScore = Math.max(...scoresWithVals.map((i) => i.overallScore));
    }
  }

  const averageScore = rawAvgScore <= 10 ? Math.round(rawAvgScore * 10) : Math.round(rawAvgScore);
  const highestScore = rawMaxScore <= 10 ? Math.round(rawMaxScore * 10) : Math.round(rawMaxScore);

  const recentInterviews = [...userInterviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return {
    totalInterviews,
    completedInterviews,
    averageScore,
    highestScore,
    monthlyInterviews,
    recentInterviews
  };
};

/**
 * @desc    Get dashboard analytics & recent interview history
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Start of current month helper for filtering
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let totalInterviews = 0;
    let completedInterviews = 0;
    let averageScore = 0;
    let highestScore = 0;
    let monthlyInterviews = 0;
    let recentInterviews = [];

    if (isDbConnected()) {
      try {
        // Run aggregation to get summary metrics in a single database round-trip
        const stats = await Interview.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          {
            $facet: {
              total: [{ $count: 'count' }],
              completed: [
                { $match: { status: 'completed' } },
                { $count: 'count' }
              ],
              scores: [
                { $match: { status: 'completed', overallScore: { $ne: null } } },
                {
                  $group: {
                    _id: null,
                    avgScore: { $avg: '$overallScore' },
                    maxScore: { $max: '$overallScore' }
                  }
                }
              ],
              monthly: [
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $count: 'count' }
              ]
            }
          }
        ]);

        const result = stats[0];

        totalInterviews = result.total[0]?.count || 0;
        completedInterviews = result.completed[0]?.count || 0;
        monthlyInterviews = result.monthly[0]?.count || 0;

        const rawAvgScore = result.scores[0]?.avgScore || 0;
        const rawMaxScore = result.scores[0]?.maxScore || 0;

        // Scale scores to 100-point scale if database scores are out of 10
        averageScore = rawAvgScore <= 10 ? Math.round(rawAvgScore * 10) : Math.round(rawAvgScore);
        highestScore = rawMaxScore <= 10 ? Math.round(rawMaxScore * 10) : Math.round(rawMaxScore);

        // Fetch recent 5 interviews sorted by creation date descending
        recentInterviews = await Interview.find({ userId })
          .sort({ createdAt: -1 })
          .limit(5);

      } catch (dbError) {
        console.warn('⚠️ MongoDB error fetching analytics, falling back to mock database:', dbError.message);
        ({
          totalInterviews,
          completedInterviews,
          averageScore,
          highestScore,
          monthlyInterviews,
          recentInterviews
        } = getMockAnalytics(userId, startOfMonth));
      }
    } else {
      // Direct mock fallback if connection is inactive
      ({
        totalInterviews,
        completedInterviews,
        averageScore,
        highestScore,
        monthlyInterviews,
        recentInterviews
      } = getMockAnalytics(userId, startOfMonth));
    }

    return res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        completedInterviews,
        averageScore,
        highestScore,
        monthlyInterviews,
        recentInterviews
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while retrieving dashboard analytics.'
    });
  }
};
