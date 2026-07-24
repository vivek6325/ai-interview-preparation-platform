import React from 'react';

/**
 * ActivityHeatmap Component
 * Calendar heatmap grid showing interview activity density across days.
 * 
 * @param {Object} props
 * @param {Object} props.activityMap - { '2026-07-20': 2, '2026-07-22': 1, ... }
 */
export function ActivityHeatmap({ activityMap = {} }) {
  // Generate past 28 days
  const days = [];
  const today = new Date();

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = activityMap[dateStr] || 0;
    days.push({
      dateStr,
      dayNum: d.getDate(),
      monthName: d.toLocaleString('default', { month: 'short' }),
      count
    });
  }

  const getHeatColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.05)';
    if (count === 1) return 'rgba(99, 102, 241, 0.4)';
    if (count === 2) return 'rgba(99, 102, 241, 0.7)';
    return '#6366f1';
  };

  return (
    <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm text-center h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="h6 fw-bold mb-0 text-info text-uppercase tracking-wider">🗓️ Practice Activity Heatmap</h4>
        <span className="text-muted fs-8">Past 28 Days</span>
      </div>

      <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((item, idx) => (
          <div
            key={idx}
            className="p-2 rounded border border-secondary border-opacity-25 d-flex flex-column align-items-center justify-content-center transition-hover"
            style={{
              backgroundColor: getHeatColor(item.count),
              minHeight: '44px'
            }}
            title={`${item.dateStr}: ${item.count} interview session(s)`}
          >
            <span className="fs-8 fw-bold text-light">{item.dayNum}</span>
            <span className="fs-8 text-secondary">{item.monthName}</span>
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center justify-content-end gap-2 mt-3 fs-8 text-muted">
        <span>Less</span>
        <span className="d-inline-block rounded-1" style={{ width: 12, height: 12, background: 'rgba(255, 255, 255, 0.05)' }}></span>
        <span className="d-inline-block rounded-1" style={{ width: 12, height: 12, background: 'rgba(99, 102, 241, 0.4)' }}></span>
        <span className="d-inline-block rounded-1" style={{ width: 12, height: 12, background: '#6366f1' }}></span>
        <span>More</span>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
