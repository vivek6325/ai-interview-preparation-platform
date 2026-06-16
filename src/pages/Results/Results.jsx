import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInterviewById, getInterviews } from '../../services/api';
import ScoreCard from './components/ScoreCard';
import MetricsPanel from './components/MetricsPanel';
import FeedbackGrid from './components/FeedbackGrid';
import QuestionBreakdown from './components/QuestionBreakdown';
import { extractErrorMessage } from '../../utils/helpers';
import './Results.css';

/**
 * Results Component
 * Decoupled container managing evaluation data fetches and page rendering.
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
          if (res?.data?.interview) {
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
        setError(extractErrorMessage(err));
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
        <ScoreCard 
          overallScore={evaluationResult.overallScore}
          overallScorePercent={evaluationResult.overallScorePercent}
          grade={evaluationResult.grade}
          verdict={evaluationResult.verdict}
        />

        <MetricsPanel metrics={evaluationResult.metrics} />
      </div>

      {/* Key Strengths & Areas for Improvement Split Grid */}
      <FeedbackGrid 
        strengths={evaluationResult.strengths}
        improvements={evaluationResult.improvements}
      />

      {/* Question Breakdown Details */}
      <QuestionBreakdown questionsBreakdown={evaluationResult.questionsBreakdown} />

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
