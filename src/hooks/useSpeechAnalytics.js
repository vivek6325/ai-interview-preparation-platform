import { useMemo } from 'react';
import { analyzeVoiceAnalytics } from '../utils/speechAnalytics';

/**
 * Custom React hook for computing voice analytics (Speaking Pace, Filler Words, Voice Confidence, Tone & Sentiment).
 * 
 * Recomputes analytics efficiently whenever transcript, duration, or volume samples change.
 * 
 * @param {string} transcript Recorded answer transcript text
 * @param {number} durationSeconds Recorded answer duration in seconds
 * @param {Array<number>} [volumeSamples] Physical volume level samples from audio recorder
 * @returns {Object} voiceAnalytics object { durationSeconds, wordCount, wordsPerMinute, pace, fillerAnalysis, confidenceAnalysis, toneAnalysis }
 */
export function useSpeechAnalytics(transcript = '', durationSeconds = 0, volumeSamples = []) {
  const analytics = useMemo(() => {
    return analyzeVoiceAnalytics(transcript, durationSeconds, volumeSamples);
  }, [transcript, durationSeconds, volumeSamples]);

  return analytics;
}

export default useSpeechAnalytics;
