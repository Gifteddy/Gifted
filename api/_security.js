// Shared security helpers for API handlers

const rateLimitStore = new Map()

export function getCorsOrigin(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
  const origin = req.headers.origin || ''
  if (allowed.length === 0) return origin || '*'
  return allowed.includes(origin) ? origin : allowed[0]
}

export function setCorsHeaders(req, res) {
  const origin = getCorsOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export function handleCors(req, res) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  return null
}

export function rateLimit({ key, windowMs = 60000, max = 10 } = {}) {
  const now = Date.now()
  const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + windowMs
  }
  entry.count++
  rateLimitStore.set(key, entry)
  return entry.count > max
}

export function checkRateLimit(req, res, { windowMs = 60000, max = 10 } = {}) {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const key = `rl:${req.url}:${ip}`
  if (rateLimit({ key, windowMs, max })) {
    res.setHeader('Retry-After', Math.ceil(windowMs / 1000))
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }
  return null
}

export function validateUuid(value, name) {
  if (!value || typeof value !== 'string') return `Missing ${name}`
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return `Invalid ${name} format`
  return null
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Missing email'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
  return null
}

export function validateAction(action) {
  const allowed = ['approve', 'reject']
  if (!action || !allowed.includes(action)) return `Invalid action. Must be: ${allowed.join(', ')}`
  return null
}

export function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars[array[i] % chars.length]
  }
  // Ensure at least one of each type
  return password.slice(0, -3) + 'A1!'
}
