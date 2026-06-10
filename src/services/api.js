/* eslint-disable no-unused-vars */
/**
 * API service layer for mock interview data and responses.
 * This module prepares the frontend for backend integration.
 * Currently returns mock data or simulates network response delays.
 */

import { mockQuestions } from '../utils/constants';

// Target backend base URL: e.g., 'https://api.prep-ai.com/v1' or process.env.REACT_APP_API_URL
const BASE_URL = '';

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
