import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

/**
 * Login Component
 * 
 * Provides a sleek, glassmorphic mock login screen.
 * Clicking "Sign In" handles mock validation and routes the user to the Dashboard.
 */
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    // Mock successful login redirection to Dashboard
    navigate('/dashboard');
  };

  return (
    <div className="login-page-container">
      {/* Background glow orbs for professional depth */}
      <div className="login-glow-orb purple-orb"></div>
      <div className="login-glow-orb indigo-orb"></div>

      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue your interview prep journey</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login-submit">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <span className="mock-link">Sign up</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
