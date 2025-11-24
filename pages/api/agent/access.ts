import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (req.method === 'PUT') {
    const { job_id, job_output } = req.body
    
    if (!job_id) {
      return res.status(400).json({ error: 'Missing job_id' })
    }

    const { error } = await supabase
      .from('access_tokens')
      .update({ job_output })
      .eq('job_id', job_id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { wallet_address, job_id, agent_id, access_token, job_input_hash, job_output } = req.body

    if (!wallet_address || !job_id || !agent_id || !access_token) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Look up user_id from wallet address (optional)
    let user_id = null
    const { data: existingToken } = await supabase
      .from('access_tokens')
      .select('user_id')
      .eq('wallet_address', wallet_address)
      .not('user_id', 'is', null)
      .limit(1)
      .single()
    
    if (existingToken?.user_id) {
      user_id = existingToken.user_id
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