import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Zap, ShieldCheck, Globe, Clock } from 'lucide-react';
import { AgentThumbnail } from '@/components/AgentThumbnail';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 60;

export async function generateStaticParams() {
    const { data: agents } = await supabase.from('agents').select('id');
    return agents?.map(({ id }) => ({ id })) || [];
}

export default async function AgentDetailsPage({ params }: { params: { id: string } }) {
    const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !agent) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 blur-sm">?</div>
                <h1 className="text-4xl font-black mb-4 font-outfit">AGENT NOT FOUND</h1>
                <p className="text-neutral-500 mb-12 max-w-md">The agent you are looking for does not exist or has been decommissioned.</p>
                <Link href="/agents" className="px-8 py-4 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    const credits = Math.floor((agent.price_microalgo || 0) / 1000000).toString();

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Header Spacer */}
            <div className="h-24 md:h-32" />

            <div className="container mx-auto px-4 py-12">
                <Link href="/agents" className="inline-flex items-center gap-3 text-neutral-500 hover:text-mint-glow mb-12 transition-all group font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                    Back to Directory
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Column: Visuals & Stats */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 relative bg-[#050505] shadow-2xl">
                            <AgentThumbnail name={agent.name} category={agent.category} className="w-full h-full" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Status</div>
                                    <div className="flex items-center gap-2 text-mint-glow font-bold">
                                        <span className="w-2 h-2 rounded-full bg-mint-glow animate-pulse" />
                                        Operational
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Architecture</div>
                                    <div className="text-white font-bold">{agent.subdomain || 'Standard'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-8 rounded-[2rem] bg-[#0A0A0A] border border-white/5 space-y-2">
                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Pricing</div>
                                <div className="text-3xl font-black font-outfit text-white">{credits} <span className="text-mint-glow">CR</span></div>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-[#0A0A0A] border border-white/5 space-y-2 text-right">
                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Version</div>
                                <div className="text-3xl font-black font-outfit text-white truncate">{agent.version || '1.0'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information & Actions */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-1.5 bg-mint-glow/10 text-mint-glow border border-mint-glow/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    {agent.category || 'General'}
                                </span>
                                <span className="px-4 py-1.5 bg-white/5 text-neutral-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ShieldCheck size={12} /> Verified Agent
                                </span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter leading-none">
                                {agent.name.toUpperCase()}
                            </h1>

                            <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed font-light">
                                {agent.description || 'This autonomous agent is configured for high-performance execution within the 0rca Pod ecosystem.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 py-8 border-y border-white/5">
                            {agent.tags?.map((tag: string) => (
                                <span key={tag} className="px-5 py-2.5 bg-[#0A0A0A] border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-neutral-600 transition-all cursor-default">
                                    #{tag.toUpperCase()}
                                </span>
                            ))}
                        </div>

                        <div className="pt-4 space-y-8">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button className="flex-1 bg-white text-black font-black py-6 rounded-full text-xl hover:bg-mint-glow hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl">
                                    <Zap size={24} className="fill-current" />
                                    EXECUTE AGENT
                                </button>
                                {agent.repo_url && (
                                    <a
                                        href={agent.repo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-12 py-6 bg-transparent border-2 border-white/10 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/5 hover:border-white transition-all flex items-center justify-center gap-3"
                                    >
                                        <Github size={20} />
                                        SOURCE
                                    </a>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-10 text-neutral-600">
                                <div className="flex items-center gap-2">
                                    <Globe size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Global Protocol</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Instant Deploy</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Audited Code</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
