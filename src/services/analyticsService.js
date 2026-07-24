import { apiRequest } from './api';

/**
 * Analytics API Client Service
 * Interacts with backend /api/analytics endpoints via apiRequest helper.
 */

/**
 * Helper for building query string from object
 */
function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  const qStr = query.toString();
  return qStr ? `?${qStr}` : '';
}

/**
 * Fetches full comprehensive analytics data
 */
export async function getFullAnalytics(params = {}) {
  const qStr = buildQueryString(params);
  return await apiRequest(`/analytics${qStr}`);
}

/**
 * Fetches summary analytics
 */
export async function getAnalyticsSummary() {
  return await apiRequest('/analytics/summary');
}

/**
 * Fetches skill category metrics
 */
export async function getSkillMetrics() {
  return await apiRequest('/analytics/skills');
}

/**
 * Fetches chart ready datasets
 */
export async function getChartDatasets() {
  return await apiRequest('/analytics/charts');
}

/**
 * Fetches filtered interview history with search and pagination
 */
export async function getHistoryAnalytics(params = {}) {
  const qStr = buildQueryString(params);
  return await apiRequest(`/analytics/history${qStr}`);
}

/**
 * Fetches AI Career Insights
 */
export async function getAICareerInsights() {
  return await apiRequest('/analytics/insights');
}

/**
 * Fetches Weakness Detection analysis
 */
export async function getWeaknessDetection() {
  return await apiRequest('/analytics/weaknesses');
}

/**
 * Fetches Personalized 4-Week Practice Plan
 */
export async function getPracticePlan() {
  return await apiRequest('/analytics/practice-plan');
}

/**
 * Exports analytics report in CSV or PDF format
 */
export async function exportAnalyticsReport(format = 'csv') {
  if (format === 'csv') {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/analytics/export?format=csv', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AI_Interview_Analytics_Report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  return await apiRequest('/analytics/export?format=pdf');
}

export default {
  getFullAnalytics,
  getAnalyticsSummary,
  getSkillMetrics,
  getChartDatasets,
  getHistoryAnalytics,
  getAICareerInsights,
  getWeaknessDetection,
  getPracticePlan,
  exportAnalyticsReport
};
