import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

/**
 * Dashboard Component
 * 
 * Renders user prep analytics summary and cards representing target roles.
 * Clicking a role button navigates the user to the Interview route.
 */
function Dashboard() {
  const navigate = useNavigate();

  // Handle starting a specific mock interview session
  const handleStartMock = (categoryName) => {
    // Navigate to the interview room page, passing category details as state
    navigate('/interview', { state: { category: categoryName } });
  };

  // User statistics summary for tracking progress
  const dashboardStats = [
    { label: 'Interviews Completed', value: '12 sessions', icon: '✅' },
    { label: 'Average Score', value: '82%', icon: '📈' },
    { label: 'Speaking Pace', value: '135 WPM (Optimal)', icon: '🗣️' },
  ];

  // The 4 requested interview category tracks
  const interviewCategories = [
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-glow-orb dashboard-orb-1"></div>
      
      {/* Header section with Welcome text */}
      <header className="dashboard-header">
        <h1>Interview Prep Dashboard</h1>
        <p>Track your analytical progress and launch simulated AI interview panels.</p>
      </header>

      {/* Analytics highlights */}
      <section className="stats-grid">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Available Session Tracks */}
      <section className="roles-section">
        <h2>Choose Your Practice Domain</h2>
        <div className="roles-grid">
          {interviewCategories.map((category) => (
            <div key={category.id} className="role-card">
              <div className="role-card-header">
                <span className={`difficulty-pill ${category.theme}`}>
                  {category.difficulty}
                </span>
                <span className="question-count">
                  <span className="icon-badge">{category.icon}</span> {category.questions} Questions
                </span>
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <button 
                className="btn-start-role-mock"
                onClick={() => handleStartMock(category.title)}
              >
                Start Interview
                <span className="arrow">→</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
