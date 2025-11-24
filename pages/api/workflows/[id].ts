import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('workflow_id', id)
      .single();

    if (workflowError) throw workflowError;

    const { data: steps, error: stepsError } = await supabase
      .from('step_results')
      .select('*')
      .eq('workflow_id', id)
      .order('step_number');

    if (stepsError) throw stepsError;

    res.status(200).json({ workflow, steps });
  } catch (error: any) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ error: error.message });
  }
}
