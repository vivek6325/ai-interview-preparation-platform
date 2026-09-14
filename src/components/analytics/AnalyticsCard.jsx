/**
 * AnalyticsCard Component
 * SaaS style metric card displaying statistic values, trend indicators, and progress bars.
 * 
 * @param {Object} props
 * @param {string} props.title - Card header label
 * @param {string|number} props.value - Primary metric value
 * @param {string} [props.icon] - Emoji or icon
 * @param {string} [props.subtitle] - Supporting description
 * @param {number} [props.trend] - Percentage change (+15 or -5)
 * @param {string} [props.trendDirection] - 'up' | 'down' | 'stable'
 * @param {number} [props.progress] - Optional progress bar percentage (0-100)
 * @param {string} [props.badgeText] - Pill badge text
 * @param {string} [props.badgeColor] - Badge theme color
 */
export function AnalyticsCard({
  title,
  value,
  icon = '📊',
  subtitle,
  trend,
  trendDirection,
  progress,
  badgeText,
  badgeColor = 'info'
}) {
  const getTrendIcon = () => {
    if (trendDirection === 'up' || (trend && trend > 0)) return '📈 ↑';
    if (trendDirection === 'down' || (trend && trend < 0)) return '📉 ↓';
    return '➡️';
  };

  const getTrendClass = () => {
    if (trendDirection === 'up' || (trend && trend > 0)) return 'text-success';
    if (trendDirection === 'down' || (trend && trend < 0)) return 'text-danger';
    return 'text-muted';
  };

  return (
    <div className="card bg-dark text-light border border-secondary border-opacity-25 rounded-4 p-3 shadow-sm h-100 transition-hover">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="text-muted fs-7 font-semibold text-uppercase tracking-wider">{title}</span>
        <div className="d-flex align-items-center gap-2">
          {badgeText && (
            <span className={`badge bg-${badgeColor}-subtle text-${badgeColor} border border-${badgeColor}-subtle fs-8`}>
              {badgeText}
            </span>
          )}
          <span className="fs-5">{icon}</span>
        </div>
      </div>

      <div className="d-flex align-items-baseline gap-2 my-1">
        <h3 className="display-6 fw-bold mb-0 text-light">{value}</h3>
        {trend !== undefined && (
          <span className={`fs-7 fw-bold ${getTrendClass()}`}>
            {getTrendIcon()} {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="progress my-2" style={{ height: '6px' }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar bg-primary" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}></div>
        </div>
      )}

      {subtitle && <p className="text-secondary fs-8 mb-0 mt-1">{subtitle}</p>}
    </div>
  );
}

export default AnalyticsCard;
