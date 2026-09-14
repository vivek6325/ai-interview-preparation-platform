import './AnalyticsComponents.css';

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
    <div className="analytics-card">
      <div className="analytics-card-header">
        <h4 className="analytics-card-title">
          <span>🏆</span> Milestones, Streaks & Readiness Meter
        </h4>
        <span className="analytics-badge badge-amber">
          🔥 {milestones.currentStreak} Day Streak (Best: {milestones.bestStreak})
        </span>
      </div>

      {/* Career Readiness Meter Bar */}
      <div className="readiness-container">
        <div className="readiness-header">
          <span>AI Career Readiness Index</span>
          <span className="readiness-score-text">{readinessScore} / 100</span>
        </div>
        <div className="progress-track-custom">
          <div
            className="progress-fill-custom"
            style={{ width: `${readinessScore}%` }}
          ></div>
        </div>
        <div className="readiness-labels">
          <span>Needs Practice (0-60)</span>
          <span>Interview Ready (75-90)</span>
          <span>Expert Candidate (90+)</span>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>🏅 Achievement Badges</h5>
        <div className="badges-flex-grid">
          {milestones.badges?.map((b, idx) => (
            <div
              key={idx}
              className={`badge-item-card ${b.unlocked ? 'unlocked' : ''}`}
              title={b.description}
            >
              <span className="badge-item-icon">{b.icon}</span>
              <div>
                <strong className="badge-item-title">{b.title}</strong>
                <span className="badge-item-status">{b.unlocked ? 'Unlocked' : 'Locked'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Challenge & Quote */}
      <div className="challenge-banner">
        <div>
          🎯 <strong>Weekly Challenge:</strong> {milestones.weeklyChallenge}
        </div>
        <div className="challenge-quote">
          💡 {milestones.motivationalQuote}
        </div>
      </div>
    </div>
  );
}

export default BadgesMilestonesCard;
