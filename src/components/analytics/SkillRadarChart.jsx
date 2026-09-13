import React from 'react';
import './AnalyticsComponents.css';

/**
 * SkillRadarChart Component
 * Pure SVG Radar Chart visualizing 6 core skill dimensions.
 * 
 * @param {Object} props
 * @param {Array<Object>} props.data - [{ subject: 'Communication', score: 85 }, ...]
 * @param {number} [props.size=300] - SVG viewport size
 */
export function SkillRadarChart({ data = [], size = 300 }) {
  const defaultSkills = [
    { subject: 'Communication', score: 75 },
    { subject: 'Technical', score: 82 },
    { subject: 'Confidence', score: 80 },
    { subject: 'Problem Solving', score: 78 },
    { subject: 'Behavioral', score: 74 },
    { subject: 'Coding', score: 85 }
  ];

  const skills = data && data.length > 0 ? data : defaultSkills;
  const numAxes = skills.length;
  const center = size / 2;
  const radius = size * 0.35;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index, valueRatio) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate data polygon points
  const points = skills
    .map((item, idx) => {
      const ratio = Math.max(0, Math.min(100, item.score || 0)) / 100;
      const { x, y } = getCoordinates(idx, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <h4 className="analytics-card-title">🎯 Multi-Dimensional Skill Radar</h4>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
          {/* Concentric Grid Web Polygons */}
          {levels.map((levelRatio, lIdx) => {
            const gridPoints = skills
              .map((_, idx) => {
                const { x, y } = getCoordinates(idx, levelRatio);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={lIdx}
                points={gridPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeDasharray={lIdx === levels.length - 1 ? 'none' : '3 3'}
                strokeWidth="1"
              />
            );
          })}

          {/* Axis Radial Lines */}
          {skills.map((item, idx) => {
            const end = getCoordinates(idx, 1.0);
            const labelPos = getCoordinates(idx, 1.18);
            return (
              <g key={idx}>
                <line x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {item.subject} ({item.score}%)
                </text>
              </g>
            );
          })}

          {/* User Score Data Polygon */}
          <polygon points={points} fill="rgba(99, 102, 241, 0.35)" stroke="#6366f1" strokeWidth="2.5" />

          {/* Data Points */}
          {skills.map((item, idx) => {
            const ratio = Math.max(0, Math.min(100, item.score || 0)) / 100;
            const { x, y } = getCoordinates(idx, ratio);
            return <circle key={idx} cx={x} cy={y} r="4" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2" />;
          })}
        </svg>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        💡 <em>Visualizes performance distribution across core technical & communication axes.</em>
      </div>
    </div>
  );
}

export default SkillRadarChart;
