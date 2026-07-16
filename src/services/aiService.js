/**
 * API Service layer connecting the frontend to AI endpoints on the Node/Express server.
 */

const BASE_URL = "http://localhost:5000/api";

async function aiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const headers = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // For FormData bodies (like resume uploads), the browser automatically sets the content-type with boundaries.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

/**
 * Request mock interview questions from the backend.
 * POST /api/ai/questions
 */
export async function generateQuestions(role, experience, difficulty, totalQuestions = 5, parsedResume = null) {
  return await aiRequest('/ai/questions', {
    method: 'POST',
    body: { role, experience, difficulty, totalQuestions, parsedResume }
  });
}

/**
 * Upload a candidate's resume for parsing.
 * POST /api/ai/resume
 */
export async function uploadResume(formData) {
  return await aiRequest('/ai/resume', {
    method: 'POST',
    body: formData
  });
}

/**
 * Request feedback score and suggestions for a candidate answer.
 * POST /api/ai/feedback
 */
export async function evaluateAnswer(question, answer, expectedAnswerPoints = []) {
  return await aiRequest('/ai/feedback', {
    method: 'POST',
    body: { question, answer, expectedAnswerPoints }
  });
}

/**
 * Generates the aggregate mock interview scorecard report card.
 * POST /api/ai/interview-report
 */
export async function generateInterviewReport(interviewId, role, difficulty, questions = []) {
  return await aiRequest('/ai/interview-report', {
    method: 'POST',
    body: { interviewId, role, difficulty, questions }
  });
}
