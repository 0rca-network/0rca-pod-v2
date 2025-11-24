import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useWallet } from '@txnlab/use-wallet-react';
import Link from 'next/link';

interface Job {
  id: string;
  user_id: string;
  wallet_address: string;
  job_id: string;
  agent_id: string;
  access_token: string;
  job_input_hash?: string;
  job_output?: string;
  created_at: string;
  agents?: {
    name: string;
    subdomain: string;
  };
}

interface Workflow {
  workflow_id: string;
  user_message: string;
  wallet_address: string;
  status: string;
  current_step: number;
  plan: {
    steps: Array<{ step_number: number; agent_name: string; description: string }>;
  };
  created_at: string;
  step_results?: Array<{
    step_number: number;
    agent_name: string;
    status: string;
    output?: string;
  }>;
}

export default function JobsPage() {
  const [user, setUser] = useState<User | null>(null);
  const { activeAccount } = useWallet();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filter, setFilter] = useState<'all' | 'jobs' | 'workflows'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (activeAccount) {
      fetchData(activeAccount.address);
    } else {
      setLoading(false);
    }
  }, [activeAccount]);

  const fetchData = async (walletAddress: string) => {
    setLoading(true);
    try {
      const [jobsRes, workflowsRes] = await Promise.all([
        supabase
          .from('access_tokens')
          .select(`
            *,
            agents (
              name,
              subdomain
            )
          `)
          .eq('wallet_address', walletAddress)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('workflows')
          .select(`
            *,
            step_results (
              step_number,
              agent_name,
              status,
              output
            )
          `)
          .eq('wallet_address', walletAddress)
          .order('created_at', { ascending: false })
      ]);

      if (jobsRes.error) throw jobsRes.error;
      if (workflowsRes.error) throw workflowsRes.error;
      
      setJobs(jobsRes.data || []);
      setWorkflows(workflowsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user',
        redirectTo: window.location.origin + '/job'
      }
    });
    if (error) console.error('Error:', error);
  };

  if (!activeAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Your Jobs</h1>
          <p className="text-neutral-400 mb-8">Connect your wallet to view your job history</p>
        </div>
      </div>
    );
  }

  const filteredJobs = filter === 'workflows' ? [] : jobs;
  const filteredWorkflows = filter === 'jobs' ? [] : workflows;
  const hasData = filteredJobs.length > 0 || filteredWorkflows.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Your Jobs</h1>
        <p className="text-neutral-400">Track your agent job executions and workflow results</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all' ? 'bg-mint-glow text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('jobs')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'jobs' ? 'bg-mint-glow text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Agent Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setFilter('workflows')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'workflows' ? 'bg-mint-glow text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          Workflows ({workflows.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center text-neutral-400 py-12">Loading...</div>
      ) : !hasData ? (
        <div className="text-center py-12">
          <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8">
            <svg className="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No Jobs Yet</h3>
            <p className="text-neutral-400 mb-4">You haven't executed any jobs or workflows yet.</p>
            <div className="flex gap-3 justify-center">
              <a href="/pod" className="inline-block bg-mint-glow text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Browse Agents
              </a>
              <a href="/orchestrator" className="inline-block bg-neutral-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-600 transition-colors">
                Create Workflow
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.workflow_id} className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-6 border-l-4 border-mint-glow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-mint-glow/20 text-mint-glow rounded-lg text-xs font-semibold">WORKFLOW</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      workflow.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      workflow.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      workflow.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-neutral-700 text-neutral-300'
                    }`}>
                      {workflow.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{workflow.user_message}</h3>
                  <p className="text-neutral-400 text-sm mb-3">
                    {workflow.plan.steps.length} steps • Step {workflow.current_step} of {workflow.plan.steps.length}
                  </p>
                  <div className="space-y-2">
                    {workflow.step_results?.map((step) => (
                      <div key={step.step_number} className="flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${
                          step.status === 'succeeded' ? 'bg-green-400' :
                          step.status === 'running' ? 'bg-blue-400 animate-pulse' :
                          step.status === 'failed' ? 'bg-red-400' :
                          'bg-neutral-600'
                        }`}></span>
                        <span className="text-neutral-400">Step {step.step_number}:</span>
                        <span className="text-white">{step.agent_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400 text-sm">
                    {new Date(workflow.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-neutral-500 text-xs">
                    {new Date(workflow.created_at).toLocaleTimeString()}
                  </div>
                  <Link
                    href={`/workflow/${workflow.workflow_id}`}
                    className="mt-2 inline-block text-mint-glow hover:underline text-sm font-semibold"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">AGENT JOB</span>
                  </div>
                  {job.agents && (
                    <h3 className="text-lg font-semibold text-white mb-2">{job.agents.name}</h3>
                  )}
                  <p className="text-neutral-400 text-sm mb-1">Job ID: {job.job_id}</p>
                  {job.agents && (
                    <a 
                      href={`https://${job.agents.subdomain}.0rca.live/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-mint-glow text-sm transition-colors"
                    >
                      {job.agents.subdomain}.0rca.live ↗
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-neutral-400 text-sm">
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-neutral-500 text-xs">
                    {new Date(job.created_at).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="mt-2 inline-block text-mint-glow hover:underline text-sm font-semibold"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
        >
          {activeAccount && selectedJob.wallet_address !== activeAccount.address ? (
            <div 
              className="bg-neutral-900 rounded-2xl max-w-md w-full p-8 text-center border border-neutral-700"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-neutral-400 mb-6">This job belongs to a different wallet address.</p>
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-mint-glow text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          ) : (
            <div 
              className="bg-neutral-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">AGENT JOB</span>
                </div>
                {selectedJob.agents && (
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedJob.agents.name}</h2>
                )}
                <p className="text-neutral-400 text-sm">Job ID: {selectedJob.job_id}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-neutral-400 text-sm mb-1">Created At</p>
                  <p className="text-white">{new Date(selectedJob.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm mb-1">Agent</p>
                  {selectedJob.agents && (
                    <a 
                      href={`https://${selectedJob.agents.subdomain}.0rca.live/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mint-glow hover:underline"
                    >
                      {selectedJob.agents.subdomain}.0rca.live ↗
                    </a>
                  )}
                </div>
              </div>

              <div>
                <p className="text-neutral-400 text-sm mb-2">Wallet Address</p>
                <p className="text-white text-sm font-mono bg-neutral-800 p-3 rounded break-all">{selectedJob.wallet_address}</p>
              </div>

              <div>
                <p className="text-neutral-400 text-sm mb-2">Access Token</p>
                <p className="text-white text-sm font-mono bg-neutral-800 p-3 rounded break-all">{selectedJob.access_token}</p>
              </div>

              {selectedJob.job_input_hash && (
                <div>
                  <p className="text-neutral-400 text-sm mb-2">Input Hash</p>
                  <p className="text-white text-sm font-mono bg-neutral-800 p-3 rounded break-all">{selectedJob.job_input_hash}</p>
                </div>
              )}

              {selectedJob.job_output && (
                <div>
                  <p className="text-neutral-400 text-sm mb-2">Output</p>
                  <pre className="bg-neutral-800 p-4 rounded text-sm text-neutral-300 overflow-x-auto">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedJob.job_output), null, 2);
                      } catch {
                        return selectedJob.job_output;
                      }
                    })()}
                  </pre>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={`/pod/agents/${selectedJob.agent_id}`}
                  className="flex-1 bg-mint-glow text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-center"
                >
                  View Agent
                </a>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}