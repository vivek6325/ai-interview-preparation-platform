/**
 * Web Speech API Voice Service Layer
 * Encapsulates native browser Speech-To-Text (STT) and Text-To-Speech (TTS) engine.
 * 
 * Provides unified interface with zero external dependencies.
 */

let recognitionInstance = null;

/**
 * Checks if Speech Recognition is supported in the current browser.
 * @returns {boolean}
 */
export function isSupported() {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Checks if Text-To-Speech Synthesis is supported in the current browser.
 * @returns {boolean}
 */
export function isSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Returns the SpeechRecognition constructor if available.
 */
function getSpeechRecognitionClass() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Starts continuous Speech Recognition listener
 * 
 * @param {Object} options
 * @param {Function} options.onResult - Callback (transcript, isFinal, interim)
 * @param {Function} options.onError - Callback (errorEvent)
 * @param {Function} options.onEnd - Callback ()
 * @param {boolean} [options.continuous=true]
 * @param {string} [options.lang='en-US']
 * @returns {Object|null} Recognition instance controller
 */
export function startListening({ onResult, onError, onEnd, continuous = true, lang = 'en-US' }) {
  const SpeechRecognitionClass = getSpeechRecognitionClass();

  if (!SpeechRecognitionClass) {
    const errorMsg = 'Web Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.';
    console.warn(`🎙️ [VoiceService] ${errorMsg}`);
    if (onError) onError({ error: 'not-supported', message: errorMsg });
    return null;
  }

  // Ensure any previous session is safely halted
  stopListening();

  try {
    const instance = new SpeechRecognitionClass();
    instance.continuous = continuous;
    instance.interimResults = true;
    instance.lang = lang;

    let accumulatedFinalTranscript = '';

    instance.onresult = (event) => {
      let interimTranscript = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript + ' ';
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (currentFinal) {
        accumulatedFinalTranscript += currentFinal;
      }

      const fullTranscript = (accumulatedFinalTranscript + interimTranscript).trim();

      if (onResult) {
        onResult({
          transcript: fullTranscript,
          finalTranscript: accumulatedFinalTranscript.trim(),
          interimTranscript: interimTranscript.trim(),
          isFinal: !!currentFinal
        });
      }
    };

    instance.onerror = (event) => {
      console.error('🎙️ [VoiceService] Speech recognition error event:', event.error);
      if (onError) onError(event);
    };

    instance.onend = () => {
      console.log('🎙️ [VoiceService] Speech recognition session ended.');
      if (onEnd) onEnd();
    };

    instance.start();
    console.log('🎙️ [VoiceService] Speech recognition started.');
    recognitionInstance = instance;
    return instance;
  } catch (err) {
    console.error('🎙️ [VoiceService] Failed to start Speech Recognition:', err);
    if (onError) onError({ error: 'start-failure', message: err.message });
    return null;
  }
}

/**
 * Halts mic capture cleanly
 */
export function stopListening() {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (e) {
      console.warn('🎙️ [VoiceService] Error while stopping recognition instance:', e);
    }
    recognitionInstance = null;
  }
}

/**
 * Cancels mic capture immediately without dispatching pending events
 */
export function cancelListening() {
  if (recognitionInstance) {
    try {
      recognitionInstance.abort();
    } catch (e) {
      console.warn('🎙️ [VoiceService] Error while aborting recognition instance:', e);
    }
    recognitionInstance = null;
  }
}

/**
 * Retrieves available browser synthesis voices
 * @returns {Array<SpeechSynthesisVoice>}
 */
export function getVoices() {
  if (!isSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices() || [];
}

/**
 * Speaks text aloud using browser Text-To-Speech (TTS)
 * 
 * @param {string} text - Message prompt to speak
 * @param {Object} [options]
 * @param {number} [options.rate=1.0] - Speed rate (0.5 to 2.0)
 * @param {number} [options.pitch=1.0] - Pitch level (0.5 to 1.5)
 * @param {string|SpeechSynthesisVoice} [options.voice] - Preferred voice object or voice URI
 * @param {Function} [options.onStart] - Callback when speech starts
 * @param {Function} [options.onEnd] - Callback when speech ends
 * @param {Function} [options.onError] - Callback on error
 */
export function speak(text, { rate = 1.0, pitch = 1.0, voice = null, onStart, onEnd, onError } = {}) {
  if (!isSynthesisSupported()) {
    const errorMsg = 'Text-To-Speech Synthesis is not supported in this browser.';
    console.warn(`🔊 [VoiceService] ${errorMsg}`);
    if (onError) onError(new Error(errorMsg));
    return;
  }

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any active utterance
  stopSpeaking();

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

    // Handle voice selection
    const voices = getVoices();
    if (voice) {
      if (typeof voice === 'string') {
        const found = voices.find(v => v.name === voice || v.voiceURI === voice);
        if (found) utterance.voice = found;
      } else if (typeof voice === 'object' && voice.name) {
        utterance.voice = voice;
      }
    } else {
      // Default to crisp English voice if present
      const defaultVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('English')));
      if (defaultVoice) utterance.voice = defaultVoice;
    }

    utterance.onstart = () => {
      console.log('🔊 [VoiceService] Text-To-Speech started reading.');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      console.log('🔊 [VoiceService] Text-To-Speech reading finished.');
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error('🔊 [VoiceService] Text-To-Speech error:', e);
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('🔊 [VoiceService] Exception during synthesis speak:', err);
    if (onError) onError(err);
  }
}

/**
 * Halts active text-to-speech reading immediately
 */
export function stopSpeaking() {
  if (isSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('🔊 [VoiceService] Error stopping synthesis:', e);
    }
  }
}

/**
 * Pauses active speech synthesis
 */
export function pauseSpeaking() {
  if (isSynthesisSupported()) {
    try {
      window.speechSynthesis.pause();
    } catch (e) {
      console.warn('🔊 [VoiceService] Error pausing synthesis:', e);
    }
  }
}

/**
 * Resumes paused speech synthesis
 */
export function resumeSpeaking() {
  if (isSynthesisSupported()) {
    try {
      window.speechSynthesis.resume();
    } catch (e) {
      console.warn('🔊 [VoiceService] Error resuming synthesis:', e);
    }
  }
}

export default {
  isSupported,
  isSynthesisSupported,
  startListening,
  stopListening,
  cancelListening,
  getVoices,
  speak,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
};
