/**
 * Speaking Indicator Component
 * Displays real-time voice activity animations and status indicators.
 * 
 * Statuses:
 * - 'listening' / 'recording'
 * - 'speaking' (TTS playing question)
 * - 'processing' (Gemini evaluation)
 * - 'idle'
 * 
 * @param {Object} props
 * @param {string} props.status - 'idle' | 'listening' | 'recording' | 'speaking' | 'processing'
 * @param {string} [props.label] - Custom label text
 */
export function SpeakingIndicator({ status = 'idle', label }) {
  const getStatusText = () => {
    if (label) return label;
    switch (status) {
      case 'listening':
      case 'recording':
        return 'Listening...';
      case 'speaking':
        return 'Speaking... (Question being read aloud)';
      case 'processing':
        return 'Processing answer...';
      default:
        return 'Idle';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'listening':
      case 'recording':
        return 'status-recording';
      case 'speaking':
        return 'status-speaking';
      case 'processing':
        return 'status-processing';
      default:
        return 'status-idle';
    }
  };

  return (
    <div className={`speaking-indicator-box ${getStatusClass()}`} role="status" aria-live="polite">
      <div className="soundwave-bars">
        <span className="bar bar-1"></span>
        <span className="bar bar-2"></span>
        <span className="bar bar-3"></span>
        <span className="bar bar-4"></span>
        <span className="bar bar-5"></span>
      </div>
      <span className="speaking-status-text">{getStatusText()}</span>
    </div>
  );
}

export default SpeakingIndicator;
