import { useState, useEffect, useRef } from 'react';

/**
 * Transcript Box Component
 * Displays speech recognition transcripts in real time, allowing manual editing before submission.
 * Includes auto-save indicator and word/character counters.
 * 
 * @param {Object} props
 * @param {string} props.transcript - Live transcript text
 * @param {string} [props.interimTranscript=''] - Interim live speech snippet
 * @param {Function} props.onChange - Handler when transcript text changes
 * @param {boolean} [props.isListening=false]
 * @param {boolean} [props.isAutoSaved=false]
 * @param {Function} [props.onClear]
 */
export function TranscriptBox({
  transcript,
  interimTranscript = '',
  onChange,
  isListening = false,
  isAutoSaved = false,
  onClear
}) {
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const prevAutoSavedRef = useRef(isAutoSaved);

  useEffect(() => {
    if (isAutoSaved && !prevAutoSavedRef.current) {
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    prevAutoSavedRef.current = isAutoSaved;
  }, [isAutoSaved]);

  // Word count & Character count calculation
  const cleanedText = (transcript || '').trim();
  const wordCount = cleanedText ? cleanedText.split(/\s+/).length : 0;
  const charCount = (transcript || '').length;

  return (
    <div className="transcript-box-container">
      <div className="transcript-box-header d-flex justify-content-between align-items-center mb-2">
        <label htmlFor="voice-transcript-input" className="transcript-label fw-semibold">
          📝 Live Answer Transcript <span className="text-muted font-normal">(Editable)</span>
        </label>
        
        <div className="transcript-meta d-flex align-items-center gap-3">
          {isAutoSaved && (
            <span className="auto-save-badge badge bg-success-subtle text-success border border-success-subtle">
              ✓ Auto-saved {lastSavedTime ? `at ${lastSavedTime}` : ''}
            </span>
          )}

          <span className="word-count-badge badge bg-dark-subtle text-light">
            {wordCount} words | {charCount} chars
          </span>

          {onClear && transcript && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger py-0 px-2 fs-7"
              onClick={onClear}
              disabled={isListening}
              title="Clear transcript"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="transcript-textarea-wrapper position-relative">
        <textarea
          id="voice-transcript-input"
          className="form-control transcript-textarea"
          rows={5}
          value={transcript}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isListening
              ? 'Listening... Speak your answer aloud. Your transcript will appear here in real time.'
              : 'Click the Microphone button to start recording or type your answer here directly.'
          }
          aria-label="Editable answer transcript"
        />

        {interimTranscript && isListening && (
          <div className="interim-transcript-overlay">
            <span className="interim-text">{interimTranscript}</span>
          </div>
        )}
      </div>

      <div className="transcript-hint text-muted fs-8 mt-1">
        💡 <em>Tip: You can edit or refine any transcribed words before clicking Submit.</em>
      </div>
    </div>
  );
}

export default TranscriptBox;
