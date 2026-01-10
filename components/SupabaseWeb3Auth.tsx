"use client"

import { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { supabase } from '@/lib/supabase';

export function SupabaseWeb3Auth({ children }: { children: React.ReactNode }) {
    const { authenticated, ready } = usePrivy();
    const { wallets } = useWallets();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const syncAuth = async () => {
            if (!ready || !authenticated || wallets.length === 0 || isSyncing) return;

            const { data: { session } } = await supabase.auth.getSession();

            // If already has a session, check if it matches the current wallet
            if (session?.user?.user_metadata?.wallet_address === wallets[0].address.toLowerCase()) {
                return;
            }

            setIsSyncing(true);
            try {
                const wallet = wallets[0];
                const address = wallet.address;
                const message = `Sign this message to authenticate with 0rca Pod.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;

                // Switch to the correct chain if needed
                if (wallet.chainId !== 'eip155:338') {
                    // Optional: await wallet.switchChain(338);
                }

                const provider = await wallet.getEthereumProvider();
                const signature = await provider.request({
                    method: 'personal_sign',
                    params: [message, address],
                });

                const res = await fetch('/api/auth/web3', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address, signature, message })
                });

                const sessionData = await res.json();
                if (sessionData.session) {
                    await supabase.auth.setSession(sessionData.session);
                    console.log('Supabase authenticated via Wallet');
                }
            } catch (error) {
                console.error('Failed to sync Web3 auth with Supabase:', error);
            } finally {
                setIsSyncing(false);
            }
        };

        syncAuth();
    }, [authenticated, ready, wallets, isSyncing]);

    return <>{children}</>;
}
