import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-black">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-4 z-20"
          onMouseEnter={() => setSidebarHovered(true)}
        />
        <div
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <Sidebar isOpen={sidebarOpen || sidebarHovered} />
        </div>
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <div className="p-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
