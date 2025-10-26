import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const router = useRouter();
  
  const navItems = [
    { label: 'Browse', href: '/pod' },
    { label: 'Featured', href: '/pod?filter=featured' },
    { label: 'Newest', href: '/pod?filter=newest' },
    { label: 'Top Rated', href: '/pod?filter=top-rated' },
  ];

  const categories = [
    'Data Analysis',
    'Content Creation',
    'Development',
    'Finance',
    'Social Media',
    'Media',
    'Language',
    'Marketing',
  ];

  const isActive = (href: string) => router.pathname === href || router.asPath === href;

  return (
    <aside className={`w-64 bg-slate-blue border-r border-neutral-800 overflow-y-auto fixed left-0 top-0 bottom-0 z-30 transition-all duration-500 ease-in-out shadow-2xl ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className={`p-4 space-y-6 transition-opacity duration-700 ${
        isOpen ? 'opacity-100 delay-200' : 'opacity-0'
      }`}>
        <button className="w-full bg-[#63f2d2] text-black py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Deploy
        </button>

        <nav className="space-y-1">
          <h3 className="text-neutral-400 text-xs uppercase font-semibold mb-2">Navigation</h3>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded transition-colors ${
                isActive(item.href)
                  ? 'text-[#BEF264] border-l-2 border-[#BEF264] bg-[#BEF264]/10'
                  : 'text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1">
          <h3 className="text-neutral-400 text-xs uppercase font-semibold mb-2">Categories</h3>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/pod?category=${category.toLowerCase().replace(' ', '-')}`}
              className="block px-3 py-2 text-white hover:bg-white/5 rounded transition-colors text-sm"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
