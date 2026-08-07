import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import './InterviewModeSelector.css';

/**
 * InterviewModeSelector Component
 *
 * Allows candidates to toggle between General AI Interview mode and Resume-Based Interview mode.
 * Styled according to the flagship dark glass design system with smooth micro-animations.
 *
 * @param {Object} props
 * @param {'general'|'resume'} props.selectedMode - Currently active interview mode
 * @param {Function} props.onSelectMode - Callback when mode changes
 * @param {boolean} [props.disabled=false] - Whether mode selection is disabled
 */
export function InterviewModeSelector({ selectedMode = 'general', onSelectMode, disabled = false }) {
  const modes = [
    {
      id: 'general',
      title: 'General AI Interview',
      subtitle: 'Standard Role Configurator',
      description:
        'Specify your target job role, experience level, and tech stack to generate instant mock interview scenarios.',
      icon: Bot,
      tag: 'Custom Parameters',
      badgeColor: 'purple',
      features: ['Choose target role & seniority', 'Select specific tech stack', 'Standard 10-question set']
    },
    {
      id: 'resume',
      title: 'Resume-Based Interview',
      subtitle: 'CV Deep Dive & AI Extraction',
      description:
        'Upload your PDF or DOCX resume. AI extracts your real experience, skills, and projects to craft hyper-personalized questions.',
      icon: FileText,
      tag: 'AI CV Analysis',
      badgeColor: 'blue',
      features: ['Tailored to your real projects', 'Deep dive into listed skills', 'STAR behavioral & tech mix']
    }
  ];

  const handleKeyDown = (e, modeId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && onSelectMode) {
        onSelectMode(modeId);
      }
    }
  };

  return (
    <div className="interview-mode-selector" role="radiogroup" aria-label="Select Interview Mode">
      <div className="mode-selector-header mb-3">
        <span className="step-tag">SELECT INTERVIEW TRACK</span>
        <h2 className="mode-selector-title">Choose How You Want to Interview</h2>
      </div>

      <div className="mode-cards-grid">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <motion.div
              key={mode.id}
              whileHover={{ scale: disabled ? 1 : 1.015 }}
              whileTap={{ scale: disabled ? 1 : 0.985 }}
              className={`mode-card ${isSelected ? 'mode-card--active' : ''} ${
                disabled ? 'mode-card--disabled' : ''
              }`}
              onClick={() => !disabled && onSelectMode && onSelectMode(mode.id)}
              onKeyDown={(e) => handleKeyDown(e, mode.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeGlow"
                  className="mode-card-active-glow"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="mode-card-top">
                <div className={`mode-icon-box mode-icon-${mode.badgeColor}`}>
                  <Icon size={24} />
                </div>
                <span className={`mode-badge mode-badge-${mode.badgeColor}`}>
                  {mode.id === 'resume' ? <Sparkles size={12} className="mr-1" /> : <UserCheck size={12} className="mr-1" />}
                  {mode.tag}
                </span>
              </div>

              <div className="mode-card-body">
                <h3 className="mode-card-title">{mode.title}</h3>
                <span className="mode-card-subtitle">{mode.subtitle}</span>
                <p className="mode-card-description">{mode.description}</p>
              </div>

              <div className="mode-card-footer">
                <ul className="mode-feature-list">
                  {mode.features.map((feat, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={13} className="mode-check-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="mode-radio-indicator">
                  <div className={`radio-circle ${isSelected ? 'radio-circle--selected' : ''}`}>
                    {isSelected && <div className="radio-inner" />}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default InterviewModeSelector;
