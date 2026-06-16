import React from 'react';

/**
 * AvatarSection Component
 * Renders the virtual interviewer avatar panel and pacing countdown timer.
 */
export function AvatarSection({ isRecording, timeLeft }) {
  return (
    <div className="avatar-section">
      <div className="avatar-box">
        <div className={`avatar-pulse-ring ${isRecording ? 'recording-active' : ''}`}></div>
        <div className="avatar-core">
          <span className="avatar-brain-icon">🤖</span>
        </div>
      </div>
      <div className="avatar-info-panel">
        <h3>PrepAI Assistant</h3>
        <p className="interviewer-status">
          {isRecording ? 'Listening and analyzing speaking pace...' : 'Awaiting response'}
        </p>
      </div>

      {/* Time Remaining Timer Badge */}
      <div 
        className={`timer-badge ${timeLeft <= 15 ? 'warning-timer' : ''}`}
        style={{ 
          padding: '0.6rem 1.2rem', 
          borderRadius: '12px', 
          border: `1px solid ${timeLeft <= 15 ? 'rgba(239, 68, 68, 0.3)' : 'var(--card-border)'}`, 
          background: timeLeft <= 15 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)',
          color: timeLeft <= 15 ? '#f87171' : 'var(--text-primary)',
          fontWeight: 'bold',
          textAlign: 'center',
          width: '80%'
        }}
      >
        ⏱️ {timeLeft}s Remaining
      </div>
    </div>
  );
}

export default AvatarSection;
