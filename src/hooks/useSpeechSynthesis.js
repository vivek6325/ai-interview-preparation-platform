import { useState, useEffect, useCallback, useRef } from 'react';
import { isSynthesisSupported, speak as serviceSpeak, stopSpeaking, pauseSpeaking, resumeSpeaking, getVoices } from '../services/voiceService';

const SETTINGS_STORAGE_KEY = 'ai_interview_voice_settings';

const DEFAULT_SETTINGS = {
  rate: 1.0,
  pitch: 1.0,
  voice: '',
  autoRead: true,
  autoStartRecording: false,
  maxDuration: 120
};

/**
 * Custom React Hook for Text-To-Speech (TTS) & AI Question Read-Aloud.
 * 
 * Provides:
 * - speechState: 'idle' | 'speaking' | 'completed' | 'unavailable' | 'error'
 * - isSpeaking: boolean
 * - isPaused: boolean
 * - isSupported: boolean
 * - speak(text, options): Function
 * - speakQuestion(text, questionKey): Function (with re-render deduplication)
 * - stop(): Function
 * - pause(): Function
 * - resume(): Function
 */
export function useSpeechSynthesis() {
  const supported = isSynthesisSupported();

  // speechState: 'idle' | 'speaking' | 'completed' | 'unavailable' | 'error'
  const [speechState, setSpeechState] = useState(() => (supported ? 'idle' : 'unavailable'));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const settingsRef = useRef(settings);
  const lastSpokenKeyRef = useRef(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load available voices once voices ready
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
    setSpeechState((prev) => (prev === 'unavailable' ? 'unavailable' : 'idle'));
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
   * 
   * @param {string} text Question text to speak
   * @param {string|number} questionKey Unique question identifier (e.g. index or ID)
   * @param {boolean} [force=false] Force replay even if questionKey matches last spoken key
   */
  const speakQuestion = useCallback((text, questionKey, force = false) => {
    if (!supported || !text) return;

    const keyStr = String(questionKey ?? text);

    if (!force && lastSpokenKeyRef.current === keyStr && isSpeaking) {
      // Already speaking this exact question
      return;
    }

    if (!force && lastSpokenKeyRef.current === keyStr && speechState === 'completed') {
      // Already completed reading this question automatically
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

