'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Plus,
    Server,
    Globe,
    Lock,
    ChevronDown,
    Shield,
    Zap,
    Check,
    Info,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { fetchMcpTools } from '@/lib/mcp-actions';

interface AddMCPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (server: any) => void;
}

export const AddMCPModal: React.FC<AddMCPModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [url, setUrl] = useState('');
    const [type, setType] = useState<'SSE' | 'Streamable'>('Streamable');
    const [authMethod, setAuthMethod] = useState<'None' | 'API Key' | 'OAuth2'>('API Key');
    const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API Key specific state
    const [keyName, setKeyName] = useState('');
    const [location, setLocation] = useState('Header');
    const [keyValue, setKeyValue] = useState('');
    const [isShareable, setIsShareable] = useState(true);

    if (!isOpen) return null;

    const handleAdd = async () => {
        if (!url) {
            setError('Please enter an MCP Server URL');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const transportType = type === 'SSE' ? 'sse' : 'http';

            // Construct headers if API key is used
            const headers: Record<string, string> = {};
            if (authMethod === 'API Key' && keyName && keyValue) {
                if (location === 'Header') {
                    headers[keyName] = keyValue;
                }
                // Note: Query and Cookie would typically be handled differently in a real fetch,
                // but for @ai-sdk/mcp transport headers, we pass them as headers object.
            }

            const result = await fetchMcpTools(url, transportType as any, headers);

            if (result.success) {
                onAdd({
                    url,
                    type,
                    authMethod,
                    keyName,
                    location,
                    keyValue,
                    isShareable,
                    name: url.split('/').pop()?.split('?')[0] || 'New MCP Server',
                    tools: result.tools
                });
                onClose();
            } else {
                setError(result.error || 'Failed to connect to MCP server');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-[#0F0F0F] border border-white/10 rounded-3xl w-full max-w-[600px] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#141414]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                <Server size={18} />
                            </div>
                            <h2 className="text-sm font-bold">Add MCP Server</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </header>

                    <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        {/* URL Input */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                MCP Server URL <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/mcp"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-neutral-700"
                                />
                            </div>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 font-medium"
                                >
                                    <AlertCircle size={14} />
                                    {error}
                                </motion.div>
                            )}
                        </div>

                        {/* Type Radio */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Type <span className="text-red-500">*</span></label>
                            <div className="flex gap-6">
                                {(['SSE', 'Streamable'] as const).map((t) => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="mcpType"
                                                checked={type === t}
                                                onChange={() => setType(t)}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${type === t ? 'border-orange-500' : 'border-neutral-700 group-hover:border-neutral-500'}`} />
                                            {type === t && (
                                                <div className="absolute inset-1 bg-orange-500 rounded-full" />
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold ${type === t ? 'text-white' : 'text-neutral-500'}`}>{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Authentication Dropdown */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Authentication <span className="text-neutral-600">(Optional)</span></label>
                            <div className="relative">
                                <button
                                    onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/10 rounded-xl hover:border-orange-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Lock size={14} className="text-neutral-600 group-hover:text-orange-400 transition-colors" />
                                        <span className="text-xs text-neutral-300 font-medium">{authMethod}</span>
                                    </div>
                                    <ChevronDown size={14} className={`text-neutral-600 transition-transform ${isAuthDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isAuthDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl"
                                        >
                                            {(['None', 'API Key', 'OAuth2'] as const).map((method) => (
                                                <div
                                                    key={method}
                                                    className="px-4 py-3 text-xs text-neutral-400 hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between group"
                                                    onClick={() => {
                                                        setAuthMethod(method);
                                                        setIsAuthDropdownOpen(false);
                                                    }}
                                                >
                                                    {method}
                                                    {authMethod === method && <Check size={12} className="text-orange-400" />}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* API Key Sub-fields */}
                        {authMethod === 'API Key' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 pt-4 border-t border-white/5"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Key Name</label>
                                        <input
                                            value={keyName}
                                            onChange={(e) => setKeyName(e.target.value)}
                                            placeholder="e.g., Authorization"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-orange-500/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Location</label>
                                        <div className="relative">
                                            <select
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-300 focus:outline-none cursor-pointer"
                                            >
                                                <option value="Header">Header</option>
                                                <option value="Query">Query</option>
                                                <option value="Cookie">Cookie</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase">API Key Value</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-neutral-500">Shareable</span>
                                            <button
                                                onClick={() => setIsShareable(!isShareable)}
                                                className={`w-7 h-4 rounded-full relative transition-colors ${isShareable ? 'bg-orange-500' : 'bg-neutral-800'}`}
                                            >
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isShareable ? 'left-3.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="password"
                                        value={keyValue}
                                        onChange={(e) => setKeyValue(e.target.value)}
                                        placeholder="Enter your API key"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-orange-500/30 font-mono"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="p-6 bg-[#141414] border-t border-white/5 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={isLoading}
                            className={`px-8 py-2.5 bg-orange-500 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    Add Server
                                </>
                            )}
                        </button>
                    </footer>
                </motion.div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
        }
      `}</style>
        </AnimatePresence>
    );
};
