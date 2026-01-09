import { createClient } from '@supabase/supabase-js';
import { AgentCard } from '@/components/AgentCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
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
            <div className="h-24 md:h-32" />

            <div className="container mx-auto px-4 py-12">
                {/* Directory Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                            Total Marketplace • {agents?.length || 0} Agents
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter leading-none font-outfit">
                            EXPLORE <span className="text-mint-glow italic">AGENTS</span>
                        </h1>
                        <p className="text-xl text-neutral-500 max-w-2xl leading-relaxed">
                            Discover the next generation of autonomous AI employees. From data analysis to creative automation.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
                        <div className="relative group flex-1 sm:w-80">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-mint-glow transition-colors" />
                            <input
                                type="text"
                                placeholder="Search our ecosystem..."
                                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-mint-glow/50 transition-all focus:ring-4 focus:ring-mint-glow/5"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-3 px-8 py-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-white text-sm font-bold hover:bg-neutral-800 transition-all">
                            <SlidersHorizontal size={18} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {agents && agents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
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
                    <div className="py-40 text-center border-2 border-dashed border-neutral-900 rounded-[3rem]">
                        <h3 className="text-2xl font-bold text-neutral-600 mb-2">No agents found</h3>
                        <p className="text-neutral-800">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>

            {/* Simple Footer for Directory */}
            <div className="container mx-auto px-4 py-20 mt-20 border-t border-white/5 text-center">
                <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.5em]">0rca Pod Marketplace • 2026</p>
            </div>
        </div>
    );
}
