import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Results.css';

/**
 * Results Component
 * 
 * Renders final evaluation scores and actionable feedback recommendations.
 * Allows retry setup routing back to the dashboard.
 */
function Results() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/dashboard');
  };

  const performanceMetrics = [
    { name: 'Content Relevance', score: 85, color: '#6366f1' },
    { name: 'Speaking Pace', score: 92, color: '#10b981' },
    { name: 'Tone Confidence', score: 78, color: '#a855f7' },
  ];

  const feedbackList = [
    {
      question: "Tell me about a time you had to resolve a performance issue in a web application.",
      strength: "Strong structural layout using the STAR method. Good articulation of caching strategies.",
      improvement: "Mention specific profiling tools (like Lighthouse or Chrome DevTools Performance tab) to demonstrate hands-on debugging.",
    },
    {
      question: "Explain how React's Virtual DOM works, and what optimization hooks you use.",
      strength: "Clear, concise definition of reconciliation and diffing algorithms.",
      improvement: "Elaborate further on when not to use useMemo to avoid over-optimizing prematurely.",
    }
  ];

  return (
    <div className="results-container">
      <div className="results-glow-orb"></div>

      <header className="results-header">
        <h1>Analysis Results</h1>
        <p>Your performance breakdown and AI insights.</p>
      </header>

      {/* Main Results Board */}
      <div className="results-board">
        
        {/* Score Ring Summary Panel */}
        <div className="score-summary-panel">
          <div className="score-ring">
            <svg viewBox="0 0 100 100">
              <circle className="ring-track" cx="50" cy="50" r="40" />
              <circle className="ring-fill" cx="50" cy="50" r="40" style={{ strokeDashoffset: 'calc(251.2 - (251.2 * 82) / 100)' }} />
            </svg>
            <div className="score-text">
              <span className="number">82</span>
              <span className="percent">%</span>
            </div>
          </div>
          <div className="grade-badge">Ready to Apply</div>
          <p className="summary-verdict">
            Great performance! Your speaking speed was steady, and you answered tech questions logically. 
            Add a few more metrics to stand out.
          </p>
        </div>

        {/* Detailed stats bars */}
        <div className="metrics-panel">
          <h3>Dimension Breakdown</h3>
          <div className="metrics-list">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="metric-bar-group">
                <div className="metric-bar-header">
                  <span>{metric.name}</span>
                  <span className="metric-score-text" style={{ color: metric.color }}>{metric.score}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${metric.score}%`, backgroundColor: metric.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Detailed Feedback Cards */}
      <section className="detailed-feedback-section">
        <h2>Question Breakdown & Feedback</h2>
        <div className="feedback-cards-grid">
          {feedbackList.map((item, idx) => (
            <div key={idx} className="feedback-card">
              <h4>Q{idx + 1}: {item.question}</h4>
              
              <div className="feedback-point strength">
                <span className="point-icon">🔥</span>
                <div>
                  <strong>Key Strength:</strong>
                  <p>{item.strength}</p>
                </div>
              </div>

              <div className="feedback-point improvement">
                <span className="point-icon">💡</span>
                <div>
                  <strong>Area for Growth:</strong>
                  <p>{item.improvement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Retry Call to Action */}
      <div className="results-cta">
        <button className="btn-results-retry" onClick={handleRetry}>
          Back to Dashboard
        </button>
      </div>

    </div>
  );
}

export default Results;
