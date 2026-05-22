import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './components.css';

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          className="rb-hamburger-btn" 
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          ☰
        </button>
        <div className="rb-navbar-title">
          {pageTitle}
        </div>
      </div>
      <div className="rb-navbar-actions">
        {user ? (
          <>
            <button className="rb-icon-btn" aria-label="Notifications" title="Notifications" onClick={() => navigate('/notifications')}>
              🔔
            </button>
            <div className="rb-user-profile">
              <Link to="/settings" style={{ textDecoration: 'none' }}>
                <div className="rb-avatar" title="View Settings & Profile" style={{ overflow: 'hidden' }}>
                  {user.profile?.photoPath ? (
                    <img 
                      src={`http://localhost:5000${user.profile.photoPath}`} 
                      alt="Avatar" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    getInitials(user.email)
                  )}
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
