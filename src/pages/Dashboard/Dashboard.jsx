import React from 'react';
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

  // Handle starting a specific mock interview configuration
  const handleStartMock = (roleName) => {
    // Navigate to the interview setup route
    navigate('/interview');
  };

  const dashboardStats = [
    { label: 'Interviews Completed', value: '12', icon: '✅' },
    { label: 'Average Score', value: '82%', icon: '📈' },
    { label: 'Speaking Pace', value: '135 WPM (Optimal)', icon: '🗣️' },
  ];

  const interviewRoles = [
    {
      id: 'frontend',
      title: 'Frontend Engineer',
      description: 'Test your React, JS core internals, CSS systems, and frontend architectural skills.',
      difficulty: 'Intermediate',
      questions: 15,
    },
    {
      id: 'backend',
      title: 'Backend Engineer',
      description: 'Prepare on database consistency, caching, distributed locks, API design, and web concurrency.',
      difficulty: 'Advanced',
      questions: 18,
    },
    {
      id: 'system-design',
      title: 'System Design Specialist',
      description: 'Deep dive into load balancing, message queues, horizontal scaling, and high-availability patterns.',
      difficulty: 'Expert',
      questions: 10,
    },
    {
      id: 'behavioral',
      title: 'Behavioral Prep (STAR)',
      description: 'Practice structuring answers using Situation, Task, Action, and Result formats with AI pacing metrics.',
      difficulty: 'All Levels',
      questions: 12,
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-glow-orb dashboard-orb-1"></div>
      
      {/* Header section with Welcome text */}
      <header className="dashboard-header">
        <h1>Prep Dashboard</h1>
        <p>Analyze your progress and launch customized AI interview sessions.</p>
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
        <h2>Select an Interview Track</h2>
        <div className="roles-grid">
          {interviewRoles.map((role) => (
            <div key={role.id} className="role-card">
              <div className="role-card-header">
                <span className={`difficulty-pill ${role.difficulty.toLowerCase().replace(' ', '-')}`}>
                  {role.difficulty}
                </span>
                <span className="question-count">{role.questions} Questions</span>
              </div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <button 
                className="btn-start-role-mock"
                onClick={() => handleStartMock(role.title)}
              >
                Launch Mock Session
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
