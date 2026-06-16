/**
 * Shared utility helper functions for the frontend.
 */

/**
 * Formats an ISO date string into a clean, human-readable format.
 * @param {string|Date} dateVal - Date input
 * @returns {string} Formatted date (e.g. "June 16, 2026")
 */
export function formatDate(dateVal) {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats a duration in seconds into MM:SS format.
 * @param {number} seconds - Number of seconds
 * @returns {string} Formatted duration (e.g., "01:15")
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates score percentage rounded to nearest integer.
 * @param {number} score - Achieved score
 * @param {number} maxScore - Maximum possible score
 * @returns {number} Score percentage (0-100)
 */
export function calculateScorePercentage(score, maxScore = 10) {
  if (!score || !maxScore) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Safely extracts error message string from an API response error object.
 * @param {Object|Error} error - Catch exception object
 * @returns {string} Contextual user-friendly message
 */
export function extractErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;
  
  // Custom API response check
  if (error.message) {
    return error.message;
  }
  
  return 'Connection timed out or invalid server response.';
}

/**
 * Validates that an answer response text is valid (non-empty, meets baseline criteria).
 * @param {string} text - Typed answer content
 * @returns {Object} Validation result { isValid, message }
 */
export function validateAnswer(text) {
  const trimmed = text ? text.trim() : '';
  if (!trimmed) {
    return {
      isValid: false,
      message: 'Your answer response cannot be empty.'
    };
  }
  if (trimmed.length < 5) {
    return {
      isValid: false,
      message: 'Please provide a more detailed response to address the question.'
    };
  }
  return {
    isValid: true,
    message: ''
  };
}
