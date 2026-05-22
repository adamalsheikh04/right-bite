import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './components.css';

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="rb-app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="rb-app-main">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        {isSidebarOpen && (
          <div 
            className="rb-sidebar-overlay" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <main className="rb-app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
