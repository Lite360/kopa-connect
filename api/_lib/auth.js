// api/_lib/auth.js
// JWT middleware for Vercel serverless functions
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kopa-connect-dev-secret-change-in-production'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

/**
 * Verifies the JWT from the Authorization header.
 * Returns the decoded payload or throws with a 401 status.
 */
export function verifyToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('No authorization token provided')
    err.status = 401
    throw err
  }
  const token = authHeader.slice(7)
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    const err = new Error('Invalid or expired token')
    err.status = 401
    throw err
  }
}

/**
 * Higher-order function: wraps a handler with auth check.
 * Usage: export default withAuth(async (req, res, user) => { ... })
 */
export function withAuth(handler) {
  return async (req, res) => {
    try {
      const user = verifyToken(req)
      return handler(req, res, user)
    } catch (err) {
      return res.status(err.status || 401).json({ error: err.message })
    }
  }
}

/**
 * Require super admin role.
 */
export function withSuperAdmin(handler) {
  return async (req, res) => {
    try {
      const user = verifyToken(req)
      if (user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Super admin access required' })
      }
      return handler(req, res, user)
    } catch (err) {
      return res.status(err.status || 401).json({ error: err.message })
    }
  }
}

/**
 * Require state admin or super admin role.
 */
export function withAdmin(handler) {
  return async (req, res) => {
    try {
      const user = verifyToken(req)
      if (!['state_admin', 'super_admin'].includes(user.role)) {
        return res.status(403).json({ error: 'Admin access required' })
      }
      return handler(req, res, user)
    } catch (err) {
      return res.status(err.status || 401).json({ error: err.message })
    }
  }
}
