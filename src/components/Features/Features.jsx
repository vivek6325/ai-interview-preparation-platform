import React from 'react';
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
        
        {/* Card 1: Interactive Conversation */}
        <div className="highlight-card">
          <div className="card-icon-wrapper">🎙️</div>
          <h3>Conversational AI</h3>
          <p>
            Interact naturally using voice or text. The system responds dynamically like a real technical panel.
          </p>
        </div>

        {/* Card 2: Actionable Insights */}
        <div className="highlight-card">
          <div className="card-icon-wrapper">📊</div>
          <h3>Detailed Feedback</h3>
          <p>
            Get scored on relevance, tone, confidence level, and suggested answers immediately after wrapping up.
          </p>
        </div>

        {/* Card 3: Custom Alignment */}
        <div className="highlight-card">
          <div className="card-icon-wrapper">🎯</div>
          <h3>Role Targeted</h3>
          <p>
            Upload job descriptions or paste requirements to generate matching role-specific interview pools.
          </p>
        </div>

      </div>
    </section>
  );
}

export default Features;
