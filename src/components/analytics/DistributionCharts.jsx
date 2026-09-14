import './AnalyticsComponents.css';

/**
 * DistributionCharts Component
 * Displays SVG Doughnut Chart for Interview Types and Bar Chart for Difficulty Breakdown.
 * 
 * @param {Object} props
 * @param {Object} props.typeData - { HR: 2, DSA: 3, 'System Design': 1, Behavioral: 2, Mixed: 4 }
 * @param {Object} props.difficultyData - { Easy: 3, Medium: 6, Hard: 2 }
 */
export function DistributionCharts({ typeData, difficultyData }) {
  const types = typeData || { HR: 2, DSA: 4, 'System Design': 2, Behavioral: 3, Mixed: 5 };
  const difficulties = difficultyData || { Easy: 3, Medium: 6, Hard: 2 };

  const totalTypes = Object.values(types).reduce((a, b) => a + b, 0) || 1;
  const totalDiff = Object.values(difficulties).reduce((a, b) => a + b, 0) || 1;

  const typeColors = {
    HR: '#38bdf8',
    DSA: '#818cf8',
    'System Design': '#c084fc',
    Behavioral: '#f472b6',
    Mixed: '#34d399'
  };

  const diffColors = {
    Easy: '#34d399',
    Medium: '#fbbf24',
    Hard: '#f87171'
  };

  return (
    <div className="analytics-grid-2col">
      {/* 1. Interview Types Doughnut Breakdown */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <h4 className="analytics-card-title">🍩 Interview Category Distribution</h4>
        </div>

        <div className="doughnut-wrapper">
          <svg width="160" height="160" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            {(() => {
              let accumulatedPercent = 0;
              return Object.entries(types).map(([key, count], idx) => {
                const percent = count / totalTypes;
                const strokeDasharray = `${percent * 283} ${283 - percent * 283}`;
                const strokeDashoffset = -accumulatedPercent * 283;
                accumulatedPercent += percent;
                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke={typeColors[key] || '#94a3b8'}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              });
            })()}
          </svg>

          <div className="doughnut-center-label">
            <div className="doughnut-center-value">{totalTypes}</div>
            <div className="doughnut-center-sub">Sessions</div>
          </div>
        </div>

        {/* Type Legend List */}
        <div className="legend-pills-wrap">
          {Object.entries(types).map(([key, count], idx) => (
            <span key={idx} className="legend-pill">
              <span style={{ color: typeColors[key] || '#94a3b8' }}>● </span>
              {key}: <strong>{count}</strong> ({Math.round((count / totalTypes) * 100)}%)
            </span>
          ))}
        </div>
      </div>

      {/* 2. Difficulty Bar Breakdown */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <h4 className="analytics-card-title">📊 Difficulty Level Distribution</h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', height: '100%' }}>
          {Object.entries(difficulties).map(([diffKey, count], idx) => {
            const pct = Math.round((count / totalDiff) * 100);
            return (
              <div key={idx} className="difficulty-bar-item">
                <div className="difficulty-bar-header">
                  <span style={{ fontWeight: 600, color: diffColors[diffKey] }}>
                    {diffKey} Track
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {count} Sessions ({pct}%)
                  </span>
                </div>

                <div className="difficulty-progress-track">
                  <div
                    className="difficulty-progress-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: diffColors[diffKey] || '#6366f1'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DistributionCharts;
