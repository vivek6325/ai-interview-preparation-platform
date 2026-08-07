import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Target, Briefcase, Cpu, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { generateAIInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import { useResumeUpload } from '../../hooks/useResumeUpload';
import { InterviewModeSelector } from '../../components/interview/InterviewModeSelector';
import { ResumeUpload } from '../../components/interview/ResumeUpload';
import { FilePreview } from '../../components/interview/FilePreview';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextInput, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import './InterviewSetup.css';

/**
 * InterviewSetup Component (Flagship SaaS Onboarding & Configurator)
 * Supports both General AI Interview setup and Resume-Based Interview mode
 * with drag-and-drop resume upload, file validation, file preview, and simulation placeholders.
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Custom Hook for Resume Upload State & Validation
  const resumeState = useResumeUpload();

  const loadingTextStages = [
    'Connecting to Gemini API...',
    'Analyzing target role & resume specifications...',
    'Crafting custom interview questions...',
    'Balancing technical and STAR behavioral scenarios...',
    'Validating session parameters...',
    'Saving mock session in database...'
  ];

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTextStages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isGenerating, loadingTextStages.length]);

  /**
   * Submit Handler for starting the interview session.
   * Handles both General AI mode and Resume-Based mode.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (interviewMode === 'general') {
      if (!role.trim()) {
        addToast('Please provide a target job role.', 'error');
        return;
      }
    } else if (interviewMode === 'resume') {
      if (!resumeState.file) {
        addToast('Please select or upload a valid resume file (PDF or DOCX, max 5 MB).', 'error');
        return;
      }
    }

    try {
      setIsGenerating(true);
      setLoadingTextIndex(0);

      // If in Resume-Based mode, run simulation placeholders for upload progress, parsing, and extraction
      if (interviewMode === 'resume') {
        await resumeState.simulateProcessing();
      }

      // Generate AI Interview session
      const res = await generateAIInterview({
        mode: interviewMode,
        role: role.trim(),
        difficulty,
        experience,
        technologies: technologies.trim(),
        resumeFileName: resumeState.fileDetails?.name || null
      });

      const interviewId = res?.data?.interviewId || res?.interviewId;

      if (!interviewId) {
        throw new Error('Server response was missing interviewId.');
      }

      addToast(
        interviewMode === 'resume'
          ? 'Resume parsed and AI interview room generated!'
          : 'AI questions generated successfully!',
        'success'
      );
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      console.error('Error generating AI interview:', err);
      addToast(err.message || 'Failed to generate questions. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine if the "Start Interview" submit button should be enabled
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
            {interviewMode === 'resume' ? 'Analyzing Resume & Preparing Room' : 'Generating AI Mock Session'}
          </h2>
          <div className="setup-loading-subtitle my-3">
            <span>{loadingTextStages[loadingTextIndex]}</span>
          </div>
          <p className="text-secondary fs-7 max-w-md mx-auto">
            Gemini is dynamically customizing interview scenarios based on your specified track parameters.
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
        disabled={isGenerating}
      />

      {/* 2-Column Split Onboarding Layout */}
      <div className="setup-grid-layout">
        {/* Left Form Panel */}
        <Card className="setup-form-card">
          <form onSubmit={handleSubmit} className="setup-form">
            {/* General AI Interview Mode Fields */}
            {interviewMode === 'general' && (
              <>
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
              </>
            )}

            {/* Resume-Based Interview Mode Fields */}
            {interviewMode === 'resume' && (
              <div className="setup-resume-section">
                <div className="setup-step-group">
                  <span className="step-tag">UPLOAD RESUME FILE</span>
                  <h3 className="section-heading mb-3">Upload Candidate Resume (PDF / DOCX)</h3>

                  {!resumeState.file ? (
                    <ResumeUpload
                      onFileChange={resumeState.handleFileChange}
                      onDragOver={resumeState.handleDragOver}
                      onDragLeave={resumeState.handleDragLeave}
                      onDrop={resumeState.handleDrop}
                      isDragging={resumeState.isDragging}
                      error={resumeState.error}
                      disabled={isGenerating}
                    />
                  ) : (
                    <FilePreview
                      file={resumeState.file}
                      fileDetails={resumeState.fileDetails}
                      onRemove={resumeState.handleRemoveFile}
                      isProcessing={resumeState.isProcessing}
                      uploadProgress={resumeState.uploadProgress}
                      parseStage={resumeState.parseStage}
                      extractedData={resumeState.extractedData}
                    />
                  )}
                </div>

                <div className="setup-step-group mt-4">
                  <span className="step-tag">OPTIONAL PROFILE OVERRIDE</span>
                  <TextInput
                    label="Target Role Title (Optional)"
                    id="resume-role"
                    placeholder="e.g. Senior Frontend Engineer (Defaults to extracted resume title)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    icon={Briefcase}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="glow"
              size="lg"
              rightIcon={ArrowRight}
              disabled={!isFormValid || isGenerating}
              className="w-100 mt-4"
            >
              {interviewMode === 'resume'
                ? 'Start Resume-Based Interview'
                : 'Generate AI Mock Session'}
            </Button>
          </form>
        </Card>

        {/* Right Session Preview Card */}
        <Card className="setup-preview-card">
          <div className="preview-card-header">
            <Target className="text-purple" size={20} />
            <h3>Live Room Preview</h3>
          </div>

          <div className="preview-spec-list">
            <div className="spec-item">
              <span className="spec-label">Interview Track</span>
              <span className="spec-value text-purple">
                {interviewMode === 'resume' ? 'Resume-Based AI Track' : 'General AI Track'}
              </span>
            </div>

            {interviewMode === 'resume' ? (
              <div className="spec-item">
                <span className="spec-label">Attached Resume</span>
                <span className={`spec-value ${resumeState.file ? 'text-emerald' : 'text-muted'}`}>
                  {resumeState.file ? resumeState.fileDetails?.name || 'Resume Uploaded' : 'No File Uploaded'}
                </span>
              </div>
            ) : (
              <div className="spec-item">
                <span className="spec-label">Target Role</span>
                <span className="spec-value text-purple">{role || 'Not set'}</span>
              </div>
            )}

            <div className="spec-item">
              <span className="spec-label">Difficulty</span>
              <span className="spec-value text-blue">{difficulty.toUpperCase()}</span>
            </div>

            <div className="spec-item">
              <span className="spec-label">Question Count</span>
              <span className="spec-value">10 Custom Scenarios</span>
            </div>

            <div className="spec-item">
              <span className="spec-label">Expected Tech Stack</span>
              <span className="spec-value text-emerald">
                {interviewMode === 'resume' ? 'CV Extracted Skills' : technologies || 'General'}
              </span>
            </div>
          </div>

          <div className="preview-features-box mt-4">
            <h4>Included Session Features</h4>
            <ul>
              <li>
                <CheckCircle2 size={14} className="text-emerald" /> Real-Time Web Speech STT/TTS
              </li>
              <li>
                <CheckCircle2 size={14} className="text-emerald" />
                {interviewMode === 'resume'
                  ? 'CV Deep-Dive & Skill Extraction'
                  : 'Itemized STAR Framework Scorecards'}
              </li>
              <li>
                <CheckCircle2 size={14} className="text-emerald" /> 6-Axis Skill Radar Updates
              </li>
            </ul>
          </div>

          {interviewMode === 'resume' && (
            <div className="preview-resume-info-box mt-4">
              <div className="info-box-header">
                <FileText size={14} className="text-blue" />
                <span>Resume Processing Info</span>
              </div>
              <p className="info-box-desc">
                Your resume will be securely parsed to evaluate project experience and generate relevant technical & STAR questions.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default InterviewSetup;
