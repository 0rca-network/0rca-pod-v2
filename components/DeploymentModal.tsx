"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Repository {
  id: number
  name: string
  description: string
  owner: { login: string }
  default_branch: string
}

interface DeploymentModalProps {
  repo: Repository
  onClose: () => void
  onDeploy: (agentData: any) => void
}

export function DeploymentModal({ repo, onClose, onDeploy }: DeploymentModalProps) {
  const [agentName, setAgentName] = useState('')
  const [description, setDescription] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDeploy = async () => {
    if (!agentName || !subdomain) {
      setError('Agent name and subdomain are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if user already deployed this repo
      const { data: existingAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('repo_owner', repo.owner.login)
        .eq('repo_name', repo.name)
        .single()

      if (existingAgent) {
        setError('You have already deployed this repository')
        setLoading(false)
        return
      }

      // Check if subdomain is available
      const { data: existingSubdomain } = await supabase
        .from('agents')
        .select('id')
        .eq('subdomain', subdomain)
        .single()

      if (existingSubdomain) {
        setError('Subdomain is already taken')
        setLoading(false)
        return
      }

      const agentData = {
        name: agentName,
        description,
        subdomain,
        repo_owner: repo.owner.login,
        repo_name: repo.name,
        github_url: `https://github.com/${repo.owner.login}/${repo.name}`
      }

      onDeploy(agentData)
      onClose()
    } catch (err) {
      setError('Failed to deploy agent')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">Deploy Agent</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-neutral-300 text-sm mb-1">Repository</label>
            <div className="text-white font-medium">{repo.owner.login}/{repo.name}</div>
          </div>

          <div>
            <label className="block text-neutral-300 text-sm mb-1">Agent Name *</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full bg-neutral-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My AI Agent"
            />
          </div>

          <div>
            <label className="block text-neutral-300 text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe your agent..."
            />
          </div>

          <div>
            <label className="block text-neutral-300 text-sm mb-1">Custom Subdomain *</label>
            <div className="flex items-center">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 bg-neutral-700 text-white rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="my-agent"
              />
              <span className="bg-neutral-600 text-neutral-300 px-3 py-2 rounded-r">.0rca.live</span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-neutral-600 text-white py-2 rounded hover:bg-neutral-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}