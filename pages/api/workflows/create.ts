import { NextApiRequest, NextApiResponse } from 'next';
import { planWorkflow } from '@/lib/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage, walletAddress } = req.body;

    if (!userMessage || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await planWorkflow(userMessage, walletAddress);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: error.message });
  }
}
