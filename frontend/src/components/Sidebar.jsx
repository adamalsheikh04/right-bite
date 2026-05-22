import { Link, useLocation, useNavigate } from 'react-router-dom';
import './components.css';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/meal-wizard', label: 'Meal Wizard', icon: '✨' },
  { path: '/weekly-plan', label: 'Weekly Plan', icon: '📅' },
  { path: '/groceries', label: 'Groceries', icon: '🛒' },
  { path: '/log-meal', label: 'Log Meal', icon: '🍽️' },
  { path: '/progress', label: 'Progress', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <aside className={`rb-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="rb-sidebar-header" style={{ gap: '0.6rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img 
            src={logo} 
            alt="Right Bite Logo" 
            style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              objectFit: 'contain'
            }} 
          />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em' }}>
            Right<span style={{ color: 'var(--text-h)' }}>Bite</span>
          </span>
        </div>
        <button 
          className="rb-sidebar-close-btn" 
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          ✕
        </button>
      </div>
      <nav className="rb-sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`rb-sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="rb-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {user && (
          <div 
            onClick={() => {
              if (onClose) onClose();
              navigate('/settings');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              userSelect: 'none',
              overflow: 'hidden'
            }}
            className="rb-sidebar-profile-card"
            title="Edit Profile & Settings"
          >
            <div className="rb-avatar" style={{ width: '2.25rem', height: '2.25rem', flexShrink: 0, overflow: 'hidden' }}>
              {user.profile?.photoPath ? (
                <img 
                  src={`http://localhost:5000${user.profile.photoPath}`} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                user.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.profile?.fullName || user.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </span>
            </div>
          </div>
        )}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
          © {new Date().getFullYear()} Right Bite
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
