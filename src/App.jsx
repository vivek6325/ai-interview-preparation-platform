import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Interview from './pages/Interview/Interview';
import Results from './pages/Results/Results';

/**
 * App Component
 * 
 * Root component of the application.
 * Configures the router, global layout container, shared Navbar, and pages routes.
 */
function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Global Navigation Header shared across all views */}
        <Navbar />

        {/* Main Content Router Viewport */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

