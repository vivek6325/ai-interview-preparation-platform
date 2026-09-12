import { useState, useRef, useEffect } from 'react';

/**
 * VoiceControls Component (Day 19 Part 2 — Voice Selection, Speed, Auto-Speak & Play/Stop)
 * Compact toolbar offering TTS preferences, auto-read toggle, voice selector, speed selector, and play/stop action.
 */
export function VoiceControls({
  speechState,
  isSpeaking,
  isTtsSupported,
  settings,
  updateSettings,
  voices = [],
  onPlayReplay,
  onStop
}) {
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const popoverRef = useRef(null);

  // Close settings popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowSettingsPopover(false);
      }
    };

    if (showSettingsPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsPopover]);

  if (!isTtsSupported) {
    return (
      <span className="tts-unsupported-badge" title="Text-to-speech is not supported in this browser.">
        🔇 Speech Unsupported
      </span>
    );
  }

  const speedOptions = [
    { value: 0.75, label: '0.75× — Slow' },
    { value: 1.0, label: '1.0× — Normal' },
    { value: 1.25, label: '1.25× — Fast' },
    { value: 1.5, label: '1.5× — Very Fast' }
  ];

  return (
    <div className="voice-controls-toolbar" ref={popoverRef}>
      {/* Auto-Speak Toggle Button */}
      <button
        type="button"
        className={`btn-autospeak-toggle ${settings.autoRead ? 'autospeak-on' : 'autospeak-off'}`}
        onClick={() => updateSettings({ autoRead: !settings.autoRead })}
        aria-pressed={settings.autoRead}
        aria-label="Toggle automatic question read-aloud"
        title={settings.autoRead ? 'Auto-speak is ON (Click to mute auto-read)' : 'Auto-speak is OFF (Click to enable auto-read)'}
      >
        <span aria-hidden="true">{settings.autoRead ? '🔊' : '🔇'}</span>
        <span className="autospeak-text">Auto-speak: {settings.autoRead ? 'ON' : 'OFF'}</span>
      </button>

      {/* Main Action Button (Play / Speaking Stop / Replay) */}
      {isSpeaking ? (
        <button
          type="button"
          className="btn-tts-action btn-tts-stop"
          onClick={onStop}
          aria-label="Stop reading question aloud"
          title="Stop reading aloud"
        >
          <span aria-hidden="true">⏹</span>
          <span>Stop</span>
        </button>
      ) : (
        <button
          type="button"
          className={`btn-tts-action ${speechState === 'completed' ? 'btn-tts-completed' : 'btn-tts-idle'}`}
          onClick={onPlayReplay}
          aria-label={speechState === 'completed' ? 'Replay question aloud' : 'Play question aloud'}
          title={speechState === 'completed' ? 'Click to replay question' : 'Read question aloud'}
        >
          <span aria-hidden="true">{speechState === 'completed' ? '🔁' : '🔉'}</span>
          <span>{speechState === 'completed' ? 'Replay Question' : 'Play Question'}</span>
        </button>
      )}

      {/* Settings Popover Trigger */}
      <div className="voice-settings-dropdown-wrapper">
        <button
          type="button"
          className={`btn-voice-settings-toggle ${showSettingsPopover ? 'active' : ''}`}
          onClick={() => setShowSettingsPopover((prev) => !prev)}
          aria-expanded={showSettingsPopover}
          aria-label="Voice settings and speaking speed"
          title="Voice selection & speed settings"
        >
          <span aria-hidden="true">⚙️</span>
          <span className="settings-btn-label">Voice & Speed</span>
          <span className="caret-icon" aria-hidden="true">{showSettingsPopover ? '▲' : '▼'}</span>
        </button>

        {/* Dropover Menu */}
        {showSettingsPopover && (
          <div className="voice-settings-popover" role="dialog" aria-label="Voice Preferences">
            <div className="popover-header">
              <span className="popover-title">AI Voice Settings</span>
              <button
                type="button"
                className="btn-close-popover"
                onClick={() => setShowSettingsPopover(false)}
                aria-label="Close voice settings"
              >
                ✕
              </button>
            </div>

            <div className="popover-body">
              {/* Voice Selection */}
              <div className="setting-field">
                <label htmlFor="voice-select" className="setting-label">Voice</label>
                <select
                  id="voice-select"
                  className="voice-select-input"
                  value={settings.voice || ''}
                  onChange={(e) => updateSettings({ voice: e.target.value })}
                >
                  <option value="">Browser Default Voice</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI || v.name} value={v.name}>
                      {v.name} {v.lang ? `(${v.lang})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaking Speed */}
              <div className="setting-field">
                <label htmlFor="speed-select" className="setting-label">Speaking Speed</label>
                <select
                  id="speed-select"
                  className="speed-select-input"
                  value={settings.rate || 1.0}
                  onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
                >
                  {speedOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="popover-footer-note">
                Preferences saved automatically to browser.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceControls;
