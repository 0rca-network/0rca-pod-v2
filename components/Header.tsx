import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectWalletButton } from './ConnectWalletButton';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user',
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) console.error('Error:', error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="relative bg-black/50 backdrop-blur-lg border-b border-neutral-800 px-4 md:px-6 py-4 z-40">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onToggleSidebar} className="text-white hover:text-[#63f2d2] transition-colors p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden md:flex flex-1 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-[#63f2d2] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="md:hidden text-white hover:text-[#63f2d2] transition-colors p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>



          <ConnectWalletButton />
        </div>
      </div>
      {showSearch && (
        <div className="md:hidden mt-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg border border-neutral-700 focus:border-[#63f2d2] focus:outline-none"
            autoFocus
          />
        </div>
      )}
    </header>
  );
};
