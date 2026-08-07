import React from 'react';
import './Badge.css';

/**
 * Vercel Design System - Badge Component
 */
export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span className={`ds-badge ds-badge-${variant} ds-badge-${size} ${className}`} {...props}>
      {Icon && <Icon className="ds-badge-icon" size={size === 'sm' ? 12 : 14} />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
