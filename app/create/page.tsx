'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    Info,
    Search,
    Plus,
    X,
    RefreshCw
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { listAvailableRepos } from '@/lib/github-actions';

interface Repository {
    id: number;
    name: string;
    description: string;
    owner: { login: string };
    html_url: string;
    updated_at: string;
    pushed_at: string;
}

const agentOptions = [
    {
        id: 'flow',
        title: 'Visual Flow Builder',
        description: 'Design complex agent logic with a powerful drag-and-drop node system.',
        icon: GitBranch,
        gradient: 'from-[#22d3ee] to-[#3b82f6]',
    },
    {
        id: 'custom',
        title: 'Create AI Agent',
        description: 'Build your own specialized agent from scratch, integrate APIs, or connect to MCP servers.',
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
    {
        id: 'cdc-agent',
        title: 'Crypto.com AI Agent',
        description: 'Launch a specialized DeFi agent powered by the Crypto.com SDK.',
        icon: Wallet,
        gradient: 'from-[#002D74] to-[#0057E6]',
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
        icon: 'zap',
        repoUrl: ''
    });

    const [githubUser, setGithubUser] = useState<any>(null);
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);

    const fetchRepos = useCallback(async () => {
        setLoadingRepos(true);
        try {
            const result = await listAvailableRepos();
            if (result.success && result.repos) {
                const formattedRepos = result.repos.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    owner: { login: r.owner },
                    html_url: r.html_url,
                    updated_at: r.updated_at,
                    pushed_at: r.pushed_at
                }));
                setRepos(formattedRepos);
            }
        } catch (error) {
            console.error('Error fetching repos:', error);
        }
        setLoadingRepos(false);
    }, []);

    const checkSession = useCallback(async () => {
        fetchRepos();
    }, [fetchRepos]);

    useEffect(() => {
        setMounted(true);
        const savedOption = localStorage.getItem('create_agent_selected_option');
        if (savedOption) {
            setSelectedOption(savedOption);
            localStorage.removeItem('create_agent_selected_option');
        }
        checkSession();
    }, [checkSession]);

    const filteredRepos = React.useMemo(() => {
        const search = searchQuery.toLowerCase().trim();
        if (!search) {
            return [...repos].sort((a, b) => {
                const timeA = new Date(a.pushed_at || a.updated_at).getTime();
                const timeB = new Date(b.pushed_at || b.updated_at).getTime();
                return timeB - timeA;
            });
        }

        return repos
            .filter(repo => {
                const nameMatch = repo.name.toLowerCase().includes(search);
                const ownerMatch = repo.owner.login.toLowerCase().includes(search);
                const descMatch = repo.description?.toLowerCase().includes(search);
                return nameMatch || ownerMatch || descMatch;
            })
            .sort((a, b) => {
                const timeA = new Date(a.pushed_at || a.updated_at).getTime();
                const timeB = new Date(b.pushed_at || b.updated_at).getTime();
                return timeB - timeA;
            });
    }, [repos, searchQuery]);

    const signInWithGitHub = async () => {
        if (selectedOption) {
            localStorage.setItem('create_agent_selected_option', selectedOption);
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                scopes: 'repo read:user',
                redirectTo: `${window.location.origin}/auth/callback?next=/create`
            }
        });
        if (error) console.error('Error:', error);
    };

    const handleNextStep = () => {
        if (!selectedOption) return;
        if (selectedOption === 'flow') {
            window.location.href = 'https://flow.0rca.network';
            return;
        }
        setStep(2);
    };

    const handleFinalize = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            toast.error("Please authenticate (GitHub or Wallet) to initialize your agent.");
            return;
        }

        if (!isConnected) {
            toast.error("Please connect your wallet to proceed.");
            return;
        }

        const idToast = toast.loading("Initializing agent architecture...");

        try {
            // Generate a subdomain (slugified name)
            const subdomain = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(7);

            // Extract owner and repo from URL
            let repoOwner = 'unknown';
            let repoName = 'unknown';
            if (formData.repoUrl) {
                const parts = formData.repoUrl.replace('https://github.com/', '').split('/');
                repoOwner = parts[0];
                repoName = parts[1];
            }

            const { data: agent, error } = await supabase
                .from('agents')
                .insert({
                    user_id: session.user.id,
                    name: formData.name,
                    description: formData.description,
                    subdomain: subdomain,
                    repo_owner: repoOwner,
                    repo_name: repoName,
                    github_url: formData.repoUrl,
                    status: 'pending',
                    port: 8000,
                    k8s_namespace: 'agents'
                })
                .select()
                .single();

            if (error) throw error;

            toast.update(idToast, {
                render: "Agent core initialized!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            if (selectedOption === 'cdc-agent') {
                router.push(`/edit/cdc-agent/${agent.id}`);
            } else if (selectedOption === 'github') {
                router.push(`/import/github/${agent.id}`);
            } else {
                router.push(`/edit/agent/${agent.id}`);
            }
        } catch (error: any) {
            console.error('Finalization error:', error);
            toast.update(idToast, {
                render: `Initialization failed: ${error.message}`,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
        }
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

                            {/* GitHub Repo Selection (Conditional) */}
                            {selectedOption === 'github' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4 px-6">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Source Repository</label>
                                        <a
                                            href="https://github.com/apps/0rca-network"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-mint-glow hover:underline flex items-center gap-1"
                                        >
                                            <Github size={12} />
                                            Configure App
                                        </a>
                                    </div>

                                    {!formData.repoUrl ? (
                                        <button
                                            onClick={() => setIsRepoModalOpen(true)}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] py-10 flex flex-col items-center justify-center gap-4 hover:border-mint-glow/30 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all">
                                                <Plus size={24} className="text-neutral-500 group-hover:text-mint-glow" />
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">Connect Repository</span>
                                        </button>
                                    ) : (
                                        <div className="relative group">
                                            <div className="w-full bg-[#0a0a0a] border border-mint-glow/30 rounded-[2.5rem] p-8 flex items-center justify-between group-hover:border-mint-glow/60 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
                                                        <Github size={24} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-bold font-outfit uppercase tracking-tight">{formData.name}</p>
                                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">
                                                            {formData.repoUrl.replace('https://github.com/', '')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsRepoModalOpen(true)}
                                                    className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Repository Selection Modal */}
                                    <AnimatePresence>
                                        {isRepoModalOpen && (
                                            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 md:px-0">
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => setIsRepoModalOpen(false)}
                                                    className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                                                >
                                                    {/* Modal Header */}
                                                    <div className="p-10 border-b border-white/5 space-y-8">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter">Select Repository</h2>
                                                                <p className="text-xs text-neutral-500 font-medium">Browse app-authorized repositories sorted by recent activity.</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setIsRepoModalOpen(false)}
                                                                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>

                                                        <div className="relative group">
                                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-mint-glow transition-colors">
                                                                <Search size={18} />
                                                            </div>
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                placeholder="Filter by name or description..."
                                                                className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-sm font-medium placeholder:text-neutral-800 focus:outline-none focus:border-mint-glow/50 transition-all shadow-inner"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Repository List */}
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                                        {loadingRepos ? (
                                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                                <div className="w-12 h-12 border-2 border-mint-glow/20 border-t-mint-glow rounded-full animate-spin" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Querying Installations...</p>
                                                            </div>
                                                        ) : filteredRepos.length > 0 ? (
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {filteredRepos.map((repo) => (
                                                                    <button
                                                                        key={repo.id}
                                                                        onClick={() => {
                                                                            setFormData({
                                                                                ...formData,
                                                                                name: repo.name,
                                                                                description: repo.description || '',
                                                                                repoUrl: repo.html_url
                                                                            });
                                                                            setIsRepoModalOpen(false);
                                                                        }}
                                                                        className={`flex flex-col items-start p-6 rounded-3xl transition-all border ${formData.repoUrl === repo.html_url
                                                                            ? 'bg-mint-glow border-mint-glow text-black shadow-xl shadow-mint-glow/10'
                                                                            : 'bg-black/40 border-white/5 hover:border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <Github size={14} className={formData.repoUrl === repo.html_url ? 'text-black' : 'text-neutral-500'} />
                                                                            <span className="font-bold uppercase tracking-tight text-lg">{repo.name}</span>
                                                                        </div>
                                                                        <p className={`text-xs text-left line-clamp-2 ${formData.repoUrl === repo.html_url ? 'text-black/60 font-medium' : 'text-neutral-500 font-light'}`}>
                                                                            {repo.description || 'No description provided.'}
                                                                        </p>
                                                                        <div className="flex items-center gap-4 mt-4">
                                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${formData.repoUrl === repo.html_url ? 'text-black/40' : 'text-neutral-600'}`}>
                                                                                {repo.owner.login}
                                                                            </span>
                                                                            <span className={`text-[9px] font-mono ${formData.repoUrl === repo.html_url ? 'text-black/30' : 'text-neutral-700'}`}>
                                                                                Pushed {new Date(repo.pushed_at || repo.updated_at).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                                                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                                                                    <Search size={24} className="text-neutral-700" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-bold text-neutral-400">No matches found</p>
                                                                    <p className="text-xs text-neutral-600">Try adjusting your filter or <a href="https://github.com/apps/0rca-network" target="_blank" rel="noreferrer" className="text-mint-glow hover:underline">configure the app</a>.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-8 border-t border-white/5 flex justify-center">
                                                        <button
                                                            onClick={fetchRepos}
                                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 hover:text-white transition-colors"
                                                        >
                                                            <RefreshCw size={12} className={loadingRepos ? 'animate-spin' : ''} />
                                                            Synchronize Repositories
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

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
        </div >
    );
}
