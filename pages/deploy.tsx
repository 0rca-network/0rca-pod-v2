"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

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

  const handleDeploy = async () => {
    if (!selectedRepo) return
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.provider_token) return

    try {
      // This will be your deployment logic
      console.log('Deploying repo:', selectedRepo)
      alert(`Deploying ${selectedRepo.name}...`)
    } catch (error) {
      console.error('Deployment error:', error)
    }
  }

  if (!user) {
    return (
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
  }

  if (selectedRepo) {
    return (
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

          <div className="text-center">
            <button
              onClick={handleDeploy}
              className="bg-[#63f2d2] text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Deploy Repository
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
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