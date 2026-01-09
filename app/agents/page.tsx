import { createClient } from '@supabase/supabase-js';
import { AgentCard } from '@/components/AgentCard';
import { Search, Filter, SlidersHorizontal, Shield } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function AgentsPage() {
    const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                    <Shield size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-4">Connection Error</h1>
                <p className="text-neutral-500 max-w-md text-center">We couldn't reach the agent directory. Please check your connection or try again later.</p>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen">
            {/* Header Spacer */}
            <div className="h-24 md:h-40" />

            <div className="container mx-auto px-4 py-24">
                {/* Directory Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-32 gap-12">
                    <div className="max-w-4xl space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                            MARKETPLACE ECOSYSTEM • {agents?.length || 0} ACTIVE AGENTS
                        </div>
                        <h1 className="text-6xl md:text-[8rem] font-black text-white mb-6 tracking-tighter leading-[0.85] font-outfit">
                            EXPLORE <br /><span className="text-mint-glow italic">AGENTS</span>
                        </h1>
                        <p className="text-2xl text-neutral-500 max-w-2xl leading-relaxed font-light">
                            Discover the next generation of autonomous AI employees. From predictive analysis to creative automation.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-6">
                        <div className="relative group flex-1 sm:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-mint-glow transition-all" />
                            <input
                                type="text"
                                placeholder="Search our ecosystem..."
                                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-[1.5rem] py-6 pl-16 pr-8 text-white text-base font-bold focus:outline-none focus:border-mint-glow/50 transition-all focus:ring-8 focus:ring-mint-glow/5"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-4 px-10 py-6 bg-neutral-900 border border-neutral-800 rounded-[1.5rem] text-white text-sm font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
                            <SlidersHorizontal size={20} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {agents && agents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {agents.map((agent, index) => (
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
                ) : (
                    <div className="py-60 text-center border-2 border-dashed border-neutral-900 rounded-[4rem]">
                        <h3 className="text-3xl font-black text-neutral-700 mb-4 uppercase tracking-tighter">No agents found</h3>
                        <p className="text-neutral-800 font-bold">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>

            {/* Simple Footer for Directory */}
            <div className="container mx-auto px-4 py-40 mt-40 border-t border-white/5 text-center">
                <p className="text-neutral-700 text-[10px] font-black uppercase tracking-[0.6em]">0rca Pod Marketplace • Established 2026</p>
            </div>
        </div>
    );
}
