/* eslint-disable no-unused-vars */
/**
 * API service layer for mock interview data and responses.
 * This module prepares the frontend for backend integration.
 * Currently returns mock data or simulates network response delays.
 */

import { mockQuestions } from '../utils/constants';

// Target backend base URL: e.g., 'https://api.prep-ai.com/v1' or process.env.REACT_APP_API_URL
const BASE_URL = 'http://localhost:5000/api';

/**
 * Reusable HTTP client wrapper using native fetch()
 * @param {string} endpoint - The target endpoint path (e.g. '/interviews')
 * @param {Object} options - Custom fetch configurations (method, headers, body)
 * @returns {Promise<Object>} Response payload from server
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default content header to JSON if we are sending data
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers: defaultHeaders,
  };

  // Convert request payload body to a JSON string if it's an object
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  // 1. Perform HTTP request
  const response = await fetch(url, config);

  // 2. Check if the server returned a 2xx success status code
  if (!response.ok) {
    // Attempt to extract error response payload, fallback to general message
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  // 3. Parse and return JSON
  return response.json();
}

/**
 * Fetches all interview sessions from the backend.
 * @returns {Promise<Object>} Object containing interviews status and data
 */
export async function getInterviews() {
  return apiRequest('/interviews');
}



/**
 * Retrieves mock/real questions for a specific interview category.
 * 
 * Future API Endpoint: GET /api/questions?category=${category}
 * 
 * @param {string} category - The category/domain (e.g., 'dsa', 'frontend', 'backend', 'hr')
 * @returns {Promise<string[]>} List of interview questions
 */
export async function getQuestions(category) {
  // Simulate network request latency
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // TODO: Add fetch call once the backend is ready:
  // const response = await fetch(`${BASE_URL}/questions?category=${category}`);
  // if (!response.ok) throw new Error('Failed to fetch questions');
  // return response.json();
  
  return mockQuestions;
}

/**
 * Submits the user's speak/written response for evaluation.
 * 
 * Future API Endpoint: POST /api/answers/submit
 * 
 * @param {Object} payload - The answer payload containing question index/id and answer text
 * @param {number|string} payload.questionId - Unique ID or index of the question
 * @param {string} payload.answerText - The text response submitted by the user
 * @returns {Promise<Object>} Evaluation metadata, status, or confidence scores
 */
export async function submitAnswer({ questionId, answerText }) {
  // Simulate network request latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Add fetch call once the backend is ready:
  // const response = await fetch(`${BASE_URL}/answers/submit`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ questionId, answerText })
  // });
  // if (!response.ok) throw new Error('Failed to submit answer');
  // return response.json();

  return {
    status: 'success',
    submittedAt: new Date().toISOString(),
    evaluationPending: true,
  };
}

/**
 * Retrieves evaluation results for a mock interview session.
 * 
 * Future API Endpoint: GET /api/results/${sessionId}
 * 
 * @param {string} sessionId - The session identifier
 * @returns {Promise<Object>} Scoring analytics (score, pacing feedback, correct answers)
 */
export async function getResults(sessionId) {
  // Simulate network request latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // TODO: Add fetch call once the backend is ready:
  // const response = await fetch(`${BASE_URL}/results/${sessionId}`);
  // if (!response.ok) throw new Error('Failed to fetch results');
  // return response.json();

  return {
    sessionId,
    overallScore: 85,
    speakingPace: '138 WPM',
    feedback: 'Excellent response structure. Try using more specific performance metrics in technical examples.',
  };
}
