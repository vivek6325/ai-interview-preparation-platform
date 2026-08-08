import { useEffect } from 'react';
import useAudioRecorder from '../../../hooks/useAudioRecorder';
import './VoiceRecorderCard.css';

/**
 * VoiceRecorderCard Component
 * 
 * Reusable Voice Recording component for interview responses.
 * Provides controls for Start Recording, Stop Recording, Re-recording, and Audio Playback.
 * Handles microphone permissions, timer formatting (MM:SS), audio blob generation,
 * and releases microphone streams safely.
 * 
 * @param {Object} props
 * @param {Function} [props.onRecordingStateChange] Callback notifying parent of recording state
 * @param {Function} [props.onAudioReady] Callback receiving { blob, url } when recording finishes
 * @param {boolean} [props.disabled] Optional flag to disable controls
 */
export function VoiceRecorderCard({ onRecordingStateChange, onAudioReady, disabled = false }) {
  const {
    status,
    isRecording,
    isSupported,
    duration,
    formattedTime,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  // Notify parent of recording state changes
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording);
    }
  }, [isRecording, onRecordingStateChange]);

  // Notify parent when audio recording is finalized
  useEffect(() => {
    if (status === 'recorded' && audioUrl && audioBlob && onAudioReady) {
      onAudioReady({ blob: audioBlob, url: audioUrl, duration });
    }
  }, [status, audioUrl, audioBlob, duration, onAudioReady]);

  // Determine status text for UI display
  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return 'Recording...';
      case 'recorded':
        return 'Recording complete';
      case 'permission_denied':
        return 'Microphone permission required';
      case 'unavailable':
        return 'Microphone unavailable';
      case 'unsupported':
        return 'Browser unsupported';
      case 'idle':
      default:
        return 'Ready to record';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'recording':
        return 'status-recording';
      case 'recorded':
        return 'status-recorded';
      case 'permission_denied':
      case 'unavailable':
      case 'unsupported':
        return 'status-error';
      case 'idle':
      default:
        return 'status-idle';
    }
  };

  return (
    <div
      className={`voice-recorder-container ${isRecording ? 'is-recording' : ''} ${status === 'recorded' ? 'is-recorded' : ''}`}
      aria-label="Voice Answer Recorder"
    >
      {/* Header bar: Status pill & Elapsed Timer */}
      <div className="voice-recorder-header">
        <div
          className={`voice-status-pill ${getStatusClass()}`}
          aria-live="polite"
        >
          {isRecording ? (
            <span className="recording-indicator-dot pulse" aria-hidden="true" />
          ) : (
            <span className="recording-indicator-dot" aria-hidden="true" style={{ opacity: status === 'recorded' ? 1 : 0.4 }} />
          )}
          <span>{getStatusText()}</span>
        </div>

        <div
          className={`voice-recorder-timer ${isRecording ? 'recording-active' : ''}`}
          aria-label={`Elapsed recording time ${formattedTime}`}
        >
          <span>⏱️ {formattedTime}</span>
        </div>
      </div>

      {/* Error alert box */}
      {error && (
        <div className="voice-recorder-alert" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Action controls toolbar */}
      <div className="voice-recorder-actions">
        {status !== 'recording' && status !== 'recorded' && (
          <button
            type="button"
            className="btn-voice-action btn-voice-start"
            onClick={startRecording}
            disabled={disabled || !isSupported}
            aria-label="Start recording audio response"
          >
            <span aria-hidden="true">🎙️</span>
            <span>Start Recording</span>
          </button>
        )}

        {status === 'recording' && (
          <button
            type="button"
            className="btn-voice-action btn-voice-stop"
            onClick={stopRecording}
            disabled={disabled}
            aria-label="Stop audio recording"
          >
            <span aria-hidden="true">⏹️</span>
            <span>Stop Recording</span>
          </button>
        )}

        {status === 'recorded' && (
          <>
            <button
              type="button"
              className="btn-voice-action btn-voice-rerecord"
              onClick={resetRecording}
              disabled={disabled}
              aria-label="Re-record audio response"
            >
              <span aria-hidden="true">🔄</span>
              <span>Re-record</span>
            </button>

            <div className="voice-audio-player-wrapper">
              <audio
                controls
                src={audioUrl}
                className="voice-audio-player"
                aria-label="Audio answer playback"
              >
                Your browser does not support the audio playback element.
              </audio>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorderCard;
