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
 * Custom React Hook for Text-To-Speech (TTS) & Settings Persistence.
 * 
 * Exposes:
 * - isSpeaking: boolean
 * - isPaused: boolean
 * - voices: Array<SpeechSynthesisVoice>
 * - isSupported: boolean
 * - settings: Object
 * - speak(text, options): Function
 * - stop(): Function
 * - pause(): Function
 * - resume(): Function
 * - updateSettings(newSettings): Function
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const supported = isSynthesisSupported();
  const settingsRef = useRef(settings);

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

  const speak = useCallback((text, overrideOptions = {}) => {
    if (!supported || !text) return;

    const activeSettings = settingsRef.current;
    const finalRate = overrideOptions.rate ?? activeSettings.rate;
    const finalPitch = overrideOptions.pitch ?? activeSettings.pitch;
    const finalVoice = overrideOptions.voice ?? activeSettings.voice;

    setIsSpeaking(true);
    setIsPaused(false);

    serviceSpeak(text, {
      rate: finalRate,
      pitch: finalPitch,
      voice: finalVoice,
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    });
  }, [supported]);

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    pauseSpeaking();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    resumeSpeaking();
    setIsPaused(false);
  }, []);

  return {
    isSpeaking,
    isPaused,
    voices,
    isSupported: supported,
    settings,
    updateSettings,
    speak,
    stop,
    pause,
    resume
  };
}

export default useSpeechSynthesis;
