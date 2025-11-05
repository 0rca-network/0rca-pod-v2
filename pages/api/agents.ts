import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { agentData, deploymentData } = req.body

    // Create agent record
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert(agentData)
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