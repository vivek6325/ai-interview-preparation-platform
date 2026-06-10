import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockQuestions } from '../../utils/constants';
import './Interview.css';

/**
 * Interview Component
 * 
 * Simulates a live AI mock interview room.
 * Displays questions, accepts answers, and provides visual cues for pacing/recording.
 * Submitting routes the user to the Results view.
 */
function Interview() {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState('normal');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

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
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'empty') {
    return (
      <div className="interview-room-container">
        <div className="state-container">
          <div className="state-icon-wrapper">📝</div>
          <h3>No Questions Found</h3>
          <p>We couldn't retrieve any mock questions for this category track. Please return to the practice selection panel and try another option.</p>
          <div>
            <button className="state-btn" onClick={() => navigate('/dashboard')}>Select Track</button>
            <button className="state-btn-secondary" onClick={() => setDemoState('normal')}>Mock Load</button>
          </div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }

  if (demoState === 'error') {
    return (
      <div className="interview-room-container">
        <div className="state-container error">
          <div className="state-icon-wrapper">🎙️</div>
          <h3>Speech Engine Failed</h3>
          <p>Unable to connect to the audio processing server. Please verify your microphone connection/permissions and retry.</p>
          <div>
            <button className="state-btn" onClick={() => setDemoState('normal')}>Retry Feed</button>
            <button className="state-btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
        {renderDemoSelector()}
      </div>
    );
  }



  const handleNextQuestion = () => {
    if (currentQuestionIdx < mockQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setAnswerText('');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
      setAnswerText('');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSubmitInterview = () => {
    // Navigate to Results page
    navigate('/results');
  };

  return (
    <div className="interview-room-container">
      <div className="interview-orb-bg"></div>

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
        </div>

        {/* Right Side: Question & Response Board */}
        <div className="question-response-board">
          <div className="board-header">
            <span className="progress-badge">
              Question {currentQuestionIdx + 1} of {mockQuestions.length}
            </span>
            <div className="pacing-indicator-bar">
              <span className="dot animate-ping"></span>
              Real-time Pace Feedback
            </div>
          </div>

          <div className="question-container">
            <h2>{mockQuestions[currentQuestionIdx]}</h2>
          </div>

          <div className="response-container">
            <label htmlFor="answer-input">Your Answer Response</label>
            <textarea
              id="answer-input"
              rows="8"
              placeholder="Type your detailed response here, or tap the voice recorder button to practice speaking..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
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
              {isRecording && <span className="recording-timer">Pace: 140 WPM (Good)</span>}
            </div>

            <div className="navigation-actions">
              <button 
                className="btn-nav-page" 
                onClick={handlePrevQuestion}
                disabled={currentQuestionIdx === 0}
              >
                Previous
              </button>
              
              {currentQuestionIdx < mockQuestions.length - 1 ? (
                <button className="btn-nav-page" onClick={handleNextQuestion}>
                  Next Question
                </button>
              ) : (
                <button 
                  className="btn-submit-interview"
                  onClick={handleSubmitInterview}
                >
                  Submit & Finish
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
      {renderDemoSelector()}
    </div>
  );
}

export default Interview;
