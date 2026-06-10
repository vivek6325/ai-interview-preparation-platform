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

  // Handle starting a specific mock interview session
  const handleStartMock = (categoryName) => {
    // Navigate to the interview room page, passing category details as state
    navigate('/interview', { state: { category: categoryName } });
  };


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
