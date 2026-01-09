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
  Shield,
  ChevronDown,
  ChevronUp,
  Copy,
  MoreHorizontal
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
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tool: true,
    greeting: true,
    shortcuts: true,
    authentication: true
  });

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
    } catch (err) {
      console.error('Failed to save agent:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Left Sidebar - Fine Tuning */}
      <div className="w-80 border-r border-neutral-800 bg-white/5 flex flex-col">
        {/* Header with back button and agent info */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href={`/agents/${agent.id}`}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                <Copy size={16} />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-mint-glow text-black font-bold rounded-lg hover:bg-mint-glow/90 transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : null}
                Publish
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-neutral-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">{agent.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-mint-glow text-black rounded text-xs font-bold uppercase">
                  Custom
                </span>
                <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs font-bold uppercase">
                  Draft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fine Tuning Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Fine Tuning</h2>
            <div className="text-sm text-neutral-400 mb-4">Background Setting</div>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm text-neutral-300 leading-relaxed">
              Edit the Agent's personality and response logic, including role, goals, skills, and constraints.
            </div>
            <div className="text-sm text-neutral-500">Sample:------------------------</div>
            
            <div className="space-y-3">
              <div>
                <div className="text-mint-glow font-semibold mb-1 text-sm">Role:</div>
                <div className="text-sm text-neutral-400">sample role</div>
              </div>
              
              <div>
                <div className="text-mint-glow font-semibold mb-1 text-sm">Goal:</div>
                <div className="text-sm text-neutral-400">sample goal</div>
              </div>
              
              <div>
                <div className="text-mint-glow font-semibold mb-1 text-sm">Skills:</div>
                <div className="text-sm text-neutral-400 space-y-1">
                  <div>1. Skill 1</div>
                  <div>2. Skill 2</div>
                  <div>3. Skill 3</div>
                </div>
              </div>
              
              <div>
                <div className="text-mint-glow font-semibold mb-1 text-sm">Constraints:</div>
                <div className="text-sm text-neutral-400 space-y-1">
                  <div>1. Constraint 1</div>
                  <div>2. Constraint 2</div>
                  <div>3. Constraint 3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Content Area */}
      <div className="flex-1 bg-black overflow-y-auto">
        <div className="p-6">
          {/* AI Badge */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">AI</span>
          </div>

          {/* Tool Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('tool')}
              className="flex items-center justify-between w-full mb-4 group"
            >
              <div className="flex items-center gap-2">
                <ChevronDown 
                  size={16} 
                  className={`text-neutral-400 transition-transform ${expandedSections.tool ? 'rotate-0' : '-rotate-90'}`} 
                />
                <span className="text-lg font-medium">Tool</span>
              </div>
              <Plus size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
            </button>
            
            {expandedSections.tool && (
              <div className="ml-6 mb-6">
                <div className="bg-neutral-900/30 rounded-lg p-4 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-neutral-700 rounded flex items-center justify-center">
                      <Zap size={12} className="text-neutral-400" />
                    </div>
                    <span className="text-neutral-400 text-sm">No tools added yet</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Greeting Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('greeting')}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center gap-2">
                <ChevronDown 
                  size={16} 
                  className={`text-neutral-400 transition-transform ${expandedSections.greeting ? 'rotate-0' : '-rotate-90'}`} 
                />
                <span className="text-lg font-medium">Greeting</span>
              </div>
            </button>
            
            {expandedSections.greeting && (
              <div className="ml-6 mb-6">
                <input
                  type="text"
                  value={agent.greeting || ''}
                  onChange={(e) => setAgent({ ...agent, greeting: e.target.value })}
                  placeholder="Enter a shortcut phrase..."
                  className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-mint-glow focus:outline-none text-white text-sm"
                />
                <div className="flex items-center gap-2 mt-3">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className="text-purple-400 text-sm">AI</span>
                </div>
              </div>
            )}
          </div>

          {/* Shortcuts Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('shortcuts')}
              className="flex items-center justify-between w-full mb-4 group"
            >
              <div className="flex items-center gap-2">
                <ChevronDown 
                  size={16} 
                  className={`text-neutral-400 transition-transform ${expandedSections.shortcuts ? 'rotate-0' : '-rotate-90'}`} 
                />
                <span className="text-lg font-medium">Shortcuts</span>
              </div>
              <Plus size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
            </button>
            
            {expandedSections.shortcuts && (
              <div className="ml-6 mb-6">
                <div className="text-neutral-400 text-sm">No shortcuts added yet</div>
              </div>
            )}
          </div>

          {/* Authentication Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('authentication')}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center gap-2">
                <ChevronDown 
                  size={16} 
                  className={`text-neutral-400 transition-transform ${expandedSections.authentication ? 'rotate-0' : '-rotate-90'}`} 
                />
                <span className="text-lg font-medium">Authentication</span>
              </div>
            </button>
            
            {expandedSections.authentication && (
              <div className="ml-6 mb-6">
                <div className="flex items-center justify-between">
                  <select className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-mint-glow focus:outline-none text-sm">
                    <option>None</option>
                    <option>API Key</option>
                    <option>Bearer Token</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-neutral-400" />
                    <span className="text-neutral-400 text-sm">Add anything</span>
                    <Shield size={16} className="text-yellow-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Preview */}
      <div className="w-80 border-l border-neutral-800 bg-white/5 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview</h3>
            <MoreHorizontal size={16} className="text-neutral-400" />
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                <User size={16} className="text-neutral-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{agent.name}</div>
                <div className="text-xs text-neutral-400">Tool</div>
              </div>
              <Copy size={14} className="text-neutral-400" />
            </div>
            
            <div className="text-sm text-neutral-400 leading-relaxed">
              {agent.description || 'Agent description will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}