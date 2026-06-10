/**
 * Central constants for the AI Interview Preparation Platform.
 * Grouping these details here allows easier configuration and future AI model integration.
 */

// User statistics summary for tracking progress on the Dashboard
export const dashboardStats = [
  { label: 'Interviews Completed', value: '12 sessions', icon: '✅' },
  { label: 'Average Score', value: '82%', icon: '📈' },
  { label: 'Speaking Pace', value: '135 WPM (Optimal)', icon: '🗣️' },
];

// The interview category tracks available on the Dashboard
export const interviewCategories = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms (DSA)',
    description: 'Master core computational concepts: arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming optimization.',
    difficulty: 'Hard',
    questions: 25,
    icon: '💻',
    theme: 'hard'
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Challenge yourself with core JS/TS internals, React component lifecycle, CSS layout systems, performance tuning, and client-side architecture.',
    difficulty: 'Medium',
    questions: 18,
    icon: '🎨',
    theme: 'medium'
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Assess your skills in database schema design, rest APIs, system cache patterns, queue workers, concurrency control, and scalability principles.',
    difficulty: 'Hard',
    questions: 20,
    icon: '⚙️',
    theme: 'hard'
  },
  {
    id: 'hr',
    title: 'Human Resources (HR)',
    description: 'Practice situational judgment scenarios, STAR-based behavioral questions, leadership principles, and workplace cultural alignment.',
    difficulty: 'Easy',
    questions: 12,
    icon: '🤝',
    theme: 'easy'
  },
];

// Sample questions used in the simulated AI Interview room
export const mockQuestions = [
  "Tell me about a time you had to resolve a performance issue in a web application. What metrics did you monitor, and what was the outcome?",
  "Explain how React's Virtual DOM works, and what optimization hooks you use to avoid unnecessary re-renders.",
  "Describe a challenging situation where you disagreed with a colleague on a technical decision. How did you approach the conversation?",
  "How do you ensure application security and prevent common vulnerabilities like XSS or CSRF in your frontend systems?"
];
