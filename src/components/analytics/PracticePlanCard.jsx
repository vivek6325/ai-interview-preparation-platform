import './AnalyticsComponents.css';

/**
 * PracticePlanCard Component
 * Personalized 4-Week Practice Plan Roadmap.
 * 
 * @param {Object} props
 * @param {Object} props.data - Practice plan object from analytics backend
 */
export function PracticePlanCard({ data }) {
  const plan = data || {
    week1: { title: 'Week 1: Core Fundamentals & DSA', focus: ['Arrays', 'HashMaps', 'Technical Definitions'], dailyGoal: 'Solve 1 technical question and review 3 concepts daily.', weeklyGoal: 'Complete 2 DSA Mock Interviews.' },
    week2: { title: 'Week 2: Data Structures & Communication', focus: ['Trees & Graphs', 'STAR Method', 'Voice Articulation'], dailyGoal: 'Practice 15-minute voice transcript session daily.', weeklyGoal: 'Complete 2 Full Stack / DSA Voice Interviews.' },
    week3: { title: 'Week 3: System Design & Architecture', focus: ['Database Sharding', 'Microservices', 'Load Balancing'], dailyGoal: 'Study 1 System Design architectural case study daily.', weeklyGoal: 'Complete 1 System Design Mock Panel.' },
    week4: { title: 'Week 4: Comprehensive Mock & Hard Level', focus: ['Hard Difficulty Coding', 'Executive Behavioral', 'Final Readiness'], dailyGoal: 'Run timed mock sessions under strict timer constraints.', weeklyGoal: 'Achieve 85+ score on 3 consecutive mock sessions.' },
    recommendedFrequency: '3 sessions per week',
    recommendedDifficulty: 'Medium -> Hard',
    suggestedNextType: 'Full Stack / System Design Voice Interview',
    estimatedImprovementTimeline: '2-3 Weeks to reach 85+ readiness rating'
  };

  const weeks = [
    { key: 'week1', data: plan.week1, badge: 'Phase 1' },
    { key: 'week2', data: plan.week2, badge: 'Phase 2' },
    { key: 'week3', data: plan.week3, badge: 'Phase 3' },
    { key: 'week4', data: plan.week4, badge: 'Phase 4' }
  ];

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <h4 className="analytics-card-title">
          <span>📅</span> Personalized 4-Week AI Practice Roadmap
        </h4>
        <span className="analytics-badge badge-indigo">
          ⏱️ {plan.estimatedImprovementTimeline || '2-3 Weeks Goal'}
        </span>
      </div>

      {/* Recommended Strategy Pills */}
      <div className="strategy-tiles-grid">
        <div className="strategy-tile">
          <span>Recommended Frequency:</span>
          <strong>{plan.recommendedFrequency}</strong>
        </div>
        <div className="strategy-tile">
          <span>Target Progression:</span>
          <strong>{plan.recommendedDifficulty}</strong>
        </div>
        <div className="strategy-tile">
          <span>Suggested Next Panel:</span>
          <strong>{plan.suggestedNextType}</strong>
        </div>
      </div>

      {/* 4-Week Roadmap Timeline Cards */}
      <div className="roadmap-grid">
        {weeks.map((w, idx) => (
          <div key={idx} className="roadmap-week-card">
            <span className="week-phase-badge">{w.badge}</span>
            <h5 className="week-card-title">{w.data?.title || `Week ${idx + 1}`}</h5>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Focus Topics:</span>
              <div className="focus-pills-list">
                {w.data?.focus?.map((f, fIdx) => (
                  <span key={fIdx} className="topic-pill">{f}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <div className="goal-line"><strong>Daily:</strong> {w.data?.dailyGoal}</div>
              <div className="goal-line"><strong>Weekly:</strong> {w.data?.weeklyGoal}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PracticePlanCard;
