
import { useEffect } from 'react';
import useSpeechSynthesis from '../../../hooks/useSpeechSynthesis';
import VoiceRecorderCard from './VoiceRecorderCard';

/**
 * QuestionBoard Component (Day 19 Part 1 — TTS AI Question Read-Aloud & Replay Controls)
 * Renders the question card, TTS controls, audio recorder, text response fields, and navigation actions.
 */
export function QuestionBoard({
  currentQuestionIdx,
  totalQuestions,
  questionCategory,
  questionText,
  answerText,
  setAnswerText,
  errorMsg,
  onRecordingStateChange,
  handlePrevQuestion,
  handleSkipQuestion,
  handleNextQuestion,
  isLastQuestion,
  handleExitClick,
  saveStatus
}) {
  const {
    speechState,
    isSpeaking,
    isSupported: isTtsSupported,
    speakQuestion,
    stop: stopSpeech
  } = useSpeechSynthesis();

  // Automatic Question Read-Aloud (deduplicated per question index/text change)
  useEffect(() => {
    if (questionText && isTtsSupported) {
      speakQuestion(questionText, currentQuestionIdx);
    }
    return () => {
      stopSpeech();
    };
  }, [currentQuestionIdx, questionText, isTtsSupported, speakQuestion, stopSpeech]);

  // Handle Play/Replay Button Click
  const handlePlayReplayClick = () => {
    if (questionText && isTtsSupported) {
      speakQuestion(questionText, currentQuestionIdx, true); // force replay
    }
  };

  return (
    <div className="question-response-board">
      <div className="board-header">
        <span className="progress-badge">
          Question {currentQuestionIdx + 1} of {totalQuestions}
        </span>

        <div className="board-header-right d-flex align-items-center gap-2">
          {/* Day 19 Part 1: TTS Play / Speaking / Replay Button */}
          {isTtsSupported ? (
            <button
              type="button"
              className={`btn-tts-action ${isSpeaking ? 'btn-tts-speaking' : speechState === 'completed' ? 'btn-tts-completed' : 'btn-tts-idle'}`}
              onClick={handlePlayReplayClick}
              aria-label={isSpeaking ? 'Speaking question aloud' : 'Play question aloud'}
              title={isSpeaking ? 'Click to replay question' : 'Read question aloud'}
            >
              <span aria-hidden="true">{isSpeaking ? '🔊' : '🔉'}</span>
              <span>
                {isSpeaking ? 'Speaking...' : speechState === 'completed' ? 'Replay Question' : 'Play Question'}
              </span>
            </button>
          ) : (
            <span className="tts-unsupported-badge" title="Text-to-speech is not supported in this browser.">
              🔇 Speech Unsupported
            </span>
          )}

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

        {/* Voice Recording Infrastructure */}
        <div style={{ marginBottom: '12px' }}>
          <VoiceRecorderCard
            key={`voice-recorder-${currentQuestionIdx}`}
            onRecordingStateChange={onRecordingStateChange}
            onTranscriptGenerated={(transcribedText) => setAnswerText(transcribedText)}
          />
        </div>

        <textarea
          id="answer-input"
          rows="6"
          placeholder="Type or refine your response text here. Explain concepts clearly with structured points and examples..."
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
        <div className="navigation-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
          <button 
            className="btn-exit-interview"
            onClick={handleExitClick}
          >
            Exit Room
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
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
    </div>
  );
}

export default QuestionBoard;

