import React from 'react';

/**
 * Microphone Button Component
 * Rendered during voice recording sessions with pulse aura and accessible keyboard controls.
 * 
 * @param {Object} props
 * @param {boolean} props.isListening - Active mic recording state
 * @param {Function} props.onClick - Toggle click handler
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.isSupported=true]
 * @param {string} [props.statusText='']
 */
export function MicrophoneButton({ isListening, onClick, disabled = false, isSupported = true, statusText = '' }) {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && isSupported) {
        onClick();
      }
    }
  };

  const getAriaLabel = () => {
    if (!isSupported) return 'Voice recognition not supported in this browser';
    if (isListening) return 'Stop recording speech answer';
    return 'Start recording speech answer';
  };

  return (
    <div className="mic-button-wrapper text-center my-3">
      <button
        type="button"
        className={`mic-button ${isListening ? 'listening' : ''} ${disabled || !isSupported ? 'disabled' : ''}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || !isSupported}
        aria-label={getAriaLabel()}
        aria-pressed={isListening}
        tabIndex={0}
      >
        <div className="mic-pulse-ring ring-1"></div>
        <div className="mic-pulse-ring ring-2"></div>
        
        <span className="mic-icon" role="img" aria-hidden="true">
          {isListening ? '🔴' : '🎙️'}
        </span>
      </button>

      <div className="mic-status-label mt-2">
        <span className={`status-badge-pill ${isListening ? 'active' : 'idle'}`}>
          {statusText || (isListening ? 'Recording... Speak now' : 'Click Mic or Press Space to Record')}
        </span>
      </div>
    </div>
  );
}

export default MicrophoneButton;
