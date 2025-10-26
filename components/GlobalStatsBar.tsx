import React from 'react';

export const GlobalStatsBar: React.FC = () => {
  return (
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#63f2d2] animate-pulse" />
        <span className="text-white text-sm font-medium">247 Agents Online</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#BEF264]" />
        <span className="text-white text-sm font-medium">1.2K Transactions (24h)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#63f2d2]" />
        <span className="text-white text-sm font-medium">$4.8M Value Settled</span>
      </div>
    </div>
  );
};
