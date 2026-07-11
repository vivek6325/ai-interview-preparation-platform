/**
 * Central constants for the AI Interview Preparation Platform.
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

export const LOCAL_STORAGE_KEYS = {
  AUTH: 'isAuthenticated',
  LOCAL_INTERVIEWS: 'localInterviews',
  GENERATED_QUESTIONS: 'generatedQuestions'
};

export const API_ENDPOINTS = {
  INTERVIEWS: '/interviews'
};

// The interview category tracks available on the Dashboard
export const interviewCategories = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms (DSA)',
    description: 'Master core computational concepts: arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming optimization.',
    difficulty: DIFFICULTY.HARD,
    questions: 25,
    icon: '💻',
    theme: 'hard'
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Challenge yourself with core JS/TS internals, React component lifecycle, CSS layout systems, performance tuning, and client-side architecture.',
    difficulty: DIFFICULTY.MEDIUM,
    questions: 18,
    icon: '🎨',
    theme: 'medium'
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Assess your skills in database schema design, rest APIs, system cache patterns, queue workers, concurrency control, and scalability principles.',
    difficulty: DIFFICULTY.HARD,
    questions: 20,
    icon: '⚙️',
    theme: 'hard'
  },
  {
    id: 'hr',
    title: 'Human Resources (HR)',
    description: 'Practice situational judgment scenarios, STAR-based behavioral questions, leadership principles, and workplace cultural alignment.',
    difficulty: DIFFICULTY.EASY,
    questions: 12,
    icon: '🤝',
    theme: 'easy'
  },
];

