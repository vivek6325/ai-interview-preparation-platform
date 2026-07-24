import React from 'react';

/**
 * WeaknessPriorityCard Component
 * Displays Weakness Detection findings: Top 5 Strengths, Top 5 Weaknesses, Urgency pill, and Priority List.
 * 
 * @param {Object} props
 * @param {Object} props.data - { topWeaknesses: [], topStrengths: [], priorityList: [], urgencyLevel: 'High' }
 */
export function WeaknessPriorityCard({ data }) {
  const weaknesses = data?.topWeaknesses || [
    { skill: 'Communication Structure', score: 72, impact: 'High' },
    { skill: 'System Design Edge Cases', score: 68, impact: 'High' },
    { skill: 'Complexity Analysis (Big-O)', score: 74, impact: 'Medium' }
  ];

  const strengths = data?.topStrengths || [
    { skill: 'Technical Concept Definition', score: 85 },
    { skill: 'Coding Fundamentals', score: 88 },
    { skill: 'Confidence & Demeanor', score: 80 }
  ];

  const priorityList = data?.priorityList || [
    'Master STAR technique for behavioral questions.',
    'Practice System Design trade-offs (Caching & Load Balancing).'
  ];

  const urgency = data?.urgencyLevel || 'Medium';

  const getUrgencyBadge = () => {
    if (urgency === 'High') return <span className="badge bg-danger-subtle text-danger border border-danger">🔥 High Urgency Action</span>;
    if (urgency === 'Medium') return <span className="badge bg-warning-subtle text-warning border border-warning">⚡ Medium Priority</span>;
    return <span className="badge bg-success-subtle text-success border border-success">✓ Low Risk</span>;
  };

  return (
    <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-4 shadow-sm h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="h5 fw-bold mb-0 text-info d-flex align-items-center gap-2">
          <span>🔍</span> AI Weakness & Risk Detection Engine
        </h4>
        {getUrgencyBadge()}
      </div>

      <div className="row g-3">
        {/* Strengths Column */}
        <div className="col-12 col-md-6">
          <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-success border-opacity-25">
            <h5 className="h6 fw-bold text-success mb-3">💪 Top 5 Identified Strengths</h5>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              {strengths.map((item, idx) => (
                <li key={idx} className="d-flex justify-content-between align-items-center fs-7 text-light">
                  <span>✓ {item.skill}</span>
                  <span className="badge bg-success-subtle text-success">{item.score}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Weaknesses Column */}
        <div className="col-12 col-md-6">
          <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-danger border-opacity-25">
            <h5 className="h6 fw-bold text-danger mb-3">⚠️ Top 5 Areas for Improvement</h5>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              {weaknesses.map((item, idx) => (
                <li key={idx} className="d-flex justify-content-between align-items-center fs-7 text-light">
                  <span>✗ {item.skill}</span>
                  <div className="d-flex gap-1 align-items-center">
                    <span className="badge bg-danger-subtle text-danger">{item.score}%</span>
                    <span className="badge bg-dark text-muted fs-8">{item.impact} Impact</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Priority Action Items */}
      <div className="mt-4 p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25">
        <h5 className="h6 fw-bold text-warning mb-2">🎯 Recommended Priority Action Items</h5>
        <ol className="mb-0 ps-3 fs-7 text-secondary">
          {priorityList.map((item, idx) => (
            <li key={idx} className="mb-1">{item}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default WeaknessPriorityCard;
