import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { jobId } = req.query

    const response = await fetch(`http://backend.0rca.live/status/${jobId}`)
    const result = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(result)
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Status API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}