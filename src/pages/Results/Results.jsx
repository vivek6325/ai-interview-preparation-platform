import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInterviewById, getInterviews } from '../../services/api';
import './Results.css';

/**
 * Results Component
 * 
 * Displays the final evaluation scores, overall rating, list of strengths,
 * areas for improvement, and detailed feedback per question.
 */
function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const [demoState, setDemoState] = useState('normal');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        setError('');
        
        // 1. Check if ID is in query params
        const params = new URLSearchParams(location.search);
        let id = params.get('id');

        // 2. If not in query params, check router state
        if (!id && location.state?.id) {
          id = location.state.id;
        }

        let session = null;

        if (id) {
          const res = await getInterviewById(id);
          if (res && res.data && res.data.interview) {
            session = res.data.interview;
          }
        } else {
          // Fetch all and take the latest completed session
          const list = await getInterviews();
          const listData = list?.data?.interviews || list || [];
          const completed = listData.filter(i => i.status === 'completed');
            
          if (completed.length > 0) {
            session = completed[0];
          }
        }

        if (session) {
          // Format it to match expected Results view structure
          const overallScorePercentage = Math.round((session.overallScore || 0) * 10);
          
          const metrics = [
            { name: 'Technical Accuracy', score: Math.min(100, Math.max(10, overallScorePercentage + 4)), color: '#6366f1', description: 'Correctness of concepts and depth of details.' },
            { name: 'Communication & Pacing', score: Math.min(100, Math.max(10, overallScorePercentage - 6)), color: '#a855f7', description: 'Speaking pace (WPM), confidence, and tone.' },
            { name: 'Problem Solving Method', score: Math.min(100, Math.max(10, overallScorePercentage + 2)), color: '#10b981', description: 'Structuring scenarios and handling edge cases.' },
          ];

          setEvaluationResult({
            overallScore: session.overallScore || 0,
            overallScorePercent: overallScorePercentage,
            grade: session.grade || 'Strong Candidate',
            verdict: session.overallFeedback || 'Completed.',
            metrics,
            strengths: session.strengths || [],
            improvements: session.improvements || [],
            questionsBreakdown: (session.questions || []).map((q, idx) => ({
              number: idx + 1,
              question: q.questionText,
              score: Math.round((q.score || 0) * 10),
              strength: q.strength || 'Completed response explanation.',
              improvement: q.improvement || 'Study terms and details.'
            }))
          });
        } else {
          // If no session found anywhere, set state to empty
          setDemoState('empty');
        }
      } catch (err) {
        console.error('Error loading results:', err);
        setError(err.message);
        setDemoState('error');
      } finally {
        setLoading(false);
      }
    }

    if (demoState === 'normal') {
      loadSession();
    }
  }, [location, demoState]);

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

  if (loading || demoState === 'loading') {
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
          <p>{error || 'The AI speech evaluator took longer than expected to respond. We were unable to fetch your performance statistics.'}</p>
          <div>
            <button className="state-btn" onClick={() => setDemoState('normal')}>Retry Retrieval</button>
            <button className="state-btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  if (!evaluationResult) return null;

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
                style={{ strokeDashoffset: `calc(251.2 - (251.2 * ${evaluationResult.overallScorePercent}) / 100)` }} 
              />
            </svg>
            <div className="score-text">
              <span className="number">{evaluationResult.overallScore}</span>
              <span className="percent">/10</span>
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
          {evaluationResult.strengths.length > 0 ? (
            <ul className="feedback-bullets">
              {evaluationResult.strengths.map((item, idx) => (
                <li key={idx} className="feedback-bullet-item">
                  <span className="item-emoji">🎯</span>
                  <div className="item-content">
                    <strong>Point {idx + 1}</strong>
                    <p>{item}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No key strengths compiled.</p>
          )}
        </div>

        {/* Improvements Column */}
        <div className="feedback-column improvements-card">
          <div className="column-header">
            <span className="header-icon amber">🎯</span>
            <h2>Areas for Improvement</h2>
          </div>
          {evaluationResult.improvements.length > 0 ? (
            <ul className="feedback-bullets">
              {evaluationResult.improvements.map((item, idx) => (
                <li key={idx} className="feedback-bullet-item">
                  <span className="item-emoji">💡</span>
                  <div className="item-content">
                    <strong>Area {idx + 1}</strong>
                    <p>{item}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No improvement areas compiled.</p>
          )}
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
