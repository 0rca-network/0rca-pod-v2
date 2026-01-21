'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Plus,
  Trash2,
  Code,
  Eye,
  Settings as SettingsIcon,
  TestTube,
  Sparkles,
  ChevronDown,
  Wrench,
  Info,
  Globe,
  Lock,
  Zap,
  Check,
  ChevronRight,
  Search,
  Database,
  Layout,
  Cpu
} from 'lucide-react';
import { CREWAI_TOOLS } from '@/lib/crewai-tools';

interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  location: 'query' | 'header' | 'path' | 'cookie' | 'body';
}

interface Tool {
  name: string;
  description: string;
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  parameters: Parameter[];
  price: number;
  isTrigger: boolean;
  useAgentAuth: boolean;
  docAssistant: string;
}

interface CreateToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: any) => void;
  onAddCrewTool?: (toolId: string) => void;
  agentName?: string;
}

export const CreateToolModal: React.FC<CreateToolModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onAddCrewTool,
  agentName = "New Agent"
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'code' | 'marketplace'>('form');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeParamTab, setActiveParamTab] = useState<'query' | 'header' | 'path' | 'cookie' | 'body'>('query');
  const [tool, setTool] = useState<Tool>({
    name: '',
    description: '',
    baseUrl: 'http://localhost:80',
    endpoint: '/api',
    method: 'GET',
    parameters: [],
    price: 0,
    isTrigger: false,
    useAgentAuth: false,
    docAssistant: ''
  });

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const paramTypes = ['string', 'number', 'boolean', 'object', 'array'];

  const addParameter = () => {
    setTool({
      ...tool,
      parameters: [
        ...tool.parameters,
        { name: '', type: 'string', required: false, description: '', location: activeParamTab }
      ]
    });
  };

  const updateParameter = (index: number, updates: Partial<Parameter>) => {
    const newParams = [...tool.parameters];
    newParams[index] = { ...newParams[index], ...updates };
    setTool({ ...tool, parameters: newParams });
  };

  const removeParameter = (index: number) => {
    setTool({
      ...tool,
      parameters: tool.parameters.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-[#0F0F0F] border border-white/10 rounded-3xl w-full max-w-[1700px] h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <header className="h-16 border-b border-white/5 bg-[#141414] px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Wrench size={20} className="text-neutral-400" />
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">Create Tool</h2>
                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                  <span className="text-[11px] text-neutral-400 font-medium">#{agentName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 hover:bg-white/5 rounded-xl text-sm font-bold text-neutral-400 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={() => onSave(tool)}
                className="px-6 py-2 bg-mint-glow text-black rounded-xl text-sm font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-mint-glow/20 flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: sidebar settings */}
            <aside className="w-[320px] border-r border-white/5 p-6 space-y-8 bg-[#0D0D0D] overflow-y-auto">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tool.name}
                  onChange={(e) => setTool({ ...tool, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint-glow/30 transition-all"
                  placeholder="Enter tool name"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                  <input
                    type="number"
                    value={tool.price}
                    onChange={(e) => setTool({ ...tool, price: Number(e.target.value) })}
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-neutral-700"
                    placeholder="0"
                  />
                  <div className="h-4 w-[1px] bg-white/10 mx-1" />
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                    <span className="text-xs text-neutral-400 font-bold uppercase">USDC/call</span>
                    <ChevronDown size={14} className="text-neutral-500" />
                  </div>
                </div>
              </div>

              {/* Set as Trigger */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Set as Trigger</span>
                <button
                  onClick={() => setTool({ ...tool, isTrigger: !tool.isTrigger })}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${tool.isTrigger ? 'bg-mint-glow' : 'bg-neutral-800'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${tool.isTrigger ? 'left-6 bg-black' : 'left-1'}`} />
                </button>
              </div>

              {/* Doc Assistant */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Doc Assistant</label>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-400">
                    <Sparkles size={10} />
                    AI
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                  Input schema or url to create a tool. Enter the URL or schema and let Tars help you complete the configuration
                </p>
                <textarea
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-neutral-400 resize-none focus:outline-none focus:border-mint-glow/30 placeholder:text-neutral-700"
                  placeholder="Paste URL or schema here..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={tool.description}
                  onChange={(e) => setTool({ ...tool, description: e.target.value })}
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-300 resize-none focus:outline-none focus:border-mint-glow/30 placeholder:text-neutral-700"
                  placeholder="What does this tool do?"
                />
              </div>
            </aside>

            {/* Right Column: API settings */}
            <main className="flex-1 p-8 overflow-y-auto bg-[#0A0A0A] custom-scrollbar">
              <div className="max-w-[1200px] flex flex-col gap-10">

                {/* Top Actions & View Switcher */}
                <div className="flex items-center justify-between">
                  <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5">
                    <button
                      onClick={() => setActiveTab('form')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'form' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      <Eye size={14} />
                      Form View
                    </button>
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'code' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      <Code size={14} />
                      Code View
                    </button>
                    <button
                      onClick={() => setActiveTab('marketplace')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'marketplace' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      <Sparkles size={14} />
                      Marketplace
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                      <button className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-all">
                        <SettingsIcon size={14} />
                        Limit Settings
                      </button>
                      <div className="w-[1px] h-4 bg-white/10" />
                      <button className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[#00FF57] transition-all">
                        <Zap size={14} />
                        Test
                      </button>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => setTool({ ...tool, useAgentAuth: !tool.useAgentAuth })}
                        className={`w-9 h-4.5 rounded-full relative transition-colors duration-300 ${tool.useAgentAuth ? 'bg-mint-glow' : 'bg-neutral-800'}`}
                      >
                        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 ${tool.useAgentAuth ? 'left-5 bg-black' : 'left-0.5'}`} />
                      </button>
                      <span className="text-[11px] font-bold text-neutral-400 uppercase">Use agent authorization</span>
                    </div>
                  </div>
                </div>

                {/* API Compile Section */}
                {activeTab !== 'marketplace' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black font-outfit uppercase tracking-tighter">API Compile</h3>
                      <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                        <button className="px-3 py-1.5 rounded-md bg-[#1A1A1A] text-[10px] font-bold text-white shadow-sm">Path</button>
                        <button className="px-3 py-1.5 rounded-md text-[10px] font-bold text-neutral-500 hover:text-neutral-300">Components</button>
                      </div>
                    </div>

                    <div className="flex items-stretch gap-3">
                      <div className="relative group">
                        <select
                          value={tool.method}
                          onChange={(e) => setTool({ ...tool, method: e.target.value as any })}
                          className="appearance-none bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 pr-10 text-xs font-black text-mint-glow focus:outline-none focus:border-mint-glow/30 transition-all cursor-pointer h-full"
                        >
                          {httpMethods.map(m => <option key={m} className="bg-black" value={m}>{m}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                      </div>

                      <div className="flex-1 flex items-stretch gap-0 bg-black/40 border border-white/10 rounded-xl px-4 group focus-within:border-mint-glow/30 transition-all">
                        <input
                          className="bg-transparent text-sm text-neutral-300 font-mono focus:outline-none w-[200px] text-right"
                          value={tool.baseUrl}
                          onChange={(e) => setTool({ ...tool, baseUrl: e.target.value })}
                          placeholder="http://base-url"
                        />
                        <div className="w-[1px] h-6 self-center bg-white/10 mx-4" />
                        <input
                          className="flex-1 bg-transparent text-sm font-mono focus:outline-none placeholder:text-neutral-700"
                          value={tool.endpoint}
                          onChange={(e) => setTool({ ...tool, endpoint: e.target.value })}
                          placeholder="/api/example"
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Parameters Section */}
                {activeTab !== 'marketplace' && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-lg font-bold">Parameters</h3>
                      <ChevronDown size={20} className="text-neutral-600" />
                    </div>

                    <div className="flex bg-white/5 rounded-xl p-1 gap-1 w-fit">
                      {(['query', 'header', 'path', 'cookie', 'body'] as const).map(tab => {
                        const count = tool.parameters.filter(p => p.location === tab).length;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveParamTab(tab)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold capitalize transition-all flex items-center gap-2 ${activeParamTab === tab ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                          >
                            {tab === 'query' ? 'Query Params' : tab === 'header' ? 'Headers' : tab === 'path' ? 'Path' : tab === 'cookie' ? 'Cookie' : 'Body'}
                            {count > 0 && <span className="bg-mint-glow/20 text-mint-glow px-1.5 py-0.5 rounded text-[8px]">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      {/* Headers for the list */}
                      {tool.parameters.filter(p => p.location === activeParamTab).length > 0 && (
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black uppercase text-neutral-500 tracking-widest bg-white/[0.02] rounded-lg">
                          <div className="col-span-3">Name</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2 text-center">Required</div>
                          <div className="col-span-4">Description</div>
                          <div className="col-span-1"></div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <AnimatePresence>
                          {tool.parameters.map((param, idx) => (
                            param.location === activeParamTab && (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 border border-white/5 rounded-xl items-center group"
                              >
                                <div className="col-span-3">
                                  <input
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-mint-glow/30 transition-all font-medium"
                                    value={param.name}
                                    onChange={(e) => updateParameter(idx, { name: e.target.value })}
                                    placeholder="param_name"
                                  />
                                </div>
                                <div className="col-span-2 relative">
                                  <select
                                    className="w-full appearance-none bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-400 focus:outline-none focus:border-mint-glow/30 cursor-pointer"
                                    value={param.type}
                                    onChange={(e) => updateParameter(idx, { type: e.target.value as any })}
                                  >
                                    {paramTypes.map(t => <option key={t} className="bg-black" value={t}>{t}</option>)}
                                  </select>
                                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
                                </div>
                                <div className="col-span-2 flex justify-center">
                                  <button
                                    onClick={() => updateParameter(idx, { required: !param.required })}
                                    className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${param.required ? 'bg-mint-glow' : 'bg-neutral-800'}`}
                                  >
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${param.required ? 'left-4.5 bg-black' : 'left-0.5'}`} />
                                  </button>
                                </div>
                                <div className="col-span-4">
                                  <input
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-400 focus:outline-none focus:border-mint-glow/30 transition-all"
                                    value={param.description}
                                    onChange={(e) => updateParameter(idx, { description: e.target.value })}
                                    placeholder="Describe this param"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                  <button
                                    onClick={() => removeParameter(idx)}
                                    className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </motion.div>
                            )
                          ))}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={addParameter}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.03] border border-dashed border-white/10 rounded-xl text-xs font-bold text-neutral-500 hover:text-white hover:bg-white/5 hover:border-mint-glow/30 transition-all mt-2"
                      >
                        <Plus size={14} />
                        Add Parameter to {activeParamTab.charAt(0).toUpperCase() + activeParamTab.slice(1)}
                      </button>
                    </div>
                  </section>
                )}

                {/* Response Section */}
                {activeTab !== 'marketplace' && (
                  <section className="space-y-6 pt-10 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Response</h3>
                      <ChevronDown size={20} className="text-neutral-600" />
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-neutral-500">Status Code:</span>
                      <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                        <Plus size={16} />
                      </button>
                    </div>
                  </section>
                )}

                {activeTab === 'marketplace' && (
                  <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">Tool Marketplace</h3>
                        <p className="text-xs text-neutral-500 font-medium mt-1">Select from hundreds of pre-built CrewAI specialized tools.</p>
                      </div>
                      <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Search tools..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-mint-glow/30 w-[300px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {CREWAI_TOOLS.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())).map((t) => (
                        <div
                          key={t.id}
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-mint-glow/30 hover:bg-white/[0.04] transition-all group cursor-pointer flex flex-col justify-between h-[180px]"
                          onClick={() => {
                            if (onAddCrewTool) onAddCrewTool(t.id);
                            onClose();
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 rounded-xl bg-mint-glow/10 flex items-center justify-center text-mint-glow group-hover:scale-110 transition-transform">
                                {t.id.includes('Search') ? <Search size={20} /> : t.id.includes('Read') ? <Layout size={20} /> : t.id.includes('Code') ? <Cpu size={20} /> : <Database size={20} />}
                              </div>
                              <div className="px-2 py-1 rounded bg-white/5 text-[9px] font-black uppercase tracking-widest text-neutral-500 border border-white/5">CrewAI</div>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-mint-glow transition-colors">{t.name}</h4>
                            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{t.description}</p>
                          </div>
                          <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-mint-glow opacity-0 group-hover:opacity-100 transition-all">
                            Import Tool
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            </main>
          </div>

        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
        }
      `}</style>
    </AnimatePresence>
  );
};
