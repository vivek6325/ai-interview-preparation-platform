import React from 'react';

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
    <div className="row g-3">
      {/* 1. Interview Types Doughnut Breakdown */}
      <div className="col-12 col-md-6">
        <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm h-100">
          <h4 className="h6 fw-bold mb-3 text-info text-uppercase tracking-wider">🍩 Interview Category Distribution</h4>

          <div className="d-flex flex-column align-items-center">
            {/* SVG Doughnut */}
            <div className="position-relative" style={{ width: '160px', height: '160px' }}>
              <svg width="160" height="160" viewBox="0 0 100 100" className="transform-rotate-neg90">
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

              <div className="position-absolute top-50 start-50 translate-middle text-center">
                <div className="fs-4 fw-bold text-light">{totalTypes}</div>
                <div className="fs-8 text-muted">Sessions</div>
              </div>
            </div>

            {/* Type Legend List */}
            <div className="w-100 mt-3 d-flex flex-wrap justify-content-center gap-2">
              {Object.entries(types).map(([key, count], idx) => (
                <span key={idx} className="badge bg-dark border border-secondary text-light fs-8 px-2 py-1">
                  <span style={{ color: typeColors[key] || '#94a3b8' }}>● </span>
                  {key}: <strong>{count}</strong> ({Math.round((count / totalTypes) * 100)}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Difficulty Bar Breakdown */}
      <div className="col-12 col-md-6">
        <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm h-100">
          <h4 className="h6 fw-bold mb-3 text-info text-uppercase tracking-wider">📊 Difficulty Level Distribution</h4>

          <div className="d-flex flex-column gap-3 justify-content-center h-100">
            {Object.entries(difficulties).map(([diffKey, count], idx) => {
              const pct = Math.round((count / totalDiff) * 100);
              return (
                <div key={idx}>
                  <div className="d-flex justify-content-between fs-7 mb-1">
                    <span className="fw-semibold" style={{ color: diffColors[diffKey] }}>
                      {diffKey} Track
                    </span>
                    <span className="text-muted fs-8">
                      {count} Sessions ({pct}%)
                    </span>
                  </div>

                  <div className="progress bg-black bg-opacity-40" style={{ height: '10px' }}>
                    <div
                      className="progress-bar rounded-pill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: diffColors[diffKey] || '#6366f1'
                      }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistributionCharts;
