import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getQuestions, createInterview, updateInterview } from '../../services/api';
import './Interview.css';

/**
 * Interview Component
 * 
 * Simulates a live AI mock interview room.
 * Displays questions, accepts answers, and provides visual cues for pacing/recording.
 * Runs a 60 second timer per question.
 */
function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('Frontend Development');

  const timerRef = useRef(null);

  // Load questions and initialize session on mount
  useEffect(() => {
    const interviewCategory = location.state?.category || 'Frontend Development';
    setCategory(interviewCategory);

    async function initInterview() {
      try {
        setIsLoading(true);
        // Load questions
        const loadedQuestions = await getQuestions(interviewCategory);
        setQuestions(loadedQuestions);
        setAnswers(new Array(loadedQuestions.length).fill(''));

        // Initialize interview session in DB
        const res = await createInterview({
          title: `${interviewCategory} Mock Practice`,
          role: interviewCategory === 'hr' ? 'HR Specialist' : 'Software Engineer',
          difficulty: 'Medium',
          questions: loadedQuestions.map(q => ({
            questionText: q,
            userAnswer: '',
            score: null,
            feedback: ''
          }))
        });

        if (res?.data?.interview?._id) {
          setSessionId(res.data.interview._id);
        }
      } catch (err) {
        console.error('Error initializing interview room:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initInterview();
  }, [location.state]);

  // Timer Effect
  useEffect(() => {
    if (isLoading || isEvaluating || questions.length === 0) return;

    // Start timer interval
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isLoading, isEvaluating, currentQuestionIdx, questions]);

  // Handle countdown timeout - auto-saves and moves forward
  const handleTimeOut = () => {
    const fallbackAnswer = answerText.trim() || 'No response provided within 60 second timer limit.';
    saveAnswerAndAdvance(fallbackAnswer);
  };

  const getQuestionCategoryTag = (questionText) => {
    const text = questionText?.toLowerCase() || '';
    if (text.includes('rest') || text.includes('graphql')) return 'Backend';
    if (text.includes('react') || text.includes('memo') || text.includes('virtual dom')) return 'Frontend';
    if (text.includes('sql') || text.includes('query') || text.includes('optimize') || text.includes('database')) return 'DB';
    return 'General';
  };

  // Helper to save answer in state and move to next or submit
  const saveAnswerAndAdvance = async (answerToSave, isSkipping = false) => {
    setErrorMsg('');
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIdx] = answerToSave;
    setAnswers(updatedAnswers);

    // If it's the last question, submit the interview
    if (currentQuestionIdx === questions.length - 1) {
      await submitCompletedInterview(updatedAnswers);
    } else {
      // Clear timers and transition
      setCurrentQuestionIdx(prev => prev + 1);
      // Pre-populate if they already have an answer (e.g., if we went previous)
      setAnswerText(updatedAnswers[currentQuestionIdx + 1] || '');
      setTimeLeft(60);
    }
  };

  // Save answer inputs when Next Question is clicked
  const handleNextQuestion = () => {
    if (!answerText.trim()) {
      setErrorMsg('Answer response cannot be blank. Please write a reply or click "Skip Question" to skip.');
      return;
    }
    saveAnswerAndAdvance(answerText.trim());
  };

  // Skip question - saves placeholder answer and advances
  const handleSkipQuestion = () => {
    saveAnswerAndAdvance('Question was skipped by candidate.', true);
  };

  // Move back to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      // Save current input so progress isn't lost
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIdx] = answerText;
      setAnswers(updatedAnswers);

      setCurrentQuestionIdx(prev => prev - 1);
      setAnswerText(updatedAnswers[currentQuestionIdx - 1] || '');
      setTimeLeft(60);
      setErrorMsg('');
    }
  };

  // Submit and evaluate completed interview
  const submitCompletedInterview = async (finalAnswersList) => {
    try {
      setIsEvaluating(true);
      
      // Map questions with user answers
      const questionsWithAnswers = questions.map((q, idx) => ({
        questionText: q,
        userAnswer: finalAnswersList[idx]
      }));

      // Submit update with completed status
      const res = await updateInterview(sessionId, {
        status: 'completed',
        questions: questionsWithAnswers
      });

      if (res?.data?.interview?._id) {
        navigate(`/results?id=${res.data.interview._id}`);
      } else {
        navigate('/results');
      }
    } catch (err) {
      console.error('Error submitting interview response:', err);
      navigate('/results');
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (isLoading) {
    return (
      <div className="interview-room-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="state-container" style={{ minHeight: 'auto', background: 'transparent', border: 'none' }}>
          <div className="avatar-box" style={{ margin: '0 auto 24px' }}>
            <div className="avatar-pulse-ring recording-active"></div>
            <div className="avatar-core">
              <span className="avatar-brain-icon">🤖</span>
            </div>
          </div>
          <h3>Setting up AI Panel...</h3>
          <p>Initializing voice analysis engines and configuring audio streams. Please stand by...</p>
          <div className="skeleton-shimmer" style={{ width: '200px', height: '6px', margin: '0 auto', borderRadius: '3px' }}></div>
        </div>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="interview-room-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="state-container" style={{ minHeight: 'auto', background: 'transparent', border: 'none' }}>
          <div className="score-summary-panel" style={{ margin: '0 auto 24px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}>
            <div className="avatar-pulse-ring recording-active" style={{ width: '120px', height: '120px' }}></div>
            <span style={{ fontSize: '3rem' }}>📊</span>
          </div>
          <h3>Interview Completed</h3>
          <p>Evaluating your performance... Analyzing answer lengths, structure coherence, and vocabulary details.</p>
          <div className="skeleton-shimmer" style={{ width: '220px', height: '6px', margin: '0 auto', borderRadius: '3px' }}></div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="interview-room-container">
        <div className="state-container">
          <div className="state-icon-wrapper">📝</div>
          <h3>No Questions Found</h3>
          <p>We couldn't retrieve any mock questions for this category track. Please return to the practice selection panel and try another option.</p>
          <div>
            <button className="state-btn" onClick={() => navigate('/dashboard')}>Select Track</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionText = questions[currentQuestionIdx];
  const questionCategory = getQuestionCategoryTag(currentQuestionText);

  // Calculate progress percent
  const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;

  return (
    <div className="interview-room-container">
      <div className="interview-orb-bg"></div>

      {/* Progress Bar Header */}
      <div className="interview-progress-wrapper" style={{ width: '100%', marginBottom: '2rem' }}>
        <div className="progress-bar-bg" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
              transition: 'width 0.4s ease'
            }}
          ></div>
        </div>
      </div>

      <div className="interview-main-layout">
        
        {/* Left Side: Interviewer Avatar visual block */}
        <div className="avatar-section">
          <div className="avatar-box">
            <div className={`avatar-pulse-ring ${isRecording ? 'recording-active' : ''}`}></div>
            <div className="avatar-core">
              <span className="avatar-brain-icon">🤖</span>
            </div>
          </div>
          <div className="avatar-info-panel">
            <h3>PrepAI Assistant</h3>
            <p className="interviewer-status">
              {isRecording ? 'Listening and analyzing speaking pace...' : 'Awaiting response'}
            </p>
          </div>

          {/* Time Remaining Timer Badge */}
          <div 
            className={`timer-badge ${timeLeft <= 15 ? 'warning-timer' : ''}`}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '12px', 
              border: `1px solid ${timeLeft <= 15 ? 'rgba(239, 68, 68, 0.3)' : 'var(--card-border)'}`, 
              background: timeLeft <= 15 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)',
              color: timeLeft <= 15 ? '#f87171' : 'var(--text-primary)',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '80%'
            }}
          >
            ⏱️ {timeLeft}s Remaining
          </div>
        </div>

        {/* Right Side: Question & Response Board */}
        <div className="question-response-board">
          <div className="board-header">
            <span className="progress-badge">
              Question {currentQuestionIdx + 1} of {questions.length}
            </span>
            <span 
              className="category-pill"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-secondary)'
              }}
            >
              Tag: {questionCategory}
            </span>
          </div>

          <div className="question-container">
            <h2>{currentQuestionText}</h2>
          </div>

          <div className="response-container">
            <label htmlFor="answer-input">Your Answer Response</label>
            <textarea
              id="answer-input"
              rows="8"
              placeholder="Type your detailed response here. Explain concepts clearly, structural points, and use examples..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            {errorMsg && (
              <span className="error-text" style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '500', marginTop: '4px' }}>
                ⚠️ {errorMsg}
              </span>
            )}
          </div>

          {/* Action Panel */}
          <div className="action-panel">
            <div className="record-panel">
              <button 
                className={`btn-record ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                title={isRecording ? 'Pause Recording' : 'Start Voice Simulation'}
              >
                <span className="microphone-icon">{isRecording ? '🛑' : '🎙️'}</span>
                {isRecording ? 'Stop Recording' : 'Record Speaking'}
              </button>
              {isRecording && <span className="recording-timer">Pace: 135 WPM (Good)</span>}
            </div>

            <div className="navigation-actions">
              <button 
                className="btn-nav-page" 
                onClick={handlePrevQuestion}
                disabled={currentQuestionIdx === 0}
              >
                Previous
              </button>

              <button 
                className="btn-nav-page" 
                onClick={handleSkipQuestion}
                style={{ marginLeft: '8px', marginRight: '8px', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                Skip
              </button>
              
              {currentQuestionIdx < questions.length - 1 ? (
                <button className="btn-nav-page" onClick={handleNextQuestion} style={{ color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                  Next Question
                </button>
              ) : (
                <button 
                  className="btn-submit-interview"
                  onClick={handleNextQuestion}
                >
                  Submit & Finish
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Interview;
