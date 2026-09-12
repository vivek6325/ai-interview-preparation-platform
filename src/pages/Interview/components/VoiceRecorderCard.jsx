import { useEffect, useCallback, useState } from 'react';
import useAudioRecorder from '../../../hooks/useAudioRecorder';
import useVoiceTranscription from '../../../hooks/useVoiceTranscription';
import useSpeechRecognition from '../../../hooks/useSpeechRecognition';
import useSpeechAnalytics from '../../../hooks/useSpeechAnalytics';
import { evaluateCommunication } from '../../../services/aiService';
import VoiceAnalyticsDashboard from './VoiceAnalyticsDashboard';
import './VoiceRecorderCard.css';

/**
 * VoiceRecorderCard Component (Part 1–7 Voice Recording Infrastructure & Interactive Analytics Dashboard)
 * 
 * Reusable Voice Recording & Speech Analytics component for interview responses.
 * 
 * @param {Object} props
 * @param {string} [props.questionText] Optional context question text for AI evaluation
 * @param {Function} [props.onRecordingStateChange] Callback notifying parent of recording state
 * @param {Function} [props.onAudioReady] Callback receiving audio & analytics payload
 * @param {Function} [props.onTranscriptGenerated] Callback passing transcript text directly to answer input
 * @param {boolean} [props.disabled] Optional flag to disable controls
 */
export function VoiceRecorderCard({
  questionText = '',
  onRecordingStateChange,
  onAudioReady,
  onTranscriptGenerated,
  disabled = false
}) {
  const [aiCommunicationFeedback, setAiCommunicationFeedback] = useState(null);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  const {
    status: recordingStatus,
    isRecording,
    isSupported: isAudioSupported,
    duration,
    formattedTime,
    audioBlob,
    audioUrl,
    volumeSamples,
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

  // Calculate Voice Analytics (Pace, Fillers, Confidence, Tone, Communication Score)
  const voiceAnalytics = useSpeechAnalytics(transcript, duration, volumeSamples, aiCommunicationFeedback);

  // Trigger AI Communication Quality evaluation when transcript is generated
  useEffect(() => {
    let isMounted = true;

    async function fetchAiFeedback() {
      if (!isTranscribeSuccess || !transcript || transcript.trim().split(/\s+/).length < 5) {
        return;
      }

      setIsEvaluatingAi(true);
      setAiError(null);

      try {
        const response = await evaluateCommunication(
          transcript,
          {
            wordsPerMinute: voiceAnalytics.wordsPerMinute,
            pace: voiceAnalytics.pace,
            fillerAnalysis: voiceAnalytics.fillerAnalysis,
            confidenceAnalysis: voiceAnalytics.confidenceAnalysis,
            toneAnalysis: voiceAnalytics.toneAnalysis
          },
          questionText
        );

        if (isMounted && response?.data) {
          setAiCommunicationFeedback(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('AI communication feedback evaluation error handled:', err);
          setAiError('AI feedback temporarily unavailable. (Showing deterministic communication breakdown)');
        }
      } finally {
        if (isMounted) {
          setIsEvaluatingAi(false);
        }
      }
    }

    fetchAiFeedback();

    return () => {
      isMounted = false;
    };
  }, [isTranscribeSuccess, transcript]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of recording state changes
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording);
    }
  }, [isRecording, onRecordingStateChange]);

  // When audio recording finishes, prepare transcription state
  useEffect(() => {
    if (recordingStatus === 'recorded' && audioUrl && audioBlob) {
      prepareReadyToTranscribe({ blob: audioBlob, url: audioUrl, duration, volumeSamples });
    }
  }, [recordingStatus, audioUrl, audioBlob, duration, volumeSamples, prepareReadyToTranscribe]);

  // Handle Start Recording
  const handleStartRecording = useCallback(() => {
    setAiCommunicationFeedback(null);
    setAiError(null);
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
    setAiCommunicationFeedback(null);
    setAiError(null);
    resetTranscription();
    resetLiveStt();
    resetAudioRecord();
  }, [resetTranscription, resetLiveStt, resetAudioRecord]);

  // Handle Transcribe Action
  const handleTranscribeAnswer = useCallback(async () => {
    if (!audioBlob || isTranscribing) return;

    try {
      setAiCommunicationFeedback(null);
      setAiError(null);
      const generatedText = await transcribe(
        { blob: audioBlob, url: audioUrl, duration, volumeSamples },
        liveTranscript
      );

      if (generatedText && onTranscriptGenerated) {
        onTranscriptGenerated(generatedText);
      }
    } catch (err) {
      console.warn('Transcription request error handled in UI:', err);
    }
  }, [audioBlob, audioUrl, duration, volumeSamples, isTranscribing, liveTranscript, transcribe, onTranscriptGenerated]);

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
    if (isEvaluatingAi) return 'Analyzing communication score & AI feedback...';
    if (isTranscribeSuccess) return 'Voice analysis & communication score ready';
    if (isTranscribeError) return 'Transcription failed';
    if (recordingStatus === 'recording') return 'Recording...';
    if (recordingStatus === 'recorded') return 'Recording complete — Ready to transcribe';
    if (recordingStatus === 'permission_denied') return 'Microphone permission required';
    if (recordingStatus === 'unavailable') return 'Microphone unavailable';
    if (recordingStatus === 'unsupported') return 'Browser unsupported';
    return 'Ready to record';
  };

  const getStatusClass = () => {
    if (isTranscribing || isEvaluatingAi) return 'status-transcribing';
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
          ) : isTranscribing || isEvaluatingAi ? (
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
          </div>
        )}
      </div>

      {/* Day 18 — Part 7: Interactive Voice Analytics Dashboard */}
      <VoiceAnalyticsDashboard
        voiceAnalytics={voiceAnalytics}
        transcript={transcript}
        audioUrl={audioUrl}
        isTranscribing={isTranscribing}
        isEvaluatingAi={isEvaluatingAi}
        aiError={aiError}
        onApplyTranscript={onTranscriptGenerated}
        onRecordNew={handleResetRecording}
      />
    </div>
  );
}

export default VoiceRecorderCard;


