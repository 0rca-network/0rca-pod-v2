import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { address, signature, message } = req.body;

        if (!address || !signature || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Verify the wallet signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // 2. Format unique user identity
        const walletAddress = address.toLowerCase();
        const email = `${walletAddress}@web3.0rca.network`;

        // Generate a deterministic password using the service role key as a secret
        // This effectively bridges Web3 Signature -> Supabase Auth Session
        const deterministicPassword = crypto
            .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
            .update(walletAddress)
            .digest('hex');

        // 3. Find or Create the User in Supabase
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        let user = users.find((u: any) => u.user_metadata?.wallet_address === walletAddress);

        if (!user) {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: deterministicPassword,
                user_metadata: {
                    wallet_address: walletAddress,
                    source: 'web3_auth'
                },
                email_confirm: true
            });

            if (createError) throw createError;
            user = newUser.user;
        } else {
            // Keep the password in sync with the deterministic one
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
                password: deterministicPassword
            });
        }

        // 4. Generate a session for the client
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
            email: email,
            password: deterministicPassword,
        });

        if (sessionError) throw sessionError;

        return res.status(200).json(sessionData);
    } catch (error: any) {
        console.error('Web3 bridge error:', error);
        return res.status(500).json({ error: error.message });
    }
}
