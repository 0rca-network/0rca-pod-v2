'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Server,
    Sparkles,
    GitBranch,
    Github,
    Wallet,
    Cpu,
    Zap,
    Info
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const agentOptions = [
    {
        id: 'mcp',
        title: 'Import from MCP',
        description: 'Instantly connect to existing Model Context Protocol servers.',
        icon: Server,
        gradient: 'from-[#818cf8] to-[#c084fc]',
    },
    {
        id: 'flow',
        title: 'Visual Flow Builder',
        description: 'Design complex agent logic with a powerful drag-and-drop node system.',
        icon: GitBranch,
        gradient: 'from-[#22d3ee] to-[#3b82f6]',
    },
    {
        id: 'custom',
        title: 'Create Custom Agent',
        description: 'Build your own specialized agent from the ground up.',
        icon: Sparkles,
        gradient: 'from-[#34d399] to-[#3b82f6]',
    },
    {
        id: 'github',
        title: 'Import from GitHub',
        description: 'Connect your repository and deploy existing agent codebases.',
        icon: Github,
        gradient: 'from-[#94a3b8] to-[#475569]',
    },
];

const PRESET_ICONS = [
    { id: 'zap', icon: Zap, label: 'Energy' },
    { id: 'cpu', icon: Cpu, label: 'Tech' },
    { id: 'sparkles', icon: Sparkles, label: 'AI' },
    { id: 'server', icon: Server, label: 'Core' },
];

export default function CreateAgentPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const { login, authenticated, user, ready } = usePrivy();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'zap'
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNextStep = () => {
        if (!selectedOption) return;
        if (selectedOption === 'flow') {
            window.location.href = 'https://flow.0rca.network';
            return;
        }
        setStep(2);
    };

    const handleFinalize = async () => {
        const tempId = Math.random().toString(36).substring(7);
        router.push(`/edit/agent/${tempId}`);
    };

    if (!mounted || !ready) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-mint-glow/20 rounded-full" />
                    <div className="w-12 h-12 border-t-2 border-mint-glow rounded-full animate-spin absolute inset-0" />
                </div>
            </div>
        );
    }

    const isConnected = authenticated && user?.wallet?.address;

    if (!isConnected) {
        return (
            <div className="bg-black min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden relative">
                <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-mint-glow/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-10"
                >
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-mint-glow/30 blur-3xl rounded-full" />
                        <div className="relative w-28 h-28 bg-gradient-to-b from-[#0a0a0a] to-black border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                            <Wallet size={44} className="text-mint-glow" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black font-outfit tracking-tighter uppercase">Authenticate</h1>
                        <p className="text-neutral-500 text-lg font-light leading-relaxed">
                            Connect your wallet to access the <br />
                            <span className="text-white font-bold">0rca Pod Developer Suite.</span>
                        </p>
                    </div>
                    <button
                        onClick={login}
                        className="group relative w-full py-6 bg-mint-glow text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative flex items-center justify-center gap-3">
                            <Zap size={18} fill="currentColor" />
                            Connect Wallet
                        </span>
                    </button>
                    <Link href="/" className="inline-block text-neutral-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]">
                        Return to Network
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-white font-inter selection:bg-mint-glow selection:text-black relative overflow-x-hidden">
            {/* Header Spacer - Increased to prevent overlap */}
            <div className="h-32 md:h-44" />

            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-mint-glow/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px]" />
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-6 pb-24">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
                    <div className="space-y-6">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => step === 2 ? setStep(1) : router.push('/')}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft size={12} className="text-mint-glow" />
                            {step === 1 ? 'Cancel Creation' : 'Previous Step'}
                        </motion.button>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black font-outfit tracking-tighter leading-[0.85]"
                        >
                            {step === 1 ? 'CREATE' : 'IDENTITY'} <br />
                            <span className="text-mint-glow italic uppercase tracking-tight">{step === 1 ? 'Architecture.' : 'Core DNA.'}</span>
                        </motion.h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-end gap-2"
                    >
                        <div className="flex items-center gap-3 px-5 py-3 bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
                            <div className="w-2 h-2 rounded-full bg-mint-glow animate-pulse shadow-[0_0_10px_rgba(99,242,210,0.8)]" />
                            <span className="text-[10px] font-black font-mono text-neutral-300 tracking-tighter">
                                {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                            </span>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
                        >
                            {agentOptions.map((option, index) => {
                                const Icon = option.icon;
                                const isSelected = selectedOption === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedOption(option.id)}
                                        className={`
                                            group relative flex flex-col items-center text-center p-8 rounded-[2.5rem] transition-all duration-500 overflow-hidden
                                            ${isSelected
                                                ? 'bg-[#111] border-2 border-mint-glow ring-4 ring-mint-glow/5 shadow-[0_0_50px_rgba(99,242,210,0.1)]'
                                                : 'bg-[#0a0a0a] border border-white/5 hover:border-white/20'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-16 h-16 rounded-3xl bg-gradient-to-br ${option.gradient} 
                                            flex items-center justify-center mb-10 shadow-lg shadow-black/80
                                            group-hover:scale-110 transition-all duration-500 relative
                                        `}>
                                            <Icon className="w-8 h-8 text-white" />
                                            <div className="absolute inset-0 bg-inherit blur-xl opacity-40 -z-10" />
                                        </div>

                                        <div className="space-y-3 relative z-10 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold font-outfit text-white group-hover:text-mint-glow transition-colors uppercase tracking-tight">
                                                {option.title}
                                            </h3>
                                            <p className="text-xs text-neutral-500 leading-relaxed font-light px-2">
                                                {option.description}
                                            </p>
                                        </div>

                                        <div className={`
                                            mt-8 w-10 h-1 rounded-full transition-all duration-500
                                            ${isSelected ? 'bg-mint-glow w-20' : 'bg-neutral-800'}
                                        `} />
                                    </button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto space-y-12 mb-20"
                        >
                            {/* Icon Selection */}
                            <div className="space-y-6 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-mint-glow">Avatar Configuration</p>
                                <div className="flex justify-center gap-4">
                                    {PRESET_ICONS.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setFormData({ ...formData, icon: item.id })}
                                            className={`
                                                w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-500
                                                ${formData.icon === item.id
                                                    ? 'bg-mint-glow text-black border-mint-glow shadow-[0_0_30px_rgba(99,242,210,0.3)]'
                                                    : 'bg-neutral-900/50 border-white/5 text-neutral-500 hover:border-white/10'
                                                }
                                            `}
                                        >
                                            <item.icon size={32} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 ml-6">Designate Agent Handle</label>
                                    <div className="relative group">
                                        <div className="absolute left-7 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-mint-glow transition-colors">
                                            <Zap size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Cronos Sentinel"
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] py-7 pl-16 pr-8 text-xl font-bold font-outfit placeholder:text-neutral-800 focus:outline-none focus:border-mint-glow/50 focus:ring-8 focus:ring-mint-glow/5 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 ml-6">Mission Directives</label>
                                    <div className="relative group">
                                        <div className="absolute left-7 top-8 text-neutral-700 group-focus-within:text-mint-glow transition-colors">
                                            <Info size={20} />
                                        </div>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="What is this agent's primary function?"
                                            rows={4}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] py-7 pl-16 pr-8 text-lg font-light leading-relaxed placeholder:text-neutral-800 focus:outline-none focus:border-mint-glow/50 focus:ring-8 focus:ring-mint-glow/5 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer / Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-10 py-12 border-t border-white/5">
                    <div className="flex items-center gap-8">
                        <div className="flex -space-x-4">
                            <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-xs font-black transition-all ${step >= 1 ? 'bg-mint-glow text-black shadow-[0_0_20px_rgba(99,242,210,0.3)]' : 'bg-neutral-900 text-neutral-700'}`}>01</div>
                            <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-xs font-black transition-all ${step >= 2 ? 'bg-mint-glow text-black shadow-[0_0_20px_rgba(99,242,210,0.3)]' : 'bg-neutral-900/50 text-neutral-700'}`}>02</div>
                            <div className={`w-12 h-12 rounded-full border-2 border-black bg-neutral-900/30 flex items-center justify-center text-xs font-black text-neutral-800`}>03</div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-1">Architecture Pipeline</p>
                            <p className="text-sm font-bold text-neutral-200 tracking-tight">{step === 1 ? 'Select Architecture' : 'Define DNA Matrix'}</p>
                        </div>
                    </div>

                    <button
                        disabled={step === 1 ? !selectedOption : !formData.name || !formData.description}
                        onClick={step === 1 ? handleNextStep : handleFinalize}
                        className={`
                            group relative px-14 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500
                            ${(step === 1 ? selectedOption : (formData.name && formData.description))
                                ? 'bg-white text-black hover:bg-mint-glow hover:scale-[1.05] shadow-[0_20px_50px_rgba(99,242,210,0.2)]'
                                : 'bg-neutral-900 text-neutral-700 opacity-50 cursor-not-allowed'
                            }
                        `}
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            {step === 1 ? 'Initiate Core' : 'Deploy DNA'}
                            <ArrowRight className={`w-4 h-4 transition-transform duration-500 ${(step === 1 ? selectedOption : (formData.name && formData.description)) ? 'group-hover:translate-x-2' : ''}`} />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
