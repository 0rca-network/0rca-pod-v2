import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AgentCard } from '@/components/AgentCard';

export default function PodMarketplace() {
  const router = useRouter();
  const { category, filter } = router.query;
  const [sortBy, setSortBy] = useState('popular');
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/list-agents');
        const data = await response.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  let filteredAgents = [...agents];

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'price-low':
        return (a.price_microalgo || 0) - (b.price_microalgo || 0);
      case 'price-high':
        return (b.price_microalgo || 0) - (a.price_microalgo || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          {category ? String(category).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Orca Pod'}
        </h1>
        <p className="text-neutral-400">
          {category ? `Browse ${String(category).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} agents` : 'Discover and hire AI agents for your tasks'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-neutral-400 text-sm">Sort by:</label>
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

      {loading ? (
        <div className="text-center text-neutral-400">Loading agents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              developer={agent.repo_owner}
              credits={Math.floor((agent.price_microalgo || 0) / 1000000).toString()}
              tags={agent.tags || [agent.subdomain]}
              category={agent.category || 'General'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
