import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import './Home.css';

/**
 * Home Component (Refactored)
 * 
 * Acting as the container page orchestrating individual modular subcomponents:
 * - Hero
 * - Features
 * 
 * Handles routing redirection for hero actions.
 */
function Home() {
  const navigate = useNavigate();
  
  // Handler for beginning a mock interview session (passed to Hero)
  const handleStartInterview = () => {
    navigate('/dashboard');
  };

  // Handler for watching demo video (passed to Hero)
  const handleWatchDemo = () => {
    alert('Launching platform preview video...');
    // Future integration: Open modal with video player
  };

  return (
    <div className="home-container">
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

