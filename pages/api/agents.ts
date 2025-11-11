import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function generateAgentToken(): string {
  return createHash('sha256').update(Math.random().toString()).digest('hex')
}

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
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify JWT token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('Auth error:', userError)
      return res.status(401).json({ error: 'User not authenticated' })
    }

    console.log('Authenticated user:', user.id)
    // Add user_id and agent_token to agentData
    const cleanAgentData = { ...agentData, user_id: user.id, agent_token: generateAgentToken() }

    // Check if agent already exists for this repo
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('repo_owner', cleanAgentData.repo_owner)
      .eq('repo_name', cleanAgentData.repo_name)
      .single()

    let agent
    if (existingAgent) {
      // Update existing agent
      const { data: updatedAgent, error: updateError } = await supabase
        .from('agents')
        .update(cleanAgentData)
        .eq('id', existingAgent.id)
        .select()
        .single()
      
      if (updateError) {
        return res.status(400).json({ error: updateError.message })
      }
      agent = updatedAgent
    } else {
      // Create new agent
      const { data: newAgent, error: insertError } = await supabase
        .from('agents')
        .insert(cleanAgentData)
        .select()
        .single()
      
      if (insertError) {
        return res.status(400).json({ error: insertError.message })
      }
      agent = newAgent
    }

    // Create deployment record
    const { error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        agent_id: agent.id,
        job_id: deploymentData.job_id,
        status: deploymentData.status || 'pending'
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