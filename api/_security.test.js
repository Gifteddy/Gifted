import { describe, it, expect, afterEach } from 'vitest'
import {
  getCorsOrigin,
  handleCors,
  rateLimit,
  checkRateLimit,
  validateUuid,
  validateEmail,
  validateAction,
  generateSecurePassword,
} from './_security.js'

function mockReq(overrides = {}) {
  return {
    headers: { origin: 'https://giftedcreates.com', ...overrides.headers },
    method: 'POST',
    url: '/api/test',
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  }
}

function mockRes() {
  const res = {
    _headers: {},
    _status: 200,
    setHeader(k, v) { res._headers[k] = v },
    status(s) { res._status = s; return res },
    end() { return res },
  }
  return res
}

describe('getCorsOrigin', () => {
  const origEnv = process.env.ALLOWED_ORIGINS

  afterEach(() => {
    if (origEnv === undefined) delete process.env.ALLOWED_ORIGINS
    else process.env.ALLOWED_ORIGINS = origEnv
  })

  it('returns origin when no ALLOWED_ORIGINS set', () => {
    delete process.env.ALLOWED_ORIGINS
    const req = mockReq({ headers: { origin: 'https://example.com' } })
    expect(getCorsOrigin(req)).toBe('https://example.com')
  })

  it('returns matching origin when in ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = 'https://giftedcreates.com,https://gifted.ng'
    const req = mockReq({ headers: { origin: 'https://gifted.ng' } })
    expect(getCorsOrigin(req)).toBe('https://gifted.ng')
  })

  it('returns first allowed origin when origin not in list', () => {
    process.env.ALLOWED_ORIGINS = 'https://giftedcreates.com,https://gifted.ng'
    const req = mockReq({ headers: { origin: 'https://evil.com' } })
    expect(getCorsOrigin(req)).toBe('https://giftedcreates.com')
  })
})

describe('handleCors', () => {
  const origEnv = process.env.ALLOWED_ORIGINS

  afterEach(() => {
    if (origEnv === undefined) delete process.env.ALLOWED_ORIGINS
    else process.env.ALLOWED_ORIGINS = origEnv
  })

  it('sets CORS headers and returns null for non-OPTIONS', () => {
    delete process.env.ALLOWED_ORIGINS
    const req = mockReq({ method: 'POST' })
    const res = mockRes()
    const result = handleCors(req, res)
    expect(result).toBeNull()
    expect(res._headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS')
  })

  it('returns res for OPTIONS request', () => {
    delete process.env.ALLOWED_ORIGINS
    const req = mockReq({ method: 'OPTIONS' })
    const res = mockRes()
    const result = handleCors(req, res)
    expect(result).toBe(res)
  })
})

describe('rateLimit', () => {
  it('returns false under limit', () => {
    const result = rateLimit({ key: `test-rl-${Date.now()}`, windowMs: 60000, max: 5 })
    expect(result).toBe(false)
  })

  it('returns true over limit', () => {
    const key = `test-rl-over-${Date.now()}`
    for (let i = 0; i < 5; i++) rateLimit({ key, windowMs: 60000, max: 5 })
    const result = rateLimit({ key, windowMs: 60000, max: 5 })
    expect(result).toBe(true)
  })
})

describe('checkRateLimit', () => {
  it('returns null when under limit', () => {
    const req = mockReq()
    const res = mockRes()
    const result = checkRateLimit(req, res, { windowMs: 60000, max: 10 })
    expect(result).toBeNull()
  })
})

describe('validateUuid', () => {
  it('returns null for valid UUID', () => {
    expect(validateUuid('550e8400-e29b-41d4-a716-446655440000', 'id')).toBeNull()
  })

  it('returns error for missing value', () => {
    expect(validateUuid(null, 'id')).toBe('Missing id')
  })

  it('returns error for invalid format', () => {
    expect(validateUuid('not-a-uuid', 'id')).toBe('Invalid id format')
  })
})

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull()
  })

  it('returns error for invalid email', () => {
    expect(validateEmail('not-an-email')).toBe('Invalid email format')
  })

  it('returns error for missing email', () => {
    expect(validateEmail('')).toBe('Missing email')
  })
})

describe('validateAction', () => {
  it('returns null for valid actions', () => {
    expect(validateAction('approve')).toBeNull()
    expect(validateAction('reject')).toBeNull()
    expect(validateAction('suspend')).toBeNull()
    expect(validateAction('ban')).toBeNull()
  })

  it('returns error for invalid action', () => {
    expect(validateAction('delete')).toContain('Invalid action')
  })

  it('returns error for missing action', () => {
    expect(validateAction('')).toContain('Invalid action')
  })
})

describe('generateSecurePassword', () => {
  it('generates a 16-char password', () => {
    const pw = generateSecurePassword()
    expect(pw).toHaveLength(16)
  })

  it('always ends with A1!', () => {
    const pw = generateSecurePassword()
    expect(pw.endsWith('A1!')).toBe(true)
  })

  it('generates different passwords each call', () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generateSecurePassword()))
    expect(passwords.size).toBeGreaterThan(1)
  })
})
