import './AnalyticsComponents.css';

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
    if (count === 0) return 'rgba(255, 255, 255, 0.04)';
    if (count === 1) return 'rgba(99, 102, 241, 0.4)';
    if (count === 2) return 'rgba(99, 102, 241, 0.7)';
    return '#6366f1';
  };

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <h4 className="analytics-card-title">🗓️ Practice Activity Heatmap</h4>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Past 28 Days</span>
      </div>

      <div className="heatmap-grid-28">
        {days.map((item, idx) => (
          <div
            key={idx}
            className="heatmap-day-cell"
            style={{
              backgroundColor: getHeatColor(item.count)
            }}
            title={`${item.dateStr}: ${item.count} interview session(s)`}
          >
            <span className="heatmap-num">{item.dayNum}</span>
            <span className="heatmap-month">{item.monthName}</span>
          </div>
        ))}
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <span className="legend-square" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)' }}></span>
        <span className="legend-square" style={{ background: 'rgba(99, 102, 241, 0.4)' }}></span>
        <span className="legend-square" style={{ background: '#6366f1' }}></span>
        <span>More</span>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
