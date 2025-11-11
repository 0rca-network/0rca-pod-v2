import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

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
}

export default function JobsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchJobs(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchJobs(session.user.id);
      } else {
        setJobs([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchJobs = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Your Jobs</h1>
          <p className="text-neutral-400 mb-8">Sign in with GitHub using the button in the header to view your job history</p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Your Jobs</h1>
        <p className="text-neutral-400">Track your agent job executions and results</p>
      </div>

      {loading ? (
        <div className="text-center text-neutral-400 py-12">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-8">
            <svg className="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No Jobs Yet</h3>
            <p className="text-neutral-400 mb-4">You haven't executed any agent jobs yet.</p>
            <a href="/pod" className="inline-block bg-mint-glow text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Browse Agents
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Job {job.job_id}</h3>
                  <p className="text-neutral-400 text-sm">Agent ID: {job.agent_id}</p>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400 text-sm">
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-neutral-500 text-xs">
                    {new Date(job.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-neutral-400 text-sm mb-1">Wallet Address</p>
                  <p className="text-white text-sm font-mono">{job.wallet_address}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm mb-1">Access Token</p>
                  <p className="text-white text-sm font-mono">{job.access_token}</p>
                </div>
              </div>

              {job.job_input_hash && (
                <div className="mb-4">
                  <p className="text-neutral-400 text-sm mb-1">Input Hash</p>
                  <p className="text-white text-sm font-mono">{job.job_input_hash}</p>
                </div>
              )}

              {job.job_output && (
                <div>
                  <p className="text-neutral-400 text-sm mb-2">Output</p>
                  <pre className="bg-neutral-800 p-3 rounded text-sm text-neutral-300 overflow-x-auto">
                    {JSON.stringify(JSON.parse(job.job_output), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}