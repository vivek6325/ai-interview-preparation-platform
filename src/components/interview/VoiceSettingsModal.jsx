import { useState } from 'react';

/**
 * Voice Settings Modal Component
 * Configures speech rate, pitch, preferred voice, auto-read, auto-start, and max recording duration.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object} props.settings
 * @param {Function} props.onSaveSettings
 * @param {Array<SpeechSynthesisVoice>} props.voices
 */
export function VoiceSettingsModal({ isOpen, onClose, settings, onSaveSettings, voices = [] }) {
  const [formData, setFormData] = useState({ ...settings });

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-custom show d-flex align-items-center justify-content-center" role="dialog" aria-modal="true">
      <div className="modal-card-custom bg-dark text-light p-4 rounded-4 shadow-lg border border-secondary" style={{ maxWidth: '540px', width: '90%' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0 fw-bold d-flex align-items-center gap-2">
            <span>⚙️</span> Voice & Audio Settings
          </h3>
          <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close settings"></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Speech Rate */}
          <div className="mb-3">
            <label htmlFor="setting-rate" className="form-label d-flex justify-content-between fs-7">
              <span>Reading Speech Rate</span>
              <span className="text-info fw-bold">{formData.rate}x</span>
            </label>
            <input
              type="range"
              className="form-range"
              id="setting-rate"
              min="0.5"
              max="2.0"
              step="0.1"
              value={formData.rate}
              onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
            />
          </div>

          {/* Speech Pitch */}
          <div className="mb-3">
            <label htmlFor="setting-pitch" className="form-label d-flex justify-content-between fs-7">
              <span>Speech Pitch</span>
              <span className="text-info fw-bold">{formData.pitch}</span>
            </label>
            <input
              type="range"
              className="form-range"
              id="setting-pitch"
              min="0.5"
              max="1.5"
              step="0.1"
              value={formData.pitch}
              onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
            />
          </div>

          {/* Voice Selection */}
          <div className="mb-3">
            <label htmlFor="setting-voice" className="form-label fs-7">Voice Selection</label>
            <select
              id="setting-voice"
              className="form-select bg-dark text-light border-secondary fs-7"
              value={formData.voice}
              onChange={(e) => handleChange('voice', e.target.value)}
            >
              <option value="">Default Browser Voice</option>
              {voices.map((v, idx) => (
                <option key={idx} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Max Recording Duration */}
          <div className="mb-3">
            <label htmlFor="setting-duration" className="form-label fs-7">Max Recording Time (per question)</label>
            <select
              id="setting-duration"
              className="form-select bg-dark text-light border-secondary fs-7"
              value={formData.maxDuration}
              onChange={(e) => handleChange('maxDuration', parseInt(e.target.value, 10))}
            >
              <option value={60}>60 Seconds (1 min)</option>
              <option value={120}>120 Seconds (2 mins)</option>
              <option value={180}>180 Seconds (3 mins)</option>
              <option value={300}>300 Seconds (5 mins)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="setting-autoread"
              checked={formData.autoRead}
              onChange={(e) => handleChange('autoRead', e.target.checked)}
            />
            <label className="form-check-input-label fs-7 ms-2" htmlFor="setting-autoread">
              Auto-read question aloud when question changes
            </label>
          </div>

          <div className="form-check form-switch mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="setting-autostart"
              checked={formData.autoStartRecording}
              onChange={(e) => handleChange('autoStartRecording', e.target.checked)}
            />
            <label className="form-check-input-label fs-7 ms-2" htmlFor="setting-autostart">
              Auto-start recording after question finishes speaking
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary px-3" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4 fw-bold">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VoiceSettingsModal;
