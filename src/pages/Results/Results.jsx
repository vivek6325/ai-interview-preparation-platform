import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Results.css';

/**
 * Results Component
 * 
 * Displays the final evaluation scores, overall rating, list of strengths,
 * areas for improvement, and detailed feedback per question.
 */
function Results() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState('normal');

  const handleRetry = () => {
    navigate('/dashboard');
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
      <div className="results-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
        <div className="state-container" style={{ minHeight: 'auto', background: 'transparent', border: 'none' }}>
          <div className="score-summary-panel" style={{ margin: '0 auto 24px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="avatar-pulse-ring recording-active" style={{ width: '120px', height: '120px' }}></div>
            <span style={{ fontSize: '3rem' }}>📊</span>
          </div>
          <h3>Compiling AI Evaluation...</h3>
          <p>Processing speech audio metrics, calculating speaking pace, and summarizing custom STAR strengths. Generating your personalized report card...</p>
          <div className="skeleton-shimmer" style={{ width: '220px', height: '6px', margin: '0 auto', borderRadius: '3px' }}></div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'empty') {
    return (
      <div className="results-container">
        <div className="state-container">
          <div className="state-icon-wrapper">📊</div>
          <h3>No Assessment Found</h3>
          <p>There are no evaluation reports available for this session. Complete a mock interview practice domain first to view your scores.</p>
          <div>
            <button className="state-btn" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            <button className="state-btn-secondary" onClick={() => setDemoState('normal')}>Mock Load</button>
          </div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="results-container">
        <div className="state-container error">
          <div className="state-icon-wrapper">⚠️</div>
          <h3>Evaluation Engine Timeout</h3>
          <p>The AI speech evaluator took longer than expected to respond. We were unable to fetch your performance statistics.</p>
          <div>
            <button className="state-btn" onClick={() => setDemoState('normal')}>Retry Retrieval</button>
            <button className="state-btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  // Structured dummy data for the evaluation
  const evaluationResult = {
    overallScore: 84,
    grade: 'Strong Candidate',
    verdict: 'Excellent job! You demonstrated a deep understanding of core architectural patterns and structured your behavioral answers logically using the STAR framework. To reach the next level, try to reduce vocal fillers and mention more specific profiling tools in your technical explanations.',
    metrics: [
      { name: 'Technical Accuracy', score: 88, color: '#6366f1', description: 'Correctness of concepts and depth of details.' },
      { name: 'Communication & Pacing', score: 78, color: '#a855f7', description: 'Speaking pace (WPM), confidence, and tone.' },
      { name: 'Problem Solving Method', score: 86, color: '#10b981', description: 'Structuring scenarios and handling edge cases.' },
    ],
    strengths: [
      {
        id: 'strength-1',
        title: 'Structured Answer Delivery',
        description: 'You structured your situational behavioral responses using the Situation, Task, Action, and Result (STAR) framework, making it easy to track your contributions.',
        icon: '🎯'
      },
      {
        id: 'strength-2',
        title: 'Core Concept Explanation',
        description: 'Your definition of complex architectural patterns (like React diffing and database replication) was clear, accurate, and easy to follow.',
        icon: '🧠'
      },
      {
        id: 'strength-3',
        title: 'Optimal Communication Pace',
        description: 'You maintained an average of 135 words per minute, which is the sweet spot for clear articulation during technical explanations.',
        icon: '🗣️'
      }
    ],
    improvements: [
      {
        id: 'improvement-1',
        title: 'Incorporate Real-World Profiling Metrics',
        description: 'When discussing performance bottlenecks, mention specific debugging tools (e.g. Chrome DevTools Performance tab, database query explain plans) to show hands-on experience.',
        icon: '🛠️'
      },
      {
        id: 'improvement-2',
        title: 'Reduce Vocal Fillers',
        description: 'Our speech analyzer detected occasional use of filler phrases (such as "like", "you know", and "um"). Pausing silently is a better alternative to gather your thoughts.',
        icon: '📈'
      },
      {
        id: 'improvement-3',
        title: 'Elaborate on System Edge Cases',
        description: 'Try to proactively cover trade-offs (e.g., explaining when NOT to apply caching or useMemo to avoid over-engineering) before the interviewer asks.',
        icon: '💡'
      }
    ],
    questionsBreakdown: [
      {
        number: 1,
        question: 'Tell me about a time you had to resolve a performance issue in a web application. What metrics did you monitor?',
        score: 85,
        strength: 'Great explanation of database connection pool exhaustion and client-side asset optimizations.',
        improvement: 'Reference specific tools like Lighthouse, Web Vitals, or database slow query logs to solidify your explanation.'
      },
      {
        number: 2,
        question: "Explain how React's Virtual DOM works, and what optimization hooks you use to avoid unnecessary re-renders.",
        score: 83,
        strength: 'Clear definition of reconciliation, fiber nodes, and when to use memoization structures.',
        improvement: 'Clarify that useMemo carries memory overhead and explain the criteria for when memoization is actually beneficial.'
      }
    ]
  };

  return (
    <div className="results-container">
      <div className="results-glow-orb results-orb-1"></div>
      <div className="results-glow-orb results-orb-2"></div>

      {/* Completion Header Banner */}
      <section className="completion-banner">
        <div className="completion-badge-shield">🏆</div>
        <div className="completion-message">
          <h1>Interview Session Completed!</h1>
          <p>Congratulations on finishing your mock practice session. Here is your AI-powered performance analysis.</p>
        </div>
      </section>

      {/* Score Dashboard & Metrics */}
      <div className="results-board">
        {/* Score Ring Summary Panel */}
        <div className="score-summary-panel">
          <div className="score-ring">
            <svg viewBox="0 0 100 100">
              <circle className="ring-track" cx="50" cy="50" r="40" />
              <circle 
                className="ring-fill" 
                cx="50" 
                cy="50" 
                r="40" 
                style={{ strokeDashoffset: `calc(251.2 - (251.2 * ${evaluationResult.overallScore}) / 100)` }} 
              />
            </svg>
            <div className="score-text">
              <span className="number">{evaluationResult.overallScore}</span>
              <span className="percent">%</span>
            </div>
          </div>
          <div className="grade-badge">{evaluationResult.grade}</div>
          <p className="summary-verdict">{evaluationResult.verdict}</p>
        </div>

        {/* Detailed stats bars */}
        <div className="metrics-panel">
          <h3>Dimension Breakdown</h3>
          <div className="metrics-list">
            {evaluationResult.metrics.map((metric, index) => (
              <div key={index} className="metric-bar-group">
                <div className="metric-bar-header">
                  <div className="metric-meta">
                    <span className="metric-title">{metric.name}</span>
                    <span className="metric-desc">{metric.description}</span>
                  </div>
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

      {/* Key Strengths & Areas for Improvement Split Grid */}
      <div className="feedback-split-grid">
        {/* Strengths Column */}
        <div className="feedback-column strengths-card">
          <div className="column-header">
            <span className="header-icon green">✨</span>
            <h2>Key Strengths</h2>
          </div>
          <ul className="feedback-bullets">
            {evaluationResult.strengths.map((item) => (
              <li key={item.id} className="feedback-bullet-item">
                <span className="item-emoji">{item.icon}</span>
                <div className="item-content">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements Column */}
        <div className="feedback-column improvements-card">
          <div className="column-header">
            <span className="header-icon amber">🎯</span>
            <h2>Areas for Improvement</h2>
          </div>
          <ul className="feedback-bullets">
            {evaluationResult.improvements.map((item) => (
              <li key={item.id} className="feedback-bullet-item">
                <span className="item-emoji">{item.icon}</span>
                <div className="item-content">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question Breakdown Details */}
      <section className="detailed-feedback-section">
        <h2>Question-by-Question Feedback</h2>
        <div className="feedback-cards-grid">
          {evaluationResult.questionsBreakdown.map((item) => (
            <div key={item.number} className="feedback-card">
              <div className="feedback-card-header">
                <h4>Q{item.number}: {item.question}</h4>
                <span className="question-score-badge">Score: {item.score}%</span>
              </div>
              
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

      {/* Back to Dashboard CTA */}
      <div className="results-cta">
        <button className="btn-results-retry" onClick={handleRetry}>
          Back to Dashboard
        </button>
      </div>
      {renderDemoSelector()}
    </div>
  );
}

export default Results;
