import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

/**
 * Navbar Component
 * Renders page links and session controls based on candidate authentication states.
 */
function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="home-navbar">
      {/* Brand logo linked to Home/Dashboard */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="nav-brand">
        PrepAI<span className="brand-dot">.</span>
      </Link>
      
      {/* Navigation Menu Links */}
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink to="/" end>Home</NavLink>
        </li>
        {isAuthenticated && (
          <>
            <li className="nav-item">
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/history">History</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profile">Profile</NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Action buttons on navbar */}
      <div className="nav-actions">
        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn-secondary-nav" style={{ cursor: 'pointer' }}>
            Log Out
          </button>
        ) : (
          <>
            <Link to="/login" className="btn-secondary-nav">
              Log In
            </Link>
            <Link to="/register" className="btn-primary-nav">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

