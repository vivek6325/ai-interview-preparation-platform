import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar Component (Refactored)
 * 
 * Renders the top navigation bar with routing links to pages.
 */
function Navbar() {
  return (
    <nav className="home-navbar">
      {/* Brand logo linked to Home page */}
      <Link to="/" className="nav-brand">
        PrepAI<span className="brand-dot">.</span>
      </Link>
      
      {/* Navigation Menu Links */}
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink to="/" end>Home</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/interview">Interview Room</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/results">Results</NavLink>
        </li>
      </ul>

      {/* Action buttons on navbar */}
      <div className="nav-actions">
        <Link to="/login" className="btn-secondary-nav">
          Log In
        </Link>
        <Link to="/dashboard" className="btn-primary-nav">
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;

