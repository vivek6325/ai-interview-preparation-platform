import React from 'react';
import './AnalyticsComponents.css';

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
    if (urgency === 'High') return <span className="analytics-badge badge-crimson">🔥 High Urgency Action</span>;
    if (urgency === 'Medium') return <span className="analytics-badge badge-amber">⚡ Medium Priority</span>;
    return <span className="analytics-badge badge-emerald">✓ Low Risk</span>;
  };

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <h4 className="analytics-card-title">
          <span>🔍</span> AI Weakness & Risk Detection Engine
        </h4>
        {getUrgencyBadge()}
      </div>

      <div className="analytics-grid-2col">
        {/* Strengths Column */}
        <div className="strengths-box">
          <h5 className="box-heading-emerald">💪 Top Identified Strengths</h5>
          <ul className="skill-list-clean">
            {strengths.map((item, idx) => (
              <li key={idx} className="skill-item-row">
                <span>✓ {item.skill}</span>
                <span className="analytics-badge badge-emerald">{item.score}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Column */}
        <div className="weaknesses-box">
          <h5 className="box-heading-crimson">⚠️ Top Areas for Improvement</h5>
          <ul className="skill-list-clean">
            {weaknesses.map((item, idx) => (
              <li key={idx} className="skill-item-row">
                <span>✗ {item.skill}</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="analytics-badge badge-crimson">{item.score}%</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.impact} Impact</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Priority Action Items */}
      <div className="priority-items-container">
        <h5 className="priority-heading">🎯 Recommended Priority Action Items</h5>
        <ol className="priority-ol">
          {priorityList.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default WeaknessPriorityCard;
