import React, { useState } from 'react';
import MicrophoneButton from './MicrophoneButton';
import SpeakingIndicator from './SpeakingIndicator';
import TranscriptBox from './TranscriptBox';
import VoiceControls from './VoiceControls';
import VoiceSettingsModal from './VoiceSettingsModal';

/**
 * Voice Recorder Wrapper Component
 * Integrates Microphone controls, status visualizers, live editable transcript, recording timer, and settings modal.
 * 
 * @param {Object} props
 * @param {string} props.transcript
 * @param {string} props.interimTranscript
 * @param {boolean} props.isListening
 * @param {boolean} props.isSpeaking
 * @param {boolean} props.isMuted
 * @param {string} props.error
 * @param {boolean} props.isSupported
 * @param {number} props.speakingDuration
 * @param {Function} props.onStartRecording
 * @param {Function} props.onStopRecording
 * @param {Function} props.onTranscriptChange
 * @param {Function} props.onRetry
 * @param {Function} props.onReplayQuestion
 * @param {Function} props.onToggleMute
 * @param {Function} props.onNext
 * @param {Function} props.onSubmit
 * @param {Object} props.settings
 * @param {Function} props.onSaveSettings
 * @param {Array<SpeechSynthesisVoice>} props.voices
 * @param {boolean} [props.isLastQuestion=false]
 * @param {boolean} [props.isSubmitting=false]
 * @param {boolean} [props.isAutoSaved=false]
 */
export function VoiceRecorder({
  transcript,
  interimTranscript,
  isListening,
  isSpeaking,
  isMuted,
  error,
  isSupported,
  speakingDuration,
  onStartRecording,
  onStopRecording,
  onTranscriptChange,
  onRetry,
  onReplayQuestion,
  onToggleMute,
  onNext,
  onSubmit,
  settings,
  onSaveSettings,
  voices,
  isLastQuestion = false,
  isSubmitting = false,
  isAutoSaved = false
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Format seconds -> mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const getStatusState = () => {
    if (isSubmitting) return 'processing';
    if (isListening) return 'recording';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  return (
    <div className="voice-recorder-card p-4 rounded-4 bg-dark text-light border border-secondary border-opacity-50 shadow-lg">
      {/* Top Header: Voice Indicator & Timer */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <SpeakingIndicator status={getStatusState()} />
        
        <div className="recording-timer-badge px-3 py-1 rounded-pill bg-dark border border-secondary font-monospace fs-6">
          <span>⏱️ Elapsed: </span>
          <strong className={isListening ? 'text-danger animate-pulse' : 'text-info'}>
            {formatTime(speakingDuration)}
          </strong>
        </div>
      </div>

      {/* Permission / Unsupported Browser Error Alert */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
          <span>⚠️</span>
          <div className="fs-7">{error}</div>
        </div>
      )}

      {!isSupported && (
        <div className="alert alert-danger mb-3" role="alert">
          🚫 Web Speech Recognition is not supported in this browser. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for Voice Mode. You can still type your answer manually below.
        </div>
      )}

      {/* Center Mic Button */}
      <MicrophoneButton
        isListening={isListening}
        onClick={isListening ? onStopRecording : onStartRecording}
        disabled={isSubmitting}
        isSupported={isSupported}
      />

      {/* Transcript Viewer & Editor */}
      <div className="my-4">
        <TranscriptBox
          transcript={transcript}
          interimTranscript={interimTranscript}
          onChange={onTranscriptChange}
          isListening={isListening}
          isAutoSaved={isAutoSaved}
          onClear={onRetry}
        />
      </div>

      {/* Action Controls Toolbar */}
      <VoiceControls
        isListening={isListening}
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onRetry={onRetry}
        onReplayQuestion={onReplayQuestion}
        onToggleMute={onToggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNext={onNext}
        onSubmit={onSubmit}
        isLastQuestion={isLastQuestion}
        isSubmitting={isSubmitting}
        hasAnswer={!!(transcript && transcript.trim())}
      />

      {/* Settings Modal */}
      <VoiceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={onSaveSettings}
        voices={voices}
      />
    </div>
  );
}

export default VoiceRecorder;
