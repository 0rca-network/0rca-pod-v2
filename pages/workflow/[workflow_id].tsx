import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { WorkflowRecord, StepResult } from '@/types/orchestrator';

export default function WorkflowPage() {
  const router = useRouter();
  const { workflow_id } = router.query;
  const { activeAccount, signTransactions, algodClient } = useWallet();
  
  const [workflow, setWorkflow] = useState<WorkflowRecord | null>(null);
  const [steps, setSteps] = useState<StepResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workflow_id) {
      fetchWorkflow();
    }
  }, [workflow_id]);

  const fetchWorkflow = async () => {
    const res = await fetch(`/api/workflows/${workflow_id}`);
    const data = await res.json();
    setWorkflow(data.workflow);
    setSteps(data.steps);
    setLoading(false);
  };

  const handleApprove = async () => {
    await fetch('/api/workflows/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: workflow_id })
    });
    
    await fetch('/api/workflows/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: workflow_id })
    });
    
    executeNextStep();
  };

  const executeNextStep = async () => {
    try {
      await fetchWorkflow();
      
      const currentStep = steps.find(s => s.status === 'pending');
      if (!currentStep) return;

      const res = await fetch('/api/workflows/step/start_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow_id,
          stepNumber: currentStep.step_number,
          walletAddress: activeAccount?.address
        })
      });

      const result = await res.json();
      
      if (result.error) {
        setError(`Step ${currentStep.step_number} failed: ${result.error}`);
        return;
      }
      
      await fetchWorkflow();
      
      if (result.jobData?.unsigned_group_txns) {
        await signAndSubmit(result.stepResultId, result.jobData);
      }
    } catch (err: any) {
      setError(`Failed to execute step: ${err.message}`);
    }
  };

  const signAndSubmit = async (stepResultId: string, jobData: any) => {
    try {
      if (!jobData?.unsigned_group_txns) {
        console.error('No unsigned transactions found');
        return;
      }
      
      const cleanTxns = [];
      for (const txnB64 of jobData.unsigned_group_txns) {
        try {
          const firstDecode = Buffer.from(txnB64, 'base64').toString();
          const txnBytes = new Uint8Array(Buffer.from(firstDecode, 'base64'));
          const decoded = algosdk.decodeUnsignedTransaction(txnBytes);
          cleanTxns.push(algosdk.encodeUnsignedTransaction(decoded));
        } catch {
          const txnBytes = new Uint8Array(Buffer.from(txnB64, 'base64'));
          const decoded = algosdk.decodeUnsignedTransaction(txnBytes);
          cleanTxns.push(algosdk.encodeUnsignedTransaction(decoded));
        }
      }

      const signed = await signTransactions(cleanTxns);
      const signedTxns = signed.filter((txn): txn is Uint8Array => txn !== null);
      
      const { txid } = await algodClient.sendRawTransaction(signedTxns).do();
      await algosdk.waitForConfirmation(algodClient, txid, 4);

      await fetch('/api/workflows/step/submit_payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepResultId,
          txnIds: jobData.txn_ids || [txid]
        })
      });

      pollStep(stepResultId);
    } catch (error) {
      console.error('Error signing transaction:', error);
    }
  };

  const pollStep = async (stepResultId: string) => {
    const poll = async () => {
      const res = await fetch('/api/workflows/step/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepResultId, workflowId: workflow_id })
      });

      const data = await res.json();
      await fetchWorkflow();

      if (data.status === 'succeeded') {
        if (!data.completed) {
          setTimeout(() => executeNextStep(), 1000);
        }
      } else if (data.status !== 'failed') {
        setTimeout(poll, 3000);
      }
    };

    setTimeout(poll, 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white text-xl">Loading workflow...</div>
    </div>
  );
  if (!workflow) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white text-xl">Workflow not found</div>
    </div>
  );

  // Validate wallet address matches
  if (activeAccount && workflow.wallet_address !== activeAccount.address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-neutral-400 mb-6">This workflow belongs to a different wallet address.</p>
          <a href="/job" className="inline-block bg-mint-glow text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            View Your Jobs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Workflow</h1>
        <p className="text-neutral-400 mb-4">{workflow.user_message}</p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div className="flex gap-4 items-center">
          <span className={`px-4 py-2 rounded-lg font-semibold ${
            workflow.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            workflow.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
            workflow.status === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-neutral-700 text-neutral-300'
          }`}>
            {workflow.status}
          </span>
          {workflow.status === 'planned' && activeAccount && (
            <button
              onClick={handleApprove}
              className="px-6 py-2 bg-mint-glow text-black rounded-lg font-semibold hover:opacity-90"
            >
              Approve & Start
            </button>
          )}
        </div>
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Workflow Plan</h2>
        <p className="text-neutral-400 mb-6">{workflow.plan.reasoning}</p>
        
        <div className="space-y-4">
          {workflow.plan.steps.map((planStep, idx) => {
            const stepResult = steps.find(s => s.step_number === planStep.step_number);
            
            return (
              <div key={idx} className="border border-neutral-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Step {planStep.step_number}: {planStep.agent_name}
                    </h3>
                    <p className="text-neutral-400 mt-1">{planStep.description}</p>
                  </div>
                  {stepResult && (
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      stepResult.status === 'succeeded' ? 'bg-green-500/20 text-green-400' :
                      stepResult.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      stepResult.status === 'awaiting_payment' ? 'bg-yellow-500/20 text-yellow-400' :
                      stepResult.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-neutral-700 text-neutral-300'
                    }`}>
                      {stepResult.status}
                    </span>
                  )}
                </div>
                
                {stepResult?.output && (
                  <div className="mt-4 bg-neutral-800 p-4 rounded">
                    <p className="text-sm text-neutral-400 mb-2">Output:</p>
                    <pre className="text-white text-sm overflow-x-auto">{stepResult.output}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
