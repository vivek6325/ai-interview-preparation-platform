import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * MetricCard Component
 * Premium KPI metric card with Lucide icons, trend badges, mini progress bars, and hover animations.
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'stable',
  badgeText,
  badgeColor = 'primary',
  progress,
  subtitle,
  accentColor = 'indigo'
}) {
  return (
    <div className={`metric-card metric-card-${accentColor}`}>
      <div className="metric-card-top">
        <div className={`metric-icon-badge icon-bg-${accentColor}`}>
          {Icon && <Icon size={20} />}
        </div>

        {trend !== undefined && trend !== null && (
          <div className={`metric-trend-pill trend-${trendDirection}`}>
            {trendDirection === 'up' && <ArrowUpRight size={13} />}
            {trendDirection === 'down' && <ArrowDownRight size={13} />}
            {trendDirection === 'stable' && <Minus size={13} />}
            <span>{typeof trend === 'number' ? `${trend > 0 ? '+' : ''}${trend}%` : trend}</span>
          </div>
        )}

        {badgeText && (
          <span className={`metric-badge-tag badge-${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="metric-card-body">
        <span className="metric-title-label">{title}</span>
        <div className="metric-large-value">{value}</div>
      </div>

      {progress !== undefined && progress !== null && (
        <div className="metric-progress-wrapper">
          <div className="metric-progress-track">
            <div
              className={`metric-progress-fill fill-${accentColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        </div>
      )}

      {subtitle && <span className="metric-subtitle-text">{subtitle}</span>}
    </div>
  );
}

export default MetricCard;
