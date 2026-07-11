import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getInterview, updateInterview, deleteInterview, evaluateAIInterview } from '../../services/api';
import ProgressBar from './components/ProgressBar';
import AvatarSection from './components/AvatarSection';
import QuestionBoard from './components/QuestionBoard';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { validateAnswer } from '../../utils/helpers';
import { useToast } from '../../components/Toast/ToastContext';
import './Interview.css';

/**
 * Interview Component
 * 
 * Simulates a live mock interview room.
 * Fetches the session details from the database by ID (URL param or router state),
 * and performs dynamic saves on navigation changes (Next, Skip, Previous, Timeout)
 * along with visual Saving/Saved badges.
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

  // Keep ref up to date with answers state to support interval reads without re-runs
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
        const questionsWithAnswers = questions.map((q, idx) => ({
          questionText: q,
          userAnswer: currentAnswers[idx] || ''
        }));
        
        await updateInterview(sessionId, {
          questions: questionsWithAnswers
        });
        
        lastSavedAnswersRef.current = [...currentAnswers];
        setSaveStatus('saved');
        console.log('📝 Mock answers autosaved in background.');
      } catch (err) {
        console.warn('⚠️ Background autosave failed:', err.message);
        setSaveStatus('error');
      }
    }, 5000);

    return () => clearInterval(autosaveInterval);
  }, [isLoading, isEvaluating, questions, sessionId]);

  /**
   * Persists the candidate's answers directly to MongoDB.
   * @param {Array} targetAnswers - Updated array of answers
   * @returns {Promise<boolean>} Resolves to true on success, false on failure
   */
  const persistAnswerToDB = async (targetAnswers) => {
    try {
      setSaveStatus('saving');
      const questionsWithAnswers = questions.map((q, idx) => ({
        questionText: q,
        userAnswer: targetAnswers[idx] || ''
      }));
      
      await updateInterview(sessionId, {
        questions: questionsWithAnswers
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

  const toggleRecording = () => {
    if (!isRecording) {
      addToast('Speech analyzer simulation online. Start speaking...', 'info');
    } else {
      addToast('Audio transcription finalized.', 'success');
    }
    setIsRecording(!isRecording);
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

      <ProgressBar percent={progressPercent} />

      <div className="interview-main-layout">
        <AvatarSection isRecording={isRecording} timeLeft={timeLeft} />

        <QuestionBoard 
          currentQuestionIdx={currentQuestionIdx}
          totalQuestions={questions.length}
          questionCategory={questionCategory}
          questionText={currentQuestionText}
          answerText={answerText}
          setAnswerText={handleAnswerChange}
          errorMsg={errorMsg}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          handlePrevQuestion={handlePrevQuestion}
          handleSkipQuestion={handleSkipQuestion}
          handleNextQuestion={handleNextQuestion}
          isLastQuestion={currentQuestionIdx === questions.length - 1}
          handleExitClick={handleExitClick}
          saveStatus={saveStatus}
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
