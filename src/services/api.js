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
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
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
export async function evaluateAIInterview(interviewId, answers) {
  return await apiRequest('/ai/evaluate', {
    method: 'POST',
    body: { interviewId, answers }
  });
}

