import React, { useState } from 'react';

interface Agent {
  description: string;
  overview: string;
  problem: string;
  solution: string;
}

interface AgentDescriptionProps {
  agent: Agent;
}

export const AgentDescription: React.FC<AgentDescriptionProps> = ({ agent }) => {
  const [descOpen, setDescOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl overflow-hidden">
        <button
          onClick={() => setDescOpen(!descOpen)}
          className="w-full flex items-center justify-between p-6 text-left border-b border-neutral-800"
        >
          <span className="text-xl font-semibold text-white">Description</span>
          <svg className={`w-6 h-6 text-white transition-transform ${descOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {descOpen && (
          <div className="p-6">
            <p className="text-neutral-400">{agent.description}</p>
          </div>
        )}
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl overflow-hidden">
        <button
          onClick={() => setOverviewOpen(!overviewOpen)}
          className="w-full flex items-center justify-between p-6 text-left border-b border-neutral-800"
        >
          <span className="text-xl font-semibold text-white">Overview</span>
          <svg className={`w-6 h-6 text-white transition-transform ${overviewOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {overviewOpen && (
          <div className="p-6">
            <p className="text-neutral-400">{agent.overview}</p>
          </div>
        )}
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl overflow-hidden">
        <button
          onClick={() => setProblemOpen(!problemOpen)}
          className="w-full flex items-center justify-between p-6 text-left border-b border-neutral-800"
        >
          <span className="text-xl font-semibold text-white">The Problem</span>
          <svg className={`w-6 h-6 text-white transition-transform ${problemOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {problemOpen && (
          <div className="p-6">
            <p className="text-neutral-400">{agent.problem}</p>
          </div>
        )}
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl overflow-hidden">
        <button
          onClick={() => setSolutionOpen(!solutionOpen)}
          className="w-full flex items-center justify-between p-6 text-left border-b border-neutral-800"
        >
          <span className="text-xl font-semibold text-white">The Solution</span>
          <svg className={`w-6 h-6 text-white transition-transform ${solutionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {solutionOpen && (
          <div className="p-6">
            <p className="text-neutral-400">{agent.solution}</p>
          </div>
        )}
      </div>
    </div>
  );
};
