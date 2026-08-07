import React from 'react';
import { Card, CardHeader } from './Card';
import { Loader2 } from 'lucide-react';
import './ChartContainer.css';

/**
 * Vercel Design System - ChartContainer Component
 */
export function ChartContainer({
  title,
  subtitle,
  children,
  action,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No chart data available yet.',
  className = '',
  ...props
}) {
  return (
    <Card className={`ds-chart-container ${className}`} {...props}>
      <CardHeader title={title} subtitle={subtitle} action={action} />

      <div className="ds-chart-body">
        {isLoading ? (
          <div className="ds-chart-loading text-center py-5">
            <Loader2 className="ds-btn-spinner text-blue" size={32} />
            <p className="text-secondary mt-2 fs-7">Rendering visualization...</p>
          </div>
        ) : isEmpty ? (
          <div className="ds-chart-empty text-center py-5">
            <p className="text-secondary fs-7">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

export default ChartContainer;
