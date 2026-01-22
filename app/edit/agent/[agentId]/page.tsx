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
    Bot,
    Wallet,
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
import { CREWAI_TOOLS } from '@/lib/crewai-tools';
import { deployOrcaAgent, deployCDCAgent, importGithubAgent } from '@/lib/deploy-actions';
import { generateOrcaAgentCode, generateCDCAgentCode } from '@/lib/agent-utils';

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
    baseUrl?: string;
    endpoint?: string;
    method?: string;
    parameters?: any[];
}

export default function EditAgentPage() {
    const params = useParams();
    const id = params?.agentId as string || 'new';

    // Core State
    const [agentName, setAgentName] = useState('New Agent');
    const [isEditingName, setIsEditingName] = useState(false);
    const [backgroundSetting, setBackgroundSetting] = useState(`Role:\nsample role\n\nGoal:\nsample goal\n\nSkills:\n1. Skill 1\n2. Skill 2\n3. Skill 3\n\nConstraints:\n1. Constraint 1\n2. Constraint 2\n3. Constraint 3`);
    const [greeting, setGreeting] = useState('');
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [newShortcut, setNewShortcut] = useState('');
    const [tools, setTools] = useState<Tool[]>([]);
    const [crewAITools, setCrewAITools] = useState<string[]>([]);
    const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
    const [capabilityType, setCapabilityType] = useState<'tool' | 'mcp'>('tool');
    const [authMethod, setAuthMethod] = useState('None');
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // Agent Type Toggle
    const [agentType, setAgentType] = useState<'orca' | 'cdc'>('orca');

    // Environment Variables
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [cdcApiKey, setCdcApiKey] = useState('');
    const [cdcPrivateKey, setCdcPrivateKey] = useState('');
    const [transferLimit, setTransferLimit] = useState('-1');
    const [timeoutVal, setTimeoutVal] = useState('60');

    // Registration Modal State
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [regStep, setRegStep] = useState(0);
    const [regError, setRegError] = useState<string | null>(null);

    const regSteps = [
        { label: 'Blockchain Network Check', description: 'Ensuring you are on Cronos Testnet' },
        { label: 'Metadata IPFS Upload', description: 'Uploading agent profile to Pinata' },
        { label: 'On-Chain Registration', description: 'Signing transaction to create unit identity' },
        { label: 'Vault Activation', description: 'Deploying and linking your OrcaAgentVault' },
        { label: 'Database Sync', description: 'Finalizing agent configuration' }
    ];

    // UI State
    const [showToolModal, setShowToolModal] = useState(false);
    const [showMCPModal, setShowMCPModal] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);
    const [previewMode, setPreviewMode] = useState<'chat' | 'code'>('chat');
    const [showCopied, setShowCopied] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hello! I am your AI agent. How can I assist you today?', sender: 'agent', timestamp: new Date() }
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
                if (data.google_api_key) setGoogleApiKey(data.google_api_key);
                if (data.gemini_api_key) setGeminiApiKey(data.gemini_api_key);
                if (data.cdc_api_key) setCdcApiKey(data.cdc_api_key);
                if (data.cdc_private_key) setCdcPrivateKey(data.cdc_private_key);

                // Load from JSON config if available (CDC specific)
                if (data.config) {
                    if (data.config.type === 'cdc-agent') setAgentType('cdc');
                    if (data.config.transferLimit) setTransferLimit(data.config.transferLimit);
                    if (data.config.timeout) setTimeoutVal(data.config.timeout);
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

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (id === 'new') return;
        setIsSaving(true);
        const saveToast = toast.loading("Saving configuration...");

        try {
            const { error } = await supabase
                .from('agents')
                .update({
                    name: agentName,
                    description: backgroundSetting,
                    google_api_key: googleApiKey,
                    gemini_api_key: geminiApiKey,
                    cdc_api_key: cdcApiKey,
                    cdc_private_key: cdcPrivateKey,
                    config: {
                        type: agentType === 'cdc' ? 'cdc-agent' : 'orca-agent',
                        transferLimit,
                        timeout: timeoutVal
                    }
                })
                .eq('id', id);

            if (error) throw error;

            toast.update(saveToast, {
                render: "Configuration saved successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
        } catch (error: any) {
            toast.update(saveToast, {
                render: `Save failed: ${error.message}`,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!authenticated || !wallet) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (agentType === 'cdc' && (!cdcApiKey || !cdcPrivateKey)) {
            toast.error("CDC API Key and Private Key are mandatory for Crypto.com agents.");
            return;
        }

        setIsRegModalOpen(true);
        setRegStep(0);
        setRegError(null);
        setIsPublishing(true);

        try {
            // STEP 0: Network Check
            const currentChainId = wallet.chainId.includes(':')
                ? wallet.chainId.split(':')[1]
                : wallet.chainId;

            if (currentChainId !== '338') {
                try {
                    await wallet.switchChain(338);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (switchError: any) {
                    throw new Error("Failed to switch to Cronos Testnet. Please do it manually.");
                }
            }
            setRegStep(1);

            // STEP 1: Metadata IPFS Upload
            const provider = await wallet.getEthereumProvider();
            const browserProvider = new ethers.BrowserProvider(provider);
            const signer = await browserProvider.getSigner();

            const registryAddress = CONTRACTS.cronosTestnet.identityRegistry;
            const abi = [
                "function register(string memory tokenUri) external returns (uint256 agentId)",
                "event Registered(uint256 indexed agentId, string tokenURI, address indexed owner)",
                "function getMetadata(uint256 agentId, string memory key) external view returns (bytes memory)"
            ];

            const contract = new ethers.Contract(registryAddress, abi, signer);

            const metadata = {
                name: agentName,
                type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
                image: "https://raw.githubusercontent.com/0rca-network/assets/main/orca-pod-logo.png",
                links: {
                    sourceCode: agentData?.github_url || "",
                    documentation: agentData?.github_url || "",
                    identityRegistry: registryAddress,
                    portfolioVerifier: "0x5A86a43E9E08C450a7909e845Ea5E4d16A3C23F2",
                },
                pricing: {
                    model: "pay-per-validation",
                    proofGeneration: "Free (off-chain computation)",
                    onChainValidation: "Gas costs only"
                },
                endpoints: [
                    {
                        name: "agentWallet",
                        version: "v1",
                        endpoint: `eip155:338:${wallet.address}`
                    }
                ],
                technology: {
                    blockchain: "Cronos Testnet",
                    agentType: agentType
                },
                description: backgroundSetting
            };

            const pinataRes = await fetch('/api/pinata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata)
            });

            if (!pinataRes.ok) throw new Error("Failed to upload to IPFS via Pinata");
            const pinataResult = await pinataRes.json();
            const ipfsUri = `ipfs://${pinataResult.IpfsHash}`;

            setRegStep(2);

            // STEP 2: On-Chain Registration
            const tx = await contract.register(ipfsUri);
            const receipt = await tx.wait();

            // Extract AgentID
            let contractAgentId = "";
            const log = receipt.logs.find((l: any) => l.address.toLowerCase() === registryAddress.toLowerCase());
            if (log) {
                const parsed = contract.interface.parseLog(log);
                if (parsed?.name === 'Registered') {
                    contractAgentId = parsed.args.agentId.toString();
                }
            }

            setRegStep(3);

            // STEP 3: Vault Activation (Wait for it to be ready in registry)
            let vaultAddr = "";
            if (contractAgentId) {
                // Poll for vault metadata if created by factory
                for (let i = 0; i < 5; i++) {
                    try {
                        const vaultBytes = await contract.getMetadata(contractAgentId, "vault");
                        if (vaultBytes && vaultBytes !== '0x') {
                            vaultAddr = ethers.toUtf8String(vaultBytes);
                            break;
                        }
                    } catch (e) { }
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            setRegStep(4);

            // STEP 4: Database Sync
            await supabase
                .from('agents')
                .update({
                    ipfs_cid: pinataResult.IpfsHash,
                    chain_agent_id: contractAgentId || undefined,
                    contract_address: registryAddress,
                    vault_address: vaultAddr || undefined,
                    status: 'active',
                    google_api_key: googleApiKey,
                    gemini_api_key: geminiApiKey,
                    cdc_api_key: cdcApiKey,
                    cdc_private_key: cdcPrivateKey,
                    config: {
                        type: agentType === 'cdc' ? 'cdc-agent' : 'orca-agent',
                        transferLimit,
                        timeout: timeoutVal
                    }
                })
                .eq('id', id);

            setRegStep(5);
            toast.success("Agent registered and configured!");

            // Reload data
            const { data } = await supabase.from('agents').select('*').eq('id', id).single();
            if (data) setAgentData(data);

            // Close modal after tiny delay
            setTimeout(() => setIsRegModalOpen(false), 2000);

        } catch (error: any) {
            console.error("Publish error:", error);
            setRegError(error.message || "Unknown registration error");
            toast.error(`Registration failed: ${error.message}`);
        } finally {
            setIsPublishing(false);
        }
    };

    const [isDeploying, setIsDeploying] = useState(false);

    const handleDeploy = async () => {
        if (!agentData?.chain_agent_id) {
            toast.error("Please register your agent on-chain first!");
            return;
        }

        setIsDeploying(true);
        const deployToast = toast.loading("Preparing Kubernetes deployment...");

        try {
            const config: any = {
                name: agentName,
                description: backgroundSetting,
                greeting: greeting,
                vaultAddress: agentData?.vault_address || wallet?.address || "",
                tools: tools,
                mcpServers: mcpServers,
                crewAITools: crewAITools,
                googleApiKey: googleApiKey,
                geminiApiKey: geminiApiKey,
                cdcApiKey: cdcApiKey,
                cdcPrivateKey: cdcPrivateKey,
                transferLimit: transferLimit,
                timeout: timeoutVal
            };

            let result;
            if (agentData?.github_url) {
                result = await importGithubAgent(agentName, agentData.github_url);
            } else if (agentType === 'cdc') {
                result = await deployCDCAgent(id, config);
            } else {
                result = await deployOrcaAgent(id, config);
            }

            if (result.success) {
                toast.update(deployToast, {
                    render: `Agent deployed! URL: ${result.url}`,
                    type: "success",
                    isLoading: false,
                    autoClose: 5000
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.update(deployToast, {
                render: `Deployment failed: ${error.message}`,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
        } finally {
            setIsDeploying(false);
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
                text: `I've received your message: "${chatInput}". As your ${agentName}, I'm currently processing this based on your configuration.`,
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

    const removeCrewTool = (index: number) => {
        setCrewAITools(prev => prev.filter((_, i) => i !== index));
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
        <div className="bg-[#0A0A0A] min-h-screen text-white font-inter selection:bg-mint-glow selection:text-black flex flex-col overflow-hidden h-screen">
            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-white/5 bg-[#0D0D0D] px-4 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/agents" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft size={18} className="text-neutral-400" />
                    </Link>
                    <div className="h-8 w-[1px] bg-white/10 mx-1" />
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-lg ${agentType === 'orca' ? 'bg-gradient-to-br from-mint-glow to-blue-600' : 'bg-gradient-to-br from-[#002D74] to-[#011B45] shadow-blue-900/20'}`}>
                            {agentType === 'orca' ? <Zap size={16} className="text-black" /> : <Bot size={16} className="text-white" />}
                        </div>
                        <div className="flex items-center gap-2 group">
                            {isEditingName ? (
                                <input
                                    autoFocus
                                    className="bg-white/5 border border-mint-glow/30 rounded px-2 py-0.5 text-sm font-bold focus:outline-none focus:border-mint-glow"
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

                        {/* Agent Type Toggle */}
                        <div className="flex bg-[#161616] rounded-full p-1 border border-white/5 ml-2 shadow-inner">
                            <button
                                onClick={() => setAgentType('orca')}
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${agentType === 'orca' ? 'bg-mint-glow text-black' : 'text-neutral-500 hover:text-white'}`}
                            >
                                Orca
                            </button>
                            <button
                                onClick={() => setAgentType('cdc')}
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${agentType === 'cdc' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}
                            >
                                CDC
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-mint-glow tracking-widest uppercase mb-0.5">
                            {balance} TCRO
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-mint-glow animate-pulse" />
                            <span className="text-[10px] font-mono text-neutral-400">
                                {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'No Wallet'}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 mx-1" />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-neutral-400 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            Save
                        </button>

                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className={`flex items-center gap-2 px-5 py-2 ${agentData?.chain_agent_id ? 'bg-white/5 text-neutral-400 border border-white/10' : 'bg-mint-glow text-black'} rounded-full text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isPublishing ? (
                                <div className="w-4 h-4 border-2 border-current rounded-full animate-spin" />
                            ) : (
                                <Shield size={14} />
                            )}
                            {agentData?.chain_agent_id ? 'Agent Registered' : (isPublishing ? 'Registering...' : 'Register Agent')}
                        </button>

                        {agentData?.chain_agent_id && (
                            <button
                                onClick={handleDeploy}
                                disabled={isDeploying}
                                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                            >
                                {isDeploying ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <MonitorPlay size={14} />
                                )}
                                {isDeploying ? 'Deploying...' : 'One Click Deploy'}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Sub-header / Tabs */}
            <div className="h-12 border-b border-white/5 bg-[#0D0D0D] px-10 flex items-center shrink-0">
                <span className="text-xs font-bold text-neutral-400 border-b-2 border-mint-glow h-full flex items-center px-4 cursor-pointer hover:text-white transition-colors">Fine Tuning</span>
                <span className="text-xs font-bold text-neutral-600 h-full flex items-center px-4 cursor-not-allowed hover:text-neutral-400 transition-colors">Deployments</span>
                <span className="text-xs font-bold text-neutral-600 h-full flex items-center px-4 cursor-not-allowed hover:text-neutral-400 transition-colors">Analytics</span>
            </div>

            {/* Main Content Grid */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 max-w-[1800px] mx-auto">

                    {/* Column 1: Background Setting */}
                    <div className="lg:col-span-4 border-r border-white/5 flex flex-col bg-[#0D0D0D]/30 relative">
                        <div className="p-6 flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                                <Shield size={14} className="text-mint-glow" />
                                Background Setting
                            </h2>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-300 hover:brightness-125 hover:scale-105 active:scale-95 transition-all">
                                <Sparkles size={12} strokeWidth={3} />
                                AI REFINE
                            </button>
                        </div>
                        <div className="px-6 flex-1 flex flex-col min-h-0 mb-6">
                            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 relative group transition-all focus-within:border-mint-glow/30">
                                <button
                                    onClick={handleCopy}
                                    className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${showCopied ? 'bg-mint-glow text-black' : 'bg-white/5 text-neutral-400 hover:text-white lg:opacity-0 group-hover:opacity-100'}`}
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
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-mint-glow text-black px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter"
                                    >
                                        Prompt Copied!
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Configuration Blocks */}
                    <div className={`${isPreviewVisible ? 'lg:col-span-4' : 'lg:col-span-8'} border-r border-white/5 flex flex-col bg-[#0A0A0A] overflow-y-auto custom-scrollbar transition-all duration-500`}>
                        <div className="p-4 space-y-3 pb-20">
                            {/* Capability Type Selector */}
                            <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-1.5 flex gap-1 mb-2">
                                <button
                                    onClick={() => setCapabilityType('tool')}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${capabilityType === 'tool' ? 'bg-white/5 text-mint-glow shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
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
                                    title="Tool"
                                    icon={Terminal}
                                    expanded={true}
                                    onAdd={() => setShowToolModal(true)}
                                    badge={(tools.length + crewAITools.length) > 0 ? (tools.length + crewAITools.length).toString() : undefined}
                                >
                                    <div className="space-y-3">
                                        {(tools.length === 0 && crewAITools.length === 0) ? (
                                            <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group/empty cursor-pointer" onClick={() => setShowToolModal(true)}>
                                                <div className="p-3 bg-white/5 rounded-full text-neutral-500 group-hover/empty:scale-110 group-hover/empty:text-mint-glow transition-all">
                                                    <Plus size={20} />
                                                </div>
                                                <span className="text-xs text-neutral-500 font-medium">No tools active. Add one to expand capabilities.</span>
                                            </div>
                                        ) : (
                                            <>
                                                {tools.map((tool, idx) => (
                                                    <div key={`tool-${idx}`} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
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
                                                ))}

                                                {crewAITools.map((toolId, idx) => {
                                                    const tool = CREWAI_TOOLS.find(t => t.id === toolId);
                                                    return (
                                                        <div key={`crew-${idx}`} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-mint-glow/10 flex items-center justify-center text-mint-glow">
                                                                    <Sparkles size={16} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-white leading-none mb-1">{tool?.name || toolId}</p>
                                                                    <p className="text-[10px] text-neutral-500 truncate w-40">{tool?.description || 'CrewAI Tool'}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => removeCrewTool(idx)}
                                                                className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </ConfigSection>
                            ) : (
                                <ConfigSection
                                    title="MCP"
                                    icon={Ghost}
                                    expanded={true}
                                    onAdd={() => setShowMCPModal(true)}
                                    badge={mcpServers.length > 0 ? mcpServers.length.toString() : undefined}
                                >
                                    <div className="space-y-4">
                                        {mcpServers.length === 0 ? (
                                            <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group/empty cursor-pointer" onClick={() => setShowMCPModal(true)}>
                                                <div className="p-3 bg-white/5 rounded-full text-neutral-500 group-hover/empty:scale-110 group-hover/empty:text-mint-glow transition-all">
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

                                                    {/* MCP Tools List */}
                                                    <div className="pl-11 space-y-1.5 border-l border-white/5 ml-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Available Tools</span>
                                                            <div className="flex-1 h-[1px] bg-white/5" />
                                                        </div>
                                                        {server.tools.map((t, tid) => (
                                                            <ToolItem key={tid} tool={t} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ConfigSection>
                            )}

                            <ConfigSection title="Greeting" icon={MessageCircle} expanded={true} hasAI>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-neutral-300 focus:outline-none focus:border-mint-glow/30 min-h-[100px] resize-none transition-all placeholder:text-neutral-700"
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

                            {agentType === 'cdc' && (
                                <ConfigSection title="CDC SDK Configuration" icon={Cpu} expanded={true}>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Transfer Limit</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all"
                                                        placeholder="-1"
                                                        value={transferLimit}
                                                        onChange={(e) => setTransferLimit(e.target.value)}
                                                    />
                                                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-400 transition-colors" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Timeout (s)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all"
                                                        placeholder="60"
                                                        value={timeoutVal}
                                                        onChange={(e) => setTimeoutVal(e.target.value)}
                                                    />
                                                    <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-400 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                            <p className="text-[10px] text-blue-400 font-medium leading-relaxed">
                                                Advanced DeFi settings for your Crypto.com agent.
                                            </p>
                                        </div>
                                    </div>
                                </ConfigSection>
                            )}

                            <ConfigSection
                                title="Shortcuts"
                                icon={Zap}
                                expanded={false}
                                badge={shortcuts.length > 0 ? shortcuts.length.toString() : undefined}
                            >
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-mint-glow/30"
                                            placeholder="Add quick phrase..."
                                            value={newShortcut}
                                            onChange={(e) => setNewShortcut(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addShortcut()}
                                        />
                                        <button
                                            onClick={addShortcut}
                                            className="p-2.5 bg-mint-glow text-black rounded-xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {shortcuts.length === 0 ? (
                                        <div className="p-10 flex flex-col items-center justify-center text-center opacity-40">
                                            <MessageSquare size={24} className="text-neutral-500 mb-2" />
                                            <p className="text-[11px] text-neutral-500 font-medium">No shortcuts added yet</p>
                                        </div>
                                    ) : (
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
                                    )}
                                </div>
                            </ConfigSection>

                            <ConfigSection title="Authentication" icon={Lock} expanded={false} type="dropdown">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsAuthOpen(!isAuthOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Key size={14} className="text-neutral-500 group-hover:text-mint-glow transition-colors" />
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
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#0D0D0D] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl"
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
                                                        {authMethod === method && <Check size={12} className="text-mint-glow" />}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </ConfigSection>

                            <ConfigSection title="Environment Variables" icon={Settings} expanded={false}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Gemini API Key</label>
                                        <div className="relative group">
                                            <input
                                                type="password"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-mint-glow/30 transition-all font-mono"
                                                placeholder="GEMINI_API_KEY"
                                                value={geminiApiKey}
                                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                            />
                                            <Sparkles size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-mint-glow transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Google API Key</label>
                                        <div className="relative group">
                                            <input
                                                type="password"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-mint-glow/30 transition-all font-mono"
                                                placeholder="GOOGLE_API_KEY"
                                                value={googleApiKey}
                                                onChange={(e) => setGoogleApiKey(e.target.value)}
                                            />
                                            <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-mint-glow transition-colors" />
                                        </div>
                                    </div>

                                    {agentType === 'cdc' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">CDC API Key</label>
                                                <div className="relative group">
                                                    <input
                                                        type="password"
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all font-mono"
                                                        placeholder="CDC_API_KEY (Mandatory for CDC)"
                                                        value={cdcApiKey}
                                                        onChange={(e) => setCdcApiKey(e.target.value)}
                                                    />
                                                    <Zap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-400 transition-colors" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">CDC Private Key</label>
                                                <div className="relative group">
                                                    <input
                                                        type="password"
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/30 transition-all font-mono"
                                                        placeholder="CDC_AGENT_PRIVATE_KEY (Mandatory for CDC)"
                                                        value={cdcPrivateKey}
                                                        onChange={(e) => setCdcPrivateKey(e.target.value)}
                                                    />
                                                    <Shield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-400 transition-colors" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <p className="text-[10px] text-neutral-500 font-medium italic mt-2 px-1">
                                        * These keys are passed directly to the agent for deployment and logic execution.
                                    </p>
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
                                className="lg:col-span-4 bg-[#0D0D0D]/50 flex flex-col overflow-hidden relative border-l border-white/5"
                            >
                                <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0">
                                    <h2 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                                        <Play size={14} className="text-mint-glow" />
                                        Interactive Preview
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className="flex bg-white/5 rounded-lg p-1 mr-2">
                                            <button
                                                onClick={() => setPreviewMode('chat')}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${previewMode === 'chat' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                                            >
                                                Chat
                                            </button>
                                            <button
                                                onClick={() => setPreviewMode('code')}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${previewMode === 'code' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                                            >
                                                Code
                                            </button>
                                        </div>
                                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-500 group" onClick={() => setIsPreviewVisible(false)}>
                                            <X size={18} className="group-hover:text-white" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                    {previewMode === 'chat' ? (
                                        <>
                                            <div className="flex items-center gap-4 mb-8 shrink-0">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-glow/20 to-blue-600/20 border border-mint-glow/20 flex items-center justify-center relative shadow-lg shadow-mint-glow/5">
                                                    <Zap size={24} className="text-mint-glow" />
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#0D0D0D] transition-transform"
                                                    >
                                                        <Plus size={12} className="text-black" />
                                                    </motion.button>
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-base leading-tight text-white">{agentName}</h3>
                                                    <p className="text-[11px] text-neutral-500 font-mono tracking-tighter uppercase leading-none">ID: {id}</p>
                                                    <div className="flex gap-1.5 mt-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-mint-glow animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-mint-glow/80">Agent Online</span>
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
                                                                ? 'bg-mint-glow text-black'
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
                                                            placeholder="Test your agent..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 text-sm focus:outline-none focus:border-mint-glow/30 transition-all font-medium placeholder:text-neutral-700"
                                                            value={chatInput}
                                                            onChange={(e) => setChatInput(e.target.value)}
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                            {chatInput.trim() ? (
                                                                <button type="submit" className="p-2 bg-mint-glow text-black rounded-xl hover:scale-105 active:scale-95 transition-all">
                                                                    <Send size={16} />
                                                                </button>
                                                            ) : (
                                                                <Ghost size={16} className="text-neutral-700 mr-2" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        /* Code View */
                                        <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 flex flex-col overflow-hidden relative shadow-inner">
                                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Terminal size={12} className="text-mint-glow" />
                                                    agent.py (Autonomous Expert)
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        const config = {
                                                            name: agentName,
                                                            description: backgroundSetting,
                                                            greeting: greeting,
                                                            vaultAddress: agentData?.vault_address || wallet?.address || "",
                                                            tools: tools,
                                                            mcpServers: mcpServers,
                                                            crewAITools: crewAITools,
                                                            transferLimit: transferLimit,
                                                            timeout: timeoutVal
                                                        };
                                                        const code = agentType === 'cdc'
                                                            ? generateCDCAgentCode(id, config)
                                                            : generateOrcaAgentCode(id, config);
                                                        navigator.clipboard.writeText(code);
                                                        toast.success("Code copied to clipboard!");
                                                    }}
                                                    className="p-2 bg-white/5 rounded-lg hover:text-white text-neutral-500 transition-all"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                                                <pre className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                                                    {agentType === 'cdc' ? generateCDCAgentCode(id, {
                                                        name: agentName,
                                                        description: backgroundSetting,
                                                        greeting: greeting,
                                                        vaultAddress: agentData?.vault_address || wallet?.address || "",
                                                        tools: tools,
                                                        mcpServers: mcpServers,
                                                        crewAITools: crewAITools,
                                                        transferLimit: transferLimit,
                                                        timeout: timeoutVal
                                                    }) : generateOrcaAgentCode(id, {
                                                        name: agentName,
                                                        description: backgroundSetting,
                                                        greeting: greeting,
                                                        vaultAddress: agentData?.vault_address || wallet?.address || "",
                                                        tools: tools,
                                                        mcpServers: mcpServers,
                                                        crewAITools: crewAITools
                                                    })}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
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
                                    className="flex items-center gap-3 px-6 py-4 bg-mint-glow text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(0,255,163,0.3)] hover:scale-105 active:scale-95 transition-all group"
                                >
                                    <Play size={16} fill="black" />
                                    Preview Agent
                                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse ml-1" />
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
                    setTools(prev => [...prev, {
                        name: newTool.name,
                        description: newTool.description,
                        baseUrl: newTool.baseUrl,
                        endpoint: newTool.endpoint,
                        method: newTool.method,
                        parameters: newTool.parameters
                    }]);
                    setShowToolModal(false);
                }}
                onAddCrewTool={(toolId) => {
                    setCrewAITools(prev => [...prev, toolId]);
                    toast.success(`Imported ${toolId} from CrewAI`);
                }}
            />

            <AddMCPModal
                isOpen={showMCPModal}
                onClose={() => setShowMCPModal(false)}
                onAdd={addMcpServer}
            />

            <RegistrationProgressModal
                isOpen={isRegModalOpen}
                currentStep={regStep}
                steps={regSteps}
                error={regError}
                onClose={() => setIsRegModalOpen(false)}
            />

            {/* Global Background Elements */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-mint-glow/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

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

function ToolItem({ tool }: { tool: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="space-y-2">
            <div
                className={`flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border transition-all group/tool cursor-pointer ${isExpanded ? 'border-orange-500/30 bg-orange-500/[0.02]' : 'border-white/5 hover:bg-white/5'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full transition-colors shadow-[0_0_8px_rgba(249,115,22,0.4)] ${isExpanded ? 'bg-orange-500' : 'bg-orange-500/20 group-hover/tool:bg-orange-500'}`} />
                    <div>
                        <span className="text-[11px] font-bold text-neutral-200 block">{tool.name}</span>
                        <span className="text-[9px] text-neutral-500 line-clamp-1">{tool.description}</span>
                    </div>
                </div>
                <button
                    className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition-all ${isExpanded ? 'bg-orange-500 text-black border-orange-500' : 'bg-white/5 text-neutral-500 border-white/10 hover:border-white/20'}`}
                >
                    {isExpanded ? 'Hide' : 'Schema'}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && tool.inputSchema && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'circOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl ml-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">Input Parameters</span>
                                <div className="h-[1px] flex-1 bg-white/5 mx-3" />
                            </div>
                            <pre className="text-[10px] font-mono text-orange-400 overflow-x-auto custom-scrollbar p-1">
                                {JSON.stringify(tool.inputSchema, null, 2)}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
        <div className={`bg-[#0D0D0D] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-white/5' : ''}`}>
            <div
                className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/5'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-mint-glow/10 text-mint-glow' : 'bg-white/5 text-neutral-500'}`}>
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
                        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-400 animate-pulse">
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
                                <Plus size={16} className="text-neutral-500 hover:text-mint-glow" />
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

function RegistrationProgressModal({ isOpen, currentStep, steps, error, onClose }: {
    isOpen: boolean,
    currentStep: number,
    steps: { label: string, description: string }[],
    error: string | null,
    onClose: () => void
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={error ? onClose : undefined}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-mint-glow/5"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-none mb-2">Agent Registration</h3>
                            <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-widest">Protocol Verification in progress</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-mint-glow/10 flex items-center justify-center">
                            {error ? (
                                <X size={24} className="text-red-500" />
                            ) : (
                                <Zap size={24} className="text-mint-glow animate-pulse" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step, idx) => {
                            const isDone = idx < currentStep;
                            const isCurrent = idx === currentStep;
                            const isPending = idx > currentStep;

                            return (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isDone ? 'bg-mint-glow border-mint-glow' :
                                            isCurrent ? 'border-mint-glow bg-mint-glow/10' :
                                                'border-white/5 bg-white/5'
                                            }`}>
                                            {isDone ? (
                                                <Check size={12} strokeWidth={4} className="text-black" />
                                            ) : isCurrent ? (
                                                <div className="w-1.5 h-1.5 rounded-full bg-mint-glow animate-ping" />
                                            ) : (
                                                <div className="w-1 h-1 rounded-full bg-neutral-800" />
                                            )}
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className={`w-[2px] flex-1 my-1 rounded-full transition-colors duration-500 ${isDone ? 'bg-mint-glow' : 'bg-white/5'}`} />
                                        )}
                                    </div>
                                    <div className={`pb-4 transition-all duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                                        <p className={`text-[13px] font-bold leading-none mb-1.5 ${isCurrent ? 'text-white' : 'text-neutral-400'}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[11px] text-neutral-600 font-medium leading-relaxed italic">
                                            {isCurrent ? (error || step.description) : step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 w-full py-2.5 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                            >
                                Close & Retry
                            </button>
                        </div>
                    )}

                    {!error && currentStep === steps.length && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-4 bg-mint-glow/10 border border-mint-glow/20 rounded-2xl flex items-center justify-center gap-3"
                        >
                            <Sparkles size={16} className="text-mint-glow" />
                            <span className="text-xs font-black text-mint-glow uppercase tracking-widest">Protocol Sync Complete</span>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
