import { NextApiRequest, NextApiResponse } from 'next';
import { pollAgentJob, advanceWorkflow } from '@/lib/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stepResultId, workflowId } = req.body;

    if (!stepResultId || !workflowId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pollAgentJob(stepResultId);
    
    if (result.status === 'succeeded') {
      const advance = await advanceWorkflow(workflowId);
      res.status(200).json({ ...result, ...advance });
    } else {
      res.status(200).json(result);
    }
  } catch (error: any) {
    console.error('Error polling job:', error);
    res.status(500).json({ error: error.message });
  }
}
