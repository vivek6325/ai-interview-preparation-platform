import { useState, useEffect, useRef, useCallback } from 'react';
import useSpeechSynthesis from '../../../hooks/useSpeechSynthesis';
import useInterviewTurn, { TURN_STATES } from '../../../hooks/useInterviewTurn';
import VoiceControls from './VoiceControls';
import VoiceRecorderCard from './VoiceRecorderCard';
import { generateFollowUpQuestionApi } from '../../../services/api';

/**
 * QuestionBoard Component (Day 19 Part 5 — Dynamic Interview State & Turn Management)
 * Integrates useInterviewTurn state machine, TTS controls, VoiceRecorderCard, and adaptive follow-ups.
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
  saveStatus,
  role = 'Software Engineer',
  difficulty = 'medium',
  questions = [],
  answers = []
}) {
  const [interviewMode, setInterviewMode] = useState(() => {
    try {
      return localStorage.getItem('ai_interview_mode') || 'voice';
    } catch {
      return 'voice';
    }
  });

  // Centralized Turn State Machine Hook (Day 19 Part 5)
  const {
    turnState,
    startNewTurn,
    isTurnCurrent,
    transitionTo,
    isAiSpeaking: isTurnAiSpeaking,
    isRecording: isTurnRecording,
    isTranscribing: isTurnTranscribing,
    isAnalyzing: isTurnAnalyzing,
    isFollowUpReady
  } = useInterviewTurn();

  // Adaptive Follow-up States
  const [followUpQuestionText, setFollowUpQuestionText] = useState('');
  const [followUpAnswerText, setFollowUpAnswerText] = useState('');
  const [followUpCount, setFollowUpCount] = useState(0);
  const analyzedAnswerKeyRef = useRef('');
  const currentTurnIdRef = useRef('');

  const {
    speechState,
    isSpeaking: isTtsEngineSpeaking,
    isSupported: isTtsSupported,
    settings,
    updateSettings,
    voices,
    speakQuestion,
    stop: stopSpeech
  } = useSpeechSynthesis();

  const isAiSpeaking = isTurnAiSpeaking || isTtsEngineSpeaking;

  // Initialize new turn state when main question index changes
  useEffect(() => {
    stopSpeech();
    const newTurnId = startNewTurn(currentQuestionIdx, 'main');
    currentTurnIdRef.current = newTurnId;

    const timer = setTimeout(() => {
      setFollowUpQuestionText('');
      setFollowUpAnswerText('');
      setFollowUpCount(0);
      analyzedAnswerKeyRef.current = '';

      if (isTtsSupported && settings.autoRead && questionText) {
        transitionTo(TURN_STATES.AI_SPEAKING);
        speakQuestion(questionText, currentQuestionIdx);
      } else {
        transitionTo(TURN_STATES.READY_FOR_ANSWER);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentQuestionIdx, questionText, isTtsSupported, settings.autoRead, speakQuestion, stopSpeech, startNewTurn, transitionTo]);

  // Synchronize TTS engine completion -> READY_FOR_ANSWER transition
  useEffect(() => {
    if (turnState === TURN_STATES.AI_SPEAKING && !isTtsEngineSpeaking && speechState !== 'speaking') {
      transitionTo(TURN_STATES.READY_FOR_ANSWER);
    }
  }, [turnState, isTtsEngineSpeaking, speechState, transitionTo]);

  // Evaluate candidate's main answer & generate context-aware adaptive follow-up (Max 1 per main question)
  const handleEvaluateFollowUp = useCallback(async (currentAnswer, turnId) => {
    if (
      !questionText ||
      !currentAnswer ||
      followUpCount >= 1 ||
      !isTurnCurrent(turnId)
    ) {
      return;
    }

    const answerKey = `${currentQuestionIdx}:${currentAnswer.trim()}`;
    if (analyzedAnswerKeyRef.current === answerKey) {
      return;
    }

    const words = currentAnswer.trim().split(/\s+/).filter(Boolean);
    if (words.length < 5) {
      transitionTo(TURN_STATES.READY_FOR_ANSWER);
      return;
    }

    analyzedAnswerKeyRef.current = answerKey;
    transitionTo(TURN_STATES.ANALYZING);

    // Build context representation of previous turns (up to current question index)
    const previousTurns = Array.isArray(questions)
      ? questions.slice(0, currentQuestionIdx).map((qText, idx) => ({
          questionText: qText,
          userAnswer: Array.isArray(answers) ? (answers[idx] || '') : ''
        })).filter(t => t.userAnswer && typeof t.userAnswer === 'string' && t.userAnswer.trim().length > 0)
      : [];

    try {
      const res = await generateFollowUpQuestionApi({
        question: questionText,
        answer: currentAnswer,
        role: role || questionCategory || 'Software Engineer',
        difficulty: difficulty || 'medium',
        previousTurns,
        mainQuestionIndex: currentQuestionIdx,
        totalMainQuestions: totalQuestions
      });

      // Guard against stale async resolution if question changed during API call
      if (!isTurnCurrent(turnId)) return;

      const data = res?.data || res;
      if (data?.shouldFollowUp && data?.followUpQuestion) {
        setFollowUpQuestionText(data.followUpQuestion);
        setFollowUpCount(1);
        transitionTo(TURN_STATES.FOLLOW_UP_READY);

        // Speak adaptive follow-up question aloud via TTS
        if (isTtsSupported) {
          transitionTo(TURN_STATES.AI_SPEAKING);
          speakQuestion(data.followUpQuestion, `followup-${currentQuestionIdx}`, true);
        }
      } else {
        transitionTo(TURN_STATES.READY_FOR_ANSWER);
      }
    } catch (err) {
      console.warn('⚠️ AI context-aware follow-up evaluation error handled gracefully:', err);
      if (isTurnCurrent(turnId)) {
        transitionTo(TURN_STATES.READY_FOR_ANSWER);
      }
    }
  }, [currentQuestionIdx, totalQuestions, questionText, questionCategory, role, difficulty, questions, answers, followUpCount, isTurnCurrent, isTtsSupported, speakQuestion, transitionTo]);

  // Handle Main Transcript Generation
  const handleMainTranscriptGenerated = useCallback((transcribedText) => {
    setAnswerText(transcribedText);
    const activeTurnId = currentTurnIdRef.current;
    
    if (interviewMode === 'voice' && followUpCount < 1) {
      handleEvaluateFollowUp(transcribedText, activeTurnId);
    } else {
      transitionTo(TURN_STATES.READY_FOR_ANSWER);
    }
  }, [interviewMode, followUpCount, handleEvaluateFollowUp, setAnswerText, transitionTo]);

  // Handle Follow-up Transcript Generation
  const handleFollowUpTranscriptGenerated = useCallback((transcribedText) => {
    setFollowUpAnswerText(transcribedText);
    transitionTo(TURN_STATES.READY_FOR_ANSWER);
  }, [transitionTo]);

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
      transitionTo(TURN_STATES.AI_SPEAKING);
      if (isFollowUpReady && followUpQuestionText) {
        speakQuestion(followUpQuestionText, `followup-${currentQuestionIdx}`, true);
      } else if (questionText) {
        speakQuestion(questionText, currentQuestionIdx, true);
      }
    }
  };

  // Handle Stop Button Click
  const handleStopClick = () => {
    stopSpeech();
    transitionTo(TURN_STATES.READY_FOR_ANSWER);
  };

  // Handle Next Question Click with Text Mode Compatibility
  const handleNextClick = async () => {
    if (isFollowUpReady) {
      handleNextQuestion();
      return;
    }

    if (interviewMode === 'text' && followUpCount < 1 && answerText) {
      const words = answerText.trim().split(/\s+/).filter(Boolean);
      const answerKey = `${currentQuestionIdx}:${answerText.trim()}`;
      if (words.length >= 5 && analyzedAnswerKeyRef.current !== answerKey) {
        const activeTurnId = currentTurnIdRef.current;
        await handleEvaluateFollowUp(answerText, activeTurnId);
        // If follow-up was generated, turnState moves to FOLLOW_UP_READY and user can answer follow-up
        if (analyzedAnswerKeyRef.current === answerKey && followUpQuestionText) {
          return;
        }
      }
    }

    handleNextQuestion();
  };

  return (
    <div className="question-response-board">
      <div className="board-header">
        <span className="progress-badge">
          Question {currentQuestionIdx + 1} of {totalQuestions}
          {isFollowUpReady && ' (Follow-up Turn)'}
        </span>

        <div className="board-header-right d-flex align-items-center gap-2">
          {/* Voice Controls Toolbar & Mode Switcher */}
          <VoiceControls
            speechState={speechState}
            isSpeaking={isAiSpeaking}
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

      {/* Turn State Processing Indicators */}
      {isTurnTranscribing && (
        <div className="followup-analyzing-bar" role="status" aria-live="polite">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          <span>📝 Transcribing your voice answer into text...</span>
        </div>
      )}

      {isTurnAnalyzing && (
        <div className="followup-analyzing-bar" role="status" aria-live="polite">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          <span>🤖 AI Interviewer is analyzing your answer for context & follow-up opportunities...</span>
        </div>
      )}

      {/* Adaptive Follow-up Question Card Banner */}
      {(isFollowUpReady || (followUpQuestionText && followUpCount > 0)) && (
        <div className="followup-question-box">
          <div className="followup-badge">
            <span className="badge-sparkle">✨</span>
            <span>CONTEXT-AWARE FOLLOW-UP QUESTION (1 of 1 Limit)</span>
          </div>
          <h3 className="followup-title">{followUpQuestionText}</h3>
        </div>
      )}

      {/* Answer Response Container */}
      <div className="response-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label htmlFor="answer-input" style={{ margin: 0 }}>
            {isFollowUpReady
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
          {isFollowUpReady ? (
            <VoiceRecorderCard
              key={`voice-recorder-followup-${currentQuestionIdx}`}
              questionText={followUpQuestionText}
              isAiSpeaking={isAiSpeaking}
              disabled={isTurnTranscribing || isTurnAnalyzing}
              autoTranscribeOnStop={interviewMode === 'voice'}
              onRecordingStateChange={(recording) => {
                if (recording) transitionTo(TURN_STATES.RECORDING);
                onRecordingStateChange(recording);
              }}
              onTranscriptGenerated={handleFollowUpTranscriptGenerated}
            />
          ) : (
            <VoiceRecorderCard
              key={`voice-recorder-main-${currentQuestionIdx}`}
              questionText={questionText}
              isAiSpeaking={isAiSpeaking}
              disabled={isTurnTranscribing || isTurnAnalyzing}
              autoTranscribeOnStop={interviewMode === 'voice'}
              onRecordingStateChange={(recording) => {
                if (recording) transitionTo(TURN_STATES.RECORDING);
                onRecordingStateChange(recording);
              }}
              onTranscriptGenerated={handleMainTranscriptGenerated}
            />
          )}
        </div>

        {/* Textarea for Main or Follow-up Answer */}
        <textarea
          id="answer-input"
          rows={isFollowUpReady ? '4' : '5'}
          disabled={isTurnTranscribing || isTurnAnalyzing}
          placeholder={
            isFollowUpReady
              ? 'Record or type your follow-up answer response here...'
              : interviewMode === 'voice'
              ? 'Voice transcript will automatically populate here after recording. You can also edit or refine text directly...'
              : 'Type or refine your response text here. Explain concepts clearly with structured points and examples...'
          }
          value={isFollowUpReady ? followUpAnswerText : answerText}
          onChange={(e) => {
            if (isFollowUpReady) {
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
            disabled={isTurnRecording || isTurnTranscribing || isTurnAnalyzing}
          >
            Exit Room
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn-nav-page" 
              onClick={handlePrevQuestion}
              disabled={currentQuestionIdx === 0 || isFollowUpReady || isTurnRecording || isTurnTranscribing || isTurnAnalyzing}
            >
              Previous
            </button>

            <button 
              className="btn-nav-page" 
              onClick={handleSkipQuestion}
              disabled={isTurnRecording || isTurnTranscribing || isTurnAnalyzing}
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              Skip
            </button>
            
            {isLastQuestion && !isFollowUpReady ? (
              <button 
                className="btn-submit-interview"
                onClick={handleNextClick}
                disabled={isTurnRecording || isTurnTranscribing || isTurnAnalyzing}
              >
                Submit & Finish
              </button>
            ) : (
              <button 
                className="btn-nav-page" 
                onClick={handleNextClick} 
                disabled={isTurnRecording || isTurnTranscribing || isTurnAnalyzing}
                style={{ color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                {isFollowUpReady ? 'Complete Follow-up & Next Question →' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionBoard;
