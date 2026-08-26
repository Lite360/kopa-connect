// api/_lib/cors.js
// CORS + common response helpers for Vercel serverless functions

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://kopaconnect.vercel.app',
  process.env.VITE_APP_URL
].filter(Boolean)

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

/**
 * Wraps a handler with CORS + OPTIONS preflight support.
 * Usage: export default withCors(async (req, res) => { ... })
 */
export function withCors(handler) {
  return async (req, res) => {
    setCorsHeaders(req, res)
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    try {
      return await handler(req, res)
    } catch (err) {
      console.error('Unhandled API error:', err)
      return res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
      })
    }
  }
}

/**
 * Validate and parse JSON body
 */
export function parseBody(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body || {}
}

/**
 * Paginate helper
 */
export function getPagination(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1)
  const limit = Math.min(50, parseInt(query.limit) || 20)
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

/**
 * Build paginated response
 */
export function paginatedResponse(rows, total, page, limit) {
  return {
    data:       rows,
    pagination: {
      total:    total,
      page:     page,
      limit:    limit,
      pages:    Math.ceil(total / limit),
      hasMore:  page * limit < total
    }
  }
}
