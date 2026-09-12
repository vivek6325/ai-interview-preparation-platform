import { useState, useCallback } from 'react';
import { transcribeAudio } from '../services/aiService';

/**
 * Custom React Hook managing Speech-to-Text (STT) transcription workflow for interview answers.
 * 
 * Supports browser Web Speech API live capture and backend Gemini Audio Transcription fallback.
 * Structures transcript data into `voiceResponse` object schema for future Day 18 analytics:
 * {
 *   audio: { blob, url },
 *   transcript: string,
 *   duration: number,
 *   analysis: null
 * }
 */
export function useVoiceTranscription() {
  // Status: 'idle' | 'ready' | 'transcribing' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [voiceResponse, setVoiceResponse] = useState(null);

  /**
   * Resets transcription state back to idle
   */
  const resetTranscription = useCallback(() => {
    setStatus('idle');
    setTranscript('');
    setError(null);
    setVoiceResponse(null);
  }, []);

  /**
   * Prepares recorder state when audio recording completes
   */
  const prepareReadyToTranscribe = useCallback(({ blob, url, duration }) => {
    setStatus('ready');
    setError(null);
    setVoiceResponse({
      audio: { blob, url },
      transcript: '',
      duration: duration || 0,
      analysis: null
    });
  }, []);

  /**
   * Transcribes recorded audio blob or uses captured Web Speech API live transcript
   * 
   * @param {Object} audioParams { blob, url, duration }
   * @param {string} [liveTranscript] Optional transcript captured live during recording
   */
  const transcribe = useCallback(async ({ blob, url, duration }, liveTranscript = '') => {
    if (status === 'transcribing') return; // Prevent duplicate concurrent requests

    setStatus('transcribing');
    setError(null);

    try {
      let resultText = liveTranscript ? liveTranscript.trim() : '';

      // If no live Web Speech API transcript available, transcribe via backend Gemini AI service
      if (!resultText && blob) {
        if (blob.size === 0) {
          throw new Error('Cannot transcribe empty audio file. Please record your answer again.');
        }

        const res = await transcribeAudio(blob);
        resultText = res?.transcript ? res.transcript.trim() : '';
      }

      if (!resultText) {
        throw new Error('No speech detected in audio recording. Please speak clearly and try again.');
      }

      setTranscript(resultText);
      setStatus('success');
      setVoiceResponse({
        audio: { blob, url },
        transcript: resultText,
        duration: duration || 0,
        analysis: null
      });

      return resultText;
    } catch (err) {
      console.error('Transcription error:', err);
      const friendlyMsg = err.message || 'Speech-to-text transcription failed. Please try again.';
      setError(friendlyMsg);
      setStatus('error');
      throw err;
    }
  }, [status]);

  return {
    status,
    transcript,
    error,
    voiceResponse,
    isTranscribing: status === 'transcribing',
    isSuccess: status === 'success',
    isError: status === 'error',
    isReady: status === 'ready',
    prepareReadyToTranscribe,
    transcribe,
    resetTranscription,
    setTranscript
  };
}

export default useVoiceTranscription;
