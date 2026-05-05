import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './components.css';

function AppLayout({ children }) {
  return (
    <div className="rb-app-layout">
      <Sidebar />
      <div className="rb-app-main">
        <Navbar />
        <main className="rb-app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
