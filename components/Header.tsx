import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectWalletButton } from './ConnectWalletButton';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [search, setSearch] = useState('');

  return (
    <header className="bg-black/50 backdrop-blur-lg border-b border-neutral-800 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="text-white hover:text-[#63f2d2] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
        </div>
        <div className="flex-1 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-[#63f2d2] focus:outline-none"
          />
        </div>
        <ConnectWalletButton />
      </div>
    </header>
  );
};
