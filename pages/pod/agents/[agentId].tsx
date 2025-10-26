import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { GenerativeThumbnail } from '@/components/GenerativeThumbnail';
import { DemoInputModal } from '@/components/DemoInputModal';
import { agents } from '@/lib/dummy-data';

export default function AgentDetail() {
  const router = useRouter();
  const { agentId } = router.query;
  const [showModal, setShowModal] = useState(false);

  const agent = agents.find((a) => a.id === agentId);

  if (!agent) return <div className="text-white">Loading...</div>;

  const handleDemo = (input: any) => {
    console.log('Demo input:', input);
    router.push(`/pod/agents/${agentId}/jobs/job-1`);
  };

  return (
    <div className="space-y-8">
      <Link href="/pod" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Agents
      </Link>
      <div className="flex gap-8">
        <div className="flex-shrink-0">
          <GenerativeThumbnail agentName={agent.name} className="h-56 w-56 rounded-2xl" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{agent.name}</h1>
            <p className="text-neutral-400">by {agent.developer}</p>
          </div>
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
              <p className="text-mint-glow text-2xl font-bold">{agent.credits} credits</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 border-2 border-mint-glow text-mint-glow rounded-lg font-semibold hover:bg-mint-glow/10"
            >
              Free Demo
            </button>
            <button className="px-6 py-3 bg-mint-glow text-black rounded-lg font-semibold hover:opacity-90">
              Hire Agent
            </button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
          <p className="text-neutral-400">{agent.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Overview</h3>
          <p className="text-neutral-400">{agent.overview}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">The Problem</h3>
          <p className="text-neutral-400">{agent.problem}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">The Solution</h3>
          <p className="text-neutral-400">{agent.solution}</p>
        </div>
      </div>

      {showModal && (
        <DemoInputModal
          agentName={agent.name}
          onClose={() => setShowModal(false)}
          onSubmit={handleDemo}
        />
      )}
    </div>
  );
}
