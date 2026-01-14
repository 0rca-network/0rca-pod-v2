'use client';

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Zap, ShieldCheck, Globe, Clock, RefreshCw, Settings } from 'lucide-react';
import { AgentThumbnail } from '@/components/AgentThumbnail';
import { AgentDetailSkeleton } from '@/components/LoadingSkeleton';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

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
}

interface AgentDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default function AgentDetailsPage({ params }: AgentDetailsPageProps) {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [executing, setExecuting] = useState(false);
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

    useEffect(() => {
        const resolveParams = async () => {
            const resolved = await params;
            setResolvedParams(resolved);
        };
        resolveParams();
    }, [params]);

    const fetchAgent = useCallback(async () => {
        if (!resolvedParams?.id) return;

        try {
            setLoading(true);
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('agents')
                .select('*')
                .eq('id', resolvedParams.id)
                .single();

            if (fetchError) throw fetchError;
            setAgent(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load agent');
        } finally {
            setLoading(false);
        }
    }, [resolvedParams?.id]);

    useEffect(() => {
        if (resolvedParams?.id) {
            fetchAgent();
        }
    }, [resolvedParams?.id, fetchAgent]);

    const handleExecuteAgent = async () => {
        if (!agent) return;

        setExecuting(true);
        try {
            // Simulate agent execution - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Add your agent execution logic here
            console.log('Executing agent:', agent.name);
        } catch (err) {
            console.error('Failed to execute agent:', err);
        } finally {
            setExecuting(false);
        }
    };

    if (loading) {
        return <AgentDetailSkeleton />;
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8"
                >
                    <span className="text-4xl">⚠️</span>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 font-outfit">
                    {error ? 'LOADING FAILED' : 'AGENT NOT FOUND'}
                </h1>
                <p className="text-neutral-500 mb-8 max-w-md text-sm md:text-base">
                    {error || 'The agent you are looking for does not exist or has been decommissioned.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={fetchAgent}
                        className="px-6 py-3 bg-neutral-800 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-all flex items-center gap-2"
                        aria-label="Retry loading agent"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                    <Link
                        href="/agents"
                        className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all"
                    >
                        Back to Directory
                    </Link>
                </div>
            </div>
        );
    }

    const credits = Math.floor((agent.price_microalgo || 0) / 1000000).toString();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-black min-h-screen text-white"
        >
            {/* Header Spacer */}
            <div className="h-24 md:h-32" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <Link
                    href="/agents"
                    className="inline-flex items-center gap-3 text-neutral-500 hover:text-mint-glow mb-8 lg:mb-12 transition-all group font-bold text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-mint-glow/50 rounded-lg p-2 -m-2"
                    aria-label="Back to agent directory"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                    Back to Directory
                </Link>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
                    {/* Left Column: Visuals & Stats */}
                    <div className="xl:col-span-5 space-y-6 lg:space-y-8">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/5 relative bg-[#050505] shadow-2xl"
                        >
                            <AgentThumbnail name={agent.name} category={agent.category} className="w-full h-full" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-4 lg:bottom-8 left-4 lg:left-8 right-4 lg:right-8 flex justify-between items-end">
                                <div>
                                    <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Status</div>
                                    <div className="flex items-center gap-2 text-mint-glow font-bold text-sm lg:text-base">
                                        <span className="w-2 h-2 rounded-full bg-mint-glow animate-pulse" />
                                        Operational
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Architecture</div>
                                    <div className="text-white font-bold text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                                        {agent.subdomain || 'Standard'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="grid grid-cols-2 gap-3 lg:gap-4"
                        >
                            <div className="p-4 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] bg-[#0A0A0A] border border-white/5 space-y-2">
                                <div className="text-neutral-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">Pricing</div>
                                <div className="text-2xl lg:text-3xl font-black font-outfit text-white">
                                    {credits} <span className="text-mint-glow">CR</span>
                                </div>
                            </div>
                            <div className="p-4 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] bg-[#0A0A0A] border border-white/5 space-y-2 text-right">
                                <div className="text-neutral-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">Version</div>
                                <div className="text-2xl lg:text-3xl font-black font-outfit text-white truncate">
                                    {agent.version || '1.0'}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Information & Actions */}
                    <div className="xl:col-span-7 space-y-8 lg:space-y-12">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="space-y-4 lg:space-y-6"
                        >
                            <div className="flex flex-wrap gap-2 lg:gap-3">
                                <span className="px-3 lg:px-4 py-1 lg:py-1.5 bg-mint-glow/10 text-mint-glow border border-mint-glow/20 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">
                                    {agent.category || 'General'}
                                </span>
                                <span className="px-3 lg:px-4 py-1 lg:py-1.5 bg-white/5 text-neutral-400 border border-white/10 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 lg:gap-2">
                                    <ShieldCheck size={10} className="lg:w-3 lg:h-3" /> Verified Agent
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black font-outfit tracking-tighter leading-none break-words">
                                {agent.name.toUpperCase()}
                            </h1>

                            <p className="text-lg sm:text-xl lg:text-2xl text-neutral-400 leading-relaxed font-light">
                                {agent.description || 'This autonomous agent is configured for high-performance execution within the 0rca Pod ecosystem.'}
                            </p>
                        </motion.div>

                        {agent.tags && agent.tags.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex flex-wrap gap-2 lg:gap-3 py-6 lg:py-8 border-y border-white/5"
                            >
                                {agent.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="px-3 lg:px-5 py-2 lg:py-2.5 bg-[#0A0A0A] border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-neutral-600 transition-all cursor-default"
                                    >
                                        #{tag.toUpperCase()}
                                    </span>
                                ))}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="pt-4 space-y-6 lg:space-y-8"
                        >
                            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                                <button
                                    onClick={handleExecuteAgent}
                                    disabled={executing}
                                    className="flex-1 bg-white text-black font-black py-4 lg:py-6 rounded-full text-lg lg:text-xl hover:bg-mint-glow hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-mint-glow/50"
                                    aria-label={executing ? 'Executing agent...' : 'Execute agent'}
                                >
                                    {executing ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            EXECUTING...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={20} className="lg:w-6 lg:h-6 fill-current" />
                                            EXECUTE AGENT
                                        </>
                                    )}
                                </button>
                                <div className="flex gap-3">
                                    <Link
                                        href={`/edit/${agent.id}`}
                                        className="px-6 lg:px-8 py-4 lg:py-6 bg-transparent border-2 border-mint-glow/20 text-mint-glow rounded-full font-black text-sm uppercase tracking-widest hover:bg-mint-glow/5 hover:border-mint-glow transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-mint-glow/50"
                                        aria-label="Edit agent"
                                    >
                                        <Settings size={16} className="lg:w-5 lg:h-5" />
                                        EDIT
                                    </Link>
                                    {agent.repo_url && (
                                        <a
                                            href={agent.repo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 lg:px-8 py-4 lg:py-6 bg-transparent border-2 border-white/10 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/5 hover:border-white transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                                            aria-label="View source code on GitHub"
                                        >
                                            <Github size={16} className="lg:w-5 lg:h-5" />
                                            SOURCE
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 lg:gap-10 text-neutral-600">
                                <div className="flex items-center gap-2" role="img" aria-label="Global protocol">
                                    <Globe size={14} className="lg:w-4 lg:h-4" />
                                    <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">Global Protocol</span>
                                </div>
                                <div className="flex items-center gap-2" role="img" aria-label="Instant deployment">
                                    <Clock size={14} className="lg:w-4 lg:h-4" />
                                    <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">Instant Deploy</span>
                                </div>
                                <div className="flex items-center gap-2" role="img" aria-label="Audited code">
                                    <ShieldCheck size={14} className="lg:w-4 lg:h-4" />
                                    <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">Audited Code</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
