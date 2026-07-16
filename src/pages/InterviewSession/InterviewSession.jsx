import { useState, useMemo } from 'react';
import { generateQuestions, uploadResume, generateFeedback } from '../../services/aiService';
import { useToast } from '../../components/Toast/ToastContext';
import Timer from '../../components/interview/Timer';
import ProgressBar from '../../components/interview/ProgressBar';
import QuestionCard from '../../components/interview/QuestionCard';
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
  
  // Resume upload state
  const [resumeUploading, setResumeUploading] = useState(false);
  const [uploadedResumeName, setUploadedResumeName] = useState('');
  const [resumeSkills, setResumeSkills] = useState([]);

  // Session Engine State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: answerText }
  
  // Feedback Metrics State
  const [evaluationError, setEvaluationError] = useState('');
  const [overallScore, setOverallScore] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState([]); // Array of string insights
  const [individualFeedback, setIndividualFeedback] = useState({}); // { [questionId]: feedbackObject }

  // 1. Resume Auto-fill trigger
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
      
      // Auto-fill role if resume contains matches
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

  // 2. Start Interview Session (Question Generation)
  const handleStartInterview = async () => {
    setSessionStatus('loading_questions');
    try {
      const questionList = await generateQuestions(role, experience, difficulty, totalQuestions);
      setQuestions(questionList);
      setAnswers({});
      setCurrentIndex(0);
      setSessionStatus('active');
      addToast('Mock questions generated. Good luck!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to load questions. Please check server status.', 'error');
      setSessionStatus('setup');
    }
  };

  // 3. Question Navigation handlers
  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishInterview();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Fired when the question timer runs out
  const handleTimerExpired = () => {
    addToast('Time is up for this question!', 'warning');
    handleNext();
  };

  // 4. Finish and Generate AI Feedback
  const handleFinishInterview = async () => {
    setSessionStatus('loading_feedback');
    setEvaluationError('');
    addToast('Analyzing answers and evaluating scorecard...', 'info');

    try {
      const feedbackMap = {};
      let scoreSum = 0;

      // Iterate and fetch feedback for each answered question sequentially
      for (const q of questions) {
        const answerText = answers[q.id] || '';
        const feedbackRes = await generateFeedback(q.question, answerText);
        feedbackMap[q.id] = feedbackRes;
        scoreSum += feedbackRes.score || 0;
      }

      const avgScore = parseFloat((scoreSum / questions.length).toFixed(1));
      setOverallScore(avgScore);
      setIndividualFeedback(feedbackMap);

      // Derive mock aggregate insights based on overall score
      if (avgScore >= 8) {
        setOverallFeedback([
          "Strong Candidate: Displays solid systems thinking and accurate definitions.",
          "Great Communication: Answer structures are coherent and complete."
        ]);
      } else if (avgScore >= 6) {
        setOverallFeedback([
          "Capable Professional: Answers hit major parameters but lacks deep architectural trade-offs.",
          "Suggestion: Practice writing out code examples for complex logic blocks."
        ]);
      } else {
        setOverallFeedback([
          "Needs Development: Answer content density was thin or incomplete.",
          "Suggestion: Spend more time reviewing theoretical foundations and algorithms."
        ]);
      }

      setSessionStatus('finished');
      addToast('AI performance analysis complete!', 'success');
    } catch (err) {
      console.error(err);
      setEvaluationError(err.message || 'An error occurred during evaluation.');
      setSessionStatus('finished');
    }
  };

  const handleResetSession = () => {
    setSessionStatus('setup');
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setUploadedResumeName('');
    setResumeSkills([]);
  };

  return (
    <div className="interview-session-container">
      <div className="interview-glow-orb orb-1"></div>
      
      {sessionStatus === 'setup' && (
        <div className="setup-card animate-fade-in">
          <header className="setup-header text-center">
            <div className="setup-badge">⚡ Practice Room</div>
            <h1>AI Mock Interview Setup</h1>
            <p>Select your track parameters or upload a resume to tailor the generated questions.</p>
          </header>

          <div className="setup-grid">
            {/* Form selections */}
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
                  {resumeUploading ? 'Analyzing Document...' : 'Choose Resume PDF'}
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
              Generate Mock Questions
            </button>
          </div>
        </div>
      )}

      {sessionStatus === 'loading_questions' && (
        <div className="loading-state-card text-center animate-fade-in">
          <div className="spinner-loader"></div>
          <h2>Formulating Interview Room...</h2>
          <p>Analyzing profile settings, querying target role question pools, and customizing difficulty parameters. Please standby.</p>
        </div>
      )}

      {sessionStatus === 'active' && (
        <div className="session-card animate-fade-in">
          <div className="session-header-row">
            <div className="session-meta">
              <span className="session-role">{role} Track</span>
              <span className="meta-sep">•</span>
              <span className={`difficulty-pill ${difficulty.toLowerCase()}`}>{difficulty}</span>
            </div>
            
            {/* Countdown timer for each question */}
            <Timer 
              initialSeconds={90} 
              onTimeUp={handleTimerExpired} 
              autoStart={true} 
            />
          </div>

          <ProgressBar 
            current={currentIndex + 1} 
            total={questions.length} 
          />

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
        </div>
      )}

      {sessionStatus === 'loading_feedback' && (
        <div className="loading-state-card text-center animate-fade-in">
          <div className="spinner-loader feedback"></div>
          <h2>AI Evaluation Pipeline Active...</h2>
          <p>Processing response densities, calculating structural parameters, and compiling scorecards for each question response. This will take a moment.</p>
        </div>
      )}

      {sessionStatus === 'finished' && (
        <div className="report-card animate-fade-in">
          <header className="report-header text-center">
            <span className="report-shield">🏆</span>
            <h1>AI Evaluation Report</h1>
            <p>Review overall score assessments and itemized feedback logs.</p>
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
                  <h3>AI Diagnostic Insights</h3>
                  <ul className="insights-list">
                    {overallFeedback.map((insight, idx) => (
                      <li key={idx}>⚡ {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question list breakdown */}
              <div className="detailed-breakdown-section">
                <h2>Itemized Answer Performance</h2>
                <div className="questions-feedback-list">
                  {questions.map((q) => {
                    const fb = individualFeedback[q.id] || {};
                    return (
                      <div key={q.id} className="question-fb-card">
                        <div className="q-fb-header">
                          <h4>Question {q.id}: {q.question}</h4>
                          <span className="score-badge">Score: {fb.score || 0} / 10</span>
                        </div>
                        
                        <div className="q-fb-body">
                          <p className="candidate-answer-quote">
                            <strong>Your Answer:</strong> <em>{answers[q.id] || "No response provided."}</em>
                          </p>
                          
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
              Configure New Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewSession;
