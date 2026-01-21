'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Zap,
    Shield,
    Terminal,
    Save,
    Play,
    ArrowLeft,
    Plus,
    Sparkles,
    Copy,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    MessageSquare,
    Send,
    Ghost,
    Key,
    MessageCircle,
    Edit3,
    Upload,
    Share2,
    Trash2,
    Check,
    X,
    User,
    Lock,
    Maximize2,
    MonitorPlay,
    Wallet,
    Bot,
    Clock,
    DollarSign,
    Cpu
} from 'lucide-react';
import Link from 'next/link';
import { CreateToolModal } from '@/components/CreateToolModal';
import { AddMCPModal } from '@/components/AddMCPModal';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import CONTRACTS from '@/lib/contracts.json';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase';
import { deployCDCAgent } from '@/lib/deploy-actions';

interface MCPServer {
    id: string;
    name: string;
    url: string;
    tools: {
        name: string,
        description: string,
        inputSchema?: any
    }[];
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface Shortcut {
    id: string;
    label: string;
}

interface Tool {
    name: string;
    description: string;
}

export default function CDCEditAgentPage() {
    const params = useParams();
    const id = params?.agentId as string || 'new';

    // Core State
    const [agentName, setAgentName] = useState('New CDC Agent');
    const [isEditingName, setIsEditingName] = useState(false);
    const [backgroundSetting, setBackgroundSetting] = useState(`Role:\nCrypto.com DeFi Expert\n\nGoal:\nAssist users with transactions and market analysis on Cronos.\n\nSkills:\n1. DeFi management\n2. Portfolio tracking\n3. Swap optimization`);
    const [greeting, setGreeting] = useState('Hello! I am your Crypto.com AI Assistant. How can I help you navigate the DeFi ecosystem today?');
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([
        { id: '1', label: 'Check Balance' },
        { id: '2', label: 'Latest Markets' }
    ]);
    const [newShortcut, setNewShortcut] = useState('');
    const [tools, setTools] = useState<Tool[]>([]);
    const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
    const [capabilityType, setCapabilityType] = useState<'tool' | 'mcp'>('tool');
    const [authMethod, setAuthMethod] = useState('None');
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // CDC Specific Configuration
    const [cdcApiKey, setCdcApiKey] = useState('');
    const [cdcPrivateKey, setCdcPrivateKey] = useState('');
    const [transferLimit, setTransferLimit] = useState('-1');
    const [timeoutVal, setTimeoutVal] = useState('60');

    // UI State
    const [showToolModal, setShowToolModal] = useState(false);
    const [showMCPModal, setShowMCPModal] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);
    const [showCopied, setShowCopied] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hello! I am your Crypto.com AI agent. I have access to the CDC SDK for advanced DeFi operations. How can I assist you today?', sender: 'agent', timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [balance, setBalance] = useState<string>('0.00');
    const [agentData, setAgentData] = useState<any>(null);
    const [isLoadingAgent, setIsLoadingAgent] = useState(id !== 'new');

    // Privy & Wallet
    const { user, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const wallet = wallets[0];

    useEffect(() => {
        const fetchAgentData = async () => {
            if (id === 'new') return;
            setIsLoadingAgent(true);
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setAgentData(data);
                setAgentName(data.name);
                if (data.description) setBackgroundSetting(data.description);

                // Try to load CDC config from metadata if it exists
                if (data.config) {
                    setCdcApiKey(data.config.cdcApiKey || '');
                    setCdcPrivateKey(data.config.cdcPrivateKey || '');
                    setTransferLimit(data.config.transferLimit || '-1');
                    setTimeoutVal(data.config.timeout || '60');
                }
            }
            setIsLoadingAgent(false);
        };
        fetchAgentData();
    }, [id]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (wallet && wallet.address) {
                try {
                    const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
                    const bal = await provider.getBalance(wallet.address);
                    setBalance(ethers.formatEther(bal));
                } catch (err) {
                    console.error("Error fetching balance:", err);
                }
            }
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [wallet]);

    const handlePublish = async () => {
        if (!authenticated || !wallet) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsPublishing(true);
        const idToast = toast.loading("Registering Crypto.com Agent on Cronos...");

        try {
            // 1. Update Agent Config in Database
            await supabase
                .from('agents')
                .update({
                    name: agentName,
                    description: backgroundSetting,
                    config: {
                        cdcApiKey,
                        cdcPrivateKey,
                        transferLimit,
                        timeout: timeoutVal,
                        type: 'cdc-agent'
                    }
                })
                .eq('id', id);

            // 2. Deployment
            const deployResult = await deployCDCAgent(id, {
                name: agentName,
                description: backgroundSetting,
                greeting,
                cdcApiKey,
                cdcPrivateKey,
                transferLimit,
                timeout: timeoutVal,
                vaultAddress: wallet?.address,
                tools: tools
            });

            if (!deployResult.success) {
                throw new Error(deployResult.error || "Deployment failed");
            }

            toast.update(idToast, {
                render: `Successfully deployed agent! URL: ${deployResult.url || 'pending'}`,
                type: "success",
                isLoading: false,
                autoClose: 5000
            });
        } catch (error: any) {
            console.error("Publish error:", error);
            toast.update(idToast, {
                render: `Registration failed: ${error.message || "Unknown error"}`,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
        } finally {
            setIsPublishing(false);
        }
    };

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleCopy = () => {
        navigator.clipboard.writeText(backgroundSetting);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: chatInput,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setChatInput('');

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `I've received your request: "${chatInput}". As your ${agentName}, I'll use the Crypto.com DeFi SDK to process this on the Cronos chain.`,
                sender: 'agent',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    const addShortcut = () => {
        if (!newShortcut.trim()) return;
        setShortcuts(prev => [...prev, { id: Date.now().toString(), label: newShortcut.trim() }]);
        setNewShortcut('');
    };

    const removeShortcut = (id: string) => {
        setShortcuts(prev => prev.filter(s => s.id !== id));
    };

    const removeTool = (index: number) => {
        setTools(prev => prev.filter((_, i) => i !== index));
    };

    const addMcpServer = (serverData: any) => {
        setMcpServers(prev => [...prev, {
            id: Date.now().toString(),
            name: serverData.name,
            url: serverData.url,
            tools: serverData.tools
        }]);
    };

    const removeMcpServer = (id: string) => {
        setMcpServers(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white font-inter selection:bg-[#0057E6] selection:text-white flex flex-col overflow-hidden h-screen">
            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-white/5 bg-[#080808] px-4 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/agents" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft size={18} className="text-neutral-400" />
                    </Link>
                    <div className="h-8 w-[1px] bg-white/10 mx-1" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#002D74] to-[#011B45] flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="flex items-center gap-2 group">
                            {isEditingName ? (
                                <input
                                    autoFocus
                                    className="bg-white/5 border border-blue-500/30 rounded px-2 py-0.5 text-sm font-bold focus:outline-none focus:border-blue-500"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                />
                            ) : (
                                <>
                                    <span className="font-bold text-sm tracking-tight cursor-text" onClick={() => setIsEditingName(true)}>{agentName}</span>
                                    <Edit3 size={14} className="text-neutral-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-white" onClick={() => setIsEditingName(true)} />
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0057E6]/10 text-[#0057E6] border border-[#0057E6]/20 uppercase tracking-widest">CDC Agent</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-white/5 flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80 animate-pulse" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase mb-0.5">
                            {balance} TCRO
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-neutral-400">
                                {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'No Wallet'}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 mx-1" />
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className={`flex items-center gap-2 px-6 py-2 bg-[#0057E6] text-white rounded-full text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-600/20 ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isPublishing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Share2 size={14} />
                        )}
                        {isPublishing ? 'Deploying...' : 'Deploy Agent'}
                    </button>
                </div>
            </header>

            {/* Sub-header / Tabs */}
            <div className="h-12 border-b border-white/5 bg-[#080808] px-10 flex items-center shrink-0">
                <span className="text-xs font-bold text-neutral-400 border-b-2 border-blue-500 h-full flex items-center px-4 cursor-pointer hover:text-white transition-colors">Fine Tuning</span>
                <span className="text-xs font-bold text-neutral-600 h-full flex items-center px-4 cursor-not-allowed hover:text-neutral-400 transition-colors">DeFi Capabilities</span>
                <span className="text-xs font-bold text-neutral-600 h-full flex items-center px-4 cursor-not-allowed hover:text-neutral-400 transition-colors">Analytics</span>
            </div>

            {/* Main Content Grid */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 max-w-[1800px] mx-auto">

                    {/* Column 1: Background Setting */}
                    <div className="lg:col-span-4 border-r border-white/5 flex flex-col bg-[#080808]/30 relative">
                        <div className="p-6 flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                                <Shield size={14} className="text-blue-500" />
                                Background & Role
                            </h2>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-full text-[10px] font-bold text-blue-300 hover:brightness-125 hover:scale-105 active:scale-95 transition-all">
                                <Sparkles size={12} strokeWidth={3} />
                                AI REFINE
                            </button>
                        </div>
                        <div className="px-6 flex-1 flex flex-col min-h-0 mb-6">
                            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 relative group transition-all focus-within:border-blue-500/30">
                                <button
                                    onClick={handleCopy}
                                    className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${showCopied ? 'bg-blue-500 text-white' : 'bg-white/5 text-neutral-400 hover:text-white lg:opacity-0 group-hover:opacity-100'}`}
                                >
                                    {showCopied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                                <textarea
                                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-neutral-300 text-sm leading-relaxed font-mono custom-scrollbar"
                                    placeholder="Define the Agent's personality and response logic..."
                                    value={backgroundSetting}
                                    onChange={(e) => setBackgroundSetting(e.target.value)}
                                />
                                {showCopied && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter"
                                    >
                                        Prompt Copied!
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Configuration Blocks */}
                    <div className={`${isPreviewVisible ? 'lg:col-span-4' : 'lg:col-span-8'} border-r border-white/5 flex flex-col bg-[#050505] overflow-y-auto custom-scrollbar transition-all duration-500`}>
                        <div className="p-4 space-y-3 pb-20">

                            {/* CDC CONFIGURATION SECTION */}
                            <ConfigSection title="CDC SDK Configuration" icon={Cpu} expanded={true}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">CDC API Key</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all font-mono"
                                                placeholder="Enter CDC API Key..."
                                                value={cdcApiKey}
                                                onChange={(e) => setCdcApiKey(e.target.value)}
                                            />
                                            <Key size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">CDC Private Key</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all font-mono"
                                                placeholder="Enter CDC Private Key..."
                                                value={cdcPrivateKey}
                                                onChange={(e) => setCdcPrivateKey(e.target.value)}
                                            />
                                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Transfer Limit</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all"
                                                    placeholder="-1"
                                                    value={transferLimit}
                                                    onChange={(e) => setTransferLimit(e.target.value)}
                                                />
                                                <DollarSign size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Timeout (s)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all"
                                                    placeholder="60"
                                                    value={timeoutVal}
                                                    onChange={(e) => setTimeoutVal(e.target.value)}
                                                />
                                                <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                        <p className="text-[10px] text-blue-400 font-medium leading-relaxed">
                                            These credentials enable your agent to perform on-chain actions like swapping, transferring, and lending via the Crypto.com DeFi SDK.
                                        </p>
                                    </div>
                                </div>
                            </ConfigSection>

                            {/* Capability Type Selector */}
                            <div className="bg-[#080808] border border-white/5 rounded-2xl p-1.5 flex gap-1 mb-2">
                                <button
                                    onClick={() => setCapabilityType('tool')}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${capabilityType === 'tool' ? 'bg-white/5 text-blue-400 shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    <Terminal size={14} />
                                    Standard Tools
                                </button>
                                <button
                                    onClick={() => setCapabilityType('mcp')}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${capabilityType === 'mcp' ? 'bg-white/5 text-orange-400 shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    <Ghost size={14} />
                                    MCP Servers
                                </button>
                            </div>

                            {capabilityType === 'tool' ? (
                                <ConfigSection
                                    title="Custom Tools"
                                    icon={Terminal}
                                    expanded={false}
                                    onAdd={() => setShowToolModal(true)}
                                    badge={tools.length > 0 ? tools.length.toString() : undefined}
                                >
                                    <div className="space-y-3">
                                        {tools.length === 0 ? (
                                            <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group/empty cursor-pointer" onClick={() => setShowToolModal(true)}>
                                                <div className="p-3 bg-white/5 rounded-full text-neutral-500 group-hover/empty:scale-110 group-hover/empty:text-blue-500 transition-all">
                                                    <Plus size={20} />
                                                </div>
                                                <span className="text-xs text-neutral-500 font-medium">No tools active. Add one to expand capabilities.</span>
                                            </div>
                                        ) : (
                                            tools.map((tool, idx) => (
                                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                            <Settings size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white leading-none mb-1">{tool.name}</p>
                                                            <p className="text-[10px] text-neutral-500 truncate w-40">{tool.description}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeTool(idx)}
                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ConfigSection>
                            ) : (
                                <ConfigSection
                                    title="MCP Servers"
                                    icon={Ghost}
                                    expanded={false}
                                    onAdd={() => setShowMCPModal(true)}
                                    badge={mcpServers.length > 0 ? mcpServers.length.toString() : undefined}
                                >
                                    <div className="space-y-4">
                                        {mcpServers.length === 0 ? (
                                            <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group/empty cursor-pointer" onClick={() => setShowMCPModal(true)}>
                                                <div className="p-3 bg-white/5 rounded-full text-neutral-500 group-hover/empty:scale-110 group-hover/empty:text-blue-500 transition-all">
                                                    <Plus size={20} />
                                                </div>
                                                <span className="text-xs text-neutral-500 font-medium">No MCP servers connected.</span>
                                            </div>
                                        ) : (
                                            mcpServers.map((server) => (
                                                <div key={server.id} className="space-y-3">
                                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                                                                <Ghost size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-white leading-none mb-1">{server.name}</p>
                                                                <p className="text-[10px] text-neutral-500 truncate w-40">{server.url}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeMcpServer(server.id)}
                                                            className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ConfigSection>
                            )}

                            <ConfigSection title="Greeting Message" icon={MessageCircle} expanded={true} hasAI>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 min-h-[100px] resize-none transition-all placeholder:text-neutral-700"
                                        placeholder="The first message your agent will send..."
                                        value={greeting}
                                        onChange={(e) => setGreeting(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-600">
                                        <span>Characters: {greeting.length}</span>
                                        <span>Markdown supported</span>
                                    </div>
                                </div>
                            </ConfigSection>

                            <ConfigSection
                                title="Quick Shortcuts"
                                icon={Zap}
                                expanded={false}
                                badge={shortcuts.length > 0 ? shortcuts.length.toString() : undefined}
                            >
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30"
                                            placeholder="Add quick phrase..."
                                            value={newShortcut}
                                            onChange={(e) => setNewShortcut(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addShortcut()}
                                        />
                                        <button
                                            onClick={addShortcut}
                                            className="p-2.5 bg-blue-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AnimatePresence>
                                            {shortcuts.map(s => (
                                                <motion.div
                                                    key={s.id}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] group"
                                                >
                                                    <span>{s.label}</span>
                                                    <X size={12} className="text-neutral-500 cursor-pointer hover:text-white" onClick={() => removeShortcut(s.id)} />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </ConfigSection>

                            <ConfigSection title="Authentication" icon={Lock} expanded={false} type="dropdown">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsAuthOpen(!isAuthOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Key size={14} className="text-neutral-500 group-hover:text-blue-500 transition-colors" />
                                            <span className="text-xs text-neutral-300 font-medium">{authMethod}</span>
                                        </div>
                                        <ChevronDown size={14} className={`text-neutral-600 transition-transform ${isAuthOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isAuthOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#080808] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl"
                                            >
                                                {['None', 'API Key', 'Bearer Token', 'OAuth 2.0'].map(method => (
                                                    <div
                                                        key={method}
                                                        className="px-4 py-3 text-xs text-neutral-400 hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between group"
                                                        onClick={() => {
                                                            setAuthMethod(method);
                                                            setIsAuthOpen(false);
                                                        }}
                                                    >
                                                        {method}
                                                        {authMethod === method && <Check size={12} className="text-blue-500" />}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </ConfigSection>
                        </div>
                    </div>

                    {/* Column 3: Preview */}
                    <AnimatePresence>
                        {isPreviewVisible ? (
                            <motion.div
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="lg:col-span-4 bg-[#080808]/50 flex flex-col overflow-hidden relative border-l border-white/5"
                            >
                                <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0">
                                    <h2 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                                        <Play size={14} className="text-blue-500" />
                                        Interactive Preview
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-500 group" onClick={() => setIsPreviewVisible(false)}>
                                            <X size={18} className="group-hover:text-white" />
                                        </button>
                                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-500">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                    <div className="flex items-center gap-4 mb-8 shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#002D74]/20 to-[#0057E6]/20 border border-blue-500/20 flex items-center justify-center relative shadow-lg shadow-blue-900/10">
                                            <Wallet size={24} className="text-blue-400" />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#080808] transition-transform"
                                            >
                                                <Plus size={12} className="text-black" />
                                            </motion.button>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-base leading-tight text-white">{agentName}</h3>
                                            <p className="text-[11px] text-neutral-500 font-mono tracking-tighter uppercase leading-none">CDC AGENT ID: {id}</p>
                                            <div className="flex gap-1.5 mt-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/80">CDC AI Powered</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 flex flex-col overflow-hidden relative group shadow-inner">
                                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                            {messages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${msg.sender === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white/5 text-neutral-200 border border-white/5'
                                                        }`}>
                                                        {msg.text}
                                                    </div>
                                                </motion.div>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </div>

                                        <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                    <button type="button" className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-neutral-500">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Ask your CDC Agent..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 text-sm focus:outline-none focus:border-blue-500/30 transition-all font-medium placeholder:text-neutral-700"
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                    {chatInput.trim() ? (
                                                        <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all">
                                                            <Send size={16} />
                                                        </button>
                                                    ) : (
                                                        <Wallet size={16} className="text-neutral-700 mr-2" />
                                                    )}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="fixed bottom-8 right-8 z-[60]"
                            >
                                <button
                                    onClick={() => setIsPreviewVisible(true)}
                                    className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(0,87,230,0.3)] hover:scale-105 active:scale-95 transition-all group"
                                >
                                    <Play size={16} fill="white" />
                                    Preview CDC Agent
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-1" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </main>

            {/* Modals */}
            <CreateToolModal
                isOpen={showToolModal}
                onClose={() => setShowToolModal(false)}
                agentName={agentName}
                onSave={(newTool) => {
                    setTools(prev => [...prev, { name: newTool.name, description: newTool.description }]);
                    setShowToolModal(false);
                }}
            />

            <AddMCPModal
                isOpen={showMCPModal}
                onClose={() => setShowMCPModal(false)}
                onAdd={addMcpServer}
            />

            {/* Global Background Elements */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#002D74]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
            `}</style>
        </div>
    );
}

function ConfigSection({
    title,
    children,
    icon: Icon,
    expanded = false,
    hasAI = false,
    type = 'normal',
    onAdd,
    badge
}: {
    title: string,
    children: React.ReactNode,
    icon?: any,
    expanded?: boolean,
    hasAI?: boolean,
    type?: 'normal' | 'dropdown',
    onAdd?: () => void,
    badge?: string
}) {
    const [isExpanded, setIsExpanded] = useState(expanded);

    return (
        <div className={`bg-[#080808] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-blue-500/20' : ''}`}>
            <div
                className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/5'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-neutral-500'}`}>
                        {Icon && <Icon size={14} />}
                    </div>
                    <span className={`text-[13px] font-bold transition-colors ${isExpanded ? 'text-white' : 'text-neutral-400'}`}>{title}</span>
                    {badge && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-black text-neutral-500 border border-white/10 uppercase tracking-tighter">
                            {badge}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasAI && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-bold text-blue-400 animate-pulse">
                            <Sparkles size={10} />
                            AI
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        {type === 'normal' && (
                            <button
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-all hover:scale-110 active:scale-90"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onAdd) onAdd();
                                }}
                            >
                                <Plus size={16} className="text-neutral-500 hover:text-blue-500" />
                            </button>
                        )}
                        <div className={`p-1.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={14} className="text-neutral-500" />
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                        className="border-t border-white/5"
                    >
                        <div className="p-5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

