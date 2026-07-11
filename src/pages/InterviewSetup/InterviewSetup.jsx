import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateAIInterview } from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import './InterviewSetup.css';

/**
 * InterviewSetup Component
 * 
 * Configures the target interview attributes (role, experience, difficulty, skills)
 * and POSTs them to Gemini AI to generate custom questions.
 */
function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [role, setRole] = useState(location.state?.role || '');
  const [experience, setExperience] = useState('3');
  const [difficulty, setDifficulty] = useState(
    (location.state?.difficulty || 'Medium').toLowerCase()
  );
  const [technologies, setTechnologies] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingTextStages = [
    'Connecting to Gemini API...',
    'Analyzing target role specifications...',
    'Crafting 10 custom interview questions...',
    'Balancing technical and STAR behavioral scenarios...',
    'Validating JSON output formats...',
    'Saving mock session in database...'
  ];

  // Cycling loading text effect
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTextStages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isGenerating, loadingTextStages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  if (isGenerating) {
    return (
      <div className="setup-page-container" style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="setup-card setup-loading-container" style={{ width: '100%' }}>
          <div className="spinner" style={{ width: '60px', height: '60px', borderWidth: '5px' }}></div>
          <h2 className="setup-loading-title">Generating AI Mock Session</h2>
          <div className="setup-loading-subtitle">
            <span>{loadingTextStages[loadingTextIndex]}</span>
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Gemini is dynamically customizing scenarios based on your specified technologies and experience level.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-page-container">
      <div className="setup-glow-orb setup-orb-1"></div>

      <header className="setup-header">
        <h1>AI Session Configurator</h1>
        <p>Define your career path parameters below. Gemini will design a 10-question evaluation panel tailored specifically to your profile.</p>
      </header>

      <div className="setup-card">
        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Target Job Role / Title</label>
            <input 
              type="text" 
              id="role"
              placeholder="e.g. Senior React Engineer, Backend Developer, Product Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="experience">Years of Experience</label>
              <select 
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="0">Entry / College Grad (0-1 yrs)</option>
                <option value="2">Junior Developer (2-3 yrs)</option>
                <option value="4">Mid-Level Engineer (4-5 yrs)</option>
                <option value="7">Senior Architect (6-9 yrs)</option>
                <option value="10">Principal / Staff (10+ yrs)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Interview Difficulty</label>
              <select 
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy (Conceptual review)</option>
                <option value="medium">Medium (Standard industry benchmarks)</option>
                <option value="hard">Hard (Deep technical challenges)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="technologies">Key Technologies / Focus Areas</label>
            <input 
              type="text" 
              id="technologies"
              placeholder="e.g. React, Docker, Node.js, System Design, SQL"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-generate-ai"
            disabled={!role.trim() || isGenerating}
          >
            Start AI Interview Generate
          </button>
        </form>
      </div>
    </div>
  );
}

export default InterviewSetup;
