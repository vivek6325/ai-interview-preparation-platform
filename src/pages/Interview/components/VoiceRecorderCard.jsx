import { useEffect, useCallback, useState } from 'react';
import useAudioRecorder, { formatAudioTimer } from '../../../hooks/useAudioRecorder';
import useVoiceTranscription from '../../../hooks/useVoiceTranscription';
import useSpeechRecognition from '../../../hooks/useSpeechRecognition';
import useSpeechAnalytics from '../../../hooks/useSpeechAnalytics';
import { evaluateCommunication } from '../../../services/aiService';
import './VoiceRecorderCard.css';

/**
 * VoiceRecorderCard Component (Part 1 + STT + Speaking Pace + Fillers + Confidence + Tone + AI Communication Score)
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

      {/* Voice Delivery Confidence Card (Day 18 Part 5) */}
      {transcript && isTranscribeSuccess && voiceAnalytics.confidenceAnalysis && (
        <div className="confidence-analytics-section mt-3">
          <div className="confidence-analytics-header d-flex justify-content-between align-items-center mb-2">
            <span className="confidence-analytics-title">🎙️ Voice Delivery Confidence</span>
            <span className={`confidence-badge ${voiceAnalytics.confidenceAnalysis.badgeClass}`}>
              {voiceAnalytics.confidenceAnalysis.level}
            </span>
          </div>

          <div className="confidence-metrics-grid">
            <div className="confidence-metric-card score-card">
              <span className="metric-label">🏆 Delivery Score</span>
              <span className="metric-value">{voiceAnalytics.confidenceAnalysis.score} / 100</span>
            </div>

            <div className="confidence-metric-card">
              <span className="metric-label">⚡ Vocal Energy</span>
              <span className="metric-value">{voiceAnalytics.confidenceAnalysis.indicators.vocalEnergy}</span>
            </div>

            <div className="confidence-metric-card">
              <span className="metric-label">🔊 Volume Consistency</span>
              <span className="metric-value">{voiceAnalytics.confidenceAnalysis.indicators.volumeConsistency}</span>
            </div>

            <div className="confidence-metric-card">
              <span className="metric-label">🎯 Speech Stability</span>
              <span className="metric-value">{voiceAnalytics.confidenceAnalysis.indicators.speechStability}</span>
            </div>
          </div>

          <div className="confidence-feedback-box mt-2">
            <span className="feedback-icon" aria-hidden="true">💡</span>
            <p className="feedback-text">{voiceAnalytics.confidenceAnalysis.feedback}</p>
          </div>
        </div>
      )}

      {/* Tone & Sentiment Analytics Card (Day 18 Part 5) */}
      {transcript && isTranscribeSuccess && voiceAnalytics.toneAnalysis && (
        <div className="tone-analytics-section mt-3">
          <div className="tone-analytics-header d-flex justify-content-between align-items-center mb-2">
            <span className="tone-analytics-title">😊 Communication Tone & Sentiment</span>
            <span className={`tone-badge ${voiceAnalytics.toneAnalysis.badgeClass}`}>
              {voiceAnalytics.toneAnalysis.tone} Tone
            </span>
          </div>

          <div className="tone-metrics-grid">
            <div className="tone-metric-card">
              <span className="metric-label">🎭 Tone</span>
              <span className="metric-value">{voiceAnalytics.toneAnalysis.tone}</span>
            </div>

            <div className="tone-metric-card">
              <span className="metric-label">💬 Sentiment</span>
              <span className="metric-value">{voiceAnalytics.toneAnalysis.sentiment}</span>
            </div>

            <div className="tone-metric-card">
              <span className="metric-label">❓ Uncertainty Phrases</span>
              <span className="metric-value">{voiceAnalytics.toneAnalysis.uncertaintyIndicators}</span>
            </div>
          </div>

          <div className="tone-feedback-box mt-2">
            <span className="feedback-icon" aria-hidden="true">💡</span>
            <p className="feedback-text">{voiceAnalytics.toneAnalysis.feedback}</p>
          </div>
        </div>
      )}

      {/* AI Communication Score & Feedback Card (Day 18 Part 6) */}
      {transcript && isTranscribeSuccess && voiceAnalytics.communicationScore && (
        <div className="communication-score-section mt-3">
          <div className="communication-score-header d-flex justify-content-between align-items-center mb-2">
            <span className="communication-score-title">🤖 AI Communication Score & Feedback</span>
            {voiceAnalytics.communicationScore.isInsufficientData ? (
              <span className="score-badge score-badge-insufficient">Insufficient Data</span>
            ) : (
              <span className={`score-badge ${voiceAnalytics.communicationScore.ratingCategory?.badgeClass || 'score-badge-good'}`}>
                {voiceAnalytics.communicationScore.level}
              </span>
            )}
          </div>

          {voiceAnalytics.communicationScore.isInsufficientData ? (
            <div className="insufficient-data-box p-3">
              <span className="me-2" aria-hidden="true">⚠️</span>
              <span className="insufficient-text">{voiceAnalytics.communicationScore.insufficientMessage}</span>
            </div>
          ) : (
            <>
              {/* Overall Score Banner */}
              <div className="score-meter-box p-3">
                <div className="d-flex justify-content-between align-items-baseline mb-2">
                  <div className="score-main-display">
                    <span className="score-number">{voiceAnalytics.communicationScore.score}</span>
                    <span className="score-total"> / 100</span>
                  </div>
                  <span className="score-level-text">{voiceAnalytics.communicationScore.level} Delivery</span>
                </div>

                <div className="score-progress-bar-container">
                  <div
                    className={`score-progress-bar-fill ${voiceAnalytics.communicationScore.ratingCategory?.badgeClass || 'score-badge-good'}`}
                    style={{ width: `${voiceAnalytics.communicationScore.score}%` }}
                  />
                </div>
              </div>

              {/* Component Score Breakdown */}
              <div className="score-breakdown-wrapper mt-3">
                <h6 className="breakdown-section-title">📊 Score Breakdown</h6>
                <div className="score-breakdown-grid">
                  {voiceAnalytics.communicationScore.breakdown &&
                    Object.entries(voiceAnalytics.communicationScore.breakdown).map(([key, item]) => (
                      <div key={key} className="breakdown-card">
                        <span className="breakdown-label">{item.label}</span>
                        <span className="breakdown-value">
                          {item.available ? `${item.score} / 100` : 'N/A'}
                        </span>
                        <span className="breakdown-weight">Weight {item.weightPercentage}%</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* AI Evaluation Spinner / Status */}
              {isEvaluatingAi && (
                <div className="ai-feedback-loading p-2 mt-2">
                  <span className="transcribing-spinner me-2" aria-hidden="true" />
                  <span>Analyzing communication quality with AI...</span>
                </div>
              )}

              {aiError && (
                <div className="ai-feedback-error p-2 mt-2">
                  <span aria-hidden="true">⚠️ </span>
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Personal Feedback Cards */}
              <div className="ai-feedback-details mt-3">
                {voiceAnalytics.communicationScore.overallAssessment && (
                  <div className="feedback-narrative-box p-3 mb-3">
                    <span className="feedback-icon" aria-hidden="true">💡</span>
                    <p className="narrative-text mb-0">{voiceAnalytics.communicationScore.overallAssessment}</p>
                  </div>
                )}

                <div className="feedback-lists-grid">
                  {voiceAnalytics.communicationScore.strengths.length > 0 && (
                    <div className="feedback-list-card strengths-card">
                      <h6 className="list-title text-success">✓ Strengths</h6>
                      <ul>
                        {voiceAnalytics.communicationScore.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {voiceAnalytics.communicationScore.areasToImprove.length > 0 && (
                    <div className="feedback-list-card improve-card">
                      <h6 className="list-title text-warning">• Areas to Improve</h6>
                      <ul>
                        {voiceAnalytics.communicationScore.areasToImprove.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {voiceAnalytics.communicationScore.recommendations.length > 0 && (
                    <div className="feedback-list-card rec-card">
                      <h6 className="list-title text-info">💡 Recommendations</h6>
                      <ul>
                        {voiceAnalytics.communicationScore.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default VoiceRecorderCard;

