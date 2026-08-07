import React from 'react';
import './Card.css';

/**
 * Vercel Design System - Card Components
 */
export function Card({ children, className = '', glow = false, ...props }) {
  return (
    <div className={`ds-card ${glow ? 'ds-card-glow' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`ds-card-header ${className}`}>
      {children || (
        <>
          <div className="ds-card-header-titles">
            {title && <h3 className="ds-card-title">{title}</h3>}
            {subtitle && <p className="ds-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="ds-card-header-action">{action}</div>}
        </>
      )}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`ds-card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`ds-card-footer ${className}`}>{children}</div>;
}

export function GlassCard({ children, className = '', ...props }) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function TopGradientCard({ children, color = 'blue', className = '', ...props }) {
  return (
    <Card className={`gradient-border-top-${color} ${className}`} {...props}>
      {children}
    </Card>
  );
}

export default Card;
