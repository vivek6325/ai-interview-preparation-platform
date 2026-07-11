import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

/**
 * Profile Component
 * Renders user account information and session controls.
 */
function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="profile-page-container">
        <p style={{ color: 'var(--text-secondary)' }}>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Background glow effects */}
      <div className="profile-glow-orb profile-orb-1"></div>
      <div className="profile-glow-orb profile-orb-2"></div>

      <div className="profile-card">
        {/* Avatar Initials Bubble */}
        <div className="profile-avatar-circle">
          {getInitials(user.fullName)}
        </div>

        {/* User Name & Role Badge */}
        <h2 className="profile-name">{user.fullName}</h2>
        <span className="profile-badge">{user.role || 'Candidate'}</span>

        {/* Details Grid */}
        <div className="profile-details-grid">
          <div className="profile-detail-row">
            <span className="profile-label">Email Address</span>
            <span className="profile-value">{user.email}</span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-label">Member Since</span>
            <span className="profile-value">{formatDate(user.createdAt)}</span>
          </div>

          <div className="profile-detail-row">
            <span className="profile-label">Account Level</span>
            <span className="profile-value" style={{ textTransform: 'capitalize' }}>
              Standard {user.role || 'candidate'}
            </span>
          </div>
        </div>

        {/* Actions Button Row */}
        <div className="profile-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-profile-dashboard">
            Back to Dashboard
          </button>
          <button onClick={logout} className="btn-profile-logout">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
export { Profile };
