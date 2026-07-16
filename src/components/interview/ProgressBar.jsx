import './ProgressBar.css';

/**
 * Reusable Progress Bar Component
 * Displays question counts (e.g. Question 2 of 10) and completion percentages.
 */
function ProgressBar({ current = 1, total = 5 }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="interview-progress-wrapper">
      <div className="progress-label-row">
        <span className="progress-indicator-text">Question {current} of {total}</span>
        <span className="progress-percentage-text">{percentage}% Complete</span>
      </div>
      <div className="interview-progress-bar-bg">
        <div 
          className="interview-progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
