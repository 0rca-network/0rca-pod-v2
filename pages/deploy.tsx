"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { DeploymentModal } from '@/components/DeploymentModal'
import { DeploymentLogs } from '@/components/DeploymentLogs'
import { WalletProvider, useWallet } from "@txnlab/use-wallet-react";
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { AgentsContractClient } from '@/contracts/AgentContracts'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

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
  const { activeAddress, transactionSigner } = useWallet()
  const algorand = AlgorandClient.testNet()
  const DEFAULT_APP_ID = 749223216
  
  const [mounted, setMounted] = useState(false)
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
  const [packages, setPackages] = useState<any[]>([])
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [needsReauth, setNeedsReauth] = useState(false)
  const [reposFetched, setReposFetched] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user && !reposFetched) {
        fetchRepos()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user && !reposFetched) {
        fetchRepos()
      }
    })

    return () => subscription.unsubscribe()
  }, [reposFetched])

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
    if (reposFetched) return
    
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session:', session?.user?.email, 'Token exists:', !!session?.provider_token)
    
    if (!session?.provider_token) {
      console.log('No provider token found - clearing session')
      await supabase.auth.signOut()
      setUser(null)
      setRepos([])
      setNeedsReauth(true)
      setReposFetched(false)
      return
    }
    
    setNeedsReauth(false)

    setLoading(true)
    try {
      const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: { Authorization: `Bearer ${session.provider_token}` }
      })
      const data = await res.json()
      console.log('Repos fetched:', data.length, 'repos')
      setRepos(data)
      setReposFetched(true)
    } catch (error) {
      console.error('Error fetching repos:', error)
    }
    setLoading(false)
  }

  const handleDeployClick = () => {
    setShowDeployForm(true)
  }

  const createAgentOnChain = async () => {
    if (!mounted || !activeAddress) {
      setDeploymentLogs(prev => [...prev, '❌ Wallet not connected'])
      throw new Error('Wallet not connected')
    }

    try {
      setDeploymentLogs(prev => [...prev, '🔗 Creating agent on Algorand blockchain...'])
      
      const appClient = new AgentsContractClient({
        appId: BigInt(DEFAULT_APP_ID),
        defaultSender: activeAddress,
        defaultSigner: transactionSigner,
        algorand,
      })

      await appClient.send.createAgent({
        args: {
          agentName: agentName,
          agentIpfs: `https://${subdomain}.0rca.live`,
          pricing: 1000000, // 1 ALGO in microAlgos
          agentImage: selectedPackage
        },
        sender: activeAddress,
        signer: transactionSigner,
        staticFee: AlgoAmount.Algo(0.02)
      })

      setDeploymentLogs(prev => [...prev, '✅ Agent created on blockchain successfully!'])
    } catch (error) {
      console.error('Blockchain agent creation error:', error)
      setDeploymentLogs(prev => [...prev, `❌ Blockchain creation failed: ${error}`])
      throw error
    }
  }

  const handleDeploy = async () => {
    if (!agentName || !subdomain || !selectedRepo || !selectedPackage) {
      setError('Agent name, subdomain, and Docker image are required')
      return
    }

    setDeploymentStatus('deploying')
    setError('')
    setDeploymentLogs(['🚀 Starting deployment...'])

    try {
      // Create agent on blockchain first - only proceed if successful
      await createAgentOnChain()
      const deployPayload = {
        image_name: selectedPackage,
        app_name: subdomain,
        port: 8000
      }
      
      console.log('Sending deploy payload:', deployPayload)
      
      // Deploy via API
      const deployResponse = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deployPayload)
      })

      const deployResult = await deployResponse.json()
      if (!deployResponse.ok) {
        console.error('Deploy error:', deployResult)
        throw new Error(deployResult.error || 'Deployment failed')
      }

      setJobId(deployResult.job_id)
      setDeploymentLogs(prev => [...prev, `✓ Deployment started: ${deployResult.job_id}`])

      // Poll deployment status
      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`/api/status/${deployResult.job_id}`)
          const status = await statusResponse.json()
          
          setDeploymentLogs(prev => [...prev, `📊 Status: ${status.status} - ${status.message}`])
          
          if (status.status === 'completed') {
            // Create agent record
            const { data: { session } } = await supabase.auth.getSession()
            const agentResponse = await fetch('/api/agents', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({
                agentData: {
                  name: agentName,
                  description,
                  subdomain,
                  repo_owner: selectedRepo.owner.login,
                  repo_name: selectedRepo.name,
                  github_url: selectedRepo.html_url
                },
                deploymentData: {
                  status: 'success',
                  job_id: deployResult.job_id
                }
              })
            })

            if (agentResponse.ok) {
              setDeploymentLogs(prev => [...prev, '✅ Agent deployed successfully!'])
              setDeploymentStatus('success')
            }
          } else if (status.status === 'failed') {
            setDeploymentStatus('error')
            setError('Deployment failed')
          } else {
            setTimeout(pollStatus, 3000)
          }
        } catch (error) {
          console.error('Status check error:', error)
        }
      }

      setTimeout(pollStatus, 2000)
    } catch (error) {
      console.error('Deployment error:', error)
      setDeploymentStatus('error')
      setError('Deployment failed')
    }
  }

  let content
  
  if (!user || needsReauth) {
    content = (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Deploy Your Repository</h1>
          <p className="text-neutral-400 mb-8">
            {needsReauth 
              ? 'Your GitHub session has expired. Please sign in again to access your repositories.' 
              : 'Sign in with GitHub to deploy your repositories'
            }
          </p>
          <button
            onClick={signInWithGitHub}
            disabled={loading}
            className="bg-[#63f2d2] text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {loading ? 'Loading...' : needsReauth ? 'Sign in Again' : 'Sign in with GitHub'}
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

                <div className="mb-6">
                  <label className="block text-neutral-300 text-sm mb-2">Docker Image *</label>
                  <input
                    type="text"
                    value={selectedPackage || ''}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full bg-neutral-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#63f2d2]"
                    placeholder="ghcr.io/nickthelegend/hello-server:latest"
                  />
                  <p className="text-neutral-400 text-xs mt-1">Enter the full Docker image path from GitHub Container Registry</p>
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm mb-4">{error}</div>
                )}
                
                {mounted && !activeAddress && (
                  <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-4">
                    <div className="text-yellow-400 font-semibold mb-2">⚠️ Wallet Required</div>
                    <div className="text-yellow-300 text-sm">
                      Connect your Algorand wallet to create agents on the blockchain
                    </div>
                  </div>
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
                    disabled={deploymentStatus === 'deploying' || (!mounted || !activeAddress)}
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
                      <h4 className="text-white font-semibold mb-2">🎉 Deployment Complete!</h4>
                      <div className="text-neutral-300 text-sm space-y-2 mb-4">
                        <div>• Agent deployed successfully</div>
                        <div>• SSL certificate configured</div>
                        <div>• Health checks passed</div>
                      </div>
                      <div className="bg-green-900 border border-green-600 rounded-lg p-4">
                        <div className="text-green-400 font-semibold mb-2">🚀 Your agent is now live!</div>
                        <a 
                          href={`https://${subdomain}.0rca.live`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#63f2d2] hover:text-white font-medium text-lg underline"
                        >
                          {subdomain}.0rca.live
                        </a>
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
        ) : repos.length === 0 ? (
          <div className="text-center text-neutral-400">
            <p>No repositories found.</p>
            <p className="text-sm mt-2">Make sure you're signed in with GitHub and have repositories.</p>
            <button 
              onClick={fetchRepos}
              className="mt-4 bg-neutral-700 text-white px-4 py-2 rounded hover:bg-neutral-600"
            >
              Retry
            </button>
          </div>
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