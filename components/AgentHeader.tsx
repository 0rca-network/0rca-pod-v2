import React, { useState } from 'react';
import { GenerativeThumbnail } from './GenerativeThumbnail';

interface Agent {
  id: string;
  name: string;
  developer: string;
  credits: string;
  executedJobs: number;
  avgTime: string;
}

interface AgentHeaderProps {
  agent: Agent;
  onDemoClick: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({ agent, onDemoClick }) => {
  const [metadataOpen, setMetadataOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-8">
        <div className="flex-shrink-0">
          <GenerativeThumbnail agentName={agent.name} className="h-56 w-56 rounded-2xl" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{agent.name}</h1>
            <p className="text-neutral-400">by {agent.developer}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onDemoClick}
              className="px-6 py-3 border-2 border-[#63f2d2] text-[#63f2d2] rounded-lg font-semibold hover:bg-[#63f2d2]/10 transition-colors"
            >
              Free Demo
            </button>
            <button className="px-6 py-3 bg-[#63f2d2] text-black rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Hire Agent
            </button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl overflow-hidden">
        <button
          onClick={() => setMetadataOpen(!metadataOpen)}
          className="w-full flex items-center justify-between p-6 text-left border-b border-neutral-800"
        >
          <span className="text-xl font-semibold text-white">Metadata</span>
          <svg className={`w-6 h-6 text-white transition-transform ${metadataOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {metadataOpen && (
          <div className="p-6">
            <div className="flex gap-8">
              <div>
                <p className="text-neutral-400 text-sm">Executed Jobs</p>
                <p className="text-white text-2xl font-bold">{agent.executedJobs}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Avg Time</p>
                <p className="text-white text-2xl font-bold">{agent.avgTime}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Price</p>
                <p className="text-[#63f2d2] text-2xl font-bold">{agent.credits} credits</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
