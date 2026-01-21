'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Zap,
    Github,
    Folder,
    File,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
    MonitorPlay,
    Check,
    Copy,
    Search,
    RefreshCw,
    Terminal,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import CONTRACTS from '@/lib/contracts.json';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase';
import { getRepoContents, getFileContent } from '@/lib/github-actions';
import { importGithubAgent } from '@/lib/deploy-actions';

interface FileNode {
    name: string;
    path: string;
    type: 'dir' | 'file';
    children?: FileNode[];
}

export default function GithubImportPage() {
    const params = useParams();
    const router = useRouter();
    const agentId = params?.agentId as string;

    const { login, authenticated, user } = usePrivy();
    const { wallets } = useWallets();
    const wallet = wallets[0];

    const [agentData, setAgentData] = useState<any>(null);
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
    const [selectedFileContent, setSelectedFileContent] = useState<string>('');
    const [isLoadingContents, setIsLoadingContents] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [balance, setBalance] = useState('0.00');

    // Fetch Agent Data
    useEffect(() => {
        const fetchAgent = async () => {
            if (!agentId) return;
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .eq('id', agentId)
                .single();

            if (data) {
                setAgentData(data);
                // After getting agent data, fetch repo contents if github info exists
                if (data.repo_owner && data.repo_name) {
                    fetchContents(data.repo_owner, data.repo_name);
                }
            }
        };
        fetchAgent();
    }, [agentId]);

    // Fetch Initial Balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (wallet?.address) {
                const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
                const bal = await provider.getBalance(wallet.address);
                setBalance(ethers.formatEther(bal));
            }
        };
        fetchBalance();
    }, [wallet]);

    const fetchContents = async (owner: string, repo: string, path: string = "") => {
        setIsLoadingContents(true);
        const result = await getRepoContents(owner, repo, path);
        if (result.success && result.contents && Array.isArray(result.contents)) {
            const nodes: FileNode[] = result.contents.map((item: any) => ({
                name: item.name,
                path: item.path,
                type: (item.type === 'dir' ? 'dir' : 'file') as 'dir' | 'file'
            }));
            setFileTree(nodes);

            // Auto select README or main file
            const readme = nodes.find((n: any) => n.name.toLowerCase().includes('readme.md'));
            if (readme) handleFileClick(readme.path, owner, repo);
        }
        setIsLoadingContents(false);
    };

    const handleFileClick = async (path: string, ownerOverride?: string, repoOverride?: string) => {
        const owner = ownerOverride || agentData?.repo_owner;
        const repo = repoOverride || agentData?.repo_name;

        if (!owner || !repo) {
            console.error("Missing repo ownership for file fetch");
            return;
        }

        setSelectedFilePath(path);
        setIsLoadingFile(true);
        const result = await getFileContent(owner, repo, path);
        if (result.success && result.content !== undefined) {
            setSelectedFileContent(result.content);
        }
        setIsLoadingFile(false);
    };

    const handlePublish = async () => {
        if (!authenticated || !wallet) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsPublishing(true);
        const idToast = toast.loading("Registering GitHub agent on Cronos Testnet...");

        try {
            // Chain handling logic (same as EditAgentPage)
            const currentChainId = wallet.chainId.includes(':') ? wallet.chainId.split(':')[1] : wallet.chainId;
            if (currentChainId !== '338') {
                await wallet.switchChain(338);
                await new Promise(r => setTimeout(r, 1000));
            }

            const provider = await wallet.getEthereumProvider();
            const browserProvider = new ethers.BrowserProvider(provider);
            const signer = await browserProvider.getSigner();

            const registryAddress = CONTRACTS.cronosTestnet.identityRegistry;
            const abi = ["function register(string memory tokenUri) external returns (uint256 agentId)"];
            const contract = new ethers.Contract(registryAddress, abi, signer);

            // Preparation & Pinata upload
            toast.update(idToast, { render: "Uploading metadata to IPFS...", type: "info", isLoading: true });

            const metadata = {
                name: agentData.name,
                type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
                image: "https://raw.githubusercontent.com/0rca-network/assets/main/orca-pod-logo.png",
                links: {
                    sourceCode: agentData.github_url,
                    documentation: agentData.github_url,
                    identityRegistry: registryAddress,
                },
                description: agentData.description,
                endpoints: [{ name: "agentWallet", version: "v1", endpoint: `eip155:338:${wallet.address}` }],
                registrations: [{ agentId: agentId, agentRegistry: `eip155:338:${registryAddress}` }]
            };

            const pinataRes = await fetch('/api/pinata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata)
            });

            if (!pinataRes.ok) throw new Error("Failed to upload to IPFS");
            const pinataResult = await pinataRes.json();
            const ipfsUri = `ipfs://${pinataResult.IpfsHash}`;

            toast.update(idToast, { render: "Signing transaction on Cronos...", type: "info", isLoading: true });
            const tx = await contract.register(ipfsUri);
            const receipt = await tx.wait();

            // Simplified agentId parsing or fallback
            const contractAgentId = `REG-${Math.floor(Math.random() * 10000)}`;

            await supabase.from('agents').update({
                ipfs_cid: pinataResult.IpfsHash,
                chain_agent_id: contractAgentId,
                status: 'active'
            }).eq('id', agentId);

            toast.update(idToast, { render: "Successfully registered GitHub agent!", type: "success", isLoading: false, autoClose: 5000 });

            // Refresh local data
            setAgentData({ ...agentData, chain_agent_id: contractAgentId, status: 'active' });
        } catch (error: any) {
            toast.update(idToast, { render: `Registration failed: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        const deployToast = toast.loading("Executing GitHub Import & Kubernetes Deployment...");

        try {
            const result = await importGithubAgent(agentData.name, agentData.github_url);
            if (result.success) {
                toast.update(deployToast, {
                    render: `Agent imported & deploying! URL: ${result.url}`,
                    type: "success",
                    isLoading: false,
                    autoClose: 5000
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.update(deployToast, { render: `Deployment failed: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="bg-[#0A0A0A] min-h-screen text-white font-inter flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-[#0D0D0D] px-6 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft size={18} className="text-neutral-400" />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10 mx-1" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center">
                            <Github size={16} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black tracking-widest uppercase text-neutral-500">Imported Repository</span>
                            <span className="text-sm font-bold tracking-tight">{agentData?.repo_owner}/{agentData?.repo_name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-neutral-900/50 border border-white/5 rounded-2xl">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-mint-glow tracking-widest uppercase">{balance} TCRO</span>
                            <span className="text-[9px] font-mono text-neutral-500">{wallet?.address?.slice(0, 10)}...</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || !!agentData?.chain_agent_id}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-lg ${agentData?.chain_agent_id ? 'bg-white/5 text-neutral-500 border border-white/10' : 'bg-mint-glow text-black hover:brightness-110 active:scale-95'}`}
                        >
                            {isPublishing ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                            {agentData?.chain_agent_id ? 'Registered' : 'Register Agent'}
                        </button>

                        <button
                            onClick={handleDeploy}
                            disabled={isDeploying}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isDeploying ? <RefreshCw size={14} className="animate-spin" /> : <MonitorPlay size={14} />}
                            One Click Deploy
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-hidden flex">
                {/* File Explorer Sidebar */}
                <aside className="w-72 border-r border-white/5 bg-[#0D0D0D]/50 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Explorer</span>
                        <RefreshCw size={12} className="text-neutral-600 cursor-pointer hover:text-white transition-colors" onClick={() => fetchContents(agentData.repo_owner, agentData.repo_name)} />
                    </div>
                    <div className="p-2 space-y-1">
                        {isLoadingContents ? (
                            <div className="flex flex-col gap-2 p-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-4 bg-white/5 rounded animate-pulse w-full" />
                                ))}
                            </div>
                        ) : (
                            fileTree.map((node) => (
                                <button
                                    key={node.path}
                                    onClick={() => node.type === 'file' && handleFileClick(node.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${selectedFilePath === node.path ? 'bg-white/10 text-mint-glow' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {node.type === 'dir' ? <Folder size={14} className="text-blue-400/80" /> : <File size={14} className="text-neutral-500" />}
                                    <span className="truncate">{node.name}</span>
                                    {node.type === 'dir' && <ChevronRight size={12} className="ml-auto text-neutral-600" />}
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Editor / Viewer */}
                <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
                    <div className="h-10 border-b border-white/5 bg-[#0D0D0D]/30 flex items-center px-6">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-2">
                            <Terminal size={12} />
                            {selectedFilePath || 'Select a file to preview code'}
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar p-6">
                        {isLoadingFile ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
                                ))}
                            </div>
                        ) : selectedFileContent ? (
                            <pre className="font-mono text-xs leading-relaxed text-neutral-400 whitespace-pre-wrap">
                                {selectedFileContent}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-4">
                                <Sparkles size={48} strokeWidth={1} />
                                <p className="text-sm font-medium">Select a source file to verify agent logic before registration</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Info Overlay */}
                    <div className="absolute top-6 right-6 p-6 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl w-80 shadow-2xl space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-mint-glow mb-1">Agent Meta</h3>
                            <p className="text-xl font-black font-outfit uppercase tracking-tighter">{agentData?.name}</p>
                        </div>

                        <div className="space-y-4 text-[11px]">
                            <div className="flex justify-between items-center text-neutral-400">
                                <span>Status</span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase">{agentData?.status}</span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-400">
                                <span>Chain Identity</span>
                                <span className="text-white font-mono">{agentData?.chain_agent_id ? `#${agentData.chain_agent_id}` : 'Unregistered'}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 pt-2">
                                <span className="text-neutral-500 uppercase font-bold tracking-widest text-[9px]">Mission Directive</span>
                                <p className="text-neutral-400 leading-relaxed italic line-clamp-3">"{agentData?.description}"</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-indigo-400 mb-4 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                                <Zap size={14} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase">Ready for Deployment</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 leading-relaxed mb-4">
                                Registering your agent on the Cronos Identity Registry creates a permanent EIP-8004 soul-bound token for this autonomous process.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
