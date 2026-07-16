import { useState, useEffect, useRef } from 'react';
import './Timer.css';

/**
 * Reusable Countdown Timer Component
 * Supports Start, Pause, Resume, Reset, Countdown display, and time-up callback triggers.
 */
function Timer({ initialSeconds = 60, onTimeUp, autoStart = true }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(initialSeconds);
    setIsActive(autoStart);
  }, [initialSeconds, autoStart]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, onTimeUp]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleResume = () => setIsActive(true);
  const handleReset = () => {
    setIsActive(false);
    setSeconds(initialSeconds);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`timer-container ${seconds < 15 ? 'timer-warning' : ''}`}>
      <div className="timer-display">
        <span className="timer-clock-icon">⏳</span>
        <span className="timer-digits">{formatTime(seconds)}</span>
      </div>
      <div className="timer-controls">
        {!isActive ? (
          <button className="timer-btn play" onClick={handleResume} title="Start/Resume Timer">▶</button>
        ) : (
          <button className="timer-btn pause" onClick={handlePause} title="Pause Timer">⏸</button>
        )}
        <button className="timer-btn reset" onClick={handleReset} title="Reset Timer">🔄</button>
      </div>
    </div>
  );
}

export default Timer;
