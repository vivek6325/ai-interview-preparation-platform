/**
 * Utility functions for Speech, Speaking Pace & Filler Word Analytics (Day 18 Part 3 & Part 4)
 * 
 * Provides robust word counting, safe WPM calculation, filler word/phrase detection with boundary
 * protection and false-positive heuristics, centralized rating classifications, and constructive feedback.
 */

/**
 * Counts exact words from a transcript string.
 * Handles multiple consecutive spaces, leading/trailing whitespace, and newlines.
 * 
 * @param {string} text 
 * @returns {number} Exact word count
 */
export function countWords(text = '') {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Split by any sequence of whitespace characters (\s+)
  const words = trimmed.split(/\s+/);
  return words.length;
}

/**
 * Calculates Words Per Minute (WPM) safely.
 * Returns 0 if duration or word count is invalid or non-positive.
 * 
 * @param {number} wordCount 
 * @param {number} durationSeconds 
 * @returns {number} WPM rounded to nearest integer
 */
export function calculateWpm(wordCount = 0, durationSeconds = 0) {
  if (!wordCount || wordCount <= 0 || !durationSeconds || durationSeconds <= 0) {
    return 0;
  }
  const durationMinutes = durationSeconds / 60;
  const wpm = wordCount / durationMinutes;
  if (!Number.isFinite(wpm) || Number.isNaN(wpm)) {
    return 0;
  }
  return Math.round(wpm);
}

/**
 * Centralized Pace Classification Thresholds & Feedback Configurations
 */
export const PACE_THRESHOLDS = {
  TOO_SLOW: {
    maxWpm: 99,
    label: 'Too Slow',
    category: 'too_slow',
    badgeClass: 'pace-badge-too-slow',
    feedback: 'Your speaking pace is slower than typical interview conversation. Try to maintain a slightly more natural and energetic pace.'
  },
  GOOD_PACE: {
    minWpm: 100,
    maxWpm: 159,
    label: 'Good Pace',
    category: 'good',
    badgeClass: 'pace-badge-good',
    feedback: 'Your speaking pace is well suited for an interview. Keep maintaining this clear and steady rhythm.'
  },
  FAST: {
    minWpm: 160,
    maxWpm: 190,
    label: 'Fast',
    category: 'fast',
    badgeClass: 'pace-badge-fast',
    feedback: "You're speaking somewhat quickly. Try adding short pauses between ideas to improve clarity."
  },
  TOO_FAST: {
    minWpm: 191,
    label: 'Too Fast',
    category: 'too_fast',
    badgeClass: 'pace-badge-too-fast',
    feedback: 'Your speaking pace is very fast. Slow down and use deliberate pauses so the interviewer can follow your answer comfortably.'
  },
  INSUFFICIENT_DATA: {
    label: 'Insufficient Data',
    category: 'insufficient_data',
    badgeClass: 'pace-badge-insufficient',
    feedback: 'Not enough data to calculate speaking pace.'
  }
};

/**
 * Classifies calculated WPM into interview speaking pace categories.
 * 
 * @param {number} wpm 
 * @param {number} wordCount 
 * @param {number} durationSeconds 
 * @returns {Object} Category config { label, category, badgeClass, feedback }
 */
export function classifySpeakingPace(wpm = 0, wordCount = 0, durationSeconds = 0) {
  if (wordCount <= 0 || durationSeconds <= 0 || wpm <= 0) {
    return PACE_THRESHOLDS.INSUFFICIENT_DATA;
  }

  if (wpm < 100) {
    return PACE_THRESHOLDS.TOO_SLOW;
  }
  if (wpm <= 159) {
    return PACE_THRESHOLDS.GOOD_PACE;
  }
  if (wpm <= 190) {
    return PACE_THRESHOLDS.FAST;
  }
  return PACE_THRESHOLDS.TOO_FAST;
}

/**
 * Generates the speaking pace analysis object.
 * 
 * @param {string} transcript 
 * @param {number} durationSeconds 
 * @returns {Object} speakingPace
 */
export function analyzeSpeakingPace(transcript = '', durationSeconds = 0) {
  const wordCount = countWords(transcript);
  const wordsPerMinute = calculateWpm(wordCount, durationSeconds);
  const paceConfig = classifySpeakingPace(wordsPerMinute, wordCount, durationSeconds);

  return {
    durationSeconds: durationSeconds || 0,
    wordCount,
    wordsPerMinute,
    pace: {
      label: paceConfig.label,
      category: paceConfig.category,
      badgeClass: paceConfig.badgeClass,
      feedback: paceConfig.feedback
    }
  };
}

// ----------------------------------------------------------------------
// Day 18 Part 4: Filler Word & Phrase Analytics Engine
// ----------------------------------------------------------------------

/** Multi-word filler phrases to check first before single words */
export const FILLER_PHRASES = [
  'you know',
  'i mean',
  'kind of',
  'sort of'
];

/** Single-word fillers to detect */
export const FILLER_WORDS = [
  'um',
  'umm',
  'uh',
  'uhh',
  'er',
  'err',
  'ah',
  'ahh',
  'like',
  'actually',
  'basically',
  'literally',
  'so'
];

/** Centralized Filler Threshold Ratings & Feedback */
export const FILLER_THRESHOLDS = {
  EXCELLENT: {
    maxPercentage: 2.0,
    label: 'Excellent',
    category: 'excellent',
    badgeClass: 'filler-badge-excellent',
    feedback: 'Your answer was very clean with minimal filler words. Keep using confident pauses when organizing your thoughts.'
  },
  GOOD: {
    minPercentage: 2.01,
    maxPercentage: 5.0,
    label: 'Good',
    category: 'good',
    badgeClass: 'filler-badge-good',
    feedback: 'You used a small number of filler words. Try replacing them with short pauses when you need time to think.'
  },
  NEEDS_IMPROVEMENT: {
    minPercentage: 5.01,
    maxPercentage: 8.0,
    label: 'Needs Improvement',
    category: 'needs_improvement',
    badgeClass: 'filler-badge-needs-improvement',
    feedback: 'You used several filler words. Practice pausing briefly instead of filling silence with words such as "um" or "like".'
  },
  HIGH: {
    minPercentage: 8.01,
    label: 'High',
    category: 'high',
    badgeClass: 'filler-badge-high',
    feedback: 'Your answer contains frequent filler words. Slow down, pause between ideas, and practice answering without relying on filler phrases.'
  },
  NO_DATA: {
    label: 'No Data',
    category: 'insufficient_data',
    badgeClass: 'filler-badge-insufficient',
    feedback: 'Transcribe your answer to analyze filler words.'
  }
};

/**
 * Escape regex special characters in string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Classifies filler percentage into rating categories
 * 
 * @param {number} percentage 
 * @param {number} totalWords 
 * @returns {Object} Filler threshold rating config
 */
export function classifyFillerPercentage(percentage = 0, totalWords = 0) {
  if (totalWords <= 0) {
    return FILLER_THRESHOLDS.NO_DATA;
  }
  if (percentage <= 2.0) {
    return FILLER_THRESHOLDS.EXCELLENT;
  }
  if (percentage <= 5.0) {
    return FILLER_THRESHOLDS.GOOD;
  }
  if (percentage <= 8.0) {
    return FILLER_THRESHOLDS.NEEDS_IMPROVEMENT;
  }
  return FILLER_THRESHOLDS.HIGH;
}

/**
 * Analyzes transcript text to detect filler words and phrases.
 * Uses boundary checking and context heuristics to prevent false positives.
 * 
 * @param {string} transcript Plain text transcript
 * @returns {Object} fillerAnalysis object
 */
export function analyzeFillerWords(transcript = '') {
  const wordCount = countWords(transcript);
  
  if (!transcript || typeof transcript !== 'string' || wordCount === 0) {
    return {
      totalFillers: 0,
      fillerRate: 0,
      fillerPercentage: 0,
      rating: {
        label: FILLER_THRESHOLDS.NO_DATA.label,
        category: FILLER_THRESHOLDS.NO_DATA.category,
        badgeClass: FILLER_THRESHOLDS.NO_DATA.badgeClass,
        feedback: FILLER_THRESHOLDS.NO_DATA.feedback
      },
      detected: [],
      feedback: FILLER_THRESHOLDS.NO_DATA.feedback
    };
  }

  // Work on lowercased version for case-insensitive matching
  let workingText = transcript.toLowerCase();
  const detectedCounts = {};

  // 1. Detect Multi-Word Filler Phrases first to avoid double counting
  FILLER_PHRASES.forEach((phrase) => {
    const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
    const matches = workingText.match(regex);
    if (matches && matches.length > 0) {
      detectedCounts[phrase] = matches.length;
      // Mask matched phrase out so individual constituent words aren't matched later
      workingText = workingText.replace(regex, ' ___FILLER_MASK___ ');
    }
  });

  // 2. Detect Single-Word Fillers with context heuristics
  FILLER_WORDS.forEach((word) => {
    if (word === 'like') {
      // Exclude semantic "like" when preceded by verbs/pronouns: "I like", "would like", "looks like", "feels like"
      const semanticLikeRegex = /(?:i|we|they|he|she|it|you|would|should|could|feels|looks|sounds|seems)\s+like\b/gi;
      const maskedForLike = workingText.replace(semanticLikeRegex, ' ___SEMANTIC_LIKE___ ');
      
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      const matches = maskedForLike.match(regex);
      if (matches && matches.length > 0) {
        detectedCounts[word] = matches.length;
      }
    } else if (word === 'so') {
      // Match "so" when at sentence start, surrounded by punctuation, or before pronouns (e.g. "So, I think")
      // Exclude semantic "so simple", "so fast", "so much"
      const semanticSoRegex = /\bso\s+(?:simple|fast|good|far|much|many|that|important|different|difficult|easy|great)\b/gi;
      const maskedForSo = workingText.replace(semanticSoRegex, ' ___SEMANTIC_SO___ ');
      
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      const matches = maskedForSo.match(regex);
      if (matches && matches.length > 0) {
        detectedCounts[word] = matches.length;
      }
    } else {
      // Standard word boundary matching for um, uh, er, ah, actually, basically, etc.
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      const matches = workingText.match(regex);
      if (matches && matches.length > 0) {
        detectedCounts[word] = matches.length;
      }
    }
  });

  // Calculate total occurrences
  let totalFillers = 0;
  const detectedList = [];

  Object.entries(detectedCounts).forEach(([filler, count]) => {
    if (count > 0) {
      totalFillers += count;
      detectedList.push({ word: filler, count });
    }
  });

  // Sort detected fillers descending by frequency count
  detectedList.sort((a, b) => b.count - a.count);

  // Calculate percentage: (totalFillers / wordCount) * 100 rounded to 1 decimal
  const rawPercentage = (totalFillers / wordCount) * 100;
  const fillerPercentage = Number.isFinite(rawPercentage) ? Math.round(rawPercentage * 10) / 10 : 0;

  const ratingConfig = classifyFillerPercentage(fillerPercentage, wordCount);

  return {
    totalFillers,
    fillerRate: fillerPercentage,
    fillerPercentage,
    rating: {
      label: ratingConfig.label,
      category: ratingConfig.category,
      badgeClass: ratingConfig.badgeClass,
      feedback: ratingConfig.feedback
    },
    detected: detectedList,
    feedback: ratingConfig.feedback
  };
}

/**
 * Combined Voice Analytics helper function combining Speaking Pace & Filler Word Analysis.
 * Prepares the unified voiceAnalytics object for Day 18.
 * 
 * @param {string} transcript 
 * @param {number} durationSeconds 
 * @returns {Object} unified voiceAnalytics object
 */
export function analyzeVoiceAnalytics(transcript = '', durationSeconds = 0) {
  const speakingPace = analyzeSpeakingPace(transcript, durationSeconds);
  const fillerAnalysis = analyzeFillerWords(transcript);

  return {
    durationSeconds: speakingPace.durationSeconds,
    wordCount: speakingPace.wordCount,
    wordsPerMinute: speakingPace.wordsPerMinute,
    pace: speakingPace.pace,
    fillerAnalysis
  };
}

export default analyzeVoiceAnalytics;
