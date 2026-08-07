import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

/**
 * MicrophoneButton Component (ChatGPT Voice / ElevenLabs Aesthetic)
 * Focal animated microphone button with multi-layer aura and Framer Motion pulse.
 */
export function MicrophoneButton({
  isListening,
  onClick,
  disabled = false,
  isSupported = true,
  statusText = ''
}) {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && isSupported) {
        onClick();
      }
    }
  };

  return (
    <div className="mic-button-wrapper text-center my-4">
      <div className="focal-mic-container">
        {isListening && (
          <>
            <motion.div
              className="mic-glow-aura aura-1"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            <motion.div
              className="mic-glow-aura aura-2"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.4, ease: 'easeInOut' }}
            />
          </>
        )}

        <button
          type="button"
          className={`focal-mic-btn-large ${isListening ? 'recording' : ''}`}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          disabled={disabled || !isSupported}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening ? <Square size={28} className="icon-stop" /> : <Mic size={36} className="icon-mic" />}
        </button>
      </div>

      <div className="mic-status-label mt-3">
        <span className={`status-pill ${isListening ? 'active' : 'idle'}`}>
          {statusText || (isListening ? '🔴 Recording Speech... Speak Now' : '🎙️ Tap Mic or Press Spacebar to Record')}
        </span>
      </div>
    </div>
  );
}

export default MicrophoneButton;
