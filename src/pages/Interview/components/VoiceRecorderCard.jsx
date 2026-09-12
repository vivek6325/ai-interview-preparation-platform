import { useEffect, useCallback } from 'react';
import useAudioRecorder, { formatAudioTimer } from '../../../hooks/useAudioRecorder';
import useVoiceTranscription from '../../../hooks/useVoiceTranscription';
import useSpeechRecognition from '../../../hooks/useSpeechRecognition';
import useSpeechAnalytics from '../../../hooks/useSpeechAnalytics';
import './VoiceRecorderCard.css';

/**
 * VoiceRecorderCard Component (Part 1 + Part 2 STT + Part 3 Speaking Pace Analysis)
 * 
 * Reusable Voice Recording & Speech Analytics component for interview responses.
 * Provides controls for Start Recording, Stop Recording, Re-recording, Audio Playback,
 * Transcribe Answer, and displays speaking duration, word count, WPM, pace rating, and feedback.
 * 
 * @param {Object} props
 * @param {Function} [props.onRecordingStateChange] Callback notifying parent of recording state
 * @param {Function} [props.onAudioReady] Callback receiving { blob, url, duration, transcript, voiceResponse, voiceAnalytics }
 * @param {Function} [props.onTranscriptGenerated] Callback passing transcript text directly to answer input
 * @param {boolean} [props.disabled] Optional flag to disable controls
 */
export function VoiceRecorderCard({
  onRecordingStateChange,
  onAudioReady,
  onTranscriptGenerated,
  disabled = false
}) {
  const {
    status: recordingStatus,
    isRecording,
    isSupported: isAudioSupported,
    duration,
    formattedTime,
    audioBlob,
    audioUrl,
    error: recorderError,
    startRecording: startAudioRecord,
    stopRecording: stopAudioRecord,
    resetRecording: resetAudioRecord
  } = useAudioRecorder();

  const {
    transcript: liveTranscript,
    start: startLiveStt,
    stop: stopLiveStt,
    reset: resetLiveStt
  } = useSpeechRecognition();

  const {
    transcript,
    error: transcriptionError,
    voiceResponse,
    isTranscribing,
    isSuccess: isTranscribeSuccess,
    isError: isTranscribeError,
    prepareReadyToTranscribe,
    transcribe,
    resetTranscription
  } = useVoiceTranscription();

  // Calculate Voice Analytics (Speaking Pace + Filler Word Detection - Day 18 Parts 3 & 4)
  const voiceAnalytics = useSpeechAnalytics(transcript, duration);

  // Notify parent of recording state changes
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording);
    }
  }, [isRecording, onRecordingStateChange]);

  // When audio recording finishes, prepare transcription state
  useEffect(() => {
    if (recordingStatus === 'recorded' && audioUrl && audioBlob) {
      prepareReadyToTranscribe({ blob: audioBlob, url: audioUrl, duration });
    }
  }, [recordingStatus, audioUrl, audioBlob, duration, prepareReadyToTranscribe]);

  // Handle Start Recording (starts audio recorder + live speech listener)
  const handleStartRecording = useCallback(() => {
    resetTranscription();
    resetLiveStt();
    startAudioRecord();
    startLiveStt();
  }, [resetTranscription, resetLiveStt, startAudioRecord, startLiveStt]);

  // Handle Stop Recording
  const handleStopRecording = useCallback(() => {
    stopLiveStt();
    stopAudioRecord();
  }, [stopLiveStt, stopAudioRecord]);

  // Handle Re-recording
  const handleResetRecording = useCallback(() => {
    resetTranscription();
    resetLiveStt();
    resetAudioRecord();
  }, [resetTranscription, resetLiveStt, resetAudioRecord]);

  // Handle Transcribe Action
  const handleTranscribeAnswer = useCallback(async () => {
    if (!audioBlob || isTranscribing) return;

    try {
      const generatedText = await transcribe(
        { blob: audioBlob, url: audioUrl, duration },
        liveTranscript
      );

      if (generatedText && onTranscriptGenerated) {
        onTranscriptGenerated(generatedText);
      }
    } catch (err) {
      console.warn('Transcription request error handled in UI:', err);
    }
  }, [audioBlob, audioUrl, duration, isTranscribing, liveTranscript, transcribe, onTranscriptGenerated]);

  // Notify parent when audio & transcription payload are updated
  useEffect(() => {
    if (recordingStatus === 'recorded' && audioUrl && audioBlob && onAudioReady) {
      onAudioReady({
        blob: audioBlob,
        url: audioUrl,
        duration,
        transcript,
        voiceResponse,
        voiceAnalytics
      });
    }
  }, [recordingStatus, audioUrl, audioBlob, duration, transcript, voiceResponse, voiceAnalytics, onAudioReady]);

  // Status text for top badge
  const getStatusText = () => {
    if (isTranscribing) return 'Transcribing answer...';
    if (isTranscribeSuccess) return 'Transcript ready & voice analyzed';
    if (isTranscribeError) return 'Transcription failed';
    if (recordingStatus === 'recording') return 'Recording...';
    if (recordingStatus === 'recorded') return 'Recording complete — Ready to transcribe';
    if (recordingStatus === 'permission_denied') return 'Microphone permission required';
    if (recordingStatus === 'unavailable') return 'Microphone unavailable';
    if (recordingStatus === 'unsupported') return 'Browser unsupported';
    return 'Ready to record';
  };

  const getStatusClass = () => {
    if (isTranscribing) return 'status-transcribing';
    if (isTranscribeSuccess) return 'status-success';
    if (isTranscribeError) return 'status-error';
    switch (recordingStatus) {
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
      className={`voice-recorder-container ${isRecording ? 'is-recording' : ''} ${recordingStatus === 'recorded' ? 'is-recorded' : ''}`}
      aria-label="Voice Answer Recorder with Speech-to-Text & Voice Analytics"
    >
      {/* Header bar: Status pill & Elapsed Timer */}
      <div className="voice-recorder-header">
        <div
          className={`voice-status-pill ${getStatusClass()}`}
          aria-live="polite"
        >
          {isRecording ? (
            <span className="recording-indicator-dot pulse" aria-hidden="true" />
          ) : isTranscribing ? (
            <span className="transcribing-spinner" aria-hidden="true" />
          ) : (
            <span className="recording-indicator-dot" aria-hidden="true" style={{ opacity: recordingStatus === 'recorded' ? 1 : 0.4 }} />
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
      {(recorderError || transcriptionError) && (
        <div className="voice-recorder-alert" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>{transcriptionError || recorderError}</span>
        </div>
      )}

      {/* Action controls toolbar */}
      <div className="voice-recorder-actions">
        {recordingStatus !== 'recording' && recordingStatus !== 'recorded' && (
          <button
            type="button"
            className="btn-voice-action btn-voice-start"
            onClick={handleStartRecording}
            disabled={disabled || !isAudioSupported}
            aria-label="Start recording audio response"
          >
            <span aria-hidden="true">🎙️</span>
            <span>Start Recording</span>
          </button>
        )}

        {recordingStatus === 'recording' && (
          <button
            type="button"
            className="btn-voice-action btn-voice-stop"
            onClick={handleStopRecording}
            disabled={disabled}
            aria-label="Stop audio recording"
          >
            <span aria-hidden="true">⏹️</span>
            <span>Stop Recording</span>
          </button>
        )}

        {recordingStatus === 'recorded' && (
          <div className="recorded-controls-group">
            <button
              type="button"
              className="btn-voice-action btn-voice-rerecord"
              onClick={handleResetRecording}
              disabled={disabled || isTranscribing}
              aria-label="Re-record audio response"
            >
              <span aria-hidden="true">🔄</span>
              <span>Re-record</span>
            </button>

            <button
              type="button"
              className={`btn-voice-action btn-voice-transcribe ${isTranscribeSuccess ? 'btn-success' : ''}`}
              onClick={handleTranscribeAnswer}
              disabled={disabled || isTranscribing}
              aria-label="Transcribe answer to text"
            >
              {isTranscribing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                  <span>Transcribing...</span>
                </>
              ) : isTranscribeError ? (
                <>
                  <span aria-hidden="true">🔁</span>
                  <span>Retry Transcribe</span>
                </>
              ) : isTranscribeSuccess ? (
                <>
                  <span aria-hidden="true">✓</span>
                  <span>Re-transcribe</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">✨</span>
                  <span>Transcribe Answer</span>
                </>
              )}
            </button>

            <div className="voice-audio-player-wrapper">
              <audio
                controls
                src={audioUrl}
                className="voice-audio-player"
                aria-label="Audio answer playback"
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display Box */}
      {transcript && (
        <div className="transcript-display-section mt-3">
          <div className="transcript-header d-flex justify-content-between align-items-center mb-2">
            <span className="transcript-title">💬 Your Transcript</span>
            {onTranscriptGenerated && (
              <button
                type="button"
                className="btn-apply-transcript"
                onClick={() => onTranscriptGenerated(transcript)}
                title="Populate answer text area with this transcript"
              >
                📥 Apply to Answer Box
              </button>
            )}
          </div>
          <blockquote className="transcript-quote-box mb-0">
            <p>{transcript}</p>
          </blockquote>
        </div>
      )}

      {/* Speaking Pace Analytics Card (Day 18 Part 3) */}
      {transcript && isTranscribeSuccess && (
        <div className="pace-analytics-section mt-3">
          <div className="pace-analytics-header d-flex justify-content-between align-items-center mb-2">
            <span className="pace-analytics-title">📊 Speaking Pace Analytics</span>
            <span className={`pace-badge ${voiceAnalytics.pace.badgeClass}`}>
              {voiceAnalytics.pace.label}
            </span>
          </div>

          <div className="pace-metrics-grid">
            <div className="pace-metric-card">
              <span className="metric-label">⏱️ Duration</span>
              <span className="metric-value">{formatAudioTimer(voiceAnalytics.durationSeconds)}</span>
            </div>

            <div className="pace-metric-card">
              <span className="metric-label">📝 Word Count</span>
              <span className="metric-value">{voiceAnalytics.wordCount} words</span>
            </div>

            <div className="pace-metric-card">
              <span className="metric-label">⚡ Pace (WPM)</span>
              <span className="metric-value">
                {voiceAnalytics.wordsPerMinute > 0 ? `${voiceAnalytics.wordsPerMinute} WPM` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="pace-feedback-box mt-2">
            <span className="feedback-icon" aria-hidden="true">💡</span>
            <p className="feedback-text">{voiceAnalytics.pace.feedback}</p>
          </div>
        </div>
      )}

      {/* Filler Word Analytics Card (Day 18 Part 4) */}
      {transcript && isTranscribeSuccess && (
        <div className="filler-analytics-section mt-3">
          <div className="filler-analytics-header d-flex justify-content-between align-items-center mb-2">
            <span className="filler-analytics-title">🔎 Filler Word Analytics</span>
            <span className={`filler-badge ${voiceAnalytics.fillerAnalysis.rating.badgeClass}`}>
              {voiceAnalytics.fillerAnalysis.rating.label}
            </span>
          </div>

          <div className="filler-metrics-grid">
            <div className="filler-metric-card">
              <span className="metric-label">🚫 Total Fillers</span>
              <span className="metric-value">{voiceAnalytics.fillerAnalysis.totalFillers}</span>
            </div>

            <div className="filler-metric-card">
              <span className="metric-label">📊 Filler Rate</span>
              <span className="metric-value">{voiceAnalytics.fillerAnalysis.fillerPercentage}%</span>
            </div>

            <div className="filler-metric-card">
              <span className="metric-label">💬 Words Analyzed</span>
              <span className="metric-value">{voiceAnalytics.wordCount} words</span>
            </div>
          </div>

          {/* Detected Fillers List / Positive Empty State */}
          <div className="detected-fillers-wrapper mt-2">
            <span className="detected-label">Detected Fillers:</span>
            {voiceAnalytics.fillerAnalysis.detected.length > 0 ? (
              <div className="filler-tags-list">
                {voiceAnalytics.fillerAnalysis.detected.map((item, idx) => (
                  <span key={idx} className="filler-tag">
                    <strong className="filler-word">{item.word}</strong>
                    <span className="filler-count">×{item.count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="no-fillers-badge">
                <span aria-hidden="true">🎉</span>
                <span>No common filler words detected.</span>
              </div>
            )}
          </div>

          <div className="filler-feedback-box mt-2">
            <span className="feedback-icon" aria-hidden="true">💡</span>
            <p className="feedback-text">{voiceAnalytics.fillerAnalysis.rating.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorderCard;


