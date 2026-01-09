'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus,
  Brain,
  Settings as SettingsIcon,
  TestTube,
  Sparkles,
  User,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price_microalgo: number;
  version: string;
  subdomain: string;
  repo_url: string;
  developer: string;
  role?: string;
  goal?: string;
  skills?: string[];
  constraints?: string[];
  greeting?: string;
  system_prompt?: string;
}

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

export default function EditAgentPage({ params }: EditAgentPageProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'tool-access' | 'security' | 'bidding'>('overview');
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchAgent();
    }
  }, [resolvedParams?.id]);

  const fetchAgent = async () => {
    if (!resolvedParams?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (err) {
      console.error('Failed to load agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!agent || !resolvedParams?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update(agent)
        .eq('id', resolvedParams.id);

      if (error) throw error;
      // Show success message
    } catch (err) {
      console.error('Failed to save agent:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-mint-glow/20 border-t-mint-glow rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <Link href="/agents" className="text-mint-glow hover:underline">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href={`/agents/${agent.id}`}
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium uppercase tracking-wider">Back to Deck</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">EDIT AGENT</h1>
                <span className="px-3 py-1 bg-neutral-800 text-mint-glow rounded-full text-xs font-bold uppercase tracking-wider">
                  Preview
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white transition-colors">
                <TestTube size={16} />
                <span className="text-sm font-medium">Test Run</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-mint-glow text-black font-bold rounded-lg hover:bg-mint-glow/90 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span className="text-sm uppercase tracking-wider">Save Manifest</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-neutral-800 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'configuration', label: 'Configuration', icon: SettingsIcon },
                { id: 'tool-access', label: 'Tool Access', icon: Zap },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'bidding', label: 'Bidding Strategy', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id 
                      ? 'bg-mint-glow text-black' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <OverviewTab agent={agent} setAgent={setAgent} />
            )}
            {activeTab === 'configuration' && (
              <ConfigurationTab agent={agent} setAgent={setAgent} />
            )}
            {activeTab === 'tool-access' && (
              <ToolAccessTab agent={agent} setAgent={setAgent} />
            )}
            {activeTab === 'security' && (
              <SecurityTab agent={agent} setAgent={setAgent} />
            )}
            {activeTab === 'bidding' && (
              <BiddingTab agent={agent} setAgent={setAgent} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Overview Tab - Identity Core
const OverviewTab: React.FC<{ agent: Agent; setAgent: (agent: Agent) => void }> = ({ agent, setAgent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8"
    >
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-mint-glow rounded-xl flex items-center justify-center">
            <Brain size={24} className="text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">IDENTITY CORE</h2>
            <p className="text-neutral-400 mt-1">
              Define your agent's personality, response logic, including role, goals, skills, and constraints.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">
                Display Name
              </label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-xl focus:border-mint-glow focus:outline-none text-white"
                placeholder="Agent Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">
                Personal Greeting
              </label>
              <input
                type="text"
                value={agent.greeting || ''}
                onChange={(e) => setAgent({ ...agent, greeting: e.target.value })}
                placeholder="hello.agent.pod"
                className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-xl focus:border-mint-glow focus:outline-none text-white"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">
              Neural Directive (System Prompt)
            </label>
            <textarea
              value={agent.system_prompt || agent.description || ''}
              onChange={(e) => setAgent({ ...agent, system_prompt: e.target.value })}
              placeholder="Define the behavior, constraints, and operational goals of your agent..."
              className="w-full h-48 p-6 bg-neutral-900 border border-neutral-700 rounded-xl focus:border-mint-glow focus:outline-none text-white resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800">
              <div className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-[0.2em]">
                Price Users
              </div>
              <div className="text-3xl font-black text-white mb-1">12.4k</div>
              <div className="text-xs text-mint-glow font-bold">+8.1%</div>
            </div>
            <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800">
              <div className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-[0.2em]">
                Availability
              </div>
              <div className="text-3xl font-black text-white mb-1">99.2%</div>
              <div className="text-xs text-mint-glow font-bold">Stable</div>
            </div>
            <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800">
              <div className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-[0.2em]">
                Credits
              </div>
              <div className="text-3xl font-black text-white mb-1">1,240</div>
              <div className="text-xs text-neutral-400 font-bold">CR</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Configuration Tab
const ConfigurationTab: React.FC<{ agent: Agent; setAgent: (agent: Agent) => void }> = ({ agent, setAgent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8"
    >
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Configuration</h2>
        
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">
                Category
              </label>
              <select
                value={agent.category}
                onChange={(e) => setAgent({ ...agent, category: e.target.value })}
                className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-xl focus:border-mint-glow focus:outline-none text-white"
              >
                <option value="Finance">Finance</option>
                <option value="Content Creation">Content Creation</option>
                <option value="Development">Development</option>
                <option value="Data Analysis">Data Analysis</option>
                <option value="Social Media">Social Media</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">
                Version
              </label>
              <input
                type="text"
                value={agent.version || ''}
                onChange={(e) => setAgent({ ...agent, version: e.target.value })}
                className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-xl focus:border-mint-glow focus:outline-none text-white"
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">
              Repository URL
            </label>
            <input
              type="url"
              value={agent.repo_url || ''}
              onChange={(e) => setAgent({ ...agent, repo_url: e.target.value })}
              className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-xl focus:border-mint-glow focus:outline-none text-white"
              placeholder="https://github.com/username/agent-repo"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Tool Access Tab
const ToolAccessTab: React.FC<{ agent: Agent; setAgent: (agent: Agent) => void }> = ({ agent, setAgent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8"
    >
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Tool Access</h2>
        
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus size={24} className="text-neutral-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">No tools added yet</h3>
          <p className="text-neutral-400 mb-8">Configure API endpoints and tools for your agent</p>
          <button className="px-8 py-3 bg-mint-glow text-black font-bold rounded-xl hover:bg-mint-glow/90 transition-colors">
            Add Tool
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Security Tab
const SecurityTab: React.FC<{ agent: Agent; setAgent: (agent: Agent) => void }> = ({ agent, setAgent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8"
    >
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Security</h2>
        
        <div className="space-y-6">
          <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-lg font-bold mb-4">Access Control</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 text-mint-glow bg-neutral-800 border-neutral-600 rounded focus:ring-mint-glow" />
                <span>Require authentication for all requests</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 text-mint-glow bg-neutral-800 border-neutral-600 rounded focus:ring-mint-glow" />
                <span>Enable rate limiting</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Bidding Strategy Tab
const BiddingTab: React.FC<{ agent: Agent; setAgent: (agent: Agent) => void }> = ({ agent, setAgent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8"
    >
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Bidding Strategy</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-[0.2em]">
              Base Price (Credits)
            </label>
            <input
              type="number"
              value={Math.floor((agent.price_microalgo || 0) / 1000000)}
              onChange={(e) => setAgent({ 
                ...agent, 
                price_microalgo: parseInt(e.target.value) * 1000000 
              })}
              className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-xl focus:border-mint-glow focus:outline-none text-white"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};