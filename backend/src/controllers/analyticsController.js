import analyticsService from '../services/analyticsService.js';

/**
 * Analytics Controller
 * Thin HTTP controller delegating all business logic to analyticsService.js.
 */

/**
 * @desc    Get full comprehensive analytics payload
 * @route   GET /api/analytics
 * @access  Private
 */
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await analyticsService.computeComprehensiveAnalytics(userId, req.query);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while retrieving analytics.'
    });
  }
};

/**
 * @desc    Get summary metrics
 * @route   GET /api/analytics/summary
 * @access  Private
 */
export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const summary = analyticsService.calculateSummaryMetrics(interviews);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Error fetching summary:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving summary metrics.'
    });
  }
};

/**
 * @desc    Get category & skill metrics
 * @route   GET /api/analytics/skills
 * @access  Private
 */
export const getSkillMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const skills = analyticsService.calculateCategoryBreakdown(interviews);

    return res.status(200).json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('❌ Error fetching skill metrics:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving skill metrics.'
    });
  }
};

/**
 * @desc    Get graph-ready chart datasets
 * @route   GET /api/analytics/charts
 * @access  Private
 */
export const getChartData = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const charts = analyticsService.generateChartDatasets(interviews);

    return res.status(200).json({
      success: true,
      data: charts
    });
  } catch (error) {
    console.error('❌ Error fetching chart data:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving chart datasets.'
    });
  }
};

/**
 * @desc    Get filtered interview history with search and pagination
 * @route   GET /api/analytics/history
 * @access  Private
 */
export const getHistoryAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const history = analyticsService.getFilteredHistory(interviews, req.query);

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Error fetching history analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving interview history.'
    });
  }
};

/**
 * @desc    Get AI Career Insights
 * @route   GET /api/analytics/insights
 * @access  Private
 */
export const getInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const summary = analyticsService.calculateSummaryMetrics(interviews);
    const categories = analyticsService.calculateCategoryBreakdown(interviews);
    const insights = analyticsService.generateAICareerInsights(interviews, summary, categories);

    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('❌ Error fetching insights:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating AI career insights.'
    });
  }
};

/**
 * @desc    Get recommendations
 * @route   GET /api/analytics/recommendations
 * @access  Private
 */
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const summary = analyticsService.calculateSummaryMetrics(interviews);
    const categories = analyticsService.calculateCategoryBreakdown(interviews);
    const insights = analyticsService.generateAICareerInsights(interviews, summary, categories);

    return res.status(200).json({
      success: true,
      data: {
        focusAreas: insights.recommendedFocusAreas,
        readinessScore: insights.readinessScore,
        consistencyScore: insights.consistencyScore
      }
    });
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating recommendations.'
    });
  }
};

/**
 * @desc    Get detected weaknesses & strengths
 * @route   GET /api/analytics/weaknesses
 * @access  Private
 */
export const getWeaknesses = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const categories = analyticsService.calculateCategoryBreakdown(interviews);
    const weaknesses = analyticsService.detectWeaknesses(interviews, categories);

    return res.status(200).json({
      success: true,
      data: weaknesses
    });
  } catch (error) {
    console.error('❌ Error fetching weaknesses:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while performing weakness detection.'
    });
  }
};

/**
 * @desc    Get 4-week practice plan
 * @route   GET /api/analytics/practice-plan
 * @access  Private
 */
export const getPracticePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await analyticsService.getUserInterviews(userId);
    const categories = analyticsService.calculateCategoryBreakdown(interviews);
    const weaknesses = analyticsService.detectWeaknesses(interviews, categories);
    const practicePlan = analyticsService.generatePracticePlan(interviews, weaknesses);

    return res.status(200).json({
      success: true,
      data: practicePlan
    });
  } catch (error) {
    console.error('❌ Error fetching practice plan:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating practice plan.'
    });
  }
};

/**
 * @desc    Export analytics reports (PDF / CSV format)
 * @route   GET /api/analytics/export
 * @access  Private
 */
export const exportAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const format = (req.query.format || 'csv').toLowerCase();
    const data = await analyticsService.computeComprehensiveAnalytics(userId);

    if (format === 'csv') {
      const csvRows = [
        ['Metric', 'Value'],
        ['Total Interviews', data.summary.totalInterviews],
        ['Completed Interviews', data.summary.completedInterviews],
        ['Average Score', `${data.summary.averageScore}%`],
        ['Highest Score', `${data.summary.highestScore}%`],
        ['Latest Score', `${data.summary.latestScore}%`],
        ['Improvement %', `${data.summary.improvementPercentage}%`],
        ['Trend', data.summary.trendDetection],
        ['Success Rate', `${data.summary.successRate}%`],
        ['Completion Rate', `${data.summary.completionRate}%`],
        [],
        ['Category', 'Average Score'],
        ...Object.entries(data.categories).map(([cat, score]) => [cat, `${score}%`])
      ];

      const csvContent = csvRows.map((r) => r.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="AI_Interview_Analytics_Report.csv"');
      return res.status(200).send(csvContent);
    }

    // PDF format JSON payload for client-side print export
    return res.status(200).json({
      success: true,
      data: {
        title: 'AI Career Coach Comprehensive Analytics Report',
        generatedAt: new Date().toISOString(),
        summary: data.summary,
        categories: data.categories,
        insights: data.insights,
        weaknesses: data.weaknesses,
        practicePlan: data.practicePlan
      }
    });

  } catch (error) {
    console.error('❌ Error exporting analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating export report.'
    });
  }
};

/**
 * @desc    Backward compatible dashboard analytics endpoint
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await analyticsService.computeComprehensiveAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: {
        totalInterviews: data.summary.totalInterviews,
        completedInterviews: data.summary.completedInterviews,
        averageScore: data.summary.averageScore,
        highestScore: data.summary.highestScore,
        monthlyInterviews: data.summary.monthlyCount,
        recentInterviews: data.history.interviews.slice(0, 5),
        fullAnalytics: data
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while retrieving dashboard analytics.'
    });
  }
};

export default {
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
};
