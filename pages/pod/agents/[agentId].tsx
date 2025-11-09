import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWallet } from '@txnlab/use-wallet-react';
import { GenerativeThumbnail } from '@/components/GenerativeThumbnail';
import { DemoInputModal } from '@/components/DemoInputModal';

export default function AgentDetail() {
  const router = useRouter();
  const { agentId } = router.query;
  const [showModal, setShowModal] = useState(false);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeAccount } = useWallet();

  useEffect(() => {
    if (agentId) {
      fetch(`/api/agents/${agentId}`)
        .then(res => res.json())
        .then(data => {
          setAgent(data.agent);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [agentId]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!agent) return <div className="text-white">Agent not found</div>;

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
            <p className="text-neutral-400">by {agent.repo_owner}</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-neutral-400 text-sm">Status</p>
              <p className="text-white text-2xl font-bold capitalize">{agent.status}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm">Repository</p>
              <p className="text-white text-lg">{agent.repo_name}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm">Subdomain</p>
              <p className="text-mint-glow text-lg">{agent.subdomain}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 border-2 border-mint-glow text-mint-glow rounded-lg font-semibold hover:bg-mint-glow/10"
            >
              Free Demo
            </button>
            <button 
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeAccount 
                  ? 'bg-mint-glow text-black hover:opacity-90' 
                  : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
              }`}
              disabled={!activeAccount}
              title={!activeAccount ? 'Connect wallet to hire agent' : ''}
            >
              {activeAccount ? 'Hire Agent' : 'Connect Wallet to Hire'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
          <p className="text-neutral-400">{agent.description || 'No description available'}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Repository</h3>
          <a href={agent.github_url} target="_blank" rel="noopener noreferrer" className="text-mint-glow hover:underline">
            {agent.github_url}
          </a>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Created</h3>
          <p className="text-neutral-400">{new Date(agent.created_at).toLocaleDateString()}</p>
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
