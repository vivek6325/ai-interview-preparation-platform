import React from 'react';
import Badge from './Badge';
import './SectionHeader.css';

/**
 * Vercel Design System - SectionHeader Component
 */
export function SectionHeader({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'primary',
  icon: Icon,
  action,
  className = ''
}) {
  return (
    <div className={`ds-section-header ${className}`}>
      <div className="ds-section-header-left">
        {badgeText && (
          <Badge variant={badgeVariant} size="sm" icon={Icon} className="ds-section-badge">
            {badgeText}
          </Badge>
        )}

        <h2 className="ds-section-title">
          {Icon && !badgeText && <Icon className="ds-section-icon" size={20} />}
          <span>{title}</span>
        </h2>

        {subtitle && <p className="ds-section-subtitle">{subtitle}</p>}
      </div>

      {action && <div className="ds-section-header-right">{action}</div>}
    </div>
  );
}

export default SectionHeader;
