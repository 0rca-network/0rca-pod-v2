'use client';

import { Hero } from '@/components/Hero';
import { AgentCard } from '@/components/AgentCard';
import { ArrowRight, Zap, Cpu, Layers } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

interface Agent {
    id: string;
    name: string;
    repo_owner: string;
    price_microalgo: number;
    tags: string[];
    subdomain: string;
    category: string;
}

export default function Home() {
    const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await fetch('/api/agents?limit=4');
                const data = await res.json();
                setFeaturedAgents(data.agents || []);
            } catch (e) {
                console.error('Failed to fetch agents');
            }
        };
        fetchAgents();
    }, []);

    return (
        <div className="bg-black text-white selection:bg-mint-glow selection:text-black snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth">

            {/* Section 1: Hero */}
            <section className="snap-start min-h-screen flex flex-col">
                <div className="h-20 md:h-24 flex-shrink-0" />
                <Hero />
            </section>

            {/* Section 2: Stats */}
            <section className="snap-start min-h-screen flex flex-col justify-center px-4 relative">
                {/* Trust Bar at top of this section */}
                <div className="absolute top-0 left-0 right-0 border-b border-white/5 bg-white/[0.01] py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-3 opacity-20">
                            <span className="text-xs font-black tracking-[0.4em] uppercase">Cronos</span>
                            <span className="w-1 h-1 rounded-full bg-white/40 hidden md:block" />
                            <span className="text-xs font-black tracking-[0.4em] uppercase">Ethereum</span>
                            <span className="w-1 h-1 rounded-full bg-white/40 hidden md:block" />
                            <span className="text-xs font-black tracking-[0.4em] uppercase">Solana</span>
                            <span className="w-1 h-1 rounded-full bg-white/40 hidden md:block" />
                            <span className="text-xs font-black tracking-[0.4em] uppercase">Base</span>
                            <span className="w-1 h-1 rounded-full bg-white/40 hidden md:block" />
                            <span className="text-xs font-black tracking-[0.4em] uppercase">Polygon</span>
                        </div>
                    </div>
                </div>

                {/* Stats centered */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={staggerContainer}
                    className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center"
                >
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <div className="text-6xl md:text-8xl font-black font-outfit text-white">61<span className="text-mint-glow">+</span></div>
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">Active Agents</div>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <div className="text-6xl md:text-8xl font-black font-outfit text-white">218<span className="text-mint-glow">+</span></div>
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">Integrations</div>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="space-y-4">
                        <div className="text-6xl md:text-8xl font-black font-outfit text-white">157<span className="text-mint-glow">+</span></div>
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">Developers</div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Section 3: Features */}
            <section className="snap-start min-h-screen flex flex-col items-center justify-center bg-[#030303] px-4 relative">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    {/* Header */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="text-center mb-16 md:mb-24"
                    >
                        <motion.div variants={fadeInUp} className="inline-block px-4 py-2 rounded-full bg-mint-glow/5 border border-mint-glow/10 text-mint-glow text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                            Core Protocol
                        </motion.div>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-7xl lg:text-8xl font-bold font-outfit tracking-tighter leading-[0.9] mb-6">
                            Powering the <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-glow via-blue-400 to-purple-500 italic">Agentic Era</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-neutral-500 text-lg md:text-xl font-light max-w-2xl mx-auto">
                            Unlock a world of autonomous possibilities with our cutting-edge agent management protocol.
                        </motion.p>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                    >
                        <FeatureCard icon={<Zap size={32} />} title="X402 Payments" desc="Hyper-efficient micro-transactions scaled for sub-second agent processing." color="text-mint-glow" />
                        <FeatureCard icon={<Layers size={32} />} title="A2A Standards" desc="Universal communication layer allowing disparate agents to work as one." color="text-blue-400" />
                        <FeatureCard icon={<Cpu size={32} />} title="MCP Native" desc="Deep integration with Model Context Protocol for boundless tool access." color="text-purple-400" />
                    </motion.div>
                </div>
            </section>

            {/* Section 4: Featured Agents */}
            <section className="snap-start min-h-screen flex flex-col items-center justify-center px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 md:mb-20"
                    >
                        <div className="space-y-3">
                            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-black font-outfit tracking-tighter leading-[0.9]">
                                Trending <span className="text-mint-glow italic">Agents</span>
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-neutral-500 text-base md:text-lg font-light max-w-md">
                                The most reliable and frequently utilized agents in the ecosystem.
                            </motion.p>
                        </div>
                        <motion.div variants={fadeInUp}>
                            <Link href="/agents" className="group flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-mint-glow transition-all">
                                All Agents <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Agent Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredAgents.map((agent, index) => (
                            <AgentCard
                                key={agent.id}
                                index={index}
                                id={agent.id}
                                name={agent.name}
                                developer={agent.repo_owner}
                                credits={Math.floor((agent.price_microalgo || 0) / 1000000).toString()}
                                tags={agent.tags || [agent.subdomain]}
                                category={agent.category || 'General'}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: CTA + Footer */}
            <section className="snap-start min-h-screen flex flex-col">
                {/* CTA - takes most of the space */}
                <div className="flex-1 flex items-center justify-center px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={fadeInUp}
                        className="container mx-auto max-w-5xl"
                    >
                        <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-neutral-900 to-black p-10 md:p-20 lg:p-28 border border-white/5">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                            <div className="relative z-10 text-center space-y-8">
                                <h2 className="text-4xl md:text-7xl lg:text-8xl font-black font-outfit tracking-tighter leading-[0.85]">
                                    START <br /><span className="text-mint-glow italic">BUILDING</span> TODAY.
                                </h2>
                                <p className="text-neutral-500 text-lg md:text-xl font-light">
                                    Deploy your first agent in under 5 minutes.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                                    <Link href="/agents" className="px-8 py-4 bg-mint-glow text-black font-black text-base rounded-full hover:scale-105 transition-all">
                                        EXPLORE DIRECTORY
                                    </Link>
                                    <button className="px-8 py-4 bg-transparent border-2 border-white/10 text-white font-black text-base rounded-full hover:bg-white hover:text-black transition-all">
                                        JOIN ECOSYSTEM
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer - at bottom of this section */}
                <footer className="py-10 border-t border-white/5 bg-[#020202]">
                    <div className="container mx-auto px-4 text-center space-y-5">
                        <div className="text-xl font-black tracking-tighter">0RCA<span className="text-mint-glow">POD</span></div>
                        <div className="flex justify-center gap-10 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-600">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">Discord</a>
                        </div>
                        <div className="text-[9px] text-neutral-800 tracking-[0.4em] uppercase">
                            © 2026 0rca Pod Protocol
                        </div>
                    </div>
                </footer>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <motion.div
            variants={fadeInUp}
            className="group p-6 md:p-8 rounded-2xl bg-[#080808] border border-neutral-800/40 hover:border-mint-glow/20 transition-all duration-500 hover:-translate-y-2"
        >
            <div className={`mb-5 ${color} opacity-60 group-hover:opacity-100 transition-all`}>
                {icon}
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3 font-outfit">{title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-400 transition-colors">
                {desc}
            </p>
        </motion.div>
    )
}
