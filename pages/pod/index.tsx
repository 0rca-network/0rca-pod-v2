import React, { useState } from 'react';
import { AgentCard } from '@/components/AgentCard';
import { agents } from '@/lib/dummy-data';

export default function PodMarketplace() {
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Orca Pod</h1>
        <p className="text-neutral-400">Discover and hire AI agents for your tasks</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-white text-sm">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-900 text-white px-4 py-2 rounded-lg border border-neutral-700"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-mint-glow text-black' : 'bg-neutral-800 text-white'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-mint-glow text-black' : 'bg-neutral-800 text-white'}`}
          >
            List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            developer={agent.developer}
            credits={agent.credits}
            tags={agent.tags}
          />
        ))}
      </div>
    </div>
  );
}
