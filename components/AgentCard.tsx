import React from 'react';
import Link from 'next/link';
import { GenerativeThumbnail } from './GenerativeThumbnail';

interface AgentCardProps {
  id: string;
  name: string;
  developer: string;
  credits: string;
  tags: string[];
}

export const AgentCard: React.FC<AgentCardProps> = ({ id, name, developer, credits, tags }) => {
  return (
    <Link href={`/pod/agents/${id}`}>
      <div className="bg-neutral-800 rounded-2xl overflow-hidden hover:ring-2 hover:ring-[#63f2d2] transition-all cursor-pointer group">
        <div className="aspect-[4/3]">
          <GenerativeThumbnail agentName={name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-white font-semibold text-lg group-hover:text-mint-glow transition-colors">{name}</h3>
          <p className="text-neutral-400 text-sm">{developer}</p>
          <p className="text-mint-glow font-medium">{credits} credits</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
