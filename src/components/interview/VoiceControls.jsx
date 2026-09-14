/**
 * Voice Controls Component
 * Toolbar providing voice actions: Start, Stop, Retry, Replay Question, Mute, Settings, Next, Submit.
 * 
 * @param {Object} props
 * @param {boolean} props.isListening
 * @param {boolean} props.isSpeaking
 * @param {boolean} props.isMuted
 * @param {Function} props.onStartRecording
 * @param {Function} props.onStopRecording
 * @param {Function} props.onRetry
 * @param {Function} props.onReplayQuestion
 * @param {Function} props.onToggleMute
 * @param {Function} props.onOpenSettings
 * @param {Function} props.onNext
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLastQuestion=false]
 * @param {boolean} [props.isSubmitting=false]
 * @param {boolean} [props.hasAnswer=false]
 */
export function VoiceControls({
  isListening,
  isSpeaking,
  isMuted,
  onStartRecording,
  onStopRecording,
  onRetry,
  onReplayQuestion,
  onToggleMute,
  onOpenSettings,
  onNext,
  onSubmit,
  isLastQuestion = false,
  isSubmitting = false,
  hasAnswer = false
}) {
  return (
    <div className="voice-controls-toolbar d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 rounded bg-dark border border-secondary border-opacity-25">
      {/* Left side: Voice audio utility actions */}
      <div className="voice-actions-left d-flex flex-wrap gap-2 align-items-center">
        {/* Record / Stop toggle */}
        {!isListening ? (
          <button
            type="button"
            className="btn btn-primary btn-voice-action d-flex align-items-center gap-2"
            onClick={onStartRecording}
            disabled={isSubmitting}
            aria-label="Start recording"
          >
            <span>🎙️</span> Start Record
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-danger btn-voice-action d-flex align-items-center gap-2"
            onClick={onStopRecording}
            aria-label="Stop recording"
          >
            <span className="spinner-grow spinner-grow-sm text-light"></span> Stop Record
          </button>
        )}

        {/* Retry answer */}
        <button
          type="button"
          className="btn btn-outline-secondary btn-voice-action"
          onClick={onRetry}
          disabled={isListening || isSubmitting}
          title="Clear answer transcript and re-record"
          aria-label="Retry answer"
        >
          🔄 Retry
        </button>

        {/* Replay Question TTS */}
        <button
          type="button"
          className="btn btn-outline-info btn-voice-action d-flex align-items-center gap-1"
          onClick={onReplayQuestion}
          disabled={isListening || isSubmitting}
          title="Read question aloud using Text-To-Speech"
          aria-label="Replay Question"
        >
          <span>{isSpeaking ? '🔊 Speaking...' : '🔊 Replay Question'}</span>
        </button>

        {/* Mute Toggle */}
        <button
          type="button"
          className={`btn ${isMuted ? 'btn-outline-warning' : 'btn-outline-secondary'} btn-voice-action`}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute question auto-read' : 'Mute question auto-read'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇 Muted' : '🔊 Auto-Read'}
        </button>

        {/* Settings button */}
        {onOpenSettings && (
          <button
            type="button"
            className="btn btn-outline-light btn-voice-action"
            onClick={onOpenSettings}
            title="Configure voice rate, pitch, and voice parameters"
            aria-label="Voice settings"
          >
            ⚙️ Settings
          </button>
        )}
      </div>

      {/* Right side: Navigation & Submit */}
      <div className="voice-actions-right d-flex gap-2">
        {onNext && !isLastQuestion && (
          <button
            type="button"
            className="btn btn-outline-primary px-3"
            onClick={onNext}
            disabled={isListening || isSubmitting}
          >
            Next Question →
          </button>
        )}

        <button
          type="button"
          className="btn btn-success px-4 fw-bold"
          onClick={onSubmit}
          disabled={isListening || isSubmitting || !hasAnswer}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Evaluating...
            </>
          ) : isLastQuestion ? (
            'Finish & Submit Session 🏆'
          ) : (
            'Submit Answer ✓'
          )}
        </button>
      </div>
    </div>
  );
}

export default VoiceControls;
