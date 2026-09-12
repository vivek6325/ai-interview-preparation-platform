import { useState, useEffect, useRef } from 'react';
import useSpeechSynthesis from '../../../hooks/useSpeechSynthesis';
import VoiceControls from './VoiceControls';
import VoiceRecorderCard from './VoiceRecorderCard';
import { generateFollowUpQuestionApi } from '../../../services/api';

/**
 * QuestionBoard Component (Day 19 Part 4 — Adaptive AI-Generated Follow-up Questions)
 * Renders the main question, voice controls, adaptive follow-up card, audio recorders, text responses, and navigation.
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
  const [interviewMode, setInterviewMode] = useState(() => {
    try {
      return localStorage.getItem('ai_interview_mode') || 'voice';
    } catch {
      return 'voice';
    }
  });

  // Adaptive Follow-up States (Day 19 Part 4)
  // followUpState: 'none' | 'analyzing' | 'active' | 'completed'
  const [followUpState, setFollowUpState] = useState('none');
  const [followUpQuestionText, setFollowUpQuestionText] = useState('');
  const [followUpAnswerText, setFollowUpAnswerText] = useState('');
  const [followUpCount, setFollowUpCount] = useState(0);
  const analyzedAnswerKeyRef = useRef('');

  const {
    speechState,
    isSpeaking,
    isSupported: isTtsSupported,
    settings,
    updateSettings,
    voices,
    speakQuestion,
    stop: stopSpeech
  } = useSpeechSynthesis();

  // Reset follow-up state when main question changes
  useEffect(() => {
    stopSpeech();
    const timer = setTimeout(() => {
      setFollowUpState('none');
      setFollowUpQuestionText('');
      setFollowUpAnswerText('');
      setFollowUpCount(0);
      analyzedAnswerKeyRef.current = '';
    }, 0);
    return () => clearTimeout(timer);
  }, [currentQuestionIdx, stopSpeech]);

  // Automatic Question Read-Aloud (main question)
  useEffect(() => {
    if (questionText && isTtsSupported && followUpState === 'none') {
      speakQuestion(questionText, currentQuestionIdx);
    }
  }, [currentQuestionIdx, questionText, isTtsSupported, speakQuestion, followUpState]);

  // Evaluates candidate's main answer and generates adaptive follow-up (Max 1 per main question)
  useEffect(() => {
    let isMounted = true;

    async function checkFollowUp() {
      if (
        !questionText ||
        !answerText ||
        followUpState !== 'none' ||
        followUpCount >= 1
      ) {
        return;
      }

      const answerKey = `${currentQuestionIdx}:${answerText.trim()}`;
      if (analyzedAnswerKeyRef.current === answerKey) {
        return;
      }

      const words = answerText.trim().split(/\s+/).filter(Boolean);
      if (words.length < 5) {
        return;
      }

      analyzedAnswerKeyRef.current = answerKey;
      setFollowUpState('analyzing');

      try {
        const res = await generateFollowUpQuestionApi({
          question: questionText,
          answer: answerText,
          role: questionCategory
        });

        const data = res?.data || res;
        if (isMounted && data?.shouldFollowUp && data?.followUpQuestion) {
          setFollowUpQuestionText(data.followUpQuestion);
          setFollowUpState('active');
          setFollowUpCount(1);

          // Speak adaptive follow-up question aloud via TTS
          if (isTtsSupported) {
            speakQuestion(data.followUpQuestion, `followup-${currentQuestionIdx}`, true);
          }
        } else if (isMounted) {
          setFollowUpState('completed');
        }
      } catch (err) {
        console.warn('⚠️ AI follow-up generation error handled gracefully:', err);
        if (isMounted) {
          setFollowUpState('completed');
        }
      }
    }

    checkFollowUp();

    return () => {
      isMounted = false;
    };
  }, [
    currentQuestionIdx,
    questionText,
    answerText,
    followUpState,
    followUpCount,
    questionCategory,
    isTtsSupported,
    speakQuestion
  ]);

  // Toggle Mode Handler ('voice' <-> 'text')
  const handleToggleInterviewMode = () => {
    setInterviewMode((prev) => {
      const next = prev === 'voice' ? 'text' : 'voice';
      try {
        localStorage.setItem('ai_interview_mode', next);
      } catch (err) {
        console.warn('Failed to save interview mode to localStorage:', err);
      }
      return next;
    });
  };

  // Handle Play / Replay Button Click
  const handlePlayReplayClick = () => {
    if (isTtsSupported) {
      if (followUpState === 'active' && followUpQuestionText) {
        speakQuestion(followUpQuestionText, `followup-${currentQuestionIdx}`, true);
      } else if (questionText) {
        speakQuestion(questionText, currentQuestionIdx, true);
      }
    }
  };

  // Handle Stop Button Click
  const handleStopClick = () => {
    stopSpeech();
  };

  return (
    <div className="question-response-board">
      <div className="board-header">
        <span className="progress-badge">
          Question {currentQuestionIdx + 1} of {totalQuestions}
          {followUpState === 'active' && ' (Follow-up Turn)'}
        </span>

        <div className="board-header-right d-flex align-items-center gap-2">
          {/* Voice Controls Toolbar & Mode Switcher */}
          <VoiceControls
            speechState={speechState}
            isSpeaking={isSpeaking}
            isTtsSupported={isTtsSupported}
            settings={settings}
            updateSettings={updateSettings}
            voices={voices}
            onPlayReplay={handlePlayReplayClick}
            onStop={handleStopClick}
            interviewMode={interviewMode}
            onToggleInterviewMode={handleToggleInterviewMode}
          />

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

      {/* Main Question Display */}
      <div className="question-container">
        <h2>{questionText}</h2>
      </div>

      {/* Analyzing Follow-up Shimmer Bar */}
      {followUpState === 'analyzing' && (
        <div className="followup-analyzing-bar" role="status" aria-live="polite">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          <span>🤖 AI Interviewer is evaluating your answer for follow-up opportunities...</span>
        </div>
      )}

      {/* Adaptive Follow-up Question Card Banner (Day 19 Part 4) */}
      {(followUpState === 'active' || (followUpState === 'completed' && followUpQuestionText)) && (
        <div className="followup-question-box">
          <div className="followup-badge">
            <span className="badge-sparkle">✨</span>
            <span>ADAPTIVE FOLLOW-UP QUESTION (1 of 1 Limit)</span>
          </div>
          <h3 className="followup-title">{followUpQuestionText}</h3>
        </div>
      )}

      {/* Answer Response Container */}
      <div className="response-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label htmlFor="answer-input" style={{ margin: 0 }}>
            {followUpState === 'active'
              ? 'Your Answer to Follow-up Question'
              : interviewMode === 'voice'
              ? 'Your Main Voice Response & Transcript'
              : 'Your Main Answer Response'}
          </label>
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

        {/* Voice Recording Infrastructure for Main or Follow-up Answer */}
        <div style={{ marginBottom: '12px' }}>
          {followUpState === 'active' ? (
            <VoiceRecorderCard
              key={`voice-recorder-followup-${currentQuestionIdx}`}
              questionText={followUpQuestionText}
              isAiSpeaking={isSpeaking}
              autoTranscribeOnStop={interviewMode === 'voice'}
              onRecordingStateChange={onRecordingStateChange}
              onTranscriptGenerated={(transcribedText) => setFollowUpAnswerText(transcribedText)}
            />
          ) : (
            <VoiceRecorderCard
              key={`voice-recorder-main-${currentQuestionIdx}`}
              questionText={questionText}
              isAiSpeaking={isSpeaking}
              autoTranscribeOnStop={interviewMode === 'voice'}
              onRecordingStateChange={onRecordingStateChange}
              onTranscriptGenerated={(transcribedText) => setAnswerText(transcribedText)}
            />
          )}
        </div>

        {/* Textarea for Main or Follow-up Answer */}
        <textarea
          id="answer-input"
          rows={followUpState === 'active' ? '4' : '5'}
          placeholder={
            followUpState === 'active'
              ? 'Record or type your follow-up answer response here...'
              : interviewMode === 'voice'
              ? 'Voice transcript will automatically populate here after recording. You can also edit or refine text directly...'
              : 'Type or refine your response text here. Explain concepts clearly with structured points and examples...'
          }
          value={followUpState === 'active' ? followUpAnswerText : answerText}
          onChange={(e) => {
            if (followUpState === 'active') {
              setFollowUpAnswerText(e.target.value);
            } else {
              setAnswerText(e.target.value);
            }
          }}
        />
        {errorMsg && (
          <span className="error-text" style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '500', marginTop: '4px' }}>
            ⚠️ {errorMsg}
          </span>
        )}
      </div>

      {/* Action Navigation Panel */}
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
              disabled={currentQuestionIdx === 0 || followUpState === 'active'}
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
            
            {isLastQuestion && followUpState !== 'active' ? (
              <button 
                className="btn-submit-interview"
                onClick={handleNextQuestion}
              >
                Submit & Finish
              </button>
            ) : (
              <button 
                className="btn-nav-page" 
                onClick={handleNextQuestion} 
                style={{ color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                {followUpState === 'active' ? 'Complete Follow-up & Next Question →' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionBoard;
