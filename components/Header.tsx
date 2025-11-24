import React, { useState, useEffect } from 'react';
import { ConnectWalletButton } from './ConnectWalletButton';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Search, Menu, X } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
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

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="absolute inset-0 bg-deep-midnight/70 backdrop-blur-md border-b border-glass-border" />
      <div className="relative px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-neutral-400 hover:text-mint-glow transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-mint-glow transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-blue/50 text-white rounded-xl border border-glass-border focus:border-mint-glow/50 focus:ring-1 focus:ring-mint-glow/50 focus:outline-none transition-all placeholder:text-neutral-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden text-neutral-400 hover:text-mint-glow transition-colors p-2"
          >
            <Search size={20} />
          </button>

          <ConnectWalletButton />
        </div>
      </div>

      {showSearch && (
        <div className="md:hidden px-4 pb-4 relative z-40 bg-deep-midnight/90 backdrop-blur-md border-b border-glass-border">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="w-full pl-10 pr-4 py-2 bg-slate-blue/50 text-white rounded-xl border border-glass-border focus:border-mint-glow focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};
