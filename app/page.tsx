import { Hero } from '@/components/Hero';
import { createClient } from '@supabase/supabase-js';
import { AgentCard } from '@/components/AgentCard';
import { ArrowRight, Shield, Zap, Globe, Cpu, Layers, MousePointer2 } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
    const { data: featuredAgents } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .limit(4)
        .order('created_at', { ascending: false });

    return (
        <div className="bg-black min-h-screen text-white selection:bg-mint-glow selection:text-black">
            {/* Space for fixed header */}
            <div className="h-24 md:h-32" />

            <Hero />

            {/* Trust Bar */}
            <div className="border-y border-white/5 bg-white/[0.02] py-8 overflow-hidden">
                <div className="container mx-auto px-4 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    <span className="text-xl font-black tracking-widest uppercase">Cronos</span>
                    <span className="text-xl font-black tracking-widest uppercase">Ethereum</span>
                    <span className="text-xl font-black tracking-widest uppercase">Solana</span>
                    <span className="text-xl font-black tracking-widest uppercase">Base</span>
                    <span className="text-xl font-black tracking-widest uppercase">Polygon</span>
                </div>
            </div>

            {/* Stats/Value Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-mint-glow/20 to-transparent" />
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                        <div className="space-y-4">
                            <div className="text-5xl md:text-7xl font-black font-outfit text-white">61<span className="text-mint-glow">+</span></div>
                            <div className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-500">Active Agents</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-5xl md:text-7xl font-black font-outfit text-white">218<span className="text-mint-glow">+</span></div>
                            <div className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-500">Integrations</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-5xl md:text-7xl font-black font-outfit text-white">157<span className="text-mint-glow">+</span></div>
                            <div className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-500">Developers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 bg-[#050505]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-24">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-mint-glow/10 border border-mint-glow/20 text-mint-glow text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            Core Protocol
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 font-outfit tracking-tight">
                            Powering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-glow to-blue-400">Agentic Era</span>
                        </h2>
                        <p className="text-neutral-500 text-xl leading-relaxed">
                            Unlock a world of autonomous possibilities with our cutting-edge agent management protocol.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap size={32} />}
                            title="X402 Payments"
                            desc="Hyper-efficient micro-transactions scaled for sub-second agent processing."
                            color="text-mint-glow"
                        />
                        <FeatureCard
                            icon={<Layers size={32} />}
                            title="A2A Standards"
                            desc="Universal communication layer allowing disparate agents to work as one."
                            color="text-blue-400"
                        />
                        <FeatureCard
                            icon={<Cpu size={32} />}
                            title="MCP Native"
                            desc="Deep integration with Model Context Protocol for boundless tool access."
                            color="text-purple-400"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Agents Section */}
            <section className="py-32">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-outfit tracking-tight">Trending <span className="text-mint-glow">Agents</span></h2>
                            <p className="text-neutral-400 text-lg">
                                The most reliable and frequently utilized agents in the ecosystem.
                            </p>
                        </div>
                        <Link
                            href="/agents"
                            className="group flex items-center gap-3 px-8 py-4 bg-neutral-900 border border-neutral-800 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-95"
                        >
                            All Agents <ArrowRight size={18} className="text-mint-glow group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredAgents?.map((agent, index) => (
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

            {/* Bottom CTA */}
            <section className="py-40 relative">
                <div className="container mx-auto px-4">
                    <div className="relative rounded-[4rem] overflow-hidden bg-gradient-to-br from-neutral-900 to-black p-12 md:p-32 border border-white/5">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="relative z-10 text-center max-w-4xl mx-auto">
                            <h2 className="text-5xl md:text-8xl font-black mb-10 font-outfit tracking-tighter">
                                START <span className="text-mint-glow italic">BUILDING</span> TODAY.
                            </h2>
                            <p className="text-neutral-500 text-2xl mb-16 leading-relaxed bg-black/40 backdrop-blur-sm p-4 rounded-3xl inline-block">
                                Deploy your first agent in under 5 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-8">
                                <Link href="/agents" className="px-12 py-6 bg-mint-glow text-black font-black text-xl rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(99,242,210,0.4)] transition-all">
                                    EXPLORE DIRECTORY
                                </Link>
                                <button className="px-12 py-6 bg-transparent border-2 border-white/20 text-white font-black text-xl rounded-full hover:bg-white hover:text-black hover:border-white transition-all">
                                    JOIN ECOSYSTEM
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-20 border-t border-white/5 bg-[#030303]">
                <div className="container mx-auto px-4 text-center space-y-8">
                    <div className="text-2xl font-black tracking-tighter">0RCA<span className="text-mint-glow">POD</span></div>
                    <div className="flex justify-center gap-10 text-xs font-bold uppercase tracking-widest text-neutral-600">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                    </div>
                    <div className="text-[10px] font-medium text-neutral-800 tracking-[0.4em] uppercase">
                        © 2026 0rca Pod Protocol • Empowering Autonomous Agents
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <div className="group p-10 rounded-[2.5rem] bg-[#0A0A0A] border border-neutral-800/50 hover:border-mint-glow/30 transition-all duration-500 hover:y-[-10px]">
            <div className={`mb-8 ${color} opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 font-outfit">{title}</h3>
            <p className="text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors">
                {desc}
            </p>
        </div>
    )
}
