import { Package } from 'lucide-react';
import Button from './Button';
import './EmptyState.css';

/**
 * Vercel Design System - EmptyState Component
 */
export function EmptyState({
  icon: Icon = Package,
  title = 'No Data Found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`ds-empty-state ${className}`}>
      <div className="ds-empty-icon-wrapper">
        <Icon size={28} />
      </div>

      <h3 className="ds-empty-title">{title}</h3>
      <p className="ds-empty-description">{description}</p>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="ds-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
