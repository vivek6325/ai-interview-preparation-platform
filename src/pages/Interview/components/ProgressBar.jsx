import React from 'react';

/**
 * ProgressBar Component
 * Renders the top progression bar matching the candidate's active question.
 */
export function ProgressBar({ percent }) {
  return (
    <div className="interview-progress-wrapper" style={{ width: '100%', marginBottom: '2rem' }}>
      <div className="progress-bar-bg" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${percent}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
            transition: 'width 0.4s ease'
          }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
