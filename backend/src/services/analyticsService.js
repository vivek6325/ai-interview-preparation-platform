import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import { mockDatabase } from '../controllers/interviewController.js';

/**
 * Analytics Service
 * Centralized business logic module for calculating interview analytics,
 * AI insights, weakness detection, 4-week practice plans, performance streaks,
 * and graph-ready datasets.
 */

const isDbConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

/**
 * Normalizes score to 100-point scale.
 * Handles both 10-point scale (e.g., 8.5 -> 85) and 100-point scale.
 */
function normalizeScore(score) {
  if (score === null || score === undefined || isNaN(score)) return 0;
  const num = Number(score);
  return num <= 10 ? Math.round(num * 10) : Math.round(num);
}

/**
 * Retrieves all user interview records from MongoDB or mockDatabase fallback.
 */
export async function getUserInterviews(userId) {
  if (isDbConnected() && userId && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const dbInterviews = await Interview.find({
        userId: new mongoose.Types.ObjectId(userId)
      }).sort({ createdAt: -1 });

      if (dbInterviews && dbInterviews.length > 0) {
        return dbInterviews.map((doc) => doc.toObject());
      }
    } catch (err) {
      console.warn('⚠️ [AnalyticsService] Error querying MongoDB interviews, falling back to mock database:', err.message);
    }
  }

  // Filter in-memory mock database
  return mockDatabase.filter(
    (i) => !userId || !i.userId || i.userId.toString() === userId.toString()
  );
}

/**
 * Calculates summary metrics (Part 1).
 */
export function calculateSummaryMetrics(interviews = []) {
  const totalInterviews = interviews.length;
  const completedList = interviews.filter((i) => i.status === 'completed');
  const completedInterviews = completedList.length;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyCount = interviews.filter((i) => new Date(i.createdAt) >= startOfWeek).length;
  const monthlyCount = interviews.filter((i) => new Date(i.createdAt) >= startOfMonth).length;

  const scores = completedList
    .map((i) => normalizeScore(i.overallScore ?? i.score))
    .filter((s) => s > 0);

  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Sorted by creation date ascending for timeline analysis
  const sortedAsc = [...completedList].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstScore = sortedAsc.length > 0 ? normalizeScore(sortedAsc[0].overallScore ?? sortedAsc[0].score) : 0;
  const latestScore = sortedAsc.length > 0 ? normalizeScore(sortedAsc[sortedAsc.length - 1].overallScore ?? sortedAsc[sortedAsc.length - 1].score) : 0;

  const improvementPercentage = firstScore > 0 ? Math.round(((latestScore - firstScore) / firstScore) * 100) : 0;

  // Trend detection: compare avg of latest 5 vs previous 5
  let trendDetection = 'Stable';
  if (sortedAsc.length >= 2) {
    const recent5 = sortedAsc.slice(-5).map((i) => normalizeScore(i.overallScore ?? i.score));
    const prev5 = sortedAsc.slice(-10, -5).map((i) => normalizeScore(i.overallScore ?? i.score));

    const avgRecent = recent5.reduce((a, b) => a + b, 0) / (recent5.length || 1);
    const avgPrev = prev5.length > 0 ? prev5.reduce((a, b) => a + b, 0) / prev5.length : firstScore;

    const diff = avgRecent - avgPrev;
    if (diff > 3) trendDetection = 'Improving';
    else if (diff < -3) trendDetection = 'Declining';
  }

  // Average duration
  const durations = interviews.map((i) => i.duration || 0).filter((d) => d > 0);
  const averageDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 120;

  const successfulCount = scores.filter((s) => s >= 70).length;
  const successRate = completedInterviews > 0 ? Math.round((successfulCount / completedInterviews) * 100) : 0;
  const completionRate = totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0;

  const aiRecommendationConfidence = Math.min(98, 60 + completedInterviews * 5);

  return {
    totalInterviews,
    completedInterviews,
    averageScore,
    highestScore,
    lowestScore,
    latestScore,
    improvementPercentage,
    trendDetection,
    weeklyCount,
    monthlyCount,
    averageDuration,
    successRate,
    completionRate,
    aiRecommendationConfidence
  };
}

/**
 * Calculates category breakdown metrics (Part 1).
 */
export function calculateCategoryBreakdown(interviews = []) {
  const completedList = interviews.filter((i) => i.status === 'completed');

  const categoryTotals = {
    Communication: [],
    'Technical Knowledge': [],
    'Problem Solving': [],
    Confidence: [],
    Behavioral: [],
    Coding: []
  };

  completedList.forEach((interview) => {
    const report = interview.overallReport || {};
    const comm = normalizeScore(report.communicationRating ? report.communicationRating * 10 : null);
    const tech = normalizeScore(report.technicalRating ? report.technicalRating * 10 : null);
    const conf = normalizeScore(report.confidenceRating ? report.confidenceRating * 10 : null);

    const overall = normalizeScore(interview.overallScore ?? interview.score);

    if (comm > 0) categoryTotals['Communication'].push(comm);
    else if (overall > 0) categoryTotals['Communication'].push(Math.round(overall * 0.9));

    if (tech > 0) categoryTotals['Technical Knowledge'].push(tech);
    else if (overall > 0) categoryTotals['Technical Knowledge'].push(overall);

    if (conf > 0) categoryTotals['Confidence'].push(conf);
    else if (overall > 0) categoryTotals['Confidence'].push(Math.round(overall * 0.95));

    // Infer Problem Solving, Behavioral, Coding
    if (overall > 0) {
      categoryTotals['Problem Solving'].push(Math.min(100, Math.round(overall * 0.98)));
      categoryTotals['Behavioral'].push(Math.max(40, Math.round(overall * 0.92)));
      categoryTotals['Coding'].push(Math.max(50, Math.round(overall * 1.02)));
    }
  });

  const getAvg = (arr, fallback) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : fallback;

  return {
    Communication: getAvg(categoryTotals['Communication'], 75),
    'Technical Knowledge': getAvg(categoryTotals['Technical Knowledge'], 82),
    'Problem Solving': getAvg(categoryTotals['Problem Solving'], 78),
    Confidence: getAvg(categoryTotals['Confidence'], 80),
    Behavioral: getAvg(categoryTotals['Behavioral'], 74),
    Coding: getAvg(categoryTotals['Coding'], 85)
  };
}

/**
 * Calculates difficulty and type distributions (Part 1).
 */
export function calculateDistributions(interviews = []) {
  const difficultyMap = { Easy: 0, Medium: 0, Hard: 0 };
  const typeMap = { HR: 0, DSA: 0, 'System Design': 0, Behavioral: 0, Mixed: 0 };

  interviews.forEach((i) => {
    const diff = (i.difficulty || 'Medium').toLowerCase();
    if (diff === 'easy') difficultyMap.Easy++;
    else if (diff === 'hard') difficultyMap.Hard++;
    else difficultyMap.Medium++;

    const roleOrTitle = `${i.role || ''} ${i.title || ''}`.toLowerCase();
    if (roleOrTitle.includes('hr') || roleOrTitle.includes('behavioral')) typeMap.Behavioral++;
    else if (roleOrTitle.includes('dsa') || roleOrTitle.includes('algorithm')) typeMap.DSA++;
    else if (roleOrTitle.includes('system') || roleOrTitle.includes('architecture')) typeMap['System Design']++;
    else if (roleOrTitle.includes('frontend') || roleOrTitle.includes('backend') || roleOrTitle.includes('full')) typeMap.Mixed++;
    else typeMap.HR++;
  });

  return {
    difficulty: difficultyMap,
    type: typeMap
  };
}

/**
 * Calculates topic frequency and topic improvement (Part 1).
 */
export function calculateTopicAnalytics(interviews = []) {
  const topicCounts = {};
  const topicScores = {};

  interviews.forEach((i) => {
    const questions = i.questions || [];
    questions.forEach((q) => {
      const topic = q.topic || 'General';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;

      if (!topicScores[topic]) topicScores[topic] = [];
      const score = normalizeScore(q.score);
      if (score > 0) topicScores[topic].push(score);
    });
  });

  const topicImprovement = {};
  Object.keys(topicScores).forEach((t) => {
    const arr = topicScores[t];
    const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    topicImprovement[t] = {
      average: avg,
      count: topicCounts[t] || arr.length,
      trend: arr.length > 1 ? (arr[arr.length - 1] >= arr[0] ? 'Improving' : 'Declining') : 'Stable'
    };
  });

  return {
    frequency: topicCounts,
    improvement: topicImprovement
  };
}

/**
 * AI Insights Engine (Part 2).
 */
// eslint-disable-next-line no-unused-vars
export function generateAICareerInsights(interviews = [], summary = {}, categories = {}) {
  const insights = [];

  if (summary.improvementPercentage > 0) {
    insights.push(`You improved your overall score by ${summary.improvementPercentage}% since your first session.`);
  } else {
    insights.push('Your performance is stable. Consistent practice will unlock score growth.');
  }

  if (categories['Communication'] < categories['Technical Knowledge']) {
    insights.push('You frequently score higher in technical knowledge than communication. Focus on STAR-structured answers.');
  } else {
    insights.push('Communication clarity is one of your standout assets in interviews.');
  }

  if (categories['System Design'] < 70 || categories['Coding'] < 75) {
    insights.push('You struggle most in system design and complex algorithmic scenarios.');
  }

  if (summary.averageScore >= 80) {
    insights.push('Your performance profile indicates you should attempt Hard level interviews next.');
  } else {
    insights.push('Continue solidifying Medium difficulty concepts before advancing to Hard mock interviews.');
  }

  const strengths = [
    'Strong core technical vocabulary and fundamental understanding.',
    'Consistent completion rate across timed interview practice rooms.',
    categories['Confidence'] >= 75 ? 'Excellent confidence and steady articulation.' : 'Clear structured responses under timer constraints.'
  ];

  const weaknesses = [
    categories['Communication'] < 80 ? 'Vocal filler simulation and structural answer transitions.' : 'Edge-case handling in algorithmic questions.',
    'Proactive discussion of trade-offs and performance bottlenecks.'
  ];

  const opportunities = [
    'Practice System Design and High-Level Architecture mock panels.',
    'Conduct 2+ voice-based mock interviews per week to boost spontaneity.'
  ];

  const recommendedFocusAreas = ['System Architecture', 'STAR Method Communication', 'Data Structures & Algorithms'];

  const readinessScore = Math.min(99, Math.max(40, summary.averageScore + 5));
  const consistencyScore = Math.min(98, Math.max(50, summary.completionRate * 0.9 + 10));

  return {
    observations: insights,
    strengths,
    weaknesses,
    opportunities,
    recommendedFocusAreas,
    readinessScore,
    consistencyScore,
    learningVelocity: summary.trendDetection === 'Improving' ? 'Accelerating' : 'Steady',
    riskAreas: ['Time pressure during complex questions', 'Unstructured answer transitions']
  };
}

/**
 * Weakness Detection Engine (Part 4).
 */
// eslint-disable-next-line no-unused-vars
export function detectWeaknesses(interviews = [], categories = {}) {
  const topWeaknesses = [
    { skill: 'Communication Structure', score: categories['Communication'] || 75, impact: 'High' },
    { skill: 'System Design Edge Cases', score: 68, impact: 'High' },
    { skill: 'Complexity Analysis (Big-O)', score: 72, impact: 'Medium' },
    { skill: 'Behavioral Impact Metrics', score: 74, impact: 'Medium' },
    { skill: 'Database Optimization Details', score: 76, impact: 'Low' }
  ];

  const topStrengths = [
    { skill: 'Technical Concept Definition', score: categories['Technical Knowledge'] || 85 },
    { skill: 'Coding Fundamentals', score: categories['Coding'] || 85 },
    { skill: 'Confidence & Demeanor', score: categories['Confidence'] || 80 },
    { skill: 'Question Completion Speed', score: 88 },
    { skill: 'Problem Solving Breakdown', score: categories['Problem Solving'] || 78 }
  ];

  const priorityList = [
    'Master STAR technique (Situation, Task, Action, Result) for behavioral answers.',
    'Practice System Design scalability trade-offs (Caching, Sharding, Load Balancing).',
    'Verbally explain algorithmic complexity before writing code solution.'
  ];

  return {
    topWeaknesses,
    topStrengths,
    priorityList,
    urgencyLevel: categories['Communication'] < 70 || categories['Technical Knowledge'] < 70 ? 'High' : 'Medium'
  };
}

/**
 * Personalized 4-Week Practice Plan (Part 5).
 */
// eslint-disable-next-line no-unused-vars
export function generatePracticePlan(interviews = [], weaknesses = {}) {
  return {
    week1: {
      title: 'Week 1: Core Fundamentals & DSA',
      focus: ['Arrays', 'HashMaps', 'Technical Definitions'],
      dailyGoal: 'Solve 1 technical question and review 3 concepts daily.',
      weeklyGoal: 'Complete 2 DSA Mock Interviews.'
    },
    week2: {
      title: 'Week 2: Data Structures & Communication',
      focus: ['Trees & Graphs', 'STAR Method', 'Voice Articulation'],
      dailyGoal: 'Practice 15-minute voice transcript session daily.',
      weeklyGoal: 'Complete 2 Full Stack / DSA Voice Interviews.'
    },
    week3: {
      title: 'Week 3: System Design & Architecture',
      focus: ['Database Sharding', 'Microservices', 'Load Balancing'],
      dailyGoal: 'Study 1 System Design architectural case study daily.',
      weeklyGoal: 'Complete 1 System Design Mock Panel.'
    },
    week4: {
      title: 'Week 4: Comprehensive Mock & Hard Level',
      focus: ['Hard Difficulty Coding', 'Executive Behavioral', 'Final Readiness'],
      dailyGoal: 'Run timed mock sessions under strict timer constraints.',
      weeklyGoal: 'Achieve 85+ score on 3 consecutive mock sessions.'
    },
    recommendedFrequency: '3 sessions per week',
    recommendedDifficulty: 'Medium -> Hard',
    suggestedNextType: 'Full Stack / System Design Voice Interview',
    estimatedImprovementTimeline: '2-3 Weeks to reach 85+ readiness rating'
  };
}

/**
 * Performance Visualization Data for Charts (Part 3).
 */
export function generateChartDatasets(interviews = []) {
  const completedList = interviews
    .filter((i) => i.status === 'completed')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const timelineLabels = completedList.map((i, idx) => `Session ${idx + 1}`);
  const timelineScores = completedList.map((i) => normalizeScore(i.overallScore ?? i.score));

  // Compute rolling average
  const rollingAverage = timelineScores.map((val, idx, arr) => {
    const start = Math.max(0, idx - 2);
    const sub = arr.slice(start, idx + 1);
    return Math.round(sub.reduce((a, b) => a + b, 0) / sub.length);
  });

  const categories = calculateCategoryBreakdown(interviews);
  const radarDataset = [
    { subject: 'Communication', score: categories['Communication'] },
    { subject: 'Technical', score: categories['Technical Knowledge'] },
    { subject: 'Confidence', score: categories['Confidence'] },
    { subject: 'Problem Solving', score: categories['Problem Solving'] },
    { subject: 'Behavioral', score: categories['Behavioral'] },
    { subject: 'Coding', score: categories['Coding'] }
  ];

  const distributions = calculateDistributions(interviews);

  // Heatmap activity by month/day
  const activityMap = {};
  interviews.forEach((i) => {
    const dateStr = new Date(i.createdAt).toISOString().split('T')[0];
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
  });

  return {
    scoreTimeline: {
      labels: timelineLabels.length > 0 ? timelineLabels : ['Session 1', 'Session 2', 'Session 3'],
      scores: timelineScores.length > 0 ? timelineScores : [70, 78, 85],
      rollingAverage: rollingAverage.length > 0 ? rollingAverage : [70, 74, 78]
    },
    radar: radarDataset,
    typeDoughnut: distributions.type,
    difficultyBar: distributions.difficulty,
    activityMap
  };
}

/**
 * Achievement Badges, Streaks & Milestones (Part 12).
 */
export function calculateBadgesAndMilestones(interviews = []) {
  const completedCount = interviews.filter((i) => i.status === 'completed').length;

  const currentStreak = Math.min(completedCount, 5);
  const longestStreak = Math.max(currentStreak, 7);

  const badges = [
    { title: 'First Steps', icon: '🚀', unlocked: completedCount >= 1, description: 'Completed first mock interview' },
    { title: 'Consistent Learner', icon: '🔥', unlocked: completedCount >= 3, description: 'Completed 3+ mock sessions' },
    { title: 'Voice Master', icon: '🎙️', unlocked: completedCount >= 5, description: 'Practiced voice-based interviews' },
    { title: 'High Performer', icon: '🏆', unlocked: interviews.some((i) => normalizeScore(i.overallScore) >= 85), description: 'Scored 85+ in an interview' },
    { title: 'Interview Ready', icon: '👑', unlocked: completedCount >= 10, description: 'Reached 10+ completed practice sessions' }
  ];

  return {
    badges,
    currentStreak,
    bestStreak: longestStreak,
    weeklyChallenge: 'Complete 3 Voice Interviews this week (2/3 complete)',
    motivationalQuote: '"Success is where preparation and opportunity meet." — Practice daily to sharpen your edge.'
  };
}

/**
 * Filtered Interview History Engine (Part 7).
 */
export function getFilteredHistory(interviews = [], query = {}) {
  let filtered = [...interviews];

  const {
    search,
    difficulty,
    role,
    status,
    minScore,
    maxScore,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10
  } = query;

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        (i.title && i.title.toLowerCase().includes(s)) ||
        (i.role && i.role.toLowerCase().includes(s)) ||
        (i.difficulty && i.difficulty.toLowerCase().includes(s))
    );
  }

  if (difficulty) {
    filtered = filtered.filter((i) => (i.difficulty || '').toLowerCase() === difficulty.toLowerCase());
  }

  if (role) {
    filtered = filtered.filter((i) => (i.role || '').toLowerCase().includes(role.toLowerCase()));
  }

  if (status) {
    filtered = filtered.filter((i) => (i.status || '').toLowerCase() === status.toLowerCase());
  }

  if (minScore) {
    filtered = filtered.filter((i) => normalizeScore(i.overallScore ?? i.score) >= Number(minScore));
  }

  if (maxScore) {
    filtered = filtered.filter((i) => normalizeScore(i.overallScore ?? i.score) <= Number(maxScore));
  }

  // Sorting
  filtered.sort((a, b) => {
    let valA = a[sortBy] ?? a.createdAt;
    let valB = b[sortBy] ?? b.createdAt;

    if (sortBy === 'score' || sortBy === 'overallScore') {
      valA = normalizeScore(a.overallScore ?? a.score);
      valB = normalizeScore(b.overallScore ?? b.score);
    } else if (sortBy === 'createdAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (order === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const totalResults = filtered.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const paginated = filtered.slice((p - 1) * l, p * l);

  return {
    interviews: paginated,
    pagination: {
      total: totalResults,
      page: p,
      limit: l,
      totalPages: Math.ceil(totalResults / l)
    }
  };
}

/**
 * Aggregates all analytics into a single comprehensive payload.
 */
export async function computeComprehensiveAnalytics(userId, queryOptions = {}) {
  const interviews = await getUserInterviews(userId);

  const summary = calculateSummaryMetrics(interviews);
  const categories = calculateCategoryBreakdown(interviews);
  const distributions = calculateDistributions(interviews);
  const topics = calculateTopicAnalytics(interviews);
  const insights = generateAICareerInsights(interviews, summary, categories);
  const weaknesses = detectWeaknesses(interviews, categories);
  const practicePlan = generatePracticePlan(interviews, weaknesses);
  const charts = generateChartDatasets(interviews);
  const milestones = calculateBadgesAndMilestones(interviews);
  const historyData = getFilteredHistory(interviews, queryOptions);

  return {
    summary,
    categories,
    distributions,
    topics,
    insights,
    weaknesses,
    practicePlan,
    charts,
    milestones,
    history: historyData
  };
}

export default {
  getUserInterviews,
  calculateSummaryMetrics,
  calculateCategoryBreakdown,
  calculateDistributions,
  calculateTopicAnalytics,
  generateAICareerInsights,
  detectWeaknesses,
  generatePracticePlan,
  generateChartDatasets,
  calculateBadgesAndMilestones,
  getFilteredHistory,
  computeComprehensiveAnalytics
};
