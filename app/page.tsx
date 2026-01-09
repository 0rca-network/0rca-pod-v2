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

            {/* Trust Bar - Massive spacing fix */}
            <div className="border-y border-white/5 bg-white/[0.02] py-16 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-8 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
                        <span className="text-2xl font-black tracking-[0.4em] uppercase whitespace-nowrap">Cronos</span>
                        <span className="w-2 h-2 rounded-full bg-white/20 hidden md:block" />
                        <span className="text-2xl font-black tracking-[0.4em] uppercase whitespace-nowrap">Ethereum</span>
                        <span className="w-2 h-2 rounded-full bg-white/20 hidden md:block" />
                        <span className="text-2xl font-black tracking-[0.4em] uppercase whitespace-nowrap">Solana</span>
                        <span className="w-2 h-2 rounded-full bg-white/20 hidden md:block" />
                        <span className="text-2xl font-black tracking-[0.4em] uppercase whitespace-nowrap">Base</span>
                        <span className="w-2 h-2 rounded-full bg-white/20 hidden md:block" />
                        <span className="text-2xl font-black tracking-[0.4em] uppercase whitespace-nowrap">Polygon</span>
                    </div>
                </div>
            </div>

            {/* Stats Section - Increased Padding */}
            <section className="py-60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-mint-glow/20 to-transparent" />
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24 text-center">
                        <div className="space-y-6">
                            <div className="text-6xl md:text-8xl font-black font-outfit text-white">61<span className="text-mint-glow">+</span></div>
                            <div className="text-xs font-black uppercase tracking-[0.5em] text-neutral-600">Active Agents</div>
                        </div>
                        <div className="space-y-6">
                            <div className="text-6xl md:text-8xl font-black font-outfit text-white">218<span className="text-mint-glow">+</span></div>
                            <div className="text-xs font-black uppercase tracking-[0.5em] text-neutral-600">Integrations</div>
                        </div>
                        <div className="space-y-6">
                            <div className="text-6xl md:text-8xl font-black font-outfit text-white">157<span className="text-mint-glow">+</span></div>
                            <div className="text-xs font-black uppercase tracking-[0.5em] text-neutral-600">Developers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Massive Spacing & Layout fix */}
            <section className="py-60 bg-[#050505] relative">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center mb-40">
                        <div className="inline-block px-5 py-2 rounded-full bg-mint-glow/5 border border-mint-glow/10 text-mint-glow text-[10px] font-black uppercase tracking-[0.4em] mb-10">
                            Core Protocol
                        </div>
                        <h2 className="text-6xl md:text-9xl font-bold mb-12 font-outfit tracking-tighter leading-none">
                            Powering the <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-glow via-blue-400 to-purple-500 italic">Agentic Era</span>
                        </h2>
                        <p className="text-neutral-500 text-2xl font-light leading-relaxed max-w-3xl mx-auto">
                            Unlock a world of autonomous possibilities with our cutting-edge agent management protocol.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={<Zap size={40} />}
                            title="X402 Payments"
                            desc="Hyper-efficient micro-transactions scaled for sub-second agent processing."
                            color="text-mint-glow"
                        />
                        <FeatureCard
                            icon={<Layers size={40} />}
                            title="A2A Standards"
                            desc="Universal communication layer allowing disparate agents to work as one."
                            color="text-blue-400"
                        />
                        <FeatureCard
                            icon={<Cpu size={40} />}
                            title="MCP Native"
                            desc="Deep integration with Model Context Protocol for boundless tool access."
                            color="text-purple-400"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Agents Section - High Spacing */}
            <section className="py-60">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-16">
                        <div className="max-w-2xl space-y-6">
                            <h2 className="text-5xl md:text-8xl font-black mb-6 font-outfit tracking-tighter leading-none">Trending <br /><span className="text-mint-glow italic">Agents</span></h2>
                            <p className="text-neutral-400 text-xl font-light leading-relaxed">
                                The most reliable and frequently utilized agents in the ecosystem.
                            </p>
                        </div>
                        <Link
                            href="/agents"
                            className="group flex items-center gap-6 px-12 py-6 bg-white text-black rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-mint-glow transition-all active:scale-95 shadow-2xl"
                        >
                            All Agents <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
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

            {/* Bottom CTA - Absolute Spacing */}
            <section className="py-60 relative">
                <div className="container mx-auto px-4">
                    <div className="relative rounded-[5rem] overflow-hidden bg-gradient-to-br from-neutral-900 to-black p-16 md:p-40 border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-16">
                            <h2 className="text-6xl md:text-[10rem] font-black mb-10 font-outfit tracking-tighter leading-[0.8]">
                                START <br /><span className="text-mint-glow italic">BUILDING</span> TODAY.
                            </h2>
                            <p className="text-neutral-500 text-3xl font-light leading-relaxed">
                                Deploy your first agent in under 5 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-12 pt-10">
                                <Link href="/agents" className="px-16 py-8 bg-mint-glow text-black font-black text-2xl rounded-full hover:scale-105 hover:shadow-[0_0_60px_rgba(99,242,210,0.3)] transition-all">
                                    EXPLORE DIRECTORY
                                </Link>
                                <button className="px-16 py-8 bg-transparent border-2 border-white/10 text-white font-black text-2xl rounded-full hover:bg-white hover:text-black hover:border-white transition-all">
                                    JOIN ECOSYSTEM
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-40 border-t border-white/5 bg-[#030303]">
                <div className="container mx-auto px-4 text-center space-y-12">
                    <div className="text-3xl font-black tracking-tighter">0RCA<span className="text-mint-glow">POD</span></div>
                    <div className="flex justify-center gap-16 text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                    </div>
                    <div className="text-[10px] font-medium text-neutral-800 tracking-[0.6em] uppercase pt-10">
                        © 2026 0rca Pod Protocol • Empowering Autonomous Agents
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <div className="group p-14 rounded-[3rem] bg-[#0A0A0A] border border-neutral-800/50 hover:border-mint-glow/30 transition-all duration-700 hover:-translate-y-4 shadow-xl">
            <div className={`mb-10 ${color} opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700`}>
                {icon}
            </div>
            <h3 className="text-3xl font-bold mb-6 font-outfit">{title}</h3>
            <p className="text-neutral-500 text-lg leading-relaxed group-hover:text-neutral-300 transition-colors">
                {desc}
            </p>
        </div>
    )
}
