/**
 * Central constants for the backend services.
 */

export const DIFFICULTY = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard'
};

export const STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
};

export const PERFORMANCE_GRADES = {
  EXPERT: 'Expert Candidate',
  CAPABLE: 'Capable Professional',
  DEVELOPMENT: 'Needs Development'
};

export const FEEDBACK_VERDICTS = {
  EXPERT: 'Excellent communication and technical clarity.',
  CAPABLE: 'Good answers but improve depth and examples.',
  DEVELOPMENT: 'Needs better structure and stronger technical explanation.'
};

export const TECH_KEYWORDS = {
  REST_GRAPHQL: ['rest', 'graphql', 'query', 'mutation', 'schema', 'endpoint', 'over-fetching', 'under-fetching', 'http', 'json', 'post', 'resolver'],
  MEMO_REACT: ['memoization', 'react', 'memo', 'usememo', 'usecallback', 'render', 're-render', 'dependency', 'cache', 'state', 'props', 'performance'],
  SQL_OPTIMIZE: ['sql', 'query', 'optimize', 'index', 'indices', 'execution plan', 'explain', 'join', 'select', 'where', 'indexes', 'slow', 'cache', 'bottleneck'],
  SECURITY: ['security', 'xss', 'csrf', 'sanitize', 'token', 'cookie', 'http', 'header', 'cors', 'validate', 'encode', 'escape'],
  BEHAVIORAL: ['disagree', 'colleague', 'conflict', 'communication', 'listen', 'compromise', 'respect', 'feedback', 'perspective', 'resolution', 'align'],
  GENERAL: ['experience', 'process', 'team', 'challenge', 'result', 'measure', 'solve', 'solution', 'analyze', 'implement']
};
