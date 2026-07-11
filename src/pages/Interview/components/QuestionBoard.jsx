
/**
 * QuestionBoard Component
 * Renders the question card, textarea text fields, and validation feedback logs.
 */
export function QuestionBoard({
  currentQuestionIdx,
  totalQuestions,
  questionCategory,
  questionText,
  answerText,
  setAnswerText,
  errorMsg,
  isRecording,
  toggleRecording,
  handlePrevQuestion,
  handleSkipQuestion,
  handleNextQuestion,
  isLastQuestion,
  handleExitClick,
  saveStatus
}) {
  return (
    <div className="question-response-board">
      <div className="board-header">
        <span className="progress-badge">
          Question {currentQuestionIdx + 1} of {totalQuestions}
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
        <h2>{questionText}</h2>
      </div>

      <div className="response-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label htmlFor="answer-input" style={{ margin: 0 }}>Your Answer Response</label>
          {saveStatus === 'saving' && (
            <span className="save-status-indicator" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: '600' }}>
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="save-status-indicator" style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
              Saved ✓
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="save-status-indicator" style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '600' }}>
              Save failed ⚠️
            </span>
          )}
        </div>
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
            className="btn-exit-interview"
            onClick={handleExitClick}
          >
            Exit Room
          </button>

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
          
          {isLastQuestion ? (
            <button 
              className="btn-submit-interview"
              onClick={handleNextQuestion}
            >
              Submit & Finish
            </button>
          ) : (
            <button className="btn-nav-page" onClick={handleNextQuestion} style={{ color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionBoard;
