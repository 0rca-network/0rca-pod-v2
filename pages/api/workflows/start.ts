import { NextApiRequest, NextApiResponse } from 'next';
import { startWorkflow } from '@/lib/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowId } = req.body;

    if (!workflowId) {
      return res.status(400).json({ error: 'Missing workflowId' });
    }

    await startWorkflow(workflowId);
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error starting workflow:', error);
    res.status(500).json({ error: error.message });
  }
}
