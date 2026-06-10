import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardStats, interviewCategories } from '../../utils/constants';
import './Dashboard.css';

/**
 * Dashboard Component
 * 
 * Renders user prep analytics summary and cards representing target roles.
 * Clicking a role button navigates the user to the Interview route.
 */
function Dashboard() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState('normal');

  // Handle starting a specific mock interview session
  const handleStartMock = (categoryName) => {
    // Navigate to the interview room page, passing category details as state
    navigate('/interview', { state: { category: categoryName } });
  };

  const renderDemoSelector = () => (
    <div className="demo-state-selector">
      <span>Demo State:</span>
      <button className={`demo-btn ${demoState === 'normal' ? 'active' : ''}`} onClick={() => setDemoState('normal')}>Normal</button>
      <button className={`demo-btn ${demoState === 'loading' ? 'active' : ''}`} onClick={() => setDemoState('loading')}>Loading</button>
      <button className={`demo-btn ${demoState === 'empty' ? 'active' : ''}`} onClick={() => setDemoState('empty')}>Empty</button>
      <button className={`demo-btn ${demoState === 'error' ? 'active' : ''}`} onClick={() => setDemoState('error')}>Error</button>
    </div>
  );

  if (demoState === 'loading') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="skeleton-shimmer" style={{ width: '320px', height: '40px', marginBottom: '12px' }}></div>
          <div className="skeleton-shimmer" style={{ width: '450px', height: '20px' }}></div>
        </header>

        <section className="stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card skeleton-shimmer" style={{ height: '94px', border: 'none', background: 'rgba(255, 255, 255, 0.02)' }}></div>
          ))}
        </section>

        <section className="roles-section">
          <div className="skeleton-shimmer" style={{ width: '250px', height: '30px', marginBottom: '24px' }}></div>
          <div className="roles-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="role-card skeleton-shimmer" style={{ height: '280px', border: 'none', background: 'rgba(255, 255, 255, 0.02)' }}></div>
            ))}
          </div>
        </section>
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'empty') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Interview Prep Dashboard</h1>
          <p>Track your analytical progress and launch simulated AI interview panels.</p>
        </header>
        
        <div className="state-container">
          <div className="state-icon-wrapper">📦</div>
          <h3>No Practice Domains Available</h3>
          <p>We couldn't retrieve any interview practice tracks right now. Please check back shortly or reload the list.</p>
          <button className="state-btn" onClick={() => setDemoState('normal')}>Load Categories</button>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Interview Prep Dashboard</h1>
          <p>Track your analytical progress and launch simulated AI interview panels.</p>
        </header>

        <div className="state-container error">
          <div className="state-icon-wrapper">⚠️</div>
          <h3>Dashboard Connection Failed</h3>
          <p>Unable to retrieve categories or analytics. This might be due to a mock backend response timeout or intermittent network status.</p>
          <div>
            <button className="state-btn" onClick={() => setDemoState('normal')}>Retry Loading</button>
            <button className="state-btn-secondary" onClick={() => navigate('/')}>Return Home</button>
          </div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }


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
      {renderDemoSelector()}
    </div>
  );
}

export default Dashboard;
