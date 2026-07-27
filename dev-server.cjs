const http = require('http')

const PORT = process.env.DEV_API_PORT || 3001

async function handleRequest(req, res) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin || ''
  const corsOrigin = allowedOrigins.length > 0 ? (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]) : origin || '*'
  res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') return res.end()

  res.statusCode = 404
  return res.end(JSON.stringify({ error: 'Not found' }))
}

const server = http.createServer(handleRequest)
server.listen(PORT, () => {
  console.log(`\n  Dev API server running at http://localhost:${PORT}`)
})
