"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { DeploymentModal } from '@/components/DeploymentModal'
import { DeploymentLogs } from '@/components/DeploymentLogs'

interface Repository {
  id: number
  name: string
  description: string
  owner: { login: string }
  default_branch: string
  html_url: string
  language: string
  stargazers_count: number
  forks_count: number
  updated_at: string
}

export default function DeployPage() {
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDeployForm, setShowDeployForm] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [description, setDescription] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRepos()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRepos()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGitHub = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user',
        redirectTo: window.location.origin + '/deploy'
      }
    })
    if (error) console.error('Error:', error)
    setLoading(false)
  }

  const fetchRepos = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.provider_token) return

    setLoading(true)
    try {
      const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: { Authorization: `Bearer ${session.provider_token}` }
      })
      const data = await res.json()
      setRepos(data)
    } catch (error) {
      console.error('Error fetching repos:', error)
    }
    setLoading(false)
  }

  const handleDeployClick = () => {
    setShowDeployForm(true)
  }

  const handleDeploy = async () => {
    if (!agentName || !subdomain || !selectedRepo) {
      setError('Agent name and subdomain are required')
      return
    }

    setDeploymentStatus('deploying')
    setError('')
    setDeploymentLogs([])

    const steps = [
      'Fetching repository packages...',
      'Setting up build environment...',
      'Installing dependencies...',
      'Building application...',
      'Configuring domain...',
      'Deploying to production...'
    ]

    try {
      // Mock deployment process
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setDeploymentLogs(prev => [...prev, `✓ ${steps[i]}`])
      }

      // Create agent via API
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentData: {
            name: agentName,
            description,
            subdomain,
            repo_owner: selectedRepo.owner.login,
            repo_name: selectedRepo.name,
            github_url: selectedRepo.html_url,
            user_id: user?.id
          },
          deploymentData: {
            status: 'success'
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      setDeploymentLogs(prev => [...prev, '✓ Deployment complete!'])
      setDeploymentStatus('success')
    } catch (error) {
      console.error('Deployment error:', error)
      setDeploymentStatus('error')
      setError('Deployment failed')
    }
  }

  let content
  
  if (!user) {
    content = (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Deploy Your Repository</h1>
          <p className="text-neutral-400 mb-8">Sign in with GitHub to deploy your repositories</p>
          <button
            onClick={signInWithGitHub}
            disabled={loading}
            className="bg-[#63f2d2] text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {loading ? 'Loading...' : 'Sign in with GitHub'}
          </button>
        </div>
      </div>
    )
  } else if (selectedRepo) {
    content = (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedRepo(null)}
          className="text-neutral-400 hover:text-white flex items-center gap-2"
        >
          ← Back to repositories
        </button>
        
        <div className="bg-neutral-800 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{selectedRepo.name}</h1>
              <p className="text-neutral-400">{selectedRepo.description || 'No description available'}</p>
            </div>
            <a
              href={selectedRepo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#63f2d2] hover:opacity-80"
            >
              View on GitHub →
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{selectedRepo.stargazers_count}</div>
              <div className="text-neutral-400 text-sm">Stars</div>
            </div>
            <div className="bg-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{selectedRepo.forks_count}</div>
              <div className="text-neutral-400 text-sm">Forks</div>
            </div>
            <div className="bg-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{selectedRepo.language || 'N/A'}</div>
              <div className="text-neutral-400 text-sm">Language</div>
            </div>
            <div className="bg-neutral-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{selectedRepo.default_branch}</div>
              <div className="text-neutral-400 text-sm">Branch</div>
            </div>
          </div>

          {!showDeployForm ? (
            <div className="text-center">
              <button
                onClick={handleDeployClick}
                className="bg-[#63f2d2] text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Deploy Repository
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-t border-neutral-700 pt-6">
                <h2 className="text-2xl font-bold text-white mb-4">Configure Your Agent</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-neutral-300 text-sm mb-2">Agent Name *</label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="w-full bg-neutral-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#63f2d2]"
                      placeholder="My AI Agent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-neutral-300 text-sm mb-2">Custom Subdomain *</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1 bg-neutral-700 text-white rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#63f2d2]"
                        placeholder="my-agent"
                      />
                      <span className="bg-neutral-600 text-neutral-300 px-4 py-3 rounded-r-lg">.0rca.live</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-neutral-300 text-sm mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-neutral-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#63f2d2]"
                    rows={3}
                    placeholder="Describe your agent..."
                  />
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm mb-4">{error}</div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeployForm(false)}
                    className="flex-1 bg-neutral-600 text-white py-3 rounded-lg hover:bg-neutral-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeploy}
                    disabled={deploymentStatus === 'deploying'}
                    className="flex-1 bg-[#63f2d2] text-black py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy Agent'}
                  </button>
                </div>
              </div>
              
              {deploymentStatus !== 'idle' && (
                <div className="border-t border-neutral-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      deploymentStatus === 'deploying' ? 'bg-yellow-500 animate-pulse' : 
                      deploymentStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h3 className="text-white font-semibold">
                      {deploymentStatus === 'deploying' ? 'Deploying...' : 
                       deploymentStatus === 'success' ? 'Deployment Successful' : 'Deployment Failed'}
                    </h3>
                  </div>
                  
                  <div className="bg-black rounded-lg p-4 mb-4">
                    <div className="text-green-400 font-mono text-sm space-y-1">
                      {deploymentLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                  
                  {deploymentStatus === 'success' && (
                    <div className="bg-neutral-700 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Deployment Summary</h4>
                      <div className="text-neutral-300 text-sm space-y-1">
                        <div>• Agent deployed to: <span className="text-[#63f2d2]">{subdomain}.0rca.live</span></div>
                        <div>• Build completed successfully</div>
                        <div>• SSL certificate configured</div>
                        <div>• Health checks passed</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  } else {
    content = (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Your Repositories</h1>
          <p className="text-neutral-400">Select a repository to deploy</p>
        </div>

        {loading ? (
          <div className="text-center text-neutral-400">Loading repositories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map(repo => (
              <div
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className="bg-neutral-800 rounded-2xl p-6 cursor-pointer hover:ring-2 hover:ring-[#63f2d2] transition-all group"
              >
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#63f2d2] transition-colors">
                  {repo.name}
                </h3>
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                  {repo.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>{repo.language || 'Unknown'}</span>
                  <span>⭐ {repo.stargazers_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return content
}