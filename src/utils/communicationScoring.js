/**
 * Communication Scoring Utility (Day 18 — Part 6)
 * Calculates a transparent, 0–100 AI Communication Score from actual voice analytics.
 */

export const SCORE_WEIGHTS = {
  PACE: 0.20,
  FILLER: 0.20,
  CONFIDENCE: 0.25,
  TONE: 0.15,
  QUALITY: 0.20
};

export const SCORE_LEVELS = {
  EXCELLENT: {
    min: 90,
    max: 100,
    label: 'Excellent',
    badgeClass: 'score-badge-excellent',
    summary: 'Outstanding interview communication with clear pace, strong confidence, and highly professional delivery.'
  },
  STRONG: {
    min: 80,
    max: 89,
    label: 'Strong',
    badgeClass: 'score-badge-strong',
    summary: 'Strong delivery overall with good speaking rhythm, solid vocal energy, and professional tone.'
  },
  GOOD: {
    min: 70,
    max: 79,
    label: 'Good',
    badgeClass: 'score-badge-good',
    summary: 'Clear communication with solid structure. Minor refinements in pace or filler control will elevate delivery.'
  },
  NEEDS_IMPROVEMENT: {
    min: 60,
    max: 69,
    label: 'Needs Improvement',
    badgeClass: 'score-badge-needs-improvement',
    summary: 'Delivery shows moderate consistency. Focus on reducing filler words and speaking at a steady pace.'
  },
  NEEDS_SIGNIFICANT_IMPROVEMENT: {
    min: 0,
    max: 59,
    label: 'Needs Significant Improvement',
    badgeClass: 'score-badge-significant-improvement',
    summary: 'Vocal delivery or structure needs development. Practice speaking clearly with deliberate pauses.'
  }
};

export const MIN_DATA_THRESHOLDS = {
  MIN_WORDS: 5,
  MIN_DURATION_SECONDS: 3
};

/**
 * Normalizes Speaking Pace (WPM) into a 0-100 sub-score.
 */
export function calculatePaceSubscore(wpm = null, paceCategory = null) {
  if (typeof wpm === 'number' && Number.isFinite(wpm) && wpm > 0) {
    if (wpm >= 110 && wpm <= 150) return 98; // Ideal range
    if (wpm >= 100 && wpm < 110) return 90;
    if (wpm > 150 && wpm <= 165) return 85; // Slightly fast
    if (wpm > 165 && wpm <= 180) return 72; // Fast
    if (wpm > 180 && wpm <= 200) return 58; // Very fast
    if (wpm > 200) return 40;              // Too fast
    if (wpm >= 80 && wpm < 100) return 75;  // Slightly slow
    if (wpm >= 60 && wpm < 80) return 55;   // Slow
    return 40;                             // Too slow (<60)
  }

  // Category fallback
  switch (paceCategory) {
    case 'good': return 95;
    case 'fast': return 75;
    case 'too_slow': return 60;
    case 'too_fast': return 45;
    default: return 75;
  }
}

/**
 * Normalizes Filler Percentage into a 0-100 sub-score with short-answer protection.
 */
export function calculateFillerSubscore(fillerPercentage = 0, totalFillers = 0, wordCount = 0) {
  // Short answer protection: 1 filler in a 10-word sentence is 10%, but shouldn't destroy score
  if (wordCount < 15 && totalFillers <= 1) {
    return totalFillers === 0 ? 100 : 85;
  }

  if (fillerPercentage <= 1.0) return 100;
  if (fillerPercentage <= 2.0) return 95;
  if (fillerPercentage <= 3.5) return 88;
  if (fillerPercentage <= 5.0) return 80;
  if (fillerPercentage <= 6.5) return 68;
  if (fillerPercentage <= 8.0) return 55;
  if (fillerPercentage <= 12.0) return 40;
  return 25;
}

/**
 * Normalizes Tone & Sentiment into a 0-100 sub-score.
 */
export function calculateToneSubscore(tone = 'Neutral', sentiment = 'Neutral', uncertaintyIndicators = 0) {
  let baseScore = 75;

  if (tone === 'Professional' && sentiment === 'Positive') baseScore = 96;
  else if (tone === 'Professional') baseScore = 88;
  else if (tone === 'Positive') baseScore = 88;
  else if (tone === 'Neutral' && sentiment === 'Positive') baseScore = 82;
  else if (tone === 'Neutral') baseScore = 75;
  else if (tone === 'Uncertain') baseScore = 58;
  else if (tone === 'Negative' || sentiment === 'Negative') baseScore = 45;

  // Deduct slightly for excessive uncertainty hedging
  if (uncertaintyIndicators >= 4) baseScore = Math.max(30, baseScore - 15);
  else if (uncertaintyIndicators >= 2) baseScore = Math.max(40, baseScore - 8);

  return baseScore;
}

/**
 * Calculates deterministic Transcript Communication Quality sub-score (0-100)
 * used as a fallback if AI API is unavailable.
 */
export function calculateFallbackQualitySubscore(transcript = '', wordCount = 0) {
  if (!transcript || wordCount < MIN_DATA_THRESHOLDS.MIN_WORDS) return 60;

  let score = 75;
  const lower = transcript.toLowerCase();

  // Word count depth reward
  if (wordCount >= 40) score += 10;
  else if (wordCount >= 20) score += 5;

  // Tech / structured vocabulary bonus
  const techMatches = lower.match(/\b(system|architecture|database|api|component|function|service|algorithm|process|design|structure|optimized|implemented|solution)\b/gi);
  if (techMatches && techMatches.length >= 3) score += 10;
  else if (techMatches && techMatches.length >= 1) score += 5;

  // Deduct for heavy hedging
  const hedgingMatches = lower.match(/\b(maybe|probably|i guess|i think|kind of|sort of)\b/gi);
  if (hedgingMatches && hedgingMatches.length >= 3) score -= 12;

  return Math.min(100, Math.max(40, score));
}

/**
 * Classifies numerical score into a centralized category.
 */
export function classifyScoreLevel(score) {
  if (score >= 90) return SCORE_LEVELS.EXCELLENT;
  if (score >= 80) return SCORE_LEVELS.STRONG;
  if (score >= 70) return SCORE_LEVELS.GOOD;
  if (score >= 60) return SCORE_LEVELS.NEEDS_IMPROVEMENT;
  return SCORE_LEVELS.NEEDS_SIGNIFICANT_IMPROVEMENT;
}

/**
 * Main Communication Score Calculator with dynamic weight re-normalization for missing data.
 */
export function calculateCommunicationScore(voiceAnalytics = {}, qualityAssessment = null) {
  const wordCount = voiceAnalytics.wordCount ?? 0;
  const durationSeconds = voiceAnalytics.durationSeconds ?? 0;

  // Minimum data rule check
  if (wordCount < MIN_DATA_THRESHOLDS.MIN_WORDS || durationSeconds < MIN_DATA_THRESHOLDS.MIN_DURATION_SECONDS) {
    return {
      score: null,
      level: 'Insufficient Data',
      ratingCategory: null,
      isInsufficientData: true,
      insufficientMessage: `Record a longer response (at least ${MIN_DATA_THRESHOLDS.MIN_WORDS} words and ${MIN_DATA_THRESHOLDS.MIN_DURATION_SECONDS} seconds) to receive a reliable communication analysis.`,
      breakdown: null,
      strengths: [],
      areasToImprove: [],
      recommendations: [],
      overallAssessment: ''
    };
  }

  // 1. Compute component sub-scores
  const paceScore = calculatePaceSubscore(voiceAnalytics.wordsPerMinute, voiceAnalytics.pace?.category);
  const fillerScore = calculateFillerSubscore(
    voiceAnalytics.fillerAnalysis?.fillerPercentage ?? 0,
    voiceAnalytics.fillerAnalysis?.totalFillers ?? 0,
    wordCount
  );
  
  const confidenceScore = typeof voiceAnalytics.confidenceAnalysis?.score === 'number'
    ? voiceAnalytics.confidenceAnalysis.score
    : null;

  const toneScore = calculateToneSubscore(
    voiceAnalytics.toneAnalysis?.tone,
    voiceAnalytics.toneAnalysis?.sentiment,
    voiceAnalytics.toneAnalysis?.uncertaintyIndicators ?? 0
  );

  const qualityScore = typeof qualityAssessment?.communicationQualityScore === 'number'
    ? Math.min(100, Math.max(0, qualityAssessment.communicationQualityScore))
    : calculateFallbackQualitySubscore(voiceAnalytics.transcript, wordCount);

  // 2. Dynamic Weight Re-normalization for missing components
  const components = [
    { name: 'pace', score: paceScore, weight: SCORE_WEIGHTS.PACE, label: 'Speaking Pace' },
    { name: 'filler', score: fillerScore, weight: SCORE_WEIGHTS.FILLER, label: 'Filler Control' },
    { name: 'confidence', score: confidenceScore, weight: SCORE_WEIGHTS.CONFIDENCE, label: 'Voice Confidence' },
    { name: 'tone', score: toneScore, weight: SCORE_WEIGHTS.TONE, label: 'Tone & Sentiment' },
    { name: 'quality', score: qualityScore, weight: SCORE_WEIGHTS.QUALITY, label: 'Communication Quality' }
  ];

  let weightedSum = 0;
  let activeWeightTotal = 0;
  const breakdown = {};

  components.forEach((comp) => {
    if (typeof comp.score === 'number' && Number.isFinite(comp.score)) {
      weightedSum += comp.score * comp.weight;
      activeWeightTotal += comp.weight;
      breakdown[comp.name] = {
        score: Math.round(comp.score),
        weightPercentage: Math.round(comp.weight * 100),
        label: comp.label,
        available: true
      };
    } else {
      breakdown[comp.name] = {
        score: null,
        weightPercentage: Math.round(comp.weight * 100),
        label: comp.label,
        available: false
      };
    }
  });

  const rawFinalScore = activeWeightTotal > 0 ? weightedSum / activeWeightTotal : 70;
  const finalScore = Math.min(100, Math.max(0, Math.round(rawFinalScore)));
  const ratingCategory = classifyScoreLevel(finalScore);

  // 3. Generate deterministic strengths, improvements, and recommendations if AI feedback is not yet available
  const strengths = qualityAssessment?.strengths || [];
  const areasToImprove = qualityAssessment?.areasToImprove || qualityAssessment?.weaknesses || [];
  const recommendations = qualityAssessment?.recommendations || qualityAssessment?.suggestions || [];
  let overallAssessment = qualityAssessment?.overallAssessment || qualityAssessment?.feedback || '';

  if (strengths.length === 0) {
    if (paceScore >= 80) strengths.push('Steady, well-controlled speaking pace.');
    if (fillerScore >= 85) strengths.push('Minimal filler word usage for clean delivery.');
    if (confidenceScore && confidenceScore >= 75) strengths.push('Consistent vocal energy and delivery volume.');
    if (toneScore >= 80) strengths.push('Professional, constructive language choice.');
    if (strengths.length === 0) strengths.push('Clear attempt at structuring the response.');
  }

  if (areasToImprove.length === 0) {
    if (fillerScore < 80) areasToImprove.push('Reduce filler words such as "um", "like", or "you know".');
    if (paceScore < 75) areasToImprove.push('Adjust speaking speed closer to 110–150 WPM.');
    if (confidenceScore && confidenceScore < 70) areasToImprove.push('Maintain steady vocal volume throughout the answer.');
    if (toneScore < 75) areasToImprove.push('Minimize uncertainty hedging phrases such as "I guess" or "maybe".');
    if (areasToImprove.length === 0) areasToImprove.push('Elaborate further on key technical decisions.');
  }

  if (recommendations.length === 0) {
    if (fillerScore < 80) recommendations.push('Pause deliberately for 1–2 seconds when organizing your thoughts instead of filling silence.');
    if (paceScore < 75) recommendations.push('Practice reading tech answers aloud with a metronome or timer to build consistent pacing.');
    if (confidenceScore && confidenceScore < 70) recommendations.push('Speak towards the microphone with steady projection.');
    if (recommendations.length === 0) recommendations.push('Structure complex answers using the STAR (Situation, Task, Action, Result) method.');
  }

  if (!overallAssessment) {
    overallAssessment = `${ratingCategory.summary} Overall communication score is ${finalScore}/100.`;
  }

  return {
    score: finalScore,
    level: ratingCategory.label,
    ratingCategory,
    isInsufficientData: false,
    breakdown,
    strengths,
    areasToImprove,
    recommendations,
    overallAssessment
  };
}
