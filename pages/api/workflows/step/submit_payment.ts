import { NextApiRequest, NextApiResponse } from 'next';
import { submitPayment } from '@/lib/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stepResultId, txnIds } = req.body;

    if (!stepResultId || !txnIds) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await submitPayment(stepResultId, txnIds);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ error: error.message });
  }
}
