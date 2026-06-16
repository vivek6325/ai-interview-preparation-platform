import React from 'react';

/**
 * ScoreCard Component
 * Displays the central radial evaluation score circle, verdict summary, and performance rank badge.
 */
export function ScoreCard({ overallScore, overallScorePercent, grade, verdict }) {
  return (
    <div className="score-summary-panel">
      <div className="score-ring">
        <svg viewBox="0 0 100 100">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
          <circle className="ring-track" cx="50" cy="50" r="40" />
          <circle 
            className="ring-fill" 
            cx="50" 
            cy="50" 
            r="40" 
            style={{ strokeDashoffset: `calc(251.2 - (251.2 * ${overallScorePercent}) / 100)` }} 
          />
        </svg>
        <div className="score-text">
          <span className="number">{overallScore}</span>
          <span className="percent">/10</span>
        </div>
      </div>
      <div className="grade-badge">{grade}</div>
      <p className="summary-verdict">{verdict}</p>
    </div>
  );
}

export default ScoreCard;
