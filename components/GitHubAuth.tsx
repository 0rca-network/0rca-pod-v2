"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface Repository {
  id: number
  name: string
  description: string
  owner: { login: string }
  default_branch: string
}

export function GitHubAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [showRepos, setShowRepos] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGitHub = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user',
        redirectTo: window.location.origin
      }
    })
    if (error) console.error('Error:', error)
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setRepos([])
    setShowRepos(false)
  }

  const fetchRepos = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.provider_token) return

    setLoading(true)
    try {
      const res = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: { Authorization: `Bearer ${session.provider_token}` }
      })
      const data = await res.json()
      setRepos(data)
      setShowRepos(true)
    } catch (error) {
      console.error('Error fetching repos:', error)
    }
    setLoading(false)
  }

  const deployRepo = async (repo: Repository) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.provider_token) return

    try {
      // This would call your Supabase Edge Function
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_owner: repo.owner.login,
          repo_name: repo.name,
          branch: repo.default_branch,
          access_token: session.provider_token
        })
      })
      const result = await res.json()
      console.log('Deployment result:', result)
    } catch (error) {
      console.error('Deployment error:', error)
    }
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGitHub}
        disabled={loading}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        {loading ? 'Loading...' : 'GitHub Login'}
      </button>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={fetchRepos}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          My Repos
        </button>
        <button
          onClick={signOut}
          className="text-neutral-400 hover:text-white text-sm"
        >
          Sign Out
        </button>
      </div>

      {showRepos && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 max-h-96 overflow-y-auto z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">Select Repository</h3>
              <button
                onClick={() => setShowRepos(false)}
                className="text-neutral-400 hover:text-white"
              >
                ×
              </button>
            </div>
            {loading ? (
              <div className="text-neutral-400">Loading repositories...</div>
            ) : (
              <div className="space-y-2">
                {repos.map(repo => (
                  <div
                    key={repo.id}
                    onClick={() => deployRepo(repo)}
                    className="p-3 bg-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors"
                  >
                    <h4 className="text-white font-medium">{repo.name}</h4>
                    <p className="text-neutral-400 text-sm">{repo.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}