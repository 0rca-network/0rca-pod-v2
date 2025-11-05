import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { agentData, deploymentData } = req.body
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Remove user_id from agentData as it will be set by RLS
    const { user_id, ...cleanAgentData } = agentData

    // Create agent record
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert(cleanAgentData)
      .select()
      .single()

    if (agentError) {
      return res.status(400).json({ error: agentError.message })
    }

    // Create deployment record
    const { error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        agent_id: agent.id,
        ...deploymentData
      })

    if (deploymentError) {
      return res.status(400).json({ error: deploymentError.message })
    }

    res.status(201).json({ agent, success: true })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}