import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  Compass,
  Cpu,
  Briefcase,
  Star,
  Clock,
  TrendingUp,
  BarChart2,
  PenTool,
  Code,
  DollarSign,
  Share2,
  Film,
  Languages,
  Megaphone,
  Rocket
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const router = useRouter();

  const navItems = [
    { label: 'Browse', href: '/pod', icon: <Compass size={20} /> },
    { label: 'Orchestrator', href: '/orchestrator', icon: <Cpu size={20} /> },
    { label: 'Jobs', href: '/job', icon: <Briefcase size={20} /> },
    { label: 'Featured', href: '/pod?filter=featured', icon: <Star size={20} /> },
    { label: 'Newest', href: '/pod?filter=newest', icon: <Clock size={20} /> },
    { label: 'Top Rated', href: '/pod?filter=top-rated', icon: <TrendingUp size={20} /> },
  ];

  const categories = [
    { name: 'Data Analysis', icon: <BarChart2 size={16} /> },
    { name: 'Content Creation', icon: <PenTool size={16} /> },
    { name: 'Development', icon: <Code size={16} /> },
    { name: 'Finance', icon: <DollarSign size={16} /> },
    { name: 'Social Media', icon: <Share2 size={16} /> },
    { name: 'Media', icon: <Film size={16} /> },
    { name: 'Language', icon: <Languages size={16} /> },
    { name: 'Marketing', icon: <Megaphone size={16} /> },
  ];

  const isActive = (href: string) => router.pathname === href || router.asPath === href;

  return (
    <aside className={`w-64 flex-shrink-0 flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-in-out border-r border-glass-border bg-deep-midnight/95 backdrop-blur-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      <div className="h-20 flex items-center justify-center border-b border-glass-border bg-gradient-to-r from-transparent via-white/5 to-transparent">
        <Image src="/orca_text-Photoroom.svg" alt="0rca" width={200} height={60} className="drop-shadow-[0_0_15px_rgba(99,242,210,0.3)]" />
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-8">
        <div>
          <Link href="/deploy" className="group relative block w-full overflow-hidden rounded-xl bg-mint-glow p-[1px] transition-all hover:bg-white">
            <div className="relative flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 transition-all group-hover:bg-black/90">
              <Rocket size={20} className="text-mint-glow group-hover:text-white transition-colors" />
              <span className="font-bold text-mint-glow group-hover:text-white transition-colors">Deploy Agent</span>
            </div>
          </Link>
        </div>

        <nav className="space-y-1">
          <h3 className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-3 px-3">Discover</h3>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.href)
                  ? 'bg-slate-blue text-mint-glow shadow-[0_0_15px_rgba(99,242,210,0.1)]'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="space-y-1">
          <h3 className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-3 px-3">Categories</h3>
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/pod?category=${category.name.toLowerCase().replace(' ', '-')}`}
              className="flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm group"
            >
              <span className="group-hover:text-mint-glow transition-colors">{category.icon}</span>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
