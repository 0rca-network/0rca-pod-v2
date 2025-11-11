import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const agentToken = req.headers['x-agent-token']
    
    if (!agentToken) {
      return res.status(401).json({ error: 'X-Agent-Token header required' })
    }

    const { user_id, wallet_address, job_id, agent_id, access_token, job_input_hash, job_output } = req.body

    if (!user_id || !wallet_address || !job_id || !agent_id || !access_token) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify agent token
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, agent_token')
      .eq('id', agent_id)
      .eq('agent_token', agentToken)
      .single()

    if (agentError || !agent) {
      return res.status(401).json({ error: 'Invalid agent token' })
    }

    // Insert access token record
    const { data: accessRecord, error: insertError } = await supabase
      .from('access_tokens')
      .insert({
        user_id,
        wallet_address,
        job_id,
        agent_id,
        access_token,
        job_input_hash,
        job_output
      })
      .select()
      .single()

    if (insertError) {
      return res.status(400).json({ error: insertError.message })
    }

    res.status(201).json({ success: true, access_record: accessRecord })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}