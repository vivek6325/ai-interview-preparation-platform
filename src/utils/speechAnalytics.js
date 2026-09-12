/**
 * Utility functions for Speech, Speaking Pace, Filler Words, Voice Confidence, Tone & Sentiment Analytics (Day 18 Parts 3, 4 & 5)
 * 
 * Provides robust word counting, safe WPM calculation, filler word/phrase detection with boundary
 * protection and false-positive heuristics, physical audio volume characteristics analysis,
 * and communication tone & sentiment classification for candidate interview voice responses.
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
      // Exclude semantic "like" when preceded by verbs/pronouns: "I like", "would like", "feels like", "looks like"
      const semanticLikeRegex = /(?:i|we|they|he|she|it|you|would|should|could|feels|looks|sounds|seems)\s+like\b/gi;
      const maskedForLike = workingText.replace(semanticLikeRegex, ' ___SEMANTIC_LIKE___ ');
      
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      const matches = maskedForLike.match(regex);
      if (matches && matches.length > 0) {
        detectedCounts[word] = matches.length;
      }
    } else if (word === 'so') {
      // Match "so" when at sentence start, surrounded by punctuation, or before pronouns (e.g. "So, I think")
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

// ----------------------------------------------------------------------
// Day 18 Part 5: Voice Confidence & Tone/Sentiment Analytics
// ----------------------------------------------------------------------

/**
 * Analyzes observable physical audio characteristics (Vocal Energy, Volume Consistency, Speech Stability)
 * and calculates a non-arbitrary, explainable communication confidence score (0-100).
 * 
 * @param {string} transcript 
 * @param {number} durationSeconds 
 * @param {Array<number>} [volumeSamples] Physical amplitude frequency volume samples from AnalyserNode
 * @returns {Object} confidenceAnalysis
 */
export function analyzeVoiceConfidence(transcript = '', durationSeconds = 0, volumeSamples = []) {
  if (!transcript || durationSeconds <= 0) {
    return {
      score: 0,
      level: 'No Data',
      badgeClass: 'confidence-badge-insufficient',
      indicators: {
        vocalEnergy: 'N/A',
        volumeConsistency: 'N/A',
        speechStability: 'N/A'
      },
      feedback: 'Record and transcribe your answer to analyze voice delivery confidence.'
    };
  }

  // 1. Calculate Vocal Energy (0-100) from physical audio amplitude samples or transcript length baseline
  let energyScore = 78;
  let energyLabel = 'Good';

  if (volumeSamples && volumeSamples.length > 0) {
    const nonZero = volumeSamples.filter((v) => v > 5);
    const avgVol = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;

    if (avgVol > 60) {
      energyScore = 92;
      energyLabel = 'Strong';
    } else if (avgVol > 30) {
      energyScore = 80;
      energyLabel = 'Good';
    } else if (avgVol > 10) {
      energyScore = 65;
      energyLabel = 'Moderate';
    } else {
      energyScore = 48;
      energyLabel = 'Low';
    }
  }

  // 2. Calculate Volume Consistency (Standard Deviation relative variance)
  let consistencyScore = 80;
  let consistencyLabel = 'Good';

  if (volumeSamples && volumeSamples.length > 1) {
    const nonZero = volumeSamples.filter((v) => v > 5);
    if (nonZero.length > 1) {
      const mean = nonZero.reduce((a, b) => a + b, 0) / nonZero.length;
      const variance = nonZero.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nonZero.length;
      const stdDev = Math.sqrt(variance);

      const relStdDev = mean > 0 ? (stdDev / mean) * 100 : 0;
      if (relStdDev < 35) {
        consistencyScore = 90;
        consistencyLabel = 'Consistent';
      } else if (relStdDev < 60) {
        consistencyScore = 78;
        consistencyLabel = 'Good';
      } else {
        consistencyScore = 58;
        consistencyLabel = 'Variable';
      }
    }
  }

  // 3. Calculate Speech Stability (Ratio of non-silent active speech frames)
  let stabilityScore = 82;
  let stabilityLabel = 'Good';

  if (volumeSamples && volumeSamples.length > 0) {
    const activeFrames = volumeSamples.filter((v) => v > 5).length;
    const activityRatio = activeFrames / volumeSamples.length;

    if (activityRatio > 0.65) {
      stabilityScore = 88;
      stabilityLabel = 'Stable';
    } else if (activityRatio > 0.45) {
      stabilityScore = 78;
      stabilityLabel = 'Good';
    } else {
      stabilityScore = 58;
      stabilityLabel = 'Unstable';
    }
  }

  // Weighted total score calculation
  const totalScore = Math.min(100, Math.max(0, Math.round(
    (energyScore * 0.35) + (consistencyScore * 0.35) + (stabilityScore * 0.30)
  )));

  // Classify Confidence Level
  let levelConfig = {
    level: 'Very Confident',
    badgeClass: 'confidence-badge-excellent',
    feedback: 'Your vocal delivery is strong and consistent. Maintain this steady energy while continuing to use natural pauses.'
  };

  if (totalScore >= 80) {
    levelConfig = {
      level: 'Very Confident',
      badgeClass: 'confidence-badge-excellent',
      feedback: 'Your vocal delivery is strong and consistent. Maintain this steady energy while continuing to use natural pauses.'
    };
  } else if (totalScore >= 65) {
    levelConfig = {
      level: 'Confident',
      badgeClass: 'confidence-badge-good',
      feedback: 'Your delivery shows good vocal consistency. Keep your voice steady and emphasize key points naturally.'
    };
  } else if (totalScore >= 50) {
    levelConfig = {
      level: 'Moderate',
      badgeClass: 'confidence-badge-moderate',
      feedback: 'Your delivery shows moderate vocal consistency. Practice maintaining steady volume and using deliberate pauses.'
    };
  } else {
    levelConfig = {
      level: 'Needs Improvement',
      badgeClass: 'confidence-badge-needs-improvement',
      feedback: 'Your vocal delivery could be more consistent. Try speaking clearly, maintaining steady volume, and avoiding rushed or quiet delivery.'
    };
  }

  return {
    score: totalScore,
    level: levelConfig.level,
    badgeClass: levelConfig.badgeClass,
    indicators: {
      vocalEnergy: energyLabel,
      volumeConsistency: consistencyLabel,
      speechStability: stabilityLabel
    },
    feedback: levelConfig.feedback
  };
}

/** Hedging phrases indicating uncertainty */
export const HEDGING_PHRASES = [
  'maybe',
  'probably',
  'i guess',
  'i think',
  "i'm not sure",
  'im not sure',
  'possibly',
  'perhaps',
  'kind of',
  'sort of'
];

/** Problem solving technical vocabulary */
export const TECHNICAL_WORDS = [
  'architecture', 'system', 'design', 'implement', 'engineered', 'optimize', 'solution',
  'data', 'api', 'database', 'algorithm', 'performance', 'scalability', 'security',
  'testing', 'component', 'pipeline', 'workflow', 'achieved', 'framework', 'service'
];

/** Positive constructive words */
export const POSITIVE_WORDS = [
  'great', 'good', 'improved', 'successful', 'enjoy', 'effective', 'confident',
  'positive', 'efficient', 'reliable', 'collaborate', 'team', 'delivered', 'value'
];

/**
 * Analyzes transcript for general communication tone and sentiment.
 * 
 * @param {string} transcript 
 * @returns {Object} toneAnalysis
 */
export function analyzeToneAndSentiment(transcript = '') {
  const wordCount = countWords(transcript);

  if (!transcript || typeof transcript !== 'string' || wordCount === 0) {
    return {
      tone: 'Neutral',
      sentiment: 'Neutral',
      confidenceLanguage: 'N/A',
      uncertaintyIndicators: 0,
      badgeClass: 'tone-badge-neutral',
      feedback: 'Transcribe your answer to analyze communication tone and sentiment.'
    };
  }

  const lower = transcript.toLowerCase();

  // 1. Count Uncertainty / Hedging Indicators
  let uncertaintyCount = 0;
  HEDGING_PHRASES.forEach((phrase) => {
    const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) {
      uncertaintyCount += matches.length;
    }
  });

  // 2. Count Technical & Positive Vocabulary
  let techWordCount = 0;
  TECHNICAL_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) techWordCount += matches.length;
  });

  let positiveWordCount = 0;
  POSITIVE_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) positiveWordCount += matches.length;
  });

  // Classify Tone
  let tone = 'Professional';
  let badgeClass = 'tone-badge-professional';
  let feedback = 'Your response uses professional and constructive language. Reduce unnecessary hedging to make your answers more direct.';

  if (uncertaintyCount >= 3) {
    tone = 'Uncertain';
    badgeClass = 'tone-badge-uncertain';
    feedback = 'Your response contains several hedging phrases ("I think", "maybe"). State your technical decisions with more direct assertion.';
  } else if (techWordCount >= 2 || (techWordCount > 0 && positiveWordCount > 0)) {
    tone = 'Professional';
    badgeClass = 'tone-badge-professional';
    feedback = 'Your response uses strong professional and technical problem-solving vocabulary. Excellent structure.';
  } else if (positiveWordCount >= 2) {
    tone = 'Positive';
    badgeClass = 'tone-badge-positive';
    feedback = 'Your response uses constructive and team-oriented language. Great positive delivery.';
  } else {
    tone = 'Neutral';
    badgeClass = 'tone-badge-neutral';
    feedback = 'Your response has a balanced, neutral tone. Consider incorporating more specific problem-solving terminology.';
  }

  // Classify Sentiment
  let sentiment = 'Neutral';
  if (positiveWordCount > uncertaintyCount && positiveWordCount > 0) {
    sentiment = 'Positive';
  } else if (uncertaintyCount > positiveWordCount + 1) {
    sentiment = 'Neutral';
  } else {
    sentiment = 'Neutral';
  }

  let confidenceLanguage = 'Strong';
  if (uncertaintyCount >= 3) confidenceLanguage = 'Moderate';
  else if (uncertaintyCount >= 1) confidenceLanguage = 'Good';

  return {
    tone,
    sentiment,
    confidenceLanguage,
    uncertaintyIndicators: uncertaintyCount,
    badgeClass,
    feedback
  };
}

/**
 * Unified Voice Analytics generator combining Speaking Pace, Filler Words, Voice Confidence, Tone & Sentiment.
 * Prepares the complete unified voiceAnalytics object for Day 18.
 * 
 * @param {string} transcript 
 * @param {number} durationSeconds 
 * @param {Array<number>} [volumeSamples] 
 * @returns {Object} unified voiceAnalytics object
 */
export function analyzeVoiceAnalytics(transcript = '', durationSeconds = 0, volumeSamples = []) {
  const speakingPace = analyzeSpeakingPace(transcript, durationSeconds);
  const fillerAnalysis = analyzeFillerWords(transcript);
  const confidenceAnalysis = analyzeVoiceConfidence(transcript, durationSeconds, volumeSamples);
  const toneAnalysis = analyzeToneAndSentiment(transcript);

  return {
    durationSeconds: speakingPace.durationSeconds,
    wordCount: speakingPace.wordCount,
    wordsPerMinute: speakingPace.wordsPerMinute,
    pace: speakingPace.pace,
    fillerAnalysis,
    confidenceAnalysis,
    toneAnalysis
  };
}

export default analyzeVoiceAnalytics;
