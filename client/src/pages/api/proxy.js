export default async function handler(req, res) {
  try {
    // Validasi method
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Forward headers yang diperlukan
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    // Jika ada auth token
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization
    }

    const response = await fetch('https://extensions.aitopia.ai/ai/prompts', {
      method: req.method,
      headers
    })

    if (!response.ok) {
      throw new Error(`External API responded with ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}