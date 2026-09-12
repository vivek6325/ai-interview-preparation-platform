import { useState, useEffect, useCallback, useRef } from 'react';
import { isSynthesisSupported, speak as serviceSpeak, stopSpeaking, pauseSpeaking, resumeSpeaking, getVoices } from '../services/voiceService';

const SETTINGS_STORAGE_KEY = 'ai_interview_voice_settings';

const DEFAULT_SETTINGS = {
  rate: 1.0,
  pitch: 1.0,
  voice: '',
  autoRead: true
};

const VALID_RATES = [0.75, 1.0, 1.25, 1.5];

/**
 * Safely parse and validate stored settings from localStorage.
 */
function loadPersistedSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(saved);
    
    const validRate = (typeof parsed.rate === 'number' && (VALID_RATES.includes(parsed.rate) || (parsed.rate >= 0.5 && parsed.rate <= 2.0)))
      ? parsed.rate 
      : DEFAULT_SETTINGS.rate;

    const validVoice = typeof parsed.voice === 'string' ? parsed.voice : DEFAULT_SETTINGS.voice;
    const validAutoRead = typeof parsed.autoRead === 'boolean' ? parsed.autoRead : DEFAULT_SETTINGS.autoRead;

    return {
      ...DEFAULT_SETTINGS,
      rate: validRate,
      voice: validVoice,
      autoRead: validAutoRead
    };
  } catch (err) {
    console.warn('Failed to parse voice settings from localStorage, resetting to defaults:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Custom React Hook for Text-To-Speech (TTS) & AI Question Read-Aloud.
 * 
 * Provides:
 * - speechState: 'idle' | 'speaking' | 'stopped' | 'completed' | 'unavailable' | 'error'
 * - isSpeaking: boolean
 * - isPaused: boolean
 * - isSupported: boolean
 * - voices: Array<SpeechSynthesisVoice>
 * - settings: { rate, pitch, voice, autoRead }
 * - updateSettings(newSettings): Function
 * - speak(text, options): Function
 * - speakQuestion(text, questionKey, force): Function (with re-render deduplication & autoRead check)
 * - stop(): Function
 * - pause(): Function
 * - resume(): Function
 */
export function useSpeechSynthesis() {
  const supported = isSynthesisSupported();

  // speechState: 'idle' | 'speaking' | 'stopped' | 'completed' | 'unavailable' | 'error'
  const [speechState, setSpeechState] = useState(() => (supported ? 'idle' : 'unavailable'));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);
  const [settings, setSettings] = useState(loadPersistedSettings);

  const settingsRef = useRef(settings);
  const lastSpokenKeyRef = useRef(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load available voices asynchronously
  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const available = getVoices();
      if (available && available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [supported]);

  /**
   * Persist setting updates cleanly
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save voice settings to localStorage:', err);
      }
      return updated;
    });
  }, []);

  /**
   * Stop active speech synthesis cleanly
   */
  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeechState((prev) => (prev === 'unavailable' ? 'unavailable' : 'stopped'));
  }, []);

  /**
   * Core Speak function wrapping voiceService
   */
  const speak = useCallback((text, overrideOptions = {}) => {
    if (!supported) {
      setSpeechState('unavailable');
      setError('Text-To-Speech is not supported in this browser.');
      return;
    }

    if (!text || !text.trim()) {
      stop();
      return;
    }

    const activeSettings = settingsRef.current;
    const finalRate = overrideOptions.rate ?? activeSettings.rate;
    const finalPitch = overrideOptions.pitch ?? activeSettings.pitch;
    const finalVoice = overrideOptions.voice ?? activeSettings.voice;

    setError(null);
    setIsSpeaking(true);
    setIsPaused(false);
    setSpeechState('speaking');

    serviceSpeak(text, {
      rate: finalRate,
      pitch: finalPitch,
      voice: finalVoice,
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setSpeechState('speaking');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeechState('completed');
      },
      onError: (err) => {
        console.warn('SpeechSynthesis error handled gracefully:', err);
        setIsSpeaking(false);
        setIsPaused(false);
        setError('Speech playback encountered an error.');
        setSpeechState('error');
      }
    });
  }, [supported, stop]);

  /**
   * Deduplicated Question Read-Aloud helper
   * Prevents React re-renders from re-reading the exact same question key automatically.
   * Respects user's autoRead setting unless force === true (manual replay).
   * 
   * @param {string} text Question text to speak
   * @param {string|number} questionKey Unique question identifier (e.g. index or ID)
   * @param {boolean} [force=false] Force replay even if autoRead is false or key matches
   */
  const speakQuestion = useCallback((text, questionKey, force = false) => {
    if (!supported || !text) return;

    const activeSettings = settingsRef.current;

    // Check if autoRead is disabled and user did NOT manually press play/replay
    if (!force && !activeSettings.autoRead) {
      return;
    }

    const keyStr = String(questionKey ?? text);

    if (!force && lastSpokenKeyRef.current === keyStr && isSpeaking) {
      // Already speaking this exact question
      return;
    }

    if (!force && lastSpokenKeyRef.current === keyStr && (speechState === 'completed' || speechState === 'stopped')) {
      // Already completed or stopped reading this question
      return;
    }

    lastSpokenKeyRef.current = keyStr;
    speak(text);
  }, [supported, isSpeaking, speechState, speak]);

  const pause = useCallback(() => {
    pauseSpeaking();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    resumeSpeaking();
    setIsPaused(false);
  }, []);

  // Cancel speech on hook unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return {
    speechState,
    isSpeaking,
    isPaused,
    voices,
    error,
    isSupported: supported,
    settings,
    updateSettings,
    speak,
    speakQuestion,
    stop,
    pause,
    resume
  };
}

export default useSpeechSynthesis;
