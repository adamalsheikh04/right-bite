import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './components.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/meal-wizard', label: 'Meal Wizard', icon: '✨' },
  { path: '/weekly-plan', label: 'Weekly Plan', icon: '📅' },
  { path: '/groceries', label: 'Groceries', icon: '🛒' },
  { path: '/log-meal', label: 'Log Meal', icon: '🍽️' },
  { path: '/progress', label: 'Progress', icon: '📈' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="rb-sidebar">
      <div className="rb-sidebar-header">
        <span role="img" aria-label="leaf">🌿</span> Right Bite
      </div>
      <nav className="rb-sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`rb-sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="rb-sidebar-footer">
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Right Bite
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
