'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Zap,
    Shield,
    Terminal,
    Save,
    Play,
    ArrowLeft,
    Plus,
    Sparkles,
    Copy,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    MessageSquare,
    Send,
    Ghost,
    Key,
    MessageCircle,
    Edit3,
    Upload,
    Share2
} from 'lucide-react';
import Link from 'next/link';
import { CreateToolModal } from '@/components/CreateToolModal';

export default function EditAgentPage() {
    const params = useParams();
    const id = params.agentId;
    const [agentName, setAgentName] = useState('New Agent');
    const [showToolModal, setShowToolModal] = useState(false);

    return (
        <div className="bg-[#0A0A0A] min-h-screen text-white font-inter selection:bg-mint-glow selection:text-black flex flex-col">
            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-white/5 bg-[#0D0D0D] px-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/agents" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft size={18} className="text-neutral-400" />
                    </Link>
                    <div className="h-8 w-[1px] bg-white/10 mx-1" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint-glow to-blue-600 flex items-center justify-center">
                            <Zap size={16} className="text-black" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm tracking-tight">{agentName}</span>
                            <Edit3 size={14} className="text-neutral-500 cursor-pointer hover:text-white" />
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint-glow/10 text-mint-glow border border-mint-glow/20">CUSTOM</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-white/5 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                                Draft
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[11px] text-neutral-500 font-mono">draft auto-saved 13:16:45</span>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                        <Save size={18} className="text-neutral-400 group-hover:text-white" />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2 bg-mint-glow text-black rounded-full text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-mint-glow/20">
                        <Share2 size={14} />
                        Publish
                    </button>
                </div>
            </header>

            {/* Sub-header / Tabs */}
            <div className="h-12 border-b border-white/5 bg-[#0D0D0D] px-10 flex items-center">
                <span className="text-xs font-bold text-neutral-400 border-b-2 border-mint-glow h-full flex items-center px-2 cursor-pointer">Fine Tuning</span>
            </div>

            {/* Main Content Grid */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 max-w-[1800px] mx-auto">

                    {/* Column 1: Background Setting */}
                    <div className="lg:col-span-4 border-r border-white/5 flex flex-col bg-[#0D0D0D]/50 relative">
                        <div className="p-6 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-neutral-300">Background Setting</h2>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-300 hover:brightness-125 transition-all">
                                <Sparkles size={12} />
                                AI
                            </button>
                        </div>
                        <div className="px-6 flex-1 flex flex-col min-h-0 mb-6">
                            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 relative group">
                                <button className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg">
                                    <Copy size={16} className="text-neutral-400 hover:text-white" />
                                </button>
                                <textarea
                                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-neutral-300 text-sm leading-relaxed font-mono"
                                    placeholder="Edit the Agent's personality and response logic, including role, goals, skills, and constraints..."
                                    defaultValue={`Role:\nsample role\n\nGoal:\nsample goal\n\nSkills:\n1. Skill 1\n2. Skill 2\n3. Skill 3\n\nConstraints:\n1. Constraint 1\n2. Constraint 2\n3. Constraint 3`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Configuration Blocks */}
                    <div className="lg:col-span-4 border-r border-white/5 flex flex-col bg-[#0A0A0A] overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-3">
                            <ConfigSection
                                title="Tool"
                                expanded={true}
                                onAdd={() => setShowToolModal(true)}
                            >
                                <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Settings size={16} className="text-blue-400" />
                                    </div>
                                    <span className="text-xs text-neutral-400 italic">No tools active</span>
                                </div>
                            </ConfigSection>

                            <ConfigSection title="Greeting" expanded={true} hasAI>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-neutral-300 focus:outline-none focus:border-mint-glow/30 min-h-[100px] resize-none"
                                        placeholder="Enter a shortcut phrase..."
                                    />
                                </div>
                            </ConfigSection>

                            <ConfigSection title="Shortcuts" expanded={false}>
                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                    <div className="p-3 bg-white/5 rounded-2xl mb-4">
                                        <MessageSquare size={24} className="text-neutral-600" />
                                    </div>
                                    <p className="text-xs text-neutral-500 font-medium">No shortcuts added yet</p>
                                </div>
                            </ConfigSection>

                            <ConfigSection title="Authentication" expanded={false} type="dropdown">
                                <div className="flex items-center justify-between px-4 py-3 bg-black/40 border border-white/5 rounded-xl">
                                    <span className="text-xs text-neutral-400">None</span>
                                    <ChevronDown size={14} className="text-neutral-600" />
                                </div>
                            </ConfigSection>
                        </div>
                    </div>

                    {/* Column 3: Preview */}
                    <div className="lg:col-span-4 bg-[#0D0D0D]/50 flex flex-col overflow-hidden">
                        <div className="p-6 flex items-center justify-between border-b border-white/5">
                            <h2 className="text-sm font-bold text-neutral-300">Preview</h2>
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <MoreHorizontal size={18} className="text-neutral-500" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col p-6 overflow-hidden">
                            {/* Agent Identity Preview */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-glow/20 to-blue-600/20 border border-mint-glow/20 flex items-center justify-center relative">
                                    <Zap size={24} className="text-mint-glow" />
                                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#0D0D0D] hover:scale-110 transition-transform">
                                        <Plus size={12} className="text-black" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-base leading-tight">{agentName}</h3>
                                    <p className="text-[11px] text-neutral-500 font-mono tracking-tighter uppercase">ID: {id}</p>
                                </div>
                            </div>

                            {/* Chat Preview Area */}
                            <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 flex flex-col overflow-hidden relative group">
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {/* Empty chat state or messages */}
                                </div>

                                {/* Chat Input */}
                                <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <button className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                                <Plus size={14} className="text-neutral-400" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ask anything."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-mint-glow/30 transition-all font-medium"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <Ghost size={16} className="text-neutral-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <CreateToolModal
                isOpen={showToolModal}
                onClose={() => setShowToolModal(false)}
                agentName={agentName}
                onSave={(tool) => {
                    console.log('Saved tool:', tool);
                    setShowToolModal(false);
                }}
            />

            {/* Global Background Elements */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-mint-glow/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

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
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}

function ConfigSection({ title, children, expanded = false, hasAI = false, type = 'normal', onAdd }: { title: string, children: React.ReactNode, expanded?: boolean, hasAI?: boolean, type?: 'normal' | 'dropdown', onAdd?: () => void }) {
    const [isExpanded, setIsExpanded] = useState(expanded);

    return (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
            <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                        <ChevronDown size={14} className="text-neutral-500" />
                    </div>
                    <span className="text-[13px] font-bold text-neutral-300">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {hasAI && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-400">
                            <Sparkles size={10} />
                            AI
                        </div>
                    )}
                    {type === 'normal' && (
                        <button
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onAdd) onAdd();
                            }}
                        >
                            <Plus size={16} className="text-neutral-500" />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/5"
                    >
                        <div className="p-5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
