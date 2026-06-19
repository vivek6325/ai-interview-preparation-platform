import './Features.css';

/**
 * Features Component
 * 
 * Renders the features highlight cards section in a responsive grid.
 */
function Features() {
  return (
    <section id="features" className="highlights-container">
      <div className="highlights-grid">
        
        {/* Card 1: Practice Interviews */}
        <div className="highlight-card">
          <div className="card-icon-wrapper">🎙️</div>
          <h3>Practice Interviews</h3>
          <p>
            Engage in realistic voice-based mock interviews that simulate actual technical and behavioral panels.
          </p>
        </div>

        {/* Card 2: AI Feedback */}
        <div className="highlight-card">
          <div className="card-icon-wrapper">📊</div>
          <h3>AI Feedback</h3>
          <p>
            Receive instant, actionable evaluation scores regarding your response content, pace, and speaking confidence.
          </p>
        </div>

        {/* Card 3: Track Progress */}
        <div className="highlight-card">
          <div className="card-icon-wrapper">📈</div>
          <h3>Track Progress</h3>
          <p>
            Monitor historical interview data, view score progression graphs, and pinpoint structural areas for growth.
          </p>
        </div>

      </div>
    </section>
  );
}

export default Features;

