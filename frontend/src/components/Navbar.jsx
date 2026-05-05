import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './components.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Extract a readable page title from the path
  const path = location.pathname.split('/')[1];
  const pageTitle = path 
    ? path.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Dashboard';

  // Get user initials for the avatar
  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="rb-navbar">
      <div className="rb-navbar-title">
        {pageTitle}
      </div>
      <div className="rb-navbar-actions">
        {user ? (
          <>
            <button className="rb-icon-btn" aria-label="Notifications" title="Notifications" onClick={() => navigate('/notifications')}>
              🔔
            </button>
            <div className="rb-user-profile">
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div className="rb-avatar" title="View Profile">
                  {getInitials(user.email)}
                </div>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="rb-user-email">{user.email?.split('@')[0]}</span>
                <button className="rb-logout-text" onClick={handleLogout} style={{ textAlign: 'left' }}>
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link to="/">
            <button className="rb-btn rb-btn-primary rb-btn-sm">Login</button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
