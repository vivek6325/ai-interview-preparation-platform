import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar Component (Refactored)
 * 
 * Renders the top navigation bar with routing links to pages.
 */
function Navbar() {
  const navigate = useNavigate();
  useLocation();
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

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
          <NavLink to="/history">History</NavLink>
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
        {isAuth ? (
          <button onClick={handleLogout} className="btn-secondary-nav" style={{ cursor: 'pointer' }}>
            Log Out
          </button>
        ) : (
          <>
            <Link to="/login" className="btn-secondary-nav">
              Log In
            </Link>
            <Link to="/dashboard" className="btn-primary-nav">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

