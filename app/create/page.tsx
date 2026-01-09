'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Code, Workflow, ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';

const agentTypes = [
    {
        id: 'autonomous',
        title: 'Autonomous Agent',
        description: 'Fully autonomous AI that can execute complex multi-step tasks independently. Perfect for automation workflows.',
        icon: Bot,
        color: 'from-mint-glow to-emerald-500',
        features: ['Multi-step task execution', 'Self-correcting behavior', 'Memory & context retention', 'Tool integration'],
        popular: true,
    },
    {
        id: 'api',
        title: 'API Agent',
        description: 'RESTful agent that exposes endpoints for external services. Ideal for integrations and backend automation.',
        icon: Code,
        color: 'from-blue-400 to-indigo-500',
        features: ['REST API endpoints', 'Webhook support', 'Rate limiting', 'Authentication built-in'],
        popular: false,
    },
    {
        id: 'workflow',
        title: 'Workflow Agent',
        description: 'DAG-based agent for orchestrating complex workflows with multiple steps and conditional logic.',
        icon: Workflow,
        color: 'from-purple-400 to-pink-500',
        features: ['Visual workflow builder', 'Conditional branching', 'Parallel execution', 'Error handling'],
        popular: false,
    },
];

export default function CreateAgentPage() {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Header Spacer */}
            <div className="h-24 md:h-32" />

            <div className="container mx-auto px-4 py-12 md:py-20">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-mint-glow transition-colors mb-12 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mb-16 md:mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint-glow/5 border border-mint-glow/10 text-mint-glow text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        <Sparkles size={14} />
                        New Agent
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-outfit tracking-tighter leading-[0.9] mb-6">
                        Create Your <br /><span className="text-mint-glow italic">Agent</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-500 font-light max-w-2xl">
                        Choose the type of agent that best fits your use case. Each type is optimized for different workflows.
                    </p>
                </motion.div>

                {/* Agent Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
                    {agentTypes.map((type, index) => (
                        <motion.div
                            key={type.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            onClick={() => setSelectedType(type.id)}
                            className={`
                                relative p-8 rounded-[2rem] cursor-pointer transition-all duration-500 group
                                ${selectedType === type.id
                                    ? 'bg-gradient-to-br ' + type.color + ' scale-[1.02] shadow-2xl'
                                    : 'bg-[#0A0A0A] border border-neutral-800/50 hover:border-neutral-700'
                                }
                            `}
                        >
                            {type.popular && (
                                <div className="absolute -top-3 right-6 px-3 py-1 bg-mint-glow text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                                    Popular
                                </div>
                            )}

                            <div className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all
                                ${selectedType === type.id
                                    ? 'bg-white/20'
                                    : 'bg-gradient-to-br ' + type.color + ' opacity-80'
                                }
                            `}>
                                <type.icon size={28} className={selectedType === type.id ? 'text-white' : 'text-white'} />
                            </div>

                            <h3 className={`text-2xl font-bold font-outfit mb-3 ${selectedType === type.id ? 'text-white' : 'text-white'}`}>
                                {type.title}
                            </h3>
                            <p className={`text-sm leading-relaxed mb-6 ${selectedType === type.id ? 'text-white/80' : 'text-neutral-500'}`}>
                                {type.description}
                            </p>

                            <ul className="space-y-2">
                                {type.features.map((feature, i) => (
                                    <li key={i} className={`flex items-center gap-2 text-xs ${selectedType === type.id ? 'text-white/70' : 'text-neutral-600'}`}>
                                        <div className={`w-1 h-1 rounded-full ${selectedType === type.id ? 'bg-white' : 'bg-mint-glow'}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {selectedType === type.id && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-6 right-6 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                                >
                                    <div className="w-3 h-3 bg-black rounded-full" />
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Continue Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedType ? 1 : 0.3 }}
                    className="flex justify-center"
                >
                    <button
                        disabled={!selectedType}
                        className={`
                            group flex items-center gap-4 px-12 py-6 rounded-full font-black text-lg uppercase tracking-widest transition-all
                            ${selectedType
                                ? 'bg-white text-black hover:bg-mint-glow hover:scale-105 cursor-pointer'
                                : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                            }
                        `}
                    >
                        Continue to Configuration
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </motion.div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-16"
                >
                    <div className="space-y-3">
                        <div className="text-mint-glow">
                            <Zap size={24} />
                        </div>
                        <h4 className="text-lg font-bold font-outfit">Instant Deploy</h4>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Your agent will be live on the network within seconds of creation.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="text-blue-400">
                            <Globe size={24} />
                        </div>
                        <h4 className="text-lg font-bold font-outfit">Global Access</h4>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Agents are accessible from anywhere via the X402 protocol.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="text-purple-400">
                            <Sparkles size={24} />
                        </div>
                        <h4 className="text-lg font-bold font-outfit">Built-in Monetization</h4>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Set your own pricing and earn credits for every execution.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
