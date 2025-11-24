import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@txnlab/use-wallet-react';

export default function OrchestratorPage() {
  const router = useRouter();
  const { activeAccount } = useWallet();
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeAccount || !userMessage.trim()) return;

    setLoading(true);
    
    try {
      const res = await fetch('/api/workflows/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMessage.trim(),
          walletAddress: activeAccount.address
        })
      });

      const data = await res.json();
      
      router.push(`/workflow/${data.workflow_id}`);
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-4">AI Agent Orchestrator</h1>
        <p className="text-neutral-400 mb-8">
          Describe what you need, and our AI will create a multi-agent workflow to accomplish your goal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              What do you need help with?
            </label>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="e.g., I have a headache and runny nose and want a movie recommendation"
              className="w-full h-32 bg-neutral-800 text-white rounded-lg p-4 border border-neutral-700 focus:border-mint-glow focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={!activeAccount || !userMessage.trim() || loading}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
              activeAccount && userMessage.trim() && !loading
                ? 'bg-mint-glow text-black hover:opacity-90'
                : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {!mounted ? 'Loading...' : loading ? 'Creating Workflow...' : activeAccount ? 'Create Workflow' : 'Connect Wallet to Continue'}
          </button>
        </form>
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
        <ol className="space-y-3 text-neutral-400">
          <li className="flex gap-3">
            <span className="text-mint-glow font-bold">1.</span>
            <span>AI analyzes your request and identifies which agents are needed</span>
          </li>
          <li className="flex gap-3">
            <span className="text-mint-glow font-bold">2.</span>
            <span>A multi-step workflow plan is generated for your approval</span>
          </li>
          <li className="flex gap-3">
            <span className="text-mint-glow font-bold">3.</span>
            <span>Each step executes sequentially, with outputs feeding into the next step</span>
          </li>
          <li className="flex gap-3">
            <span className="text-mint-glow font-bold">4.</span>
            <span>You sign transactions for each agent using your wallet</span>
          </li>
          <li className="flex gap-3">
            <span className="text-mint-glow font-bold">5.</span>
            <span>Get your final result when all steps complete</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
