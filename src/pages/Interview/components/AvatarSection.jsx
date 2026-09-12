
/**
 * AvatarSection Component (Day 19 Part 8 — Voice Interview Room UI)
 * Renders the virtual interviewer avatar panel, live speaking state badges, and countdown timer.
 */
export function AvatarSection({ 
  isRecording = false,
  isAiSpeaking = false,
  isTranscribing = false,
  isAnalyzing = false,
  timeLeft = 60
}) {
  const getStatusText = () => {
    if (isAiSpeaking) return '🔊 AI is speaking...';
    if (isRecording) return '🎙️ Listening to your answer...';
    if (isTranscribing) return '📝 Transcribing voice response...';
    if (isAnalyzing) return '🤖 AI analyzing response...';
    return '🎙️ Your turn to answer';
  };

  const getStatusBadgeClass = () => {
    if (isAiSpeaking) return 'status-badge-speaking';
    if (isRecording) return 'status-badge-recording';
    if (isTranscribing || isAnalyzing) return 'status-badge-processing';
    return 'status-badge-ready';
  };

  return (
    <div className="avatar-section">
      <div className="avatar-box">
        <div className={`avatar-pulse-ring ${isRecording ? 'recording-active' : ''} ${isAiSpeaking ? 'ai-speaking-active' : ''}`}></div>
        <div className="avatar-core">
          <span className="avatar-brain-icon">🤖</span>
        </div>

        {/* Animated Sound Wave visualizer when AI is speaking */}
        {isAiSpeaking && (
          <div className="ai-audio-wave-visualizer" aria-label="AI speaking soundwave animation">
            <span className="wave-bar bar-1"></span>
            <span className="wave-bar bar-2"></span>
            <span className="wave-bar bar-3"></span>
            <span className="wave-bar bar-4"></span>
          </div>
        )}
      </div>

      <div className="avatar-info-panel">
        <h3>PrepAI Interviewer</h3>
        <div className={`interviewer-status-badge ${getStatusBadgeClass()}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Time Remaining Timer Badge */}
      <div className={`timer-badge ${timeLeft <= 15 ? 'warning-timer' : ''}`}>
        ⏱️ {timeLeft}s Remaining
      </div>
    </div>
  );
}

export default AvatarSection;
