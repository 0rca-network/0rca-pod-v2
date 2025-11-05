import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { owner, repo, token } = req.query

    if (!token) {
      return res.status(401).json({ error: 'GitHub token required' })
    }

    const response = await fetch(`https://api.github.com/users/${owner}/packages?package_type=container`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': '0rca-pod-marketplace'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch packages' })
    }

    const packages = await response.json()
    
    // Filter packages by repository if specified
    const filteredPackages = repo 
      ? packages.filter((pkg: any) => pkg.repository?.name === repo)
      : packages

    // Format packages for deployment
    const formattedPackages = filteredPackages.map((pkg: any) => ({
      name: pkg.name,
      image: `ghcr.io/${owner}/${pkg.name}:latest`,
      repository: pkg.repository?.name,
      visibility: pkg.visibility,
      created_at: pkg.created_at,
      updated_at: pkg.updated_at
    }))

    res.status(200).json(formattedPackages)
  } catch (error) {
    console.error('Packages API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}