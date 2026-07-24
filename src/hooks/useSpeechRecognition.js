import { useState, useEffect, useRef, useCallback } from 'react';
import { isSupported, startListening, stopListening, cancelListening } from '../services/voiceService';

/**
 * Custom React Hook for browser Speech Recognition (STT).
 * 
 * Exposes:
 * - transcript: string (Full recorded text)
 * - interimTranscript: string (Live intermediate result)
 * - isListening: boolean
 * - error: string | null
 * - isSupported: boolean
 * - speakingDuration: number (seconds)
 * - start(): Function
 * - stop(): Function
 * - reset(): Function
 * - setTranscript(): Function (for manual edits)
 * 
 * @param {Object} [config]
 * @param {number} [config.maxDuration=180] Max recording time in seconds before auto-stop
 * @param {Function} [config.onAutoSave] Callback fired when recording stops or transcript updates
 */
export function useSpeechRecognition({ maxDuration = 180, onAutoSave } = {}) {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [speakingDuration, setSpeakingDuration] = useState(0);

  const durationTimerRef = useRef(null);
  const supported = isSupported();

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, []);

  // Duration timer when listening
  useEffect(() => {
    if (isListening) {
      setSpeakingDuration(0);
      durationTimerRef.current = setInterval(() => {
        setSpeakingDuration((prev) => {
          const next = prev + 1;
          if (maxDuration && next >= maxDuration) {
            console.log('🎙️ [useSpeechRecognition] Max recording duration reached. Auto-stopping.');
            stop();
          }
          return next;
        });
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
  }, [isListening, maxDuration]);

  // Handle human-readable mic permission errors
  const parsePermissionError = (errEvent) => {
    const errType = errEvent?.error || errEvent;
    switch (errType) {
      case 'not-allowed':
      case 'permission-denied':
        return 'Microphone access denied. Please allow microphone permissions in your browser address bar.';
      case 'no-speech':
        return 'No speech detected. Please speak clearly into your microphone.';
      case 'audio-capture':
        return 'No microphone detected. Please plug in a microphone and retry.';
      case 'network':
        return 'Network connection error for speech service. Please check your connection.';
      case 'not-supported':
        return 'Speech recognition is not supported in this browser. Please use Chrome or Edge.';
      default:
        return typeof errEvent?.message === 'string' ? errEvent.message : 'An error occurred with Speech Recognition.';
    }
  };

  const start = useCallback(() => {
    if (!supported) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    setError(null);
    setInterimTranscript('');

    const instance = startListening({
      onResult: ({ transcript: fullText, interimTranscript: interim }) => {
        setTranscript(fullText);
        setInterimTranscript(interim);
      },
      onError: (errEvent) => {
        const friendlyMsg = parsePermissionError(errEvent);
        setError(friendlyMsg);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript('');
      }
    });

    if (instance) {
      setIsListening(true);
    }
  }, [supported]);

  const stop = useCallback(() => {
    stopListening();
    setIsListening(false);
    setInterimTranscript('');
    if (onAutoSave && transcript) {
      onAutoSave(transcript);
    }
  }, [onAutoSave, transcript]);

  const reset = useCallback(() => {
    cancelListening();
    setIsListening(false);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setSpeakingDuration(0);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    error,
    isSupported: supported,
    speakingDuration,
    start,
    stop,
    reset,
    setTranscript
  };
}

export default useSpeechRecognition;
