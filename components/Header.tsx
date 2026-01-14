'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] py-4 px-6 md:px-12 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 md:hidden text-neutral-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-mint-glow rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(99,242,210,0.3)]">O</div>
            <span className="text-2xl font-bold font-outfit tracking-tighter text-white group-hover:text-mint-glow transition-colors">
              0rca<span className="text-neutral-500 group-hover:text-white transition-colors">Pod</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/agents"
            className={clsx(
              "text-xs font-bold tracking-[0.2em] uppercase transition-all hover:text-mint-glow",
              pathname === '/agents' ? "text-mint-glow" : "text-neutral-400"
            )}
          >
            Directory
          </Link>
          <a href="#" className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-all">Docs</a>
          <a href="#" className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-all">Build</a>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="/create" className="hidden sm:block px-8 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-mint-glow hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Create Agent
          </Link>
        </div>
      </div>
    </header>
  );
};
