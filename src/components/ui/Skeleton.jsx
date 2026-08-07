import React from 'react';
import './Skeleton.css';

/**
 * Vercel Design System - Skeleton Component Suite
 */
export function SkeletonText({ lines = 1, width = '100%', height = '16px', className = '' }) {
  return (
    <div className={`ds-skeleton-text-group ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="ds-skeleton skeleton-shimmer"
          style={{ width: idx === lines - 1 && lines > 1 ? '70%' : width, height }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = '48px', className = '' }) {
  return (
    <div
      className={`ds-skeleton ds-skeleton-circle skeleton-shimmer ${className}`}
      style={{ width: size, height: size }}
    ></div>
  );
}

export function SkeletonCard({ height = '160px', className = '' }) {
  return (
    <div
      className={`ds-skeleton ds-skeleton-card skeleton-shimmer ${className}`}
      style={{ height }}
    ></div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`ds-skeleton-table ${className}`}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="ds-skeleton-table-row">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="ds-skeleton skeleton-shimmer"
              style={{ height: '20px', width: `${90 - cIdx * 15}%` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default SkeletonText;
