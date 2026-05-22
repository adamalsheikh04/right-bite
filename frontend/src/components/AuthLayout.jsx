import React from 'react';
import './components.css';
import { useTheme } from '../context/ThemeContext';

function AuthLayout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="rb-auth-layout" style={{ position: 'relative' }}>
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border)',
          color: 'var(--text-h)',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all var(--transition-normal)'
        }}
        className="rb-action-tile"
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      >
        <span>{theme === 'light' ? '🌙' : '☀️'}</span>
        <span style={{ fontSize: '0.8rem' }}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>
      <div className="rb-auth-container">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
