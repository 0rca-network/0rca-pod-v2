'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Settings,
    Zap,
    Shield,
    Terminal,
    Save,
    Play,
    LayoutDashboard,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function EditAgentPage() {
    const params = useParams();
    const id = params.agentId;

    return (
        <div className="bg-black min-h-screen text-white font-inter selection:bg-mint-glow selection:text-black">
            {/* Header Area */}
            <div className="h-20" />

            {/* Sidebar + Main Content Layout */}
            <div className="flex h-[calc(100vh-80px)] overflow-hidden">

                {/* Sidebar */}
                <aside className="w-64 border-r border-white/5 bg-[#050505] hidden lg:flex flex-col p-6">
                    <Link href="/agents" className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-10 text-xs font-black uppercase tracking-widest">
                        <ArrowLeft size={14} />
                        Back to Deck
                    </Link>

                    <nav className="space-y-2 flex-1">
                        <SidebarItem icon={LayoutDashboard} label="Overview" active />
                        <SidebarItem icon={Settings} label="Configuration" />
                        <SidebarItem icon={Terminal} label="Tool Access" />
                        <SidebarItem icon={Shield} label="Security" />
                        <SidebarItem icon={Zap} label="Bidding Strategy" />
                    </nav>

                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-mint-glow/5 border border-mint-glow/10">
                            <div className="w-2 h-2 rounded-full bg-mint-glow animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-mint-glow">Agent Online</span>
                        </div>
                    </div>
                </aside>

                {/* Main Editor Surface */}
                <main className="flex-1 overflow-y-auto bg-black relative">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-20 bg-black/50 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black font-outfit uppercase tracking-tighter">Edit Agent</h1>
                                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-white/10 text-[9px] font-black text-neutral-500 uppercase tracking-widest">#{id}</span>
                            </div>
                            <p className="text-xs text-neutral-500 font-mono">ID: {id}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all">
                                <Play size={14} className="text-mint-glow" />
                                Test Run
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-mint-glow text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                                <Save size={14} />
                                Save Manifest
                            </button>
                        </div>
                    </header>

                    {/* Editor Content */}
                    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12">

                        {/* Section: Identity */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-glow to-blue-600 flex items-center justify-center shadow-lg shadow-mint-glow/20">
                                    <Zap size={24} className="text-black" />
                                </div>
                                <h2 className="text-3xl font-black font-outfit tracking-tighter uppercase">Identity Core</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 ml-2">Display Name</label>
                                    <input
                                        type="text"
                                        placeholder="Agent Name"
                                        className="w-full bg-[#080808] border border-white/10 rounded-2xl py-5 px-6 font-bold font-outfit focus:outline-none focus:border-mint-glow/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 ml-2">Protocol Namespace</label>
                                    <input
                                        type="text"
                                        placeholder="namespace.pod"
                                        className="w-full bg-[#080808] border border-white/10 rounded-2xl py-5 px-6 font-mono text-sm focus:outline-none focus:border-mint-glow/50 transition-all text-neutral-400"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 ml-2">Neural Directive (System Prompt)</label>
                                <textarea
                                    rows={6}
                                    placeholder="Define the behavior, constraints, and operational goals of your agent..."
                                    className="w-full bg-[#080808] border border-white/10 rounded-3xl py-6 px-8 text-sm leading-relaxed focus:outline-none focus:border-mint-glow/50 transition-all resize-none"
                                />
                            </div>
                        </section>

                        {/* Section: Operational Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard label="Token Usage" value="12.4k" trend="+5.2%" />
                            <StatCard label="Success Rate" value="99.2%" trend="Stable" />
                            <StatCard label="Credits" value="1,240" unit="CR" />
                        </div>
                    </div>
                </main>
            </div>

            {/* Background Glow */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-mint-glow/5 rounded-full blur-[150px] -z-10" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] -z-10" />
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-mint-glow text-black' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
            <Icon size={18} />
            {label}
        </button>
    );
}

function StatCard({ label, value, unit, trend }: { label: string, value: string, unit?: string, trend?: string }) {
    return (
        <div className="p-6 rounded-[2rem] bg-[#080808] border border-white/5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{label}</p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black font-outfit">{value}</span>
                {unit && <span className="text-[10px] font-black text-neutral-400 mb-1">{unit}</span>}
            </div>
            {trend && <p className="text-[9px] font-bold text-mint-glow">{trend}</p>}
        </div>
    );
}
