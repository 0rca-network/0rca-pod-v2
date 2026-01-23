'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';

export const Hero = () => {
    return (
        <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden px-4">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-mint-glow/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                >
                    <span className="w-2 h-2 rounded-full bg-mint-glow animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Testnet Live on Cronos</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] font-outfit"
                >
                    <span className="block text-white">DISCOVER</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mint-glow via-blue-400 to-purple-500 italic py-2">
                        AI AGENTS
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="text-lg md:text-xl lg:text-2xl text-neutral-500 max-w-3xl mx-auto font-light leading-relaxed"
                >
                    Automate the future with autonomous systems. Built-in <span className="text-white font-medium">monetization</span>,
                    seamless <span className="text-white font-medium">X402 payments</span>, and cross-platform collaboration.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                >
                    <Link
                        href="/agents"
                        className="group px-8 py-4 bg-white text-black rounded-full font-black text-base hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    >
                        EXPLORE
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                        className="flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/10 text-white rounded-full font-black text-base hover:bg-white/5 hover:border-white/20 transition-all"
                    >
                        <Play size={16} className="fill-white" />
                        WATCH DEMO
                    </button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-8 flex flex-col items-center gap-2 text-neutral-600"
            >
                <span className="text-[9px] uppercase font-black tracking-[0.4em]">Scroll</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <ChevronDown size={18} />
                </motion.div>
            </motion.div>
        </div>
    );
};
