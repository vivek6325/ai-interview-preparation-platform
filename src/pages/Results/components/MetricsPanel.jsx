import React from 'react';

/**
 * MetricsPanel Component
 * Renders technical and communication dimension metric progress bars.
 */
export function MetricsPanel({ metrics }) {
  return (
    <div className="metrics-panel">
      <h3>Dimension Breakdown</h3>
      <div className="metrics-list">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-bar-group">
            <div className="metric-bar-header">
              <div className="metric-meta">
                <span className="metric-title">{metric.name}</span>
                <span className="metric-desc">{metric.description}</span>
              </div>
              <span className="metric-score-text" style={{ color: metric.color }}>{metric.score}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${metric.score}%`, backgroundColor: metric.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MetricsPanel;
