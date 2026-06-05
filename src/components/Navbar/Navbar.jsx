import React from 'react';
import './Navbar.css';

/**
 * Navbar Component
 * 
 * Renders the top navigation bar with mock links and callback trigger buttons.
 * 
 * Props:
 * @param {Function} onStartInterview Callback triggered when clicking the "Get Started" call-to-action button.
 */
function Navbar({ onStartInterview }) {
  return (
    <nav className="home-navbar">
      <div className="nav-brand">
        PrepAI<span className="brand-dot">.</span>
      </div>
      
      {/* Mock Navigation Menu Links */}
      <ul className="nav-menu">
        <li className="nav-item"><a href="#features">Features</a></li>
        <li className="nav-item"><a href="#about">About AI</a></li>
        <li className="nav-item"><a href="#pricing">Pricing</a></li>
      </ul>

      {/* Action buttons on navbar */}
      <div className="nav-actions">
        <button className="btn-secondary-nav">Log In</button>
        <button className="btn-primary-nav" onClick={onStartInterview}>
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
