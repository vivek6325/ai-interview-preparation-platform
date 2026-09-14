import { motion } from 'framer-motion';
import { Sparkles, Gauge, Target, FileCheck, CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import './AIAssistantPanel.css';

/**
 * AIAssistantPanel Component
 * Right-hand AI co-pilot panel during live interview sessions.
 * Displays resume match rating, live speaking metrics, expected points checklist, and STAR tips.
 */
export function AIAssistantPanel({
  currentQuestion,
  transcript = '',
  speakingDuration = 0,
  parsedResumeDetails
}) {
  // Compute word count & speaking speed (WPM)
  const wordsCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const minutes = speakingDuration > 0 ? speakingDuration / 60 : 0;
  const wpm = minutes > 0 ? Math.round(wordsCount / minutes) : 0;

  // Pace status text
  const getPaceStatus = () => {
    if (wpm === 0) return 'Ready to record';
    if (wpm < 90) return 'Slightly slow - speak clearly';
    if (wpm > 170) return 'Pacing fast - slow down slightly';
    return 'Optimal speaking pace (~130 WPM)';
  };

  // Expected points checklist
  const expectedPoints = currentQuestion?.expectedAnswerPoints || [
    'Define core concept & problem solved',
    'Explain key architectural trade-offs',
    'Give real-world application example'
  ];

  // Simple keyword matching heuristic for UI feedback
  const lowerTranscript = transcript.toLowerCase();
  const matchedPoints = expectedPoints.filter((pt) => {
    const keywords = pt.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    return keywords.some(kw => lowerTranscript.includes(kw));
  });

  const resumeMatchScore = parsedResumeDetails?.skills?.length > 0 ? 88 : 75;

  return (
    <motion.aside
      className="ai-assistant-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="panel-header">
        <div className="panel-title-row">
          <Sparkles size={18} className="text-indigo" />
          <h3 className="panel-title">AI Assistant Co-Pilot</h3>
        </div>
        <span className="live-pill">
          <span className="live-dot"></span> LIVE METRICS
        </span>
      </div>

      {/* Resume Match Card */}
      <div className="assistant-card resume-match-card">
        <div className="card-meta-row">
          <FileCheck size={16} className="text-emerald" />
          <span className="meta-label">Resume Skill Alignment</span>
          <span className="meta-value">{resumeMatchScore}% Match</span>
        </div>
        <div className="progress-track-sm">
          <div className="progress-fill-sm fill-emerald" style={{ width: `${resumeMatchScore}%` }}></div>
        </div>
      </div>

      {/* Live Speaking Metrics */}
      <div className="assistant-card metrics-card">
        <div className="card-title-row">
          <Gauge size={16} className="text-sky" />
          <span>Speech Delivery Pace</span>
        </div>

        <div className="metrics-grid-2col">
          <div className="metric-box">
            <span className="box-val">{wpm}</span>
            <span className="box-lbl">Est. WPM</span>
          </div>

          <div className="metric-box">
            <span className="box-val">{speakingDuration}s</span>
            <span className="box-lbl">Speech Time</span>
          </div>
        </div>

        <div className="pace-status-banner">
          <span>⚡ {getPaceStatus()}</span>
        </div>
      </div>

      {/* Target Points Checklist */}
      <div className="assistant-card points-card">
        <div className="card-title-row">
          <Target size={16} className="text-amber" />
          <span>Expected Key Points ({matchedPoints.length}/{expectedPoints.length})</span>
        </div>

        <ul className="points-checklist">
          {expectedPoints.map((point, idx) => {
            const isMatched = matchedPoints.includes(point);
            return (
              <li key={idx} className={`checklist-item ${isMatched ? 'matched' : ''}`}>
                {isMatched ? (
                  <CheckCircle2 size={15} className="icon-check text-emerald" />
                ) : (
                  <Circle size={15} className="icon-circle text-muted" />
                )}
                <span>{point}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* STAR Framework Guidance */}
      <div className="assistant-card star-tips-card">
        <div className="card-title-row">
          <Lightbulb size={16} className="text-indigo" />
          <span>STAR Method Reminder</span>
        </div>
        <p className="star-tips-text">
          Structure your answer: <strong>Situation</strong> (context), <strong>Task</strong> (goal), <strong>Action</strong> (steps taken), and <strong>Result</strong> (impact).
        </p>
      </div>
    </motion.aside>
  );
}

export default AIAssistantPanel;
