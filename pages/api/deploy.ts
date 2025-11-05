import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image_name, app_name, port = 8000 } = req.body

    if (!image_name || !app_name) {
      return res.status(400).json({ error: 'Missing required fields: image_name and app_name are required' })
    }
    
    const deployPayload = {
      "image_name": image_name,
      "app_name": app_name,
      "port": port,
      "registry_auth": "ghcr-secret"
    }

    console.log('Deploy payload:', deployPayload)

    const response = await fetch('http://backend.0rca.live/deploy', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': '0rca-pod-marketplace'
      },
      body: JSON.stringify(deployPayload)
    })

    const result = await response.json()
    console.log('Backend response:', response.status, result)
    
    if (!response.ok) {
      console.error('Backend error:', result)
      return res.status(response.status).json(result)
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Deploy API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}