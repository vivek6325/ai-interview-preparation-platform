import { useMemo } from 'react';
import { analyzeVoiceAnalytics } from '../utils/speechAnalytics';

/**
 * Custom React hook for computing voice analytics (Speaking Pace + Filler Word Detection).
 * 
 * Recomputes analytics efficiently whenever transcript or duration change.
 * 
 * @param {string} transcript Recorded answer transcript text
 * @param {number} durationSeconds Recorded answer duration in seconds
 * @returns {Object} voiceAnalytics object { durationSeconds, wordCount, wordsPerMinute, pace, fillerAnalysis }
 */
export function useSpeechAnalytics(transcript = '', durationSeconds = 0) {
  const analytics = useMemo(() => {
    return analyzeVoiceAnalytics(transcript, durationSeconds);
  }, [transcript, durationSeconds]);

  return analytics;
}

export default useSpeechAnalytics;
