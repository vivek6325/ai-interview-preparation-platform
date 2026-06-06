import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const mockQuestions = [
    "Tell me about a time you had to resolve a performance issue in a web application. What metrics did you monitor, and what was the outcome?",
    "Explain how React's Virtual DOM works, and what optimization hooks you use to avoid unnecessary re-renders.",
    "Describe a challenging situation where you disagreed with a colleague on a technical decision. How did you approach the conversation?",
    "How do you ensure application security and prevent common vulnerabilities like XSS or CSRF in your frontend systems?"
  ];

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
    </div>
  );
}

export default Interview;
