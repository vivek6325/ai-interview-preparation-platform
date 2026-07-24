import React from 'react';

/**
 * BadgesMilestonesCard Component
 * Displays achievement badges, streak tracking, weekly challenges, and career readiness meter.
 * 
 * @param {Object} props
 * @param {Object} props.data - Milestones payload from analytics backend
 * @param {number} [props.readinessScore=82]
 */
export function BadgesMilestonesCard({ data, readinessScore = 82 }) {
  const milestones = data || {
    currentStreak: 3,
    bestStreak: 7,
    badges: [
      { title: 'First Steps', icon: '🚀', unlocked: true, description: 'Completed first mock interview' },
      { title: 'Consistent Learner', icon: '🔥', unlocked: true, description: 'Completed 3+ mock sessions' },
      { title: 'Voice Master', icon: '🎙️', unlocked: true, description: 'Practiced voice-based interviews' },
      { title: 'High Performer', icon: '🏆', unlocked: true, description: 'Scored 85+ in an interview' },
      { title: 'Interview Ready', icon: '👑', unlocked: false, description: 'Reach 10+ completed sessions' }
    ],
    weeklyChallenge: 'Complete 3 Voice Interviews this week (2/3 complete)',
    motivationalQuote: '"Success is where preparation and opportunity meet."'
  };

  return (
    <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-4 shadow-sm h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="h5 fw-bold mb-0 text-info d-flex align-items-center gap-2">
          <span>🏆</span> Milestones, Streaks & Readiness Meter
        </h4>
        <span className="badge bg-warning-subtle text-warning border border-warning fs-7">
          🔥 {milestones.currentStreak} Day Streak (Best: {milestones.bestStreak})
        </span>
      </div>

      {/* Career Readiness Meter Bar */}
      <div className="mb-4 p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fs-7 font-semibold text-secondary">AI Career Readiness Index</span>
          <span className="fs-5 fw-bold text-success">{readinessScore} / 100</span>
        </div>
        <div className="progress bg-dark border border-secondary" style={{ height: '14px' }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-success"
            style={{ width: `${readinessScore}%` }}
            role="progressbar"
            aria-valuenow={readinessScore}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
        <div className="fs-8 text-muted mt-2 d-flex justify-content-between">
          <span>Needs Practice (0-60)</span>
          <span>Interview Ready (75-90)</span>
          <span>Expert Candidate (90+)</span>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="mb-3">
        <h5 className="h6 fw-bold text-light mb-2">🏅 Achievement Badges</h5>
        <div className="d-flex flex-wrap gap-2">
          {milestones.badges?.map((b, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-3 border d-flex align-items-center gap-2 fs-7 ${
                b.unlocked
                  ? 'bg-primary-subtle text-primary border-primary'
                  : 'bg-black bg-opacity-30 text-muted border-secondary opacity-50'
              }`}
              title={b.description}
            >
              <span className="fs-5">{b.icon}</span>
              <div>
                <strong className="d-block fs-8">{b.title}</strong>
                <span className="fs-8">{b.unlocked ? 'Unlocked' : 'Locked'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Challenge & Quote */}
      <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-info border-opacity-25 mt-3">
        <div className="fs-7 text-info mb-1">
          🎯 <strong>Weekly Challenge:</strong> {milestones.weeklyChallenge}
        </div>
        <div className="fs-8 text-muted italic">
          💡 {milestones.motivationalQuote}
        </div>
      </div>
    </div>
  );
}

export default BadgesMilestonesCard;
