import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getInterview, updateInterview, deleteInterview, evaluateAIInterview } from '../../services/api';
import ProgressBar from './components/ProgressBar';
import AvatarSection from './components/AvatarSection';
import QuestionBoard from './components/QuestionBoard';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { validateAnswer } from '../../utils/helpers';
import { aggregateVoiceAnalytics } from '../../utils/speechAnalytics';
import { useToast } from '../../components/Toast/ToastContext';
import './Interview.css';

/**
 * Interview Component
 * 
 * Simulates a live mock interview room.
 * Fetches the session details from the database by ID (URL param or router state),
 * and performs dynamic saves on navigation changes (Next, Skip, Previous, Timeout)
 * along with visual Saving/Saved badges and Day 18 voice analytics persistence.
 */
function Interview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToast } = useToast();
  
  // State variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState('');
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [interviewDifficulty, setInterviewDifficulty] = useState('medium');
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  
  // Auto-save visual status: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');

  const timerRef = useRef(null);
  const handleTimeOutRef = useRef(null);
  
  const answersRef = useRef(answers);
  const lastSavedAnswersRef = useRef([]);
  const voiceAnalyticsMapRef = useRef({});

  // Keep ref up to date with answers state to support interval reads without re-runs
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Handle voice analytics payload updates from QuestionBoard
  const handleVoiceAnalyticsChange = useCallback(({ questionIdx, type, voiceAnalytics, followUpQuestion, followUpAnswer }) => {
    if (questionIdx === undefined || questionIdx === null) return;

    if (!voiceAnalyticsMapRef.current[questionIdx]) {
      voiceAnalyticsMapRef.current[questionIdx] = {};
    }

    if (type === 'main') {
      voiceAnalyticsMapRef.current[questionIdx].main = voiceAnalytics;
    } else if (type === 'followup') {
      voiceAnalyticsMapRef.current[questionIdx].followup = voiceAnalytics;
      if (followUpQuestion) voiceAnalyticsMapRef.current[questionIdx].followUpQuestion = followUpQuestion;
      if (followUpAnswer) voiceAnalyticsMapRef.current[questionIdx].followUpAnswer = followUpAnswer;
    }
  }, []);

  // Helper to build payload including per-question and aggregate voice analytics
  const buildQuestionsPayload = useCallback((targetAnswers) => {
    const allAnalyzedList = [];

    const questionsPayload = questions.map((q, idx) => {
      const itemAnalytics = voiceAnalyticsMapRef.current[idx] || {};
      
      if (itemAnalytics.main) allAnalyzedList.push(itemAnalytics.main);
      if (itemAnalytics.followup) allAnalyzedList.push(itemAnalytics.followup);

      return {
        questionText: q,
        userAnswer: targetAnswers[idx] || '',
        voiceAnalytics: itemAnalytics.main || null,
        followUpVoiceAnalytics: itemAnalytics.followup || null,
        followUpQuestion: itemAnalytics.followUpQuestion || '',
        followUpAnswer: itemAnalytics.followUpAnswer || '',
        hasFollowUp: Boolean(itemAnalytics.followUpQuestion)
      };
    });

    const sessionVoiceAnalytics = aggregateVoiceAnalytics(allAnalyzedList);

    return {
      questions: questionsPayload,
      voiceAnalytics: sessionVoiceAnalytics.analyzedAnswersCount > 0 ? sessionVoiceAnalytics : null
    };
  }, [questions]);

  // Background Autosave interval effect
  useEffect(() => {
    if (isLoading || isEvaluating || questions.length === 0 || !sessionId) return;

    // Set initial save checkpoint
    lastSavedAnswersRef.current = [...answersRef.current];

    const autosaveInterval = setInterval(async () => {
      const currentAnswers = answersRef.current;
      const hasChanged = currentAnswers.some((ans, idx) => ans !== lastSavedAnswersRef.current[idx]);
      if (!hasChanged) return;

      try {
        setSaveStatus('saving');
        const { questions: questionsPayload, voiceAnalytics: sessionAnalytics } = buildQuestionsPayload(currentAnswers);
        
        await updateInterview(sessionId, {
          questions: questionsPayload,
          ...(sessionAnalytics ? { voiceAnalytics: sessionAnalytics } : {})
        });
        
        lastSavedAnswersRef.current = [...currentAnswers];
        setSaveStatus('saved');
        console.log('📝 Mock answers & voice analytics autosaved in background.');
      } catch (err) {
        console.warn('⚠️ Background autosave failed:', err.message);
        setSaveStatus('error');
      }
    }, 5000);

    return () => clearInterval(autosaveInterval);
  }, [isLoading, isEvaluating, questions, sessionId, buildQuestionsPayload]);

  /**
   * Persists the candidate's answers directly to MongoDB.
   * @param {Array} targetAnswers - Updated array of answers
   * @returns {Promise<boolean>} Resolves to true on success, false on failure
   */
  const persistAnswerToDB = async (targetAnswers) => {
    try {
      setSaveStatus('saving');
      const { questions: questionsPayload, voiceAnalytics: sessionAnalytics } = buildQuestionsPayload(targetAnswers);
      
      await updateInterview(sessionId, {
        questions: questionsPayload,
        ...(sessionAnalytics ? { voiceAnalytics: sessionAnalytics } : {})
      });
      
      lastSavedAnswersRef.current = [...targetAnswers];
      setSaveStatus('saved');
      return true;
    } catch (err) {
      console.error('Error auto-saving answer:', err);
      setSaveStatus('error');
      addToast(err.message || 'Auto-save failed. Please check connection and retry.', 'error');
      return false;
    }
  };

  /**
   * Updates answer in local state and propagates change on keystroke.
   */
  const handleAnswerChange = (text) => {
    setAnswerText(text);
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestionIdx] = text;
      return updated;
    });
  };

  async function submitCompletedInterview(finalAnswersList) {
    try {
      setIsEvaluating(true);
      addToast('Interview finished! Evaluating performance...', 'info');
      
      const questionsWithAnswers = questions.map((q, idx) => ({
        questionText: q,
        userAnswer: finalAnswersList[idx] || ''
      }));
      
      const res = await evaluateAIInterview(sessionId, questionsWithAnswers);
      
      addToast('Interview evaluation completed.', 'success');
      const finalId = res?.data?.interview?._id || res?.interview?._id || sessionId;
      navigate(`/results/${finalId}`);
    } catch (err) {
      console.error('Error submitting interview response:', err);
      addToast(err.message || 'Failed to evaluate answers.', 'error');
      navigate('/dashboard');
    } finally {
      setIsEvaluating(false);
    }
  }

  const changeQuestion = (newIdx, newAnswers) => {
    setCurrentQuestionIdx(newIdx);
    const nextAnswerText = newAnswers[newIdx] || '';
    setAnswerText(nextAnswerText);
    setSaveStatus(nextAnswerText ? 'saved' : 'idle');
    setTimeLeft(60);
    setErrorMsg('');
    setIsRecording(false);
  };

  async function saveAnswerAndAdvance(answerToSave) {
    setErrorMsg('');
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIdx] = answerToSave;
    setAnswers(updatedAnswers);

    const success = await persistAnswerToDB(updatedAnswers);
    if (success) {
      if (currentQuestionIdx === questions.length - 1) {
        await submitCompletedInterview(updatedAnswers);
      } else {
        changeQuestion(currentQuestionIdx + 1, updatedAnswers);
      }
    }
  }

  function handleTimeOut() {
    const fallbackAnswer = answerText.trim() || 'No response provided within 60 second timer limit.';
    saveAnswerAndAdvance(fallbackAnswer);
  }

  useEffect(() => {
    handleTimeOutRef.current = handleTimeOut;
  });

  useEffect(() => {
    const interviewId = id || location.state?.id;

    if (!interviewId) {
      addToast('No active interview session found. Please start from the dashboard.', 'error');
      navigate('/dashboard');
      return;
    }

    async function initInterview() {
      try {
        setIsLoading(true);
        const res = await getInterview(interviewId);
        const interview = res?.data?.interview || res;

        if (!interview) {
          throw new Error('Session details could not be retrieved.');
        }

        if (interview.role) setInterviewRole(interview.role);
        if (interview.difficulty) setInterviewDifficulty(interview.difficulty);

        const questionList = interview.questions || [];
        setQuestions(questionList.map(q => q.questionText));
        
        const initialAnswers = questionList.map(q => q.userAnswer || '');
        setAnswers(initialAnswers);
        setSessionId(interview._id);

        // Find first question without an answer to support resumption
        const unansweredIdx = questionList.findIndex(q => !q.userAnswer);
        const startIdx = unansweredIdx >= 0 ? unansweredIdx : 0;
        setCurrentQuestionIdx(startIdx);
        
        const currentAnswer = initialAnswers[startIdx] || '';
        setAnswerText(currentAnswer);
        setSaveStatus(currentAnswer ? 'saved' : 'idle');
      } catch (err) {
        console.error('Error initializing interview room:', err);
        addToast(err.message || 'Failed to initialize the interview session.', 'error');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    initInterview();
  }, [id, location.state, navigate, addToast]);

  // Timer Effect
  useEffect(() => {
    if (isLoading || isEvaluating || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (handleTimeOutRef.current) {
            handleTimeOutRef.current();
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isLoading, isEvaluating, currentQuestionIdx, questions]);

  const getQuestionCategoryTag = (questionText) => {
    const text = questionText?.toLowerCase() || '';
    if (text.includes('rest') || text.includes('graphql')) return 'Backend';
    if (text.includes('react') || text.includes('memo') || text.includes('virtual dom')) return 'Frontend';
    if (text.includes('sql') || text.includes('query') || text.includes('optimize') || text.includes('database')) return 'DB';
    return 'General';
  };

  const handleNextQuestion = () => {
    const validation = validateAnswer(answerText);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }
    saveAnswerAndAdvance(answerText.trim());
  };

  const handleSkipQuestion = () => {
    addToast('Question skipped.', 'warning');
    saveAnswerAndAdvance('Question was skipped by candidate.');
  };

  const handlePrevQuestion = async () => {
    if (currentQuestionIdx > 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIdx] = answerText;
      setAnswers(updatedAnswers);

      const success = await persistAnswerToDB(updatedAnswers);
      if (success) {
        changeQuestion(currentQuestionIdx - 1, updatedAnswers);
      }
    }
  };


  const handleExitClick = () => {
    setExitModalOpen(true);
  };

  const handleConfirmExit = async () => {
    try {
      if (sessionId) {
        await deleteInterview(sessionId);
        addToast('Practice session cancelled and deleted.', 'info');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error cancelling interview:', err);
      navigate('/dashboard');
    } finally {
      setExitModalOpen(false);
    }
  };

  const [turnFlags, setTurnFlags] = useState({
    isAiSpeaking: false,
    isTranscribing: false,
    isAnalyzing: false,
    isRecording: false
  });

  // Callback to track active turn state from QuestionBoard
  const handleTurnStateChange = useCallback((flags) => {
    setTurnFlags(flags);
  }, []);

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
          <h3>AI is evaluating your interview...</h3>
          <p>Analyzing answer accuracy, vocabulary structure, and coherence parameters using Gemini AI model.</p>
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
  const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;

  return (
    <div className="interview-room-container">
      <div className="interview-orb-bg"></div>

      {/* Top Header Bar */}
      <div className="interview-room-header">
        <button 
          className="btn-header-exit" 
          onClick={handleExitClick}
          title="Exit interview room"
        >
          ← Exit Room
        </button>

        <div className="interview-room-title-group">
          <span className="room-title">🎙️ AI Voice Interview Room</span>
          <span className="room-subtitle">{interviewRole} • {interviewDifficulty} track</span>
        </div>

        <div className="interview-room-progress-badge">
          Question {currentQuestionIdx + 1} of {questions.length} ({Math.round(progressPercent)}%)
        </div>
      </div>

      <ProgressBar percent={progressPercent} />

      <div className="interview-main-layout">
        <AvatarSection 
          isRecording={isRecording || turnFlags.isRecording} 
          timeLeft={timeLeft}
          isAiSpeaking={turnFlags.isAiSpeaking}
          isTranscribing={turnFlags.isTranscribing}
          isAnalyzing={turnFlags.isAnalyzing}
        />

        <QuestionBoard 
          currentQuestionIdx={currentQuestionIdx}
          totalQuestions={questions.length}
          questionCategory={questionCategory}
          questionText={currentQuestionText}
          answerText={answerText}
          setAnswerText={handleAnswerChange}
          errorMsg={errorMsg}
          onRecordingStateChange={setIsRecording}
          handlePrevQuestion={handlePrevQuestion}
          handleSkipQuestion={handleSkipQuestion}
          handleNextQuestion={handleNextQuestion}
          isLastQuestion={currentQuestionIdx === questions.length - 1}
          handleExitClick={handleExitClick}
          saveStatus={saveStatus}
          role={interviewRole}
          difficulty={interviewDifficulty}
          questions={questions}
          answers={answers}
          onVoiceAnalyticsChange={handleVoiceAnalyticsChange}
          onTurnStateChange={handleTurnStateChange}
        />
      </div>

      <ConfirmationModal 
        isOpen={exitModalOpen}
        title="Exit Interview Room?"
        message="Are you sure you want to cancel and exit this mock interview? All answers and progress recorded in this session will be permanently lost."
        confirmText="Yes, Exit"
        cancelText="Resume Practice"
        onConfirm={handleConfirmExit}
        onCancel={() => setExitModalOpen(false)}
      />
    </div>
  );
}

export default Interview;
