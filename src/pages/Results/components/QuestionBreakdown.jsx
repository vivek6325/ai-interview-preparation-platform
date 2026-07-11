import { useState } from 'react';

/**
 * QuestionBreakdown Component
 * Renders an interactive Accordion showing per-question scoring, answers, and AI critiques.
 */
export function QuestionBreakdown({ questionsBreakdown }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section className="detailed-feedback-section">
      <h2>Question-by-Question Breakdown</h2>
      <div className="accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        {questionsBreakdown.map((item, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div 
              key={item.number} 
              className={`accordion-item ${isExpanded ? 'active' : ''}`}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'var(--transition-smooth)',
                boxShadow: isExpanded ? '0 10px 25px rgba(99, 102, 241, 0.08)' : 'none'
              }}
            >
              {/* Header */}
              <div 
                className="accordion-header"
                onClick={() => toggleAccordion(idx)}
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpanded ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isExpanded ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}
                  >
                    Q{item.number}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', color: isExpanded ? '#fff' : 'var(--text-secondary)', fontWeight: '600' }}>
                    {item.question}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span 
                    className="question-score-badge"
                    style={{
                      background: item.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : item.score >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: item.score >= 80 ? '#10b981' : item.score >= 60 ? '#f59e0b' : '#ef4444',
                      border: `1px solid ${item.score >= 80 ? 'rgba(16, 185, 129, 0.2)' : item.score >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      borderRadius: '8px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    {item.score}%
                  </span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Body */}
              {isExpanded && (
                <div 
                  className="accordion-body"
                  style={{
                    padding: '1.5rem',
                    borderTop: '1px solid var(--border)',
                    background: 'rgba(13, 18, 30, 0.4)',
                    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Candidate Answer */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Your Submitted Answer
                    </h5>
                    <blockquote 
                      style={{
                        margin: 0,
                        padding: '1rem 1.25rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderLeft: '4px solid var(--primary)',
                        borderRadius: '0 8px 8px 0',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                        lineHeight: '1.6',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      "{item.userAnswer}"
                    </blockquote>
                  </div>

                  {/* AI Feedback */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      AI Performance Feedback
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {item.feedback}
                    </p>
                  </div>

                  {/* Strength & Area for Improvement */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div 
                      style={{
                        padding: '1rem',
                        background: 'rgba(16, 185, 129, 0.02)',
                        border: '1px solid rgba(16, 185, 129, 0.08)',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>🔥</span>
                        <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>Key Strength</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {item.strength}
                      </p>
                    </div>

                    <div 
                      style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.02)',
                        border: '1px solid rgba(239, 68, 68, 0.08)',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>💡</span>
                        <strong style={{ fontSize: '0.85rem', color: '#f87171' }}>Area for Growth</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {item.improvement}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default QuestionBreakdown;
