import { useState, useCallback } from 'react';
import { transcribeAudio } from '../services/aiService';
import { analyzeVoiceAnalytics } from '../utils/speechAnalytics';

/**
 * Custom React Hook managing Speech-to-Text (STT) transcription workflow for interview answers.
 * 
 * Supports browser Web Speech API live capture and backend Gemini Audio Transcription fallback.
 * Structures transcript, pace & filler analysis into `voiceResponse` object schema:
 * {
 *   audio: { blob, url },
 *   transcript: string,
 *   duration: number,
 *   analysis: {
 *     speakingPace: voiceAnalytics.pace,
 *     fillerAnalysis: voiceAnalytics.fillerAnalysis
 *   },
 *   voiceAnalytics: voiceAnalytics
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
  const prepareReadyToTranscribe = useCallback(({ blob, url, duration, volumeSamples = [] }) => {
    setStatus('ready');
    setError(null);
    const initialAnalytics = analyzeVoiceAnalytics('', duration || 0, volumeSamples);
    setVoiceResponse({
      audio: { blob, url },
      transcript: '',
      duration: duration || 0,
      analysis: {
        speakingPace: initialAnalytics.pace,
        fillerAnalysis: initialAnalytics.fillerAnalysis,
        confidenceAnalysis: initialAnalytics.confidenceAnalysis,
        toneAnalysis: initialAnalytics.toneAnalysis
      },
      voiceAnalytics: initialAnalytics
    });
  }, []);

  /**
   * Transcribes recorded audio blob or uses captured Web Speech API live transcript
   * 
   * @param {Object} audioParams { blob, url, duration, volumeSamples }
   * @param {string} [liveTranscript] Optional transcript captured live during recording
   */
  const transcribe = useCallback(async ({ blob, url, duration, volumeSamples = [] }, liveTranscript = '') => {
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

      const analytics = analyzeVoiceAnalytics(resultText, duration || 0, volumeSamples);

      setTranscript(resultText);
      setStatus('success');
      setVoiceResponse({
        audio: { blob, url },
        transcript: resultText,
        duration: duration || 0,
        analysis: {
          speakingPace: analytics.pace,
          fillerAnalysis: analytics.fillerAnalysis,
          confidenceAnalysis: analytics.confidenceAnalysis,
          toneAnalysis: analytics.toneAnalysis
        },
        voiceAnalytics: analytics
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
