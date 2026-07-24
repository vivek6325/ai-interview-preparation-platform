import React from 'react';

/**
 * ScoreTimelineChart Component
 * Pure SVG Line & Area chart depicting score progress over time with rolling average.
 * 
 * @param {Object} props
 * @param {Object} props.data - { labels: ['Session 1', ...], scores: [70, 85, ...], rollingAverage: [70, 78, ...] }
 * @param {number} [props.height=240]
 */
export function ScoreTimelineChart({ data, height = 240 }) {
  const labels = data?.labels || ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];
  const scores = data?.scores || [65, 72, 80, 78, 88];
  const rollingAverage = data?.rollingAverage || [65, 68, 72, 75, 80];

  const width = 600;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 100;
  const minVal = 0;

  const getX = (index) => {
    if (labels.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (labels.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return paddingTop + chartHeight - ((clamped - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Generate Score Line & Area points
  const scorePointsArr = scores.map((val, idx) => `${getX(idx)},${getY(val)}`);
  const scorePath = scorePointsArr.join(' ');
  const areaPath = `${paddingLeft},${paddingTop + chartHeight} ${scorePath} ${getX(scores.length - 1)},${paddingTop + chartHeight}`;

  // Generate Rolling Average Line points
  const rollingPath = rollingAverage.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');

  return (
    <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm text-center h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="h6 fw-bold mb-0 text-info text-uppercase tracking-wider">📈 Score History & Rolling Progress</h4>
        <div className="d-flex gap-3 fs-8">
          <span className="text-primary font-bold">● Score</span>
          <span className="text-warning font-bold">-- 3-Session Rolling Avg</span>
        </div>
      </div>

      <div className="svg-responsive-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-100 h-auto">
          {/* Y-Axis Horizontal Grid Lines */}
          {[0, 25, 50, 75, 100].map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                <text x={paddingLeft - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area Gradient Fill */}
          <defs>
            <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Filled Area */}
          {scores.length > 0 && <polyline points={areaPath} fill="url(#scoreAreaGrad)" />}

          {/* Primary Score Line */}
          {scores.length > 0 && <polyline points={scorePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Rolling Average Line */}
          {rollingAverage.length > 0 && (
            <polyline points={rollingPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
          )}

          {/* Score Data Circles */}
          {scores.map((val, idx) => {
            const cx = getX(idx);
            const cy = getY(val);
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="5" fill="#818cf8" stroke="#1e1b4b" strokeWidth="2" />
                <text x={cx} y={cy - 10} fill="#a5b4fc" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {val}
                </text>
                <text x={cx} y={height - 10} fill="#64748b" fontSize="10" textAnchor="middle">
                  {labels[idx] || `S${idx + 1}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default ScoreTimelineChart;
