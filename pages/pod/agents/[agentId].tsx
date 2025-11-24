import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { GenerativeThumbnail } from '@/components/GenerativeThumbnail';
import { DemoInputModal } from '@/components/DemoInputModal';
import { HiringProgressModal } from '@/components/HiringProgressModal';

export default function AgentDetail() {
  const router = useRouter();
  const { agentId } = router.query;
  const [showModal, setShowModal] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [hiringStage, setHiringStage] = useState('');
  const [hiringError, setHiringError] = useState('');
  const [stages, setStages] = useState<Array<{ id: string; label: string; status: 'pending' | 'active' | 'complete' | 'error' }>>([
    { id: 'create', label: 'Creating job...', status: 'pending' },
    { id: 'sign', label: 'Awaiting wallet signature...', status: 'pending' },
    { id: 'send', label: 'Sending transaction...', status: 'pending' },
    { id: 'confirm', label: 'Confirming payment...', status: 'pending' },
    { id: 'verify', label: 'Verifying payment...', status: 'pending' },
    { id: 'poll', label: 'Processing job...', status: 'pending' },
    { id: 'complete', label: 'Complete!', status: 'pending' }
  ]);
  const { activeAccount, signTransactions, algodClient } = useWallet();

  const updateStage = (stageId: string, status: 'active' | 'complete' | 'error') => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, status } : s));
    if (status === 'active') setHiringStage(stageId);
  };

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

  const handleHire = async () => {
    if (!activeAccount || !agent?.subdomain) return;
    
    setHiring(true);
    setHiringError('');
    setStages(prev => prev.map(s => ({ ...s, status: 'pending' })));
    
    try {
      updateStage('create', 'active');
      console.log('Starting job creation...');
      
      // Create job on agent
      const jobResponse = await fetch(`https://${agent.subdomain}.0rca.live/start_job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_address: activeAccount.address,
          job_input: agent.example_input || 'Default job input'
        })
      });
      
      const jobData = await jobResponse.json();
      console.log('Job created:', jobData);
      updateStage('create', 'complete');
      
      if (!jobData.unsigned_group_txns || jobData.unsigned_group_txns.length === 0) {
        throw new Error('No unsigned transaction received');
      }
      
      // Handle double base64 encoding from backend
      const cleanTxns = [];
      for (const txnB64 of jobData.unsigned_group_txns) {
        try {
          // First decode from base64
          const firstDecode = Buffer.from(txnB64, 'base64').toString();
          // Second decode from base64 to get actual msgpack bytes
          const txnBytes = new Uint8Array(Buffer.from(firstDecode, 'base64'));
          // Decode and re-encode to ensure clean msgpack
          const decoded = algosdk.decodeUnsignedTransaction(txnBytes);
          const cleanBytes = algosdk.encodeUnsignedTransaction(decoded);
          cleanTxns.push(cleanBytes);
        } catch (e) {
          console.error('Failed to decode double-encoded transaction:', e);
          // Fallback to single decode
          try {
            const txnBytes = new Uint8Array(Buffer.from(txnB64, 'base64'));
            const decoded = algosdk.decodeUnsignedTransaction(txnBytes);
            const cleanBytes = algosdk.encodeUnsignedTransaction(decoded);
            cleanTxns.push(cleanBytes);
          } catch (e2) {
            console.error('Fallback decode also failed:', e2);
            cleanTxns.push(new Uint8Array(Buffer.from(txnB64, 'base64')));
          }
        }
      }
      console.log('Clean transactions for signing:', cleanTxns);
      
      updateStage('sign', 'active');
      const signed = await signTransactions(cleanTxns);
      console.log('Signed transaction:', signed);
      updateStage('sign', 'complete');
      
const signedTxns = signed.filter((txn): txn is Uint8Array => txn !== null);
      console.log('Signed transactions:', signedTxns);
      if (signedTxns.length === 0) {
  throw new Error("No valid signed transactions returned.");
}
      updateStage('send', 'active');
      console.log('Sending transaction group...');
      const { txid } = await algodClient.sendRawTransaction(signedTxns).do();
      console.log('Transaction ID:', txid);
      updateStage('send', 'complete');
      
      updateStage('confirm', 'active');
      console.log('Waiting for confirmation...');
      const result = await algosdk.waitForConfirmation(algodClient, txid, 4);
      console.log(`Transaction confirmed at round ${result['confirmedRound']}`);
      updateStage('confirm', 'complete');
      
      updateStage('verify', 'active');
      console.log('Submitting payment verification...');
      const paymentResponse = await fetch(`https://${agent.subdomain}.0rca.live/submit_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobData.job_id,
          txid: jobData.txn_ids || [txid]
        })
      });
      
      const paymentData = await paymentResponse.json();
      console.log('Payment verification response:', paymentData);
      updateStage('verify', 'complete');
      
      if (paymentData.status === 'success') {
        updateStage('poll', 'active');
        console.log('Payment verified, saving to database...');
        
        // Save to Supabase
        await fetch('/api/agent/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: activeAccount.address,
            job_id: jobData.job_id,
            agent_id: agent.id,
            access_token: paymentData.access_token,
            job_input_hash: jobData.job_input_hash
          })
        });
        
        console.log('Saved to database, polling for job results...');
        
        const pollJobResult = async () => {
          const resultResponse = await fetch(`https://${agent.subdomain}.0rca.live/job/${jobData.job_id}?access_token=${paymentData.access_token}`);
          const resultData = await resultResponse.json();
          console.log('Job status:', resultData);
          
          if (resultData.status === 'succeeded') {
            console.log('Job completed successfully!');
            console.log('Job output:', resultData.output);
            
            await fetch('/api/agent/access', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                job_id: jobData.job_id,
                job_output: resultData.output
              })
            });
            
            updateStage('poll', 'complete');
            updateStage('complete', 'complete');
          } else if (resultData.status === 'failed') {
            console.log('Job failed');
            updateStage('poll', 'error');
            setHiringError('Job execution failed');
          } else {
            console.log(`Job status: ${resultData.status}, polling again in 3 seconds...`);
            setTimeout(pollJobResult, 3000);
          }
        };
        
        setTimeout(pollJobResult, 2000);
      } else {
        throw new Error(paymentData.message || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('Error hiring agent:', error);
      const errorStage = stages.find(s => s.status === 'active');
      if (errorStage) {
        updateStage(errorStage.id, 'error');
      }
      setHiringError(error instanceof Error ? error.message : 'Failed to hire agent');
    }
  };

  return (
    <div className="space-y-8">
      <Link href="/pod" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Agents
      </Link>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <GenerativeThumbnail agentName={agent.name} className="h-56 w-56 rounded-2xl" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{agent.name}</h1>
            <p className="text-neutral-400">by {agent.repo_owner}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div>
              <p className="text-neutral-400 text-sm">Status</p>
              <p className="text-white text-2xl font-bold capitalize">{agent.status}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm">Repository</p>
              <p className="text-white text-lg break-all">{agent.repo_name}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm">Live URL</p>
              <a href={`https://${agent.subdomain}.0rca.live/`} target="_blank" rel="noopener noreferrer" className="text-mint-glow text-lg hover:underline break-all">
                https://{agent.subdomain}.0rca.live/
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 border-2 border-mint-glow text-mint-glow rounded-lg font-semibold hover:bg-mint-glow/10"
            >
              Free Demo
            </button>
            <button 
              onClick={handleHire}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeAccount && !hiring
                  ? 'bg-mint-glow text-black hover:opacity-90' 
                  : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
              }`}
              disabled={!activeAccount || hiring}
              title={!activeAccount ? 'Connect wallet to hire agent' : hiring ? 'Hiring in progress...' : ''}
            >
              {hiring ? 'Hiring...' : activeAccount ? 'Hire Agent' : 'Connect Wallet to Hire'}
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
        {agent.data_input && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Input Format</h3>
            <p className="text-neutral-400">{agent.data_input}</p>
          </div>
        )}
        {agent.example_input && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Example Input</h3>
            <pre className="text-neutral-400 bg-neutral-800 p-3 rounded text-sm overflow-x-auto">{agent.example_input}</pre>
          </div>
        )}
        {agent.example_output && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Example Output</h3>
            <pre className="text-neutral-400 bg-neutral-800 p-3 rounded text-sm overflow-x-auto">{agent.example_output}</pre>
          </div>
        )}
      </div>

      {showModal && (
        <DemoInputModal
          agentName={agent.name}
          dataInput={agent.data_input}
          exampleInput={agent.example_input}
          exampleOutput={agent.example_output}
          onClose={() => setShowModal(false)}
          onSubmit={handleDemo}
        />
      )}

      <HiringProgressModal
        isOpen={hiring}
        currentStage={hiringStage}
        stages={stages}
        error={hiringError}
        onClose={hiringError || stages.every(s => s.status === 'complete') ? () => {
          setHiring(false);
          if (!hiringError) router.push('/job');
        } : undefined}
      />
    </div>
  );
}
