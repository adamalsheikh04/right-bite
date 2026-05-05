import React from 'react';
import './components.css';

function AuthLayout({ children }) {
  return (
    <div className="rb-auth-layout">
      <div className="rb-auth-container">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
