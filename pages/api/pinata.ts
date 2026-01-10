import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const metadata = req.body;

        if (!process.env.PINATA_JWT) {
            return res.status(500).json({ error: 'PINATA_JWT is not configured' });
        }

        const pinataData = JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
                name: metadata.name || 'Agent Metadata',
            },
        });

        const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.PINATA_JWT.trim()}`,
            },
            body: pinataData,
        });

        const result = await pinataResponse.json();

        if (!pinataResponse.ok) {
            console.error('Pinata API Error Response:', result);
            return res.status(pinataResponse.status).json({
                error: result.error?.message || result.message || result.error || 'Failed to pin to IPFS',
                details: result
            });
        }

        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Pinata internal error:', error);
        return res.status(500).json({ error: error.message });
    }
}
