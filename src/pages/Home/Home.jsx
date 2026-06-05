import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import './Home.css';

/**
 * Home Component (Refactored)
 * 
 * Acting as the container page orchestrating individual modular subcomponents:
 * - Navbar
 * - Hero
 * - Features
 * 
 * Manages route-level actions and redirects (e.g., mock alert callbacks).
 */
function Home() {
  
  // Handler for beginning a mock interview session (passed to Navbar & Hero)
  const handleStartInterview = () => {
    alert('Welcome to your AI Interview prep! Starting your mock interview session setup...');
    // Future integration: Navigation or router hook to '/interview'
  };

  // Handler for watching demo video (passed to Hero)
  const handleWatchDemo = () => {
    alert('Launching platform preview video...');
    // Future integration: Open modal with video player
  };

  return (
    <div className="home-container">
      {/* Top navigation header */}
      <Navbar onStartInterview={handleStartInterview} />

      {/* Main hero page display */}
      <Hero 
        onStartInterview={handleStartInterview} 
        onWatchDemo={handleWatchDemo} 
      />

      {/* Highlights grid */}
      <Features />
    </div>
  );
}

export default Home;
