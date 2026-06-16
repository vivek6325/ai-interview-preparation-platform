import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getQuestions, createInterview, updateInterview } from '../../services/api';
import ProgressBar from './components/ProgressBar';
import AvatarSection from './components/AvatarSection';
import QuestionBoard from './components/QuestionBoard';
import { validateAnswer } from '../../utils/helpers';
import './Interview.css';

/**
 * Interview Component
 * 
 * Simulates a live AI mock interview room.
 * Manages question states, timers, and routes completion events.
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
        const loadedQuestions = await getQuestions(interviewCategory);
        setQuestions(loadedQuestions);
        setAnswers(new Array(loadedQuestions.length).fill(''));

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

  const saveAnswerAndAdvance = async (answerToSave) => {
    setErrorMsg('');
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIdx] = answerToSave;
    setAnswers(updatedAnswers);

    if (currentQuestionIdx === questions.length - 1) {
      await submitCompletedInterview(updatedAnswers);
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
      setAnswerText(updatedAnswers[currentQuestionIdx + 1] || '');
      setTimeLeft(60);
    }
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
    saveAnswerAndAdvance('Question was skipped by candidate.');
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIdx] = answerText;
      setAnswers(updatedAnswers);

      setCurrentQuestionIdx(prev => prev - 1);
      setAnswerText(updatedAnswers[currentQuestionIdx - 1] || '');
      setTimeLeft(60);
      setErrorMsg('');
    }
  };

  const submitCompletedInterview = async (finalAnswersList) => {
    try {
      setIsEvaluating(true);
      const questionsWithAnswers = questions.map((q, idx) => ({
        questionText: q,
        userAnswer: finalAnswersList[idx]
      }));

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
          setAnswerText={setAnswerText}
          errorMsg={errorMsg}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          handlePrevQuestion={handlePrevQuestion}
          handleSkipQuestion={handleSkipQuestion}
          handleNextQuestion={handleNextQuestion}
          isLastQuestion={currentQuestionIdx === questions.length - 1}
        />
      </div>
    </div>
  );
}

export default Interview;
