'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AgentThumbnail } from './AgentThumbnail';
import { ExternalLink, User } from 'lucide-react';

interface AgentCardProps {
  id: string;
  name: string;
  developer: string;
  credits: string;
  tags: string[];
  category?: string;
  index?: number;
}

export const AgentCard: React.FC<AgentCardProps> = ({ id, name, developer, credits, tags, category = 'Default', index = 0 }) => {
  return (
    <Link href={`/agents/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -8 }}
        className="group relative bg-[#0A0A0A] border border-neutral-800/50 rounded-[2rem] overflow-hidden hover:border-mint-glow/40 transition-all duration-500 h-full flex flex-col"
      >
        <div className="aspect-[1.5/1] relative overflow-hidden">
          <AgentThumbnail name={name} category={category} className="w-full h-full transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />

          <div className="absolute top-5 right-5 z-20">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-mint-glow font-bold text-[10px] tracking-widest uppercase">
              {credits} CR
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 flex-1 flex flex-col relative z-20">
          <div className="space-y-1">
            <h3 className="text-white font-bold text-xl group-hover:text-mint-glow transition-colors duration-300 flex items-center justify-between gap-2">
              <span className="truncate">{name}</span>
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-neutral-500" />
            </h3>
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <User size={12} />
              <span className="truncate opacity-70">Dev: {developer}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-auto">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] uppercase font-bold tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-500 px-2.5 py-1 rounded-md group-hover:bg-neutral-800 group-hover:text-neutral-300 transition-all">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute -inset-px bg-gradient-to-br from-mint-glow/10 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none" />
      </motion.div>
    </Link>
  );
};
