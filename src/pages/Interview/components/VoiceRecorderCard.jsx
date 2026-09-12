import { useEffect, useCallback } from 'react';
import useAudioRecorder from '../../../hooks/useAudioRecorder';
import useVoiceTranscription from '../../../hooks/useVoiceTranscription';
import useSpeechRecognition from '../../../hooks/useSpeechRecognition';
import './VoiceRecorderCard.css';

/**
 * VoiceRecorderCard Component (Part 1 + Part 2 Speech-to-Text)
 * 
 * Reusable Voice Recording & Speech-to-Text component for interview responses.
 * Provides controls for Start Recording, Stop Recording, Re-recording, Audio Playback,
 * and Transcribe Answer with clear loading, transcript display, and retry error states.
 * 
 * @param {Object} props
 * @param {Function} [props.onRecordingStateChange] Callback notifying parent of recording state
 * @param {Function} [props.onAudioReady] Callback receiving { blob, url, duration, transcript, voiceResponse }
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
        voiceResponse
      });
    }
  }, [recordingStatus, audioUrl, audioBlob, duration, transcript, voiceResponse, onAudioReady]);

  // Status text for top badge
  const getStatusText = () => {
    if (isTranscribing) return 'Transcribing answer...';
    if (isTranscribeSuccess) return 'Transcript ready';
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
      aria-label="Voice Answer Recorder with Speech-to-Text"
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
    </div>
  );
}

export default VoiceRecorderCard;
