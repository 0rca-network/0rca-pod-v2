import { NextApiRequest, NextApiResponse } from 'next';
import { createAgentJob } from '@/lib/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowId, stepNumber, walletAddress } = req.body;

    if (!workflowId || !stepNumber || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await createAgentJob(workflowId, stepNumber, walletAddress);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error starting job:', error);
    res.status(500).json({ error: error.message });
  }
}
