import { useState, useEffect, useMemo, useCallback } from 'react';
import { generateQuestions, uploadResume, evaluateAnswer, generateInterviewReport } from '../../services/aiService';
import { createInterview, updateInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import Timer from '../../components/interview/Timer';
import ProgressBar from '../../components/interview/ProgressBar';
import QuestionCard from '../../components/interview/QuestionCard';
import VoiceRecorder from '../../components/interview/VoiceRecorder';
import AIAssistantPanel from '../../components/interview/AIAssistantPanel';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis';
import './InterviewSession.css';

function InterviewSession() {
  const { addToast } = useToast();

  // Session state steps: 'setup' | 'loading_questions' | 'active' | 'loading_feedback' | 'finished'
  const [sessionStatus, setSessionStatus] = useState('setup');
  
  // Setup Parameters
  const [role, setRole] = useState('Frontend');
  const [difficulty, setDifficulty] = useState('Medium');
  const [experience, setExperience] = useState('1-3 Years');
  const [totalQuestions, setTotalQuestions] = useState(5);
  
  // Mode selection: 'voice' | 'text'
  const [interviewMode, setInterviewMode] = useState('voice');
  const [isMuted, setIsMuted] = useState(false);

  // Resume upload state
  const [resumeUploading, setResumeUploading] = useState(false);
  const [uploadedResumeName, setUploadedResumeName] = useState('');
  const [resumeSkills, setResumeSkills] = useState([]);

  // Session Engine State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: answerText }
  const [voiceMetricsMap, setVoiceMetricsMap] = useState({}); // { [qId]: { speakingDuration, wordsSpoken } }
  
  // Database persistence state
  const [interviewId, setInterviewId] = useState(null);
  const [parsedResumeDetails, setParsedResumeDetails] = useState(null);

  // Feedback Metrics State
  const [evaluationError, setEvaluationError] = useState('');
  const [overallScore, setOverallScore] = useState(0);
  const [overallReport, setOverallReport] = useState(null);
  const [individualFeedback, setIndividualFeedback] = useState({});
  const [overallVoiceAnalytics, setOverallVoiceAnalytics] = useState(null);

  // Voice Hooks
  const {
    isSpeaking,
    voices,
    isSupported: isTtsSupported,
    settings: voiceSettings,
    updateSettings: updateVoiceSettings,
    speak,
    stop: stopSpeaking
  } = useSpeechSynthesis();

  const {
    transcript,
    interimTranscript,
    isListening,
    error: recognitionError,
    isSupported: isSttSupported,
    speakingDuration,
    start: startRecording,
    stop: stopRecording,
    reset: resetRecording,
    setTranscript
  } = useSpeechRecognition({
    maxDuration: voiceSettings.maxDuration || 180,
    onAutoSave: (savedText) => {
      if (questions[currentIndex]) {
        handleAnswerChange(questions[currentIndex].id, savedText);
      }
    }
  });

  // Sync current question's answer to transcript hook when question changes
  useEffect(() => {
    if (sessionStatus === 'active' && questions[currentIndex]) {
      const qId = questions[currentIndex].id;
      setTranscript(answers[qId] || '');
    }
  }, [currentIndex, sessionStatus, questions]);

  // Read Question Aloud on Question change (if autoRead is enabled)
  useEffect(() => {
    if (sessionStatus === 'active' && questions.length > 0 && questions[currentIndex]) {
      const currentQText = questions[currentIndex].question;
      if (voiceSettings.autoRead && !isMuted && interviewMode === 'voice') {
        speak(currentQText);
      }
    }
    return () => {
      stopSpeaking();
    };
  }, [currentIndex, sessionStatus, voiceSettings.autoRead, isMuted, interviewMode]);

  // Keyboard Shortcuts (Part 21)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sessionStatus !== 'active') return;
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';

      // Space bar toggles mic recording if user is not actively typing in an input/textarea
      if (e.code === 'Space' && tag !== 'input' && tag !== 'textarea' && interviewMode === 'voice') {
        e.preventDefault();
        if (isListening) {
          handleStopRecordingVoice();
        } else {
          startRecording();
        }
      }

      // Ctrl + Enter or Cmd + Enter to submit answer
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionStatus, isListening, interviewMode, currentIndex, questions]);

  // Resume Auto-fill trigger
  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeUploading(true);
    setUploadedResumeName(file.name);
    addToast('Parsing uploaded resume...', 'info');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await uploadResume(formData);
      setResumeSkills(response.skills || []);
      setExperience(response.experience || '1-3 Years');
      setParsedResumeDetails(response);
      
      if (response.skills && response.skills.length > 0) {
        setRole(response.skills[2] || 'Frontend');
      }

      addToast('Resume metrics extracted successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to analyze resume.', 'error');
    } finally {
      setResumeUploading(false);
    }
  };

  // Start Interview Session
  const handleStartInterview = async () => {
    setSessionStatus('loading_questions');
    try {
      const questionList = await generateQuestions(role, experience, difficulty, totalQuestions, parsedResumeDetails);
      setQuestions(questionList);
      setAnswers({});
      setVoiceMetricsMap({});
      setCurrentIndex(0);
      
      const interviewRes = await createInterview({
        title: `${role} AI Interview`,
        role,
        difficulty: difficulty.toLowerCase(),
        status: 'pending',
        questions: questionList.map(q => ({
          questionText: typeof q === 'string' ? q : q?.question || q?.questionText || 'Technical Question',
          userAnswer: '',
          score: null,
          feedback: '',
          strength: '',
          improvement: '',
          topic: q.topic || 'General',
          expectedAnswerPoints: q.expectedAnswerPoints || []
        })),
        resumeSummary: parsedResumeDetails
      });
      
      const savedId = interviewRes?.data?._id || interviewRes?._id;
      setInterviewId(savedId);

      setSessionStatus('active');
      addToast(`Mock interview room ready (${interviewMode === 'voice' ? 'Voice Mode' : 'Text Mode'}). Good luck!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to load questions. Please check server status.', 'error');
      setSessionStatus('setup');
    }
  };

  // Answer Change Handlers
  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleVoiceTranscriptChange = (val) => {
    if (questions[currentIndex]) {
      const qId = questions[currentIndex].id;
      setTranscript(val);
      handleAnswerChange(qId, val);
    }
  };

  const handleStartRecordingVoice = () => {
    stopSpeaking();
    startRecording();
  };

  const handleStopRecordingVoice = () => {
    stopRecording();
    if (questions[currentIndex]) {
      const qId = questions[currentIndex].id;
      const currentAns = answers[qId] || transcript || '';
      const words = currentAns.trim() ? currentAns.trim().split(/\s+/).length : 0;

      setVoiceMetricsMap((prev) => ({
        ...prev,
        [qId]: {
          speakingDuration: (prev[qId]?.speakingDuration || 0) + (speakingDuration || 1),
          wordsSpoken: words
        }
      }));
    }
  };

  const handleRetryVoice = () => {
    resetRecording();
    if (questions[currentIndex]) {
      handleAnswerChange(questions[currentIndex].id, '');
    }
  };

  const handleReplayQuestion = () => {
    if (questions[currentIndex]) {
      speak(questions[currentIndex].question);
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      if (!prev) stopSpeaking();
      return !prev;
    });
  };

  const handleNext = () => {
    if (isListening) {
      handleStopRecordingVoice();
    }
    stopSpeaking();

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishInterview();
    }
  };

  const handlePrevious = () => {
    if (isListening) {
      handleStopRecordingVoice();
    }
    stopSpeaking();

    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTimerExpired = () => {
    addToast('Time is up for this question!', 'warning');
    handleNext();
  };

  // Finish and Evaluate Interview Session
  const handleFinishInterview = async () => {
    if (isListening) stopRecording();
    stopSpeaking();

    setSessionStatus('loading_feedback');
    setEvaluationError('');
    addToast('Analyzing transcripts and generating AI performance scorecard...', 'info');

    try {
      const feedbackMap = {};
      let scoreSum = 0;
      let totalSpeakingDuration = 0;
      let totalWordsSpoken = 0;

      // 1. Evaluate answers via Gemini
      for (const q of questions) {
        const answerText = answers[q.id] || '';
        const expectedPoints = q.expectedAnswerPoints || [];
        const feedbackRes = await evaluateAnswer(q.question, answerText, expectedPoints);
        feedbackMap[q.id] = feedbackRes;
        scoreSum += feedbackRes.overallScore || feedbackRes.score || 0;

        // Calculate Voice Analytics per question
        const metrics = voiceMetricsMap[q.id] || {};
        const words = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
        totalSpeakingDuration += metrics.speakingDuration || 0;
        totalWordsSpoken += words;
      }

      setIndividualFeedback(feedbackMap);

      const avgWordsPerAnswer = questions.length > 0 ? Math.round(totalWordsSpoken / questions.length) : 0;
      const avgSpeakingDurationPerAnswer = questions.length > 0 ? Math.round(totalSpeakingDuration / questions.length) : 0;

      const voiceAnalyticsObj = {
        totalSpeakingDuration,
        totalWordsSpoken,
        avgWordsPerAnswer,
        avgSpeakingDurationPerAnswer
      };
      setOverallVoiceAnalytics(voiceAnalyticsObj);

      // 2. Format questions payload for MongoDB
      const formattedQuestions = questions.map(q => {
        const ans = answers[q.id] || '';
        const fb = feedbackMap[q.id] || {};
        const vm = voiceMetricsMap[q.id] || {};
        const words = ans.trim() ? ans.trim().split(/\s+/).length : 0;
        return {
          questionText: typeof q === 'string' ? q : q?.question || q?.questionText || 'Technical Question',
          userAnswer: ans,
          transcript: ans,
          speakingDuration: vm.speakingDuration || 0,
          wordsSpoken: words,
          score: fb.overallScore || fb.score || 0,
          feedback: fb.suggestions?.join(" ") || '',
          strength: fb.strengths?.join(" ") || '',
          improvement: fb.weaknesses?.join(" ") || '',
          topic: q.topic || 'General',
          expectedAnswerPoints: q.expectedAnswerPoints || []
        };
      });

      if (interviewId) {
        await updateInterview(interviewId, {
          status: 'completed',
          questions: formattedQuestions,
          voiceAnalytics: voiceAnalyticsObj
        });
      }

      // 3. Generate comprehensive overall report
      const reportRes = await generateInterviewReport(interviewId, role, difficulty, formattedQuestions);
      const report = reportRes?.data?.report || reportRes?.report || reportRes;

      setOverallReport(report);
      setOverallScore(report.overallScore);
      setSessionStatus('finished');
      addToast('AI Voice Performance Analysis Complete!', 'success');
    } catch (err) {
      console.error(err);
      setEvaluationError(err.message || 'An error occurred during evaluation.');
      setSessionStatus('finished');
    }
  };

  const handleResetSession = () => {
    stopSpeaking();
    resetRecording();
    setSessionStatus('setup');
    setQuestions([]);
    setAnswers({});
    setVoiceMetricsMap({});
    setCurrentIndex(0);
    setUploadedResumeName('');
    setResumeSkills([]);
    setInterviewId(null);
    setOverallReport(null);
    setParsedResumeDetails(null);
    setOverallVoiceAnalytics(null);
  };

  return (
    <div className="interview-session-container">
      <div className="interview-glow-orb orb-1"></div>
      
      {sessionStatus === 'setup' && (
        <div className="setup-card animate-fade-in">
          <header className="setup-header text-center">
            <div className="setup-badge">⚡ Practice Room</div>
            <h1>AI Voice Mock Interview</h1>
            <p>Select your track parameters or upload a resume to tailor real-time voice interview questions.</p>
          </header>

          <div className="setup-grid">
            <div className="form-column">
              <div className="input-group-custom">
                <label>Target Role / Focus Stack</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Frontend">Frontend (React / CSS / HTML)</option>
                  <option value="Backend">Backend (Node / Express / SQL)</option>
                  <option value="Full Stack">Full Stack Development</option>
                  <option value="Java">Java Developer</option>
                  <option value="Python">Python Engineer</option>
                </select>
              </div>

              <div className="row">
                <div className="col col-half">
                  <div className="input-group-custom">
                    <label>Difficulty</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="col col-half">
                  <div className="input-group-custom">
                    <label>Experience Level</label>
                    <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                      <option value="Fresher">Fresher (0-1 Year)</option>
                      <option value="1-3 Years">Mid-Level (1-3 Years)</option>
                      <option value="3+ Years">Senior (3+ Years)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col col-half">
                  <div className="input-group-custom">
                    <label>Total Questions</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="10" 
                      value={totalQuestions} 
                      onChange={(e) => setTotalQuestions(Math.min(10, Math.max(2, parseInt(e.target.value, 10) || 5)))}
                    />
                  </div>
                </div>

                <div className="col col-half">
                  <div className="input-group-custom">
                    <label>Interview Mode</label>
                    <select value={interviewMode} onChange={(e) => setInterviewMode(e.target.value)}>
                      <option value="voice">🎙️ Voice Interviewer</option>
                      <option value="text">✍️ Text Practice</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload column */}
            <div className="resume-column text-center">
              <div className="resume-upload-box">
                <span className="upload-icon">📄</span>
                <h3>Optimize via Resume Upload</h3>
                <p>Auto-fills candidate metadata, parsed skills, and level metrics.</p>
                
                <input 
                  type="file" 
                  id="resume-file-input" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange} 
                  disabled={resumeUploading}
                  style={{ display: 'none' }}
                />
                
                <label htmlFor="resume-file-input" className={`btn-upload ${resumeUploading ? 'loading' : ''}`}>
                  {resumeUploading ? 'Analyzing PDF Document...' : 'Choose Resume PDF'}
                </label>

                {uploadedResumeName && (
                  <span className="file-name-label">✓ {uploadedResumeName}</span>
                )}
              </div>

              {resumeSkills.length > 0 && (
                <div className="parsed-skills-tags">
                  <span className="tags-title">Detected Tech Stacks:</span>
                  <div className="tags-container">
                    {resumeSkills.slice(0, 6).map((skill, idx) => (
                      <span key={idx} className="skill-pill">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="setup-actions">
            <button className="btn-start" onClick={handleStartInterview}>
              {interviewMode === 'voice' ? '🎙️ Start Voice Interview' : '🚀 Generate Mock Questions'}
            </button>
          </div>
        </div>
      )}

      {sessionStatus === 'loading_questions' && (
        <div className="loading-state-card text-center animate-fade-in">
          <div className="spinner-loader"></div>
          <h2>Formulating Voice Interview Room...</h2>
          <p>Analyzing profile settings, querying target role question pools, and initializing speech engines. Please standby.</p>
        </div>
      )}

      {sessionStatus === 'active' && (
        <div className="session-active-grid-wrapper animate-fade-in">
          {/* Top Progress Timeline Header */}
          <div className="session-progress-timeline-bar mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1 rounded-pill fw-bold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="session-track-pill">{role} Track</span>
                <span className={`difficulty-pill ${difficulty.toLowerCase()}`}>{difficulty}</span>
              </div>

              <div className="d-flex align-items-center gap-3">
                <Timer
                  initialSeconds={120}
                  onTimeUp={handleTimerExpired}
                  autoStart={true}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info rounded-pill px-3 py-1"
                  onClick={() => setInterviewMode(prev => (prev === 'voice' ? 'text' : 'voice'))}
                >
                  {interviewMode === 'voice' ? '🎙️ Voice Mode' : '✍️ Text Mode'}
                </button>
              </div>
            </div>

            <ProgressBar
              current={currentIndex + 1}
              total={questions.length}
            />
          </div>

          {/* 2-Column Main Interview Grid */}
          <div className="interview-room-2col-grid">
            {/* Left Column: Question Card & Voice Recorder */}
            <div className="room-left-column">
              <div className="question-presentation-card mb-4">
                <div className="q-card-header-meta d-flex justify-content-between align-items-center mb-2">
                  <span className="q-category-tag">Topic: {questions[currentIndex]?.topic || role}</span>
                  <span className="q-time-tag">⏱️ Est. 120s Answer</span>
                </div>

                <h2 className="q-headline">{questions[currentIndex]?.question}</h2>

                <div className="q-actions-bar d-flex align-items-center justify-content-between mt-3 pt-3 border-top border-secondary border-opacity-25">
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm d-flex align-items-center gap-2"
                    onClick={handleReplayQuestion}
                  >
                    <span>🔊</span> {isSpeaking ? 'Reading Aloud...' : 'Replay Question'}
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${isMuted ? 'btn-outline-warning' : 'btn-outline-secondary'}`}
                    onClick={handleToggleMute}
                  >
                    {isMuted ? '🔇 Auto-read Muted' : '🔊 Auto-read Enabled'}
                  </button>
                </div>
              </div>

              {interviewMode === 'voice' ? (
                <VoiceRecorder
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isMuted={isMuted}
                  error={recognitionError}
                  isSupported={isSttSupported}
                  speakingDuration={speakingDuration}
                  onStartRecording={handleStartRecordingVoice}
                  onStopRecording={handleStopRecordingVoice}
                  onTranscriptChange={handleVoiceTranscriptChange}
                  onRetry={handleRetryVoice}
                  onReplayQuestion={handleReplayQuestion}
                  onToggleMute={handleToggleMute}
                  onNext={handleNext}
                  onSubmit={handleNext}
                  settings={voiceSettings}
                  onSaveSettings={updateVoiceSettings}
                  voices={voices}
                  isLastQuestion={currentIndex === questions.length - 1}
                  hasAnswer={!!(answers[questions[currentIndex]?.id] || transcript)}
                />
              ) : (
                <QuestionCard
                  questionNumber={currentIndex + 1}
                  totalQuestions={questions.length}
                  questionText={questions[currentIndex]?.question}
                  difficulty={questions[currentIndex]?.difficulty || difficulty}
                  value={answers[questions[currentIndex]?.id] || ''}
                  onChange={(val) => handleAnswerChange(questions[currentIndex]?.id, val)}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  isFirst={currentIndex === 0}
                  isLast={currentIndex === questions.length - 1}
                />
              )}
            </div>

            {/* Right Column: AI Assistant Co-Pilot Side Panel */}
            <div className="room-right-column">
              <AIAssistantPanel
                currentQuestion={questions[currentIndex]}
                transcript={answers[questions[currentIndex]?.id] || transcript}
                speakingDuration={speakingDuration}
                parsedResumeDetails={parsedResumeDetails}
              />
            </div>
          </div>
        </div>
      )}

      {sessionStatus === 'loading_feedback' && (
        <div className="loading-state-card text-center animate-fade-in">
          <div className="spinner-loader feedback"></div>
          <h2>AI Evaluation Pipeline Active...</h2>
          <p>Processing response speech metrics, analyzing text transcripts with Gemini, and compiling final scorecard. Please standby.</p>
        </div>
      )}

      {sessionStatus === 'finished' && (
        <div className="report-card animate-fade-in">
          <header className="report-header text-center">
            <span className="report-shield">🏆</span>
            <h1>AI Interview Scorecard</h1>
            <p>Review overall score ratings, voice analytics, and detailed feedback logs.</p>
          </header>

          {evaluationError ? (
            <div className="state-container error">
              <h3>Evaluation Pipeline Failure</h3>
              <p>{evaluationError}</p>
              <button className="state-btn" onClick={handleFinishInterview}>Retry Feedback Generation</button>
            </div>
          ) : (
            <>
              {/* Score section */}
              <div className="score-summary-grid">
                <div className="score-circle-panel">
                  <div className="big-score">{overallScore}</div>
                  <div className="score-label">Overall Rating / 10</div>
                </div>
                
                <div className="insights-panel text-left">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Hiring Recommendation</h3>
                  <div className="hiring-verdict" style={{ background: 'rgba(99, 102, 241, 0.06)', borderLeft: '4px solid var(--primary)', padding: '0.8rem 1.25rem', borderRadius: '8px', fontSize: '0.98rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    💡 {overallReport?.hiringRecommendation || "No recommendation summary generated."}
                  </div>

                  {/* Subscores */}
                  <div className="subscores-row" style={{ marginTop: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="subscore-metric" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <strong>Technical Capability:</strong> <span style={{ color: 'var(--accent)', fontWeight: '750' }}>{overallReport?.technicalRating || 0} / 10</span>
                    </div>
                    <div className="subscore-metric" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <strong>Communication:</strong> <span style={{ color: 'var(--success)', fontWeight: '750' }}>{overallReport?.communicationRating || 0} / 10</span>
                    </div>
                    <div className="subscore-metric" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <strong>Confidence:</strong> <span style={{ color: '#c084fc', fontWeight: '750' }}>{overallReport?.confidenceRating || 0} / 10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Analytics Summary Bar (Part 20) */}
              {overallVoiceAnalytics && (
                <div className="voice-analytics-panel my-4 p-3 rounded-4 bg-dark border border-secondary text-light">
                  <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2 text-info">
                    <span>📊</span> Voice & Speech Metrics Analytics
                  </h3>

                  <div className="row g-3 text-center">
                    <div className="col-6 col-md-3">
                      <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                        <div className="fs-7 text-muted">Total Speaking Time</div>
                        <div className="fs-5 fw-bold text-light">{overallVoiceAnalytics.totalSpeakingDuration}s</div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                        <div className="fs-7 text-muted">Total Words Spoken</div>
                        <div className="fs-5 fw-bold text-light">{overallVoiceAnalytics.totalWordsSpoken}</div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                        <div className="fs-7 text-muted">Avg Words / Answer</div>
                        <div className="fs-5 fw-bold text-light">{overallVoiceAnalytics.avgWordsPerAnswer}</div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                        <div className="fs-7 text-muted">Avg Time / Answer</div>
                        <div className="fs-5 fw-bold text-light">{overallVoiceAnalytics.avgSpeakingDurationPerAnswer}s</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Highlights split lists */}
              <div className="fb-bullets-row" style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="bullet-col strength" style={{ background: 'rgba(16, 185, 129, 0.02)', padding: '1.75rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                  <h3 style={{ fontSize: '1.20rem', color: 'var(--success)', marginBottom: '1rem', fontWeight: '800' }}>Top Strengths</h3>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {overallReport?.topStrengths?.map((s, idx) => (
                      <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>✓ {s}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bullet-col weakness" style={{ background: 'rgba(239, 68, 68, 0.02)', padding: '1.75rem', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                  <h3 style={{ fontSize: '1.20rem', color: '#f87171', marginBottom: '1rem', fontWeight: '800' }}>Areas for Improvement</h3>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {overallReport?.improvementAreas?.map((w, idx) => (
                      <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>✗ {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Itemized Answer Performance */}
              <div className="detailed-breakdown-section">
                <h2>Itemized Transcripts & AI Evaluation</h2>
                <div className="questions-feedback-list">
                  {questions.map((q) => {
                    const fb = individualFeedback[q.id] || {};
                    const vm = voiceMetricsMap[q.id] || {};
                    return (
                      <div key={q.id} className="question-fb-card">
                        <div className="q-fb-header d-flex justify-content-between align-items-center">
                          <h4>Question {q.id}: {q.question}</h4>
                          <span className="score-badge">Score: {fb.overallScore || fb.score || 0} / 10</span>
                        </div>
                        
                        <div className="q-fb-body">
                          <p className="candidate-answer-quote">
                            <strong>Your Answer Transcript:</strong> <em>{answers[q.id] || "No response recorded."}</em>
                          </p>

                          {vm.speakingDuration > 0 && (
                            <div className="voice-item-meta text-muted fs-8 mb-2">
                              🎙️ <em>Recorded: {vm.speakingDuration} seconds | Words: {(answers[q.id] || '').trim().split(/\s+/).length}</em>
                            </div>
                          )}
                          
                          <div className="fb-bullets-row">
                            <div className="bullet-col strength">
                              <h5>Strengths</h5>
                              <ul>
                                {fb.strengths?.map((s, idx) => <li key={idx}>✓ {s}</li>)}
                              </ul>
                            </div>

                            <div className="bullet-col weakness">
                              <h5>Improvements Needed</h5>
                              <ul>
                                {fb.weaknesses?.map((w, idx) => <li key={idx}>✗ {w}</li>)}
                              </ul>
                            </div>
                          </div>
                          
                          {fb.suggestions && fb.suggestions.length > 0 && (
                            <div className="fb-suggestions">
                              <strong>Suggestions:</strong> {fb.suggestions.join(" ")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="report-actions text-center">
            <button className="btn-reset" onClick={handleResetSession}>
              Configure New Interview Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewSession;
