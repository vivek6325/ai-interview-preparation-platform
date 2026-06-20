/**
 * API service layer for mock interview data and responses.
 * This module prepares the frontend for backend integration.
 * Currently returns mock data or simulates network response delays.
 */

// Target backend base URL loaded dynamically from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  try {
    return await apiRequest('/interviews');
  } catch (error) {
    console.warn('⚠️ Backend offline, loading interviews from localStorage mock:', error.message);
    const local = localStorage.getItem('localInterviews');
    return local ? JSON.parse(local) : [];
  }
}

/**
 * Creates a new interview session.
 * @param {Object} payload - Interview metadata (title, role, difficulty, questions)
 * @returns {Promise<Object>} Created interview object
 */
export async function createInterview(payload) {
  try {
    return await apiRequest('/interviews', {
      method: 'POST',
      body: payload
    });
  } catch (error) {
    console.warn('⚠️ Backend offline, creating interview session locally:', error.message);
    const newSession = {
      _id: 'local-' + Date.now(),
      ...payload,
      questions: payload.questions.map((q, idx) => ({
        _id: 'q-' + idx,
        questionText: typeof q === 'string' ? q : (q.questionText || ''),
        userAnswer: '',
        feedback: '',
        score: null,
        strength: '',
        improvement: ''
      })),
      status: 'pending',
      overallScore: null,
      overallFeedback: '',
      grade: '',
      strengths: [],
      improvements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to local storage
    const local = localStorage.getItem('localInterviews');
    const list = local ? JSON.parse(local) : [];
    list.unshift(newSession);
    localStorage.setItem('localInterviews', JSON.stringify(list));

    return { status: 'success', data: { interview: newSession } };
  }
}

/**
 * Fetches an interview session by ID.
 * @param {string} id - Session identifier
 * @returns {Promise<Object>} Interview session data
 */
export async function getInterviewById(id) {
  try {
    return await apiRequest(`/interviews/${id}`);
  } catch (error) {
    console.warn('⚠️ Backend offline, retrieving interview from localStorage:', error.message);
    const local = localStorage.getItem('localInterviews');
    const list = local ? JSON.parse(local) : [];
    const found = list.find(i => i._id === id);
    if (!found) {
      throw new Error('Interview not found in local storage.', { cause: error });
    }
    return { status: 'success', data: { interview: found } };
  }
}

/**
 * Updates an interview session (status, answers, scores).
 * @param {string} id - Session identifier
 * @param {Object} payload - Payload to merge
 * @returns {Promise<Object>} Updated interview session data
 */
export async function updateInterview(id, payload) {
  try {
    return await apiRequest(`/interviews/${id}`, {
      method: 'PATCH',
      body: payload
    });
  } catch (error) {
    console.warn('⚠️ Backend offline, updating interview in localStorage & running client-side AI evaluation:', error.message);
    const local = localStorage.getItem('localInterviews');
    const list = local ? JSON.parse(local) : [];
    const index = list.findIndex(i => i._id === id);
    if (index === -1) {
      throw new Error('Interview not found in local storage.', { cause: error });
    }

    const existing = list[index];
    const questionsMerged = payload.questions || existing.questions;

    let updatedSession = {
      ...existing,
      ...payload,
      questions: questionsMerged,
      updatedAt: new Date().toISOString()
    };

    if (payload.status === 'completed') {
      const evaluation = localEvaluateSession(questionsMerged);
      updatedSession = {
        ...updatedSession,
        questions: evaluation.questions,
        overallScore: evaluation.overallScore,
        overallFeedback: evaluation.overallFeedback,
        grade: evaluation.grade,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      };
    }

    list[index] = updatedSession;
    localStorage.setItem('localInterviews', JSON.stringify(list));

    return { status: 'success', data: { interview: updatedSession } };
  }
}

/**
 * Deletes an interview session by ID.
 * @param {string} id - Session identifier
 * @returns {Promise<Object>} Status response
 */
export async function deleteInterview(id) {
  try {
    return await apiRequest(`/interviews/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.warn('⚠️ Backend offline, deleting interview session locally:', error.message);
    const local = localStorage.getItem('localInterviews');
    const list = local ? JSON.parse(local) : [];
    const filtered = list.filter(i => i._id !== id);
    localStorage.setItem('localInterviews', JSON.stringify(filtered));
    return { status: 'success', message: 'Deleted locally.' };
  }
}

/**
 * Retrieves mock/real questions for a specific interview category.
 * Loads generated questions from localStorage if available, or falls back to mock questions.
 * @param {string} category - The category/domain (e.g., 'dsa', 'frontend', 'backend', 'hr')
 * @returns {Promise<string[]>} List of interview questions
 */
export async function getQuestions(category) {
  // Simulate network request latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // 1. Check if user generated questions are saved in localStorage
  const localQuestionsStr = localStorage.getItem('generatedQuestions');
  if (localQuestionsStr) {
    try {
      const parsed = JSON.parse(localQuestionsStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If they are specific to this category (case insensitive comparison)
        const filtered = parsed.filter(q => {
          const cat = q.category || '';
          return cat.toLowerCase().includes(category?.toLowerCase()) || 
                 category?.toLowerCase().includes(cat.toLowerCase());
        });
        if (filtered.length > 0) {
          return filtered.map(q => q.questionText || q.text || q);
        }
        return parsed.map(q => q.questionText || q.text || q);
      }
    } catch (e) {
      console.warn('Error parsing generatedQuestions from localStorage:', e);
    }
  }

  // 2. Otherwise use the fallback mock questions as requested
  return [
    "Explain difference between REST and GraphQL",
    "What is memoization in React",
    "How to optimize a slow SQL query"
  ];
}

/**
 * Client-side fallback rule-based evaluation logic in case the backend server is offline.
 */
function localEvaluateSession(questions) {
  let totalScore = 0;
  const evaluatedQuestions = questions.map((q, idx) => {
    const text = q.questionText || '';
    const answer = q.userAnswer || '';
    
    // 1. Length scoring (up to 3 points)
    let lengthScore = 1;
    if (answer.length >= 300) {
      lengthScore = 3;
    } else if (answer.length >= 150) {
      lengthScore = 2.5;
    } else if (answer.length >= 50) {
      lengthScore = 2;
    } else if (answer.length > 10) {
      lengthScore = 1.5;
    }

    // 2. Structure scoring (up to 3 points)
    const structureKeywords = [
      'first', 'second', 'third', 'finally', 'lastly', 'however', 'therefore',
      'for example', 'specifically', 'resolved', 'outcome', 'situation', 'task',
      'action', 'result', 'because', 'consequently', 'furthermore', 'in addition'
    ];
    let matchedStructure = 0;
    structureKeywords.forEach(kw => {
      if (answer.toLowerCase().includes(kw)) {
        matchedStructure++;
      }
    });
    let structureScore = 1;
    if (matchedStructure >= 4) {
      structureScore = 3;
    } else if (matchedStructure >= 2) {
      structureScore = 2.3;
    } else if (matchedStructure >= 1) {
      structureScore = 1.8;
    }

    // 3. Keyword matching (up to 4 points)
    let techKeywords;
    const qLower = text.toLowerCase();
    if (qLower.includes('rest') || qLower.includes('graphql')) {
      techKeywords = ['rest', 'graphql', 'query', 'mutation', 'schema', 'endpoint', 'over-fetching', 'under-fetching', 'http', 'json', 'post', 'resolver'];
    } else if (qLower.includes('memoization') || qLower.includes('react') || qLower.includes('render')) {
      techKeywords = ['memoization', 'react', 'memo', 'usememo', 'usecallback', 'render', 're-render', 'dependency', 'cache', 'state', 'props', 'performance'];
    } else if (qLower.includes('sql') || qLower.includes('query') || qLower.includes('optimize') || qLower.includes('database')) {
      techKeywords = ['sql', 'query', 'optimize', 'index', 'indices', 'execution plan', 'explain', 'join', 'select', 'where', 'indexes', 'slow', 'cache', 'bottleneck'];
    } else if (qLower.includes('security') || qLower.includes('vulnerabilities') || qLower.includes('xss') || qLower.includes('csrf')) {
      techKeywords = ['security', 'xss', 'csrf', 'sanitize', 'token', 'cookie', 'http', 'header', 'cors', 'validate', 'encode', 'escape'];
    } else if (qLower.includes('conflict') || qLower.includes('disagree') || qLower.includes('colleague')) {
      techKeywords = ['disagree', 'colleague', 'conflict', 'communication', 'listen', 'compromise', 'respect', 'feedback', 'perspective', 'resolution', 'align'];
    } else {
      techKeywords = ['experience', 'process', 'team', 'challenge', 'result', 'measure', 'solve', 'solution', 'analyze', 'implement'];
    }

    let matchedTech = 0;
    techKeywords.forEach(kw => {
      if (answer.toLowerCase().includes(kw)) {
        matchedTech++;
      }
    });

    let keywordScore = 1;
    if (matchedTech >= 5) {
      keywordScore = 4;
    } else if (matchedTech >= 3) {
      keywordScore = 3;
    } else if (matchedTech >= 1) {
      keywordScore = 2;
    }

    let score = parseFloat((lengthScore + structureScore + keywordScore).toFixed(1));
    score = Math.max(1, Math.min(10, score));
    totalScore += score;

    let qFeedback;
    let qStrength;
    let qImprovement;

    if (score >= 9) {
      qFeedback = 'Excellent answer. You covered technical details comprehensively with solid structure.';
      qStrength = `Great usage of terms like ${techKeywords.slice(0, 3).join(', ')} and clear logical flow.`;
      qImprovement = 'Proactively mention performance trade-offs or alternative approaches to show even deeper mastery.';
    } else if (score >= 7) {
      qFeedback = 'Good explanation, but could incorporate more specific terminology or deeper structure.';
      qStrength = 'Good articulation of the key concepts and reasonable detail length.';
      qImprovement = `Incorporate more target keywords such as: ${techKeywords.filter(k => !answer.toLowerCase().includes(k)).slice(0, 3).join(', ')}.`;
    } else if (score >= 5) {
      qFeedback = 'Average answer. Focus on expanding technical explanations and structuring the response.';
      qStrength = 'Demonstrates basic familiarity with the concepts.';
      qImprovement = 'Expand your answer to cover specific scenarios, improve grammatical flow, and add real-world examples.';
    } else {
      qFeedback = 'Poor explanation. The response is too short or lacks technical substance.';
      qStrength = 'Attempted to address the question prompt.';
      qImprovement = 'Significantly increase detail length, use structured explanation patterns, and explain how the underlying technology operates.';
    }

    return {
      _id: q._id || 'q-' + idx,
      questionText: text,
      userAnswer: answer,
      score: score,
      feedback: qFeedback,
      strength: qStrength,
      improvement: qImprovement
    };
  });

  const averageScore = parseFloat((totalScore / questions.length).toFixed(1));

  let overallFeedback;
  let badge;
  let strengths;
  let improvements;

  if (averageScore >= 8) {
    overallFeedback = 'Excellent communication and technical clarity.';
    badge = 'Expert Candidate';
    strengths = [
      'Exceptional depth in explaining core engineering/technical principles.',
      'Highly structured delivery patterns (consistent with STAR framework).',
      'Strong integration of industry-standard jargon and relevant concepts.'
    ];
    improvements = [
      'Proactively outline edge cases or trade-offs before the interviewer prompts.',
      'Reduce vocal filler simulation by maintaining composed pause structures.'
    ];
  } else if (averageScore >= 6) {
    overallFeedback = 'Good answers but improve depth and examples.';
    badge = 'Capable Professional';
    strengths = [
      'Clear baseline explanation of technical concepts.',
      'Well-organized transition words helping the logical flow.',
      'Good engagement with the key components of the prompts.'
    ];
    improvements = [
      'Incorporate more concrete metrics, tools, or real-world experience details.',
      'Extend answer lengths to cover structural details rather than just high-level overviews.',
      'Ensure standard engineering terms are always mentioned where relevant.'
    ];
  } else {
    overallFeedback = 'Needs better structure and stronger technical explanation.';
    badge = 'Needs Development';
    strengths = [
      'Completed all interview questions under timer constraints.',
      'Identified core terms related to the question topic.'
    ];
    improvements = [
      'Significantly restructure responses using clear numbering or sequential steps.',
      'Practice technical definitions and write more comprehensive, detailed descriptions.',
      'Study underlying concepts to increase keyword usage and depth.'
    ];
  }

  return {
    questions: evaluatedQuestions,
    overallScore: averageScore,
    overallFeedback: overallFeedback,
    grade: badge,
    strengths: strengths,
    improvements: improvements
  };
}
