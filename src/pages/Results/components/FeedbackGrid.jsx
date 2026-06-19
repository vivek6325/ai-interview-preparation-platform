
/**
 * FeedbackGrid Component
 * Displays split cards listing key strengths and areas of improvements.
 */
export function FeedbackGrid({ strengths, improvements }) {
  return (
    <div className="feedback-split-grid">
      {/* Strengths Column */}
      <div className="feedback-column strengths-card">
        <div className="column-header">
          <span className="header-icon green">✨</span>
          <h2>Key Strengths</h2>
        </div>
        {strengths.length > 0 ? (
          <ul className="feedback-bullets">
            {strengths.map((item, idx) => (
              <li key={idx} className="feedback-bullet-item">
                <span className="item-emoji">🎯</span>
                <div className="item-content">
                  <strong>Point {idx + 1}</strong>
                  <p>{item}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No key strengths compiled.</p>
        )}
      </div>

      {/* Improvements Column */}
      <div className="feedback-column improvements-card">
        <div className="column-header">
          <span className="header-icon amber">🎯</span>
          <h2>Areas for Improvement</h2>
        </div>
        {improvements.length > 0 ? (
          <ul className="feedback-bullets">
            {improvements.map((item, idx) => (
              <li key={idx} className="feedback-bullet-item">
                <span className="item-emoji">💡</span>
                <div className="item-content">
                  <strong>Area {idx + 1}</strong>
                  <p>{item}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No improvement areas compiled.</p>
        )}
      </div>
    </div>
  );
}

export default FeedbackGrid;
