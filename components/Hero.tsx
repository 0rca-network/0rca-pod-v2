'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';

export const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-mint-glow/10 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px]" />
                <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <motion.div
                style={{ y: y1, opacity }}
                className="relative z-10 text-center max-w-6xl mx-auto space-y-12"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-mint-glow animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Mainnet Live on Cronos</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] font-outfit"
                >
                    <span className="block text-white">DISCOVER</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mint-glow via-blue-400 to-purple-500 italic py-2">
                        AI AGENTS
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-xl md:text-3xl text-neutral-500 max-w-4xl mx-auto font-light leading-relaxed"
                >
                    Automate the future with autonomous systems. Built-in <span className="text-white font-medium">monetization</span>,
                    seamless <span className="text-white font-medium">X402 payments</span>, and cross-platform collaboration.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8"
                >
                    <Link
                        href="/agents"
                        className="group px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        EXPLORE
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <button
                        className="flex items-center gap-3 px-10 py-6 bg-transparent border-2 border-white/10 text-white rounded-full font-black text-xl hover:bg-white/5 hover:border-white/30 transition-all"
                    >
                        <Play size={20} className="fill-white" />
                        WATCH DEMO
                    </button>
                </motion.div>
            </motion.div>

            {/* Floating Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 flex flex-col items-center gap-4 text-neutral-600"
            >
                <span className="text-[10px] uppercase font-black tracking-[0.4em]">Scroll</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ChevronDown size={20} />
                </motion.div>
            </motion.div>
        </div>
    );
};
