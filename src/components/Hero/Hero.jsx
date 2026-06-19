import './Hero.css';

/**
 * Hero Component
 * 
 * Renders the primary landing presentation area of the platform, including
 * headings, description copy, and call-to-action buttons.
 * 
 * Props:
 * @param {Function} onStartInterview Callback triggered when clicking the primary button.
 * @param {Function} onLogin Callback triggered when clicking the secondary button.
 */
function Hero({ onStartInterview, onLogin }) {
  return (
    <header className="home-hero">
      {/* Background glow overlay */}
      <div className="hero-glow-orb"></div>

      {/* Small feature pill badge */}
      <div className="hero-badge">
        <span className="badge-icon"></span>
        Next-Gen AI Mock Simulation
      </div>

      {/* Main Heading */}
      <h1>PrepAI - AI Interview Preparation</h1>

      {/* Platform Value Prop / Subheading */}
      <p className="hero-description">
        Master the art of interviewing with real-time, AI-driven behavioral and technical mock interviews. 
        Receive instant body language alerts, constructive speaking pace analysis, and tailored model answers 
        customized directly to your target job profile.
      </p>

      {/* Primary and Secondary Call To Action Buttons */}
      <div className="hero-cta-group">
        <button className="btn-hero-primary" onClick={onStartInterview}>
          Start Interview
          <span className="arrow-icon">→</span>
        </button>
        <button className="btn-hero-secondary" onClick={onLogin}>
          Login
        </button>
      </div>
    </header>
  );
}

export default Hero;

