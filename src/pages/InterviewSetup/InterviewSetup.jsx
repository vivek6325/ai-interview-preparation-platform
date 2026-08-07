import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Target, Briefcase, Cpu, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import {
  generateAIInterview,
  extractResumeApi,
  generateResumeQuestionsApi,
  saveResumeApi,
  createInterview
} from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import { useResumeUpload } from '../../hooks/useResumeUpload';
import { InterviewModeSelector } from '../../components/interview/InterviewModeSelector';
import { ResumeUpload } from '../../components/interview/ResumeUpload';
import { FilePreview } from '../../components/interview/FilePreview';
import { ResumePreview } from '../../components/interview/ResumePreview';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextInput, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import './InterviewSetup.css';

/**
 * InterviewSetup Component (Flagship SaaS Onboarding & Configurator)
 * Connects the complete pipeline:
 * Upload -> Parser -> AI Extraction -> Resume Preview -> Question Generator -> Launch Session
 */
function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Track Mode Selection State: 'general' | 'resume'
  const [interviewMode, setInterviewMode] = useState('general');

  // Form Field States
  const [role, setRole] = useState(location.state?.role || 'Senior Frontend Engineer');
  const [experience, setExperience] = useState('3');
  const [difficulty, setDifficulty] = useState(
    (location.state?.difficulty || 'Medium').toLowerCase()
  );
  const [technologies, setTechnologies] = useState('React, TypeScript, CSS, Node.js');

  // Processing & Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [extractedResumeData, setExtractedResumeData] = useState(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Custom Hook for Resume Upload State & Validation
  const resumeState = useResumeUpload();

  const loadingTextStages = [
    'Connecting to Gemini API...',
    'Analyzing target role & resume specifications...',
    'Generating 15-20 personalized interview questions...',
    'Balancing technical, behavioral, and STAR scenarios...',
    'Validating session parameters...',
    'Initializing mock interview room...'
  ];

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTextStages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isGenerating, loadingTextStages.length]);

  /**
   * Automatically trigger AI structured extraction when candidate attaches a valid resume file.
   */
  const handleExtractResumeData = useCallback(async (file) => {
    if (!file) return;

    try {
      setIsExtractingResume(true);
      addToast('Extracting structured candidate profile with AI...', 'info');

      const res = await extractResumeApi(file);
      const data = res?.data || res;

      if (!data) {
        throw new Error('Unable to extract structured resume information.');
      }

      setExtractedResumeData(data);
      addToast('Resume details extracted successfully!', 'success');
    } catch (err) {
      console.error('Error during AI resume extraction:', err);
      addToast(
        err.message || 'Unable to extract structured resume information. You can still proceed.',
        'error'
      );
    } finally {
      setIsExtractingResume(false);
    }
  }, [addToast]);

  // Trigger extraction when resumeState.file changes
  useEffect(() => {
    if (resumeState.file && !extractedResumeData && !isExtractingResume) {
      handleExtractResumeData(resumeState.file);
    }
  }, [resumeState.file, extractedResumeData, isExtractingResume, handleExtractResumeData]);

  // Clear extracted profile data when file is removed
  const handleRemoveResume = () => {
    resumeState.handleRemoveFile();
    setExtractedResumeData(null);
  };

  /**
   * Launches Resume Interview using AI Question Generator.
   */
  const handleStartResumeInterview = async () => {
    if (!extractedResumeData && !resumeState.file) {
      addToast('Please upload a resume first.', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      setLoadingTextIndex(0);

      // Step 1: Call AI Question Generator API (PART B / C)
      const qRes = await generateResumeQuestionsApi(
        extractedResumeData || { name: 'Candidate', skills: [role] }
      );

      const qGroup = qRes?.questions || {};
      const combinedQuestions = [
        ...(qGroup.technical || []),
        ...(qGroup.behavioral || []),
        ...(qGroup.projects || []),
        ...(qGroup.experience || []),
        ...(qGroup.problemSolving || [])
      ];

      if (combinedQuestions.length === 0) {
        throw new Error('AI Question Generator returned no questions.');
      }

      // Step 2: Persist Resume document in MongoDB (PART B)
      await saveResumeApi({
        originalFileName: resumeState.fileDetails?.name || resumeState.file?.name || 'Resume.pdf',
        storedFileName: resumeState.fileDetails?.name || resumeState.file?.name || 'resume.pdf',
        fileType: (resumeState.fileDetails?.extension || 'PDF').toUpperCase(),
        fileSize: resumeState.fileDetails?.size || resumeState.file?.size || 0,
        extractedData: extractedResumeData,
        interviewQuestions: combinedQuestions,
        status: 'questions_generated'
      }).catch((err) => console.warn('⚠️ Could not save resume record to history:', err.message));

      // Step 3: Create Session in Database
      const sessionTitle = extractedResumeData?.name
        ? `${extractedResumeData.name} - Resume AI Session`
        : 'Resume AI Interview';

      const createRes = await createInterview({
        title: sessionTitle,
        role: extractedResumeData?.name ? `${extractedResumeData.name}'s Resume` : role,
        difficulty: 'medium',
        status: 'pending',
        questions: combinedQuestions.map((q) => ({
          questionText: q.question,
          userAnswer: '',
          score: null,
          feedback: '',
          strength: '',
          improvement: ''
        }))
      });

      const interviewId = createRes?.data?.interview?._id || createRes?.interview?._id || createRes?._id;

      if (!interviewId) {
        throw new Error('Failed to create interview session.');
      }

      addToast('Personalized AI questions generated! Entering interview room...', 'success');
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      console.error('Error generating personalized resume interview:', err);
      addToast(err.message || 'Unable to generate personalized interview questions.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Submit Handler for starting General AI Interview session.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (interviewMode === 'general') {
      if (!role.trim()) {
        addToast('Please provide a target job role.', 'error');
        return;
      }

      try {
        setIsGenerating(true);
        setLoadingTextIndex(0);

        const res = await generateAIInterview({
          role: role.trim(),
          difficulty,
          experience,
          technologies: technologies.trim()
        });

        const interviewId = res?.data?.interviewId || res?.interviewId;

        if (!interviewId) {
          throw new Error('Server response was missing interviewId.');
        }

        addToast('AI questions generated successfully!', 'success');
        navigate(`/interview/${interviewId}`);
      } catch (err) {
        console.error('Error generating AI interview:', err);
        addToast(err.message || 'Failed to generate questions. Please try again.', 'error');
      } finally {
        setIsGenerating(false);
      }
    } else {
      await handleStartResumeInterview();
    }
  };

  // Enable button state
  const isFormValid =
    interviewMode === 'general'
      ? Boolean(role.trim())
      : Boolean(resumeState.file && !resumeState.error);

  if (isGenerating) {
    return (
      <div className="setup-page-container flex-center min-h-screen">
        <Card className="setup-loading-card text-center p-5">
          <div className="spinner-glow mx-auto mb-4"></div>
          <h2 className="setup-loading-title">
            {interviewMode === 'resume'
              ? 'Generating 15-20 Personalized AI Questions'
              : 'Generating AI Mock Session'}
          </h2>
          <div className="setup-loading-subtitle my-3">
            <span>{loadingTextStages[loadingTextIndex]}</span>
          </div>
          <p className="text-secondary fs-7 max-w-md mx-auto">
            Gemini AI is analyzing candidate background details to formulate targeted questions.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="setup-page-container">
      <div className="setup-glow-orb purple-orb"></div>

      <header className="setup-header text-center mb-5">
        <Badge variant="glow" size="md" icon={Sparkles} className="mb-3">
          STEP-BY-STEP SESSION CONFIGURATOR
        </Badge>
        <h1 className="setup-title">Formulate Your AI Mock Room</h1>
        <p className="setup-subtitle">
          Select an interview track to practice with general role scenarios or upload your resume for CV-tailored questions.
        </p>
      </header>

      {/* Mode Selection Component */}
      <InterviewModeSelector
        selectedMode={interviewMode}
        onSelectMode={setInterviewMode}
        disabled={isGenerating || isExtractingResume}
      />

      {/* General AI Track Setup View */}
      {interviewMode === 'general' && (
        <div className="setup-grid-layout">
          <Card className="setup-form-card">
            <form onSubmit={handleSubmit} className="setup-form">
              <div className="setup-step-group">
                <span className="step-tag">STEP 1 OF 3</span>
                <TextInput
                  label="Target Job Role / Focus Title"
                  id="role"
                  placeholder="e.g. Senior Frontend Engineer, Full Stack, Java Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  icon={Briefcase}
                  required
                />
              </div>

              <div className="setup-step-group">
                <span className="step-tag">STEP 2 OF 3</span>
                <div className="grid-2col">
                  <Select
                    label="Experience Level"
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="0">Entry Level (0-1 yrs)</option>
                    <option value="2">Junior Developer (2-3 yrs)</option>
                    <option value="4">Mid-Level (4-5 yrs)</option>
                    <option value="7">Senior Architect (6-9 yrs)</option>
                    <option value="10">Staff / Principal (10+ yrs)</option>
                  </Select>

                  <Select
                    label="Interview Difficulty"
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy (Conceptual fundamentals)</option>
                    <option value="medium">Medium (Standard benchmarks)</option>
                    <option value="hard">Hard (Deep technical challenges)</option>
                  </Select>
                </div>
              </div>

              <div className="setup-step-group">
                <span className="step-tag">STEP 3 OF 3</span>
                <TextInput
                  label="Key Technologies / Tech Stacks"
                  id="technologies"
                  placeholder="e.g. React, Docker, Node.js, SQL, System Design"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  icon={Cpu}
                />
              </div>

              <Button
                type="submit"
                variant="glow"
                size="lg"
                rightIcon={ArrowRight}
                disabled={!isFormValid || isGenerating}
                className="w-100 mt-4"
              >
                Generate AI Mock Session
              </Button>
            </form>
          </Card>

          <Card className="setup-preview-card">
            <div className="preview-card-header">
              <Target className="text-purple" size={20} />
              <h3>Live Room Preview</h3>
            </div>

            <div className="preview-spec-list">
              <div className="spec-item">
                <span className="spec-label">Interview Track</span>
                <span className="spec-value text-purple">General AI Track</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Target Role</span>
                <span className="spec-value text-purple">{role || 'Not set'}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Difficulty</span>
                <span className="spec-value text-blue">{difficulty.toUpperCase()}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Question Count</span>
                <span className="spec-value">10 Scenarios</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Expected Tech Stack</span>
                <span className="spec-value text-emerald">{technologies || 'General'}</span>
              </div>
            </div>

            <div className="preview-features-box mt-4">
              <h4>Included Session Features</h4>
              <ul>
                <li>
                  <CheckCircle2 size={14} className="text-emerald" /> Real-Time Web Speech STT/TTS
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-emerald" /> Itemized STAR Framework Scorecards
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-emerald" /> 6-Axis Skill Radar Updates
                </li>
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* Resume-Based Track Setup & Resume Preview View */}
      {interviewMode === 'resume' && (
        <div className="resume-track-container">
          {!resumeState.file ? (
            <div className="setup-grid-layout">
              <Card className="setup-form-card">
                <div className="setup-resume-section">
                  <div className="setup-step-group">
                    <span className="step-tag">UPLOAD RESUME FILE</span>
                    <h3 className="section-heading mb-3">Upload Candidate Resume (PDF / DOCX)</h3>

                    <ResumeUpload
                      onFileChange={resumeState.handleFileChange}
                      onDragOver={resumeState.handleDragOver}
                      onDragLeave={resumeState.handleDragLeave}
                      onDrop={resumeState.handleDrop}
                      isDragging={resumeState.isDragging}
                      error={resumeState.error}
                      disabled={isGenerating || isExtractingResume}
                    />
                  </div>
                </div>
              </Card>

              <Card className="setup-preview-card">
                <div className="preview-card-header">
                  <Target className="text-purple" size={20} />
                  <h3>Live Room Preview</h3>
                </div>

                <div className="preview-spec-list">
                  <div className="spec-item">
                    <span className="spec-label">Interview Track</span>
                    <span className="spec-value text-purple">Resume-Based AI Track</span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Attached Resume</span>
                    <span className="spec-value text-muted">No File Uploaded</span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Difficulty</span>
                    <span className="spec-value text-blue">ADAPTIVE</span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Question Count</span>
                    <span className="spec-value">15-20 Personalized Scenarios</span>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="resume-attached-flow">
              {/* File Info Bar */}
              <FilePreview
                file={resumeState.file}
                fileDetails={resumeState.fileDetails}
                onRemove={handleRemoveResume}
                isProcessing={isExtractingResume}
                uploadProgress={isExtractingResume ? 60 : 100}
                parseStage={isExtractingResume ? 'extracting' : 'ready'}
                extractedData={extractedResumeData}
              />

              {/* Resume Preview Screen (PART A) */}
              <ResumePreview
                resumeData={extractedResumeData}
                isLoading={isExtractingResume}
                onStartInterview={handleStartResumeInterview}
                isGeneratingQuestions={isGenerating}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewSetup;
