
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
      <div className={`timer-badge ${timeLeft <= 15 ? 'warning-timer' : ''}`}>
        ⏱️ {timeLeft}s Remaining
      </div>
    </div>
  );
}

export default AvatarSection;
