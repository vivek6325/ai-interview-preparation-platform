/**
 * API service layer connecting to the Express backend.
 * All functions communicate with the backend at http://localhost:5000/api.
 */

const BASE_URL = "http://localhost:5000/api";

// Local questions mapping for different interview tracks
const CATEGORY_QUESTIONS = {
  dsa: [
    "How does a hash map work under the hood, and how are collisions resolved?",
    "Explain the difference between a stack and a queue, and give real-world application examples.",
    "How does the merge sort algorithm work, and what is its time and space complexity?"
  ],
  frontend: [
    "What is memoization in React, and when should you use or avoid useMemo/useCallback?",
    "Explain the Virtual DOM reconciliation process in React and how the key prop helps.",
    "How do you ensure application security and prevent common vulnerabilities like XSS or CSRF in frontend?"
  ],
  backend: [
    "Explain the differences between REST and GraphQL, including their pros and cons.",
    "How would you identify and optimize a slow-performing SQL query in a production database?",
    "What are the common strategies for backend caching, and how do you handle cache invalidation?"
  ],
  hr: [
    "Describe a challenging situation where you disagreed with a colleague. How did you resolve it?",
    "Tell me about a time you made a mistake on a project. How did you handle it and what did you learn?",
    "Why are you interested in this position, and how do you prioritize tasks under tight deadlines?"
  ]
};

/**
 * Reusable HTTP client wrapper using native fetch()
 * @param {string} endpoint - The target endpoint path (e.g. '/interviews')
 * @param {Object} options - Custom fetch configurations (method, headers, body)
 * @returns {Promise<Object>} Response payload from server
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const token = localStorage.getItem('token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers: defaultHeaders,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login';
        }
      }
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error.status) {
      throw error;
    }
    const networkError = new Error(error.message || 'Network connection failed.');
    networkError.status = 503;
    throw networkError;
  }
}

/**
 * Register a new user account.
 */
export async function register(userData) {
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

/**
 * Log in to an existing user account.
 */
export async function login(credentials) {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

/**
 * Fetches all interview sessions.
 */
export async function getInterviews() {
  return await apiRequest('/interviews');
}

/**
 * Fetches a single interview session by ID.
 */
export async function getInterview(id) {
  return await apiRequest(`/interviews/${id}`);
}

/**
 * Backward compatibility alias for getInterview
 */
export async function getInterviewById(id) {
  return await getInterview(id);
}

/**
 * Creates a new interview session.
 */
export async function createInterview(data) {
  return await apiRequest('/interviews', {
    method: 'POST',
    body: data
  });
}

/**
 * Updates an interview session (answers, status, overall scores).
 */
export async function updateInterview(id, data) {
  return await apiRequest(`/interviews/${id}`, {
    method: 'PATCH',
    body: data
  });
}

/**
 * Deletes an interview session by ID.
 */
export async function deleteInterview(id) {
  return await apiRequest(`/interviews/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Retrieves the local static questions for a given track category.
 */
export async function getQuestions(category) {
  // Simulate minor network latency for realistic UX feel
  await new Promise((resolve) => setTimeout(resolve, 300));
  const key = category?.toLowerCase().includes('dsa') || category?.toLowerCase().includes('algorithm') ? 'dsa' :
    category?.toLowerCase().includes('front') ? 'frontend' :
      category?.toLowerCase().includes('back') ? 'backend' :
        category?.toLowerCase().includes('hr') || category?.toLowerCase().includes('human') ? 'hr' : 'frontend';
  return CATEGORY_QUESTIONS[key];
}

/**
 * Calls backend Gemini endpoint to generate questions and save interview.
 */
export async function generateAIInterview(payload) {
  return await apiRequest('/ai/generate', {
    method: 'POST',
    body: payload
  });
}

/**
 * Calls backend Gemini endpoint to grade answers and save scores.
 */
export async function evaluateAIInterview(interviewId, questions) {
  return await apiRequest('/ai/evaluate', {
    method: 'POST',
    body: { interviewId, questions }
  });
}

/**
 * Fetches dashboard analytics.
 */
export async function getDashboardAnalytics() {
  return await apiRequest('/analytics/dashboard');
}

/**
 * Uploads candidate resume file (PDF or DOCX).
 */
export async function uploadResumeApi(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const url = `${BASE_URL}/resume/upload`;
  const token = localStorage.getItem('token');

  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to upload resume file.');
  }

  return await res.json();
}

/**
 * Uploads & parses raw text from a candidate resume file.
 */
export async function parseResumeApi(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const url = `${BASE_URL}/resume/parse`;
  const token = localStorage.getItem('token');

  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Unable to parse resume.');
  }

  return await res.json();
}

/**
 * Extracts structured JSON profile (skills, experience, projects, etc.) from resume text or file.
 */
export async function extractResumeApi(textOrPayload) {
  if (typeof textOrPayload === 'string') {
    return await apiRequest('/resume/extract', {
      method: 'POST',
      body: { text: textOrPayload }
    });
  }

  return await apiRequest('/resume/extract', {
    method: 'POST',
    body: textOrPayload
  });
}

/**
 * Generates 15-20 personalized interview questions based on candidate structured resume JSON.
 */
export async function generateResumeQuestionsApi(resumeData) {
  return await apiRequest('/resume/questions', {
    method: 'POST',
    body: { resumeData }
  });
}

/**
 * Saves candidate resume metadata and questions in MongoDB.
 */
export async function saveResumeApi(data) {
  return await apiRequest('/resume/save', {
    method: 'POST',
    body: data
  });
}

/**
 * Fetches all uploaded candidate resumes for history view.
 */
export async function getResumesApi() {
  return await apiRequest('/resume');
}

/**
 * Fetches a single resume details by ID.
 */
export async function getResumeByIdApi(id) {
  return await apiRequest(`/resume/${id}`);
}

/**
 * Deletes a resume record from MongoDB and disk storage.
 */
export async function deleteResumeApi(id) {
  return await apiRequest(`/resume/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Generates an adaptive AI follow-up question based on the candidate's latest response and conversation context.
 */
export async function generateFollowUpQuestionApi({
  question,
  answer,
  role,
  difficulty,
  previousTurns,
  mainQuestionIndex,
  totalMainQuestions
}) {
  try {
    return await apiRequest('/ai/follow-up', {
      method: 'POST',
      body: {
        question,
        answer,
        role,
        difficulty,
        previousTurns,
        mainQuestionIndex,
        totalMainQuestions
      }
    });
  } catch (err) {
    console.warn('⚠️ Follow-up API call failed gracefully, continuing interview:', err.message);
    return {
      status: 'success',
      data: { shouldFollowUp: false, followUpQuestion: '', reason: 'API call exception' }
    };
  }
}




