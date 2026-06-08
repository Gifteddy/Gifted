export default async function handler(req, res) {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary environment variables not configured on server' })
  }

  const path = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug || ''

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'slug') {
      params.append(key, String(value))
    }
  }
  const qs = params.toString()

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${path}${qs ? '?' + qs : ''}`

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')

  try {
    const options = {
      method: req.method,
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(req.body)
    }

    const response = await fetch(url, options)
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
