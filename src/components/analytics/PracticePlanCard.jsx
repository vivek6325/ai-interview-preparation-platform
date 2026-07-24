import React from 'react';

/**
 * PracticePlanCard Component
 * Personalized 4-Week Practice Plan Roadmap.
 * 
 * @param {Object} props
 * @param {Object} props.data - Practice plan object from analytics backend
 */
export function PracticePlanCard({ data }) {
  const plan = data || {
    week1: { title: 'Week 1: Core Fundamentals & DSA', focus: ['Arrays', 'HashMaps'], dailyGoal: '1 question daily', weeklyGoal: '2 DSA sessions' },
    week2: { title: 'Week 2: Data Structures & Communication', focus: ['Trees', 'STAR Method'], dailyGoal: '15-min transcript daily', weeklyGoal: '2 Voice sessions' },
    week3: { title: 'Week 3: System Design & Architecture', focus: ['Sharding', 'Load Balancing'], dailyGoal: '1 Architecture case daily', weeklyGoal: '1 System session' },
    week4: { title: 'Week 4: Comprehensive Mock & Hard Level', focus: ['Hard Coding', 'Mock Panels'], dailyGoal: 'Timed mock sessions', weeklyGoal: 'Achieve 85+ score' },
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
    <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-4 shadow-sm h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="h5 fw-bold mb-0 text-info d-flex align-items-center gap-2">
          <span>📅</span> Personalized 4-Week AI Practice Roadmap
        </h4>
        <span className="badge bg-primary-subtle text-primary border border-primary fs-8">
          ⏱️ {plan.estimatedImprovementTimeline || '2-3 Weeks Goal'}
        </span>
      </div>

      {/* Recommended Strategy Pills */}
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25 fs-8 text-secondary">
            <span>Recommended Frequency: </span>
            <strong className="text-light">{plan.recommendedFrequency}</strong>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25 fs-8 text-secondary">
            <span>Target Progression: </span>
            <strong className="text-light">{plan.recommendedDifficulty}</strong>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25 fs-8 text-secondary">
            <span>Suggested Next Panel: </span>
            <strong className="text-light">{plan.suggestedNextType}</strong>
          </div>
        </div>
      </div>

      {/* 4-Week Roadmap Timeline Cards */}
      <div className="row g-3">
        {weeks.map((w, idx) => (
          <div key={idx} className="col-12 col-md-6 col-lg-3">
            <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100 position-relative">
              <span className="badge bg-info-subtle text-info fs-8 position-absolute top-0 end-0 m-2">{w.badge}</span>
              <h5 className="h6 fw-bold text-light mb-2 pe-4">{w.data?.title || `Week ${idx + 1}`}</h5>

              <div className="mb-2">
                <span className="fs-8 text-muted d-block fw-semibold mb-1">Focus Topics:</span>
                <div className="d-flex flex-wrap gap-1">
                  {w.data?.focus?.map((f, fIdx) => (
                    <span key={fIdx} className="badge bg-dark border border-secondary text-info fs-8">{f}</span>
                  ))}
                </div>
              </div>

              <div className="fs-8 text-secondary mt-2">
                <div><strong>Daily:</strong> {w.data?.dailyGoal}</div>
                <div><strong>Weekly:</strong> {w.data?.weeklyGoal}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PracticePlanCard;
