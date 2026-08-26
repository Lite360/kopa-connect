// api/auth/forgot-password.js
import { query } from '../_lib/db.js'
import { withCors, parseBody } from '../_lib/cors.js'
import crypto from 'crypto'

export default withCors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { identifier } = parseBody(req)
  if (!identifier?.trim()) {
    return res.status(422).json({ error: 'Email or phone is required' })
  }

  try {
    const id = identifier.trim()
    const whereClause = id.includes('@') ? 'LOWER(email) = LOWER($1)' : 'phone = $1'

    const result = await query(
      `SELECT id, email, phone, first_name FROM users WHERE ${whereClause} AND is_active = TRUE LIMIT 1`,
      [id]
    )

    // Always return success to prevent user enumeration
    if (!result.rows.length) {
      return res.status(200).json({ 
        message: 'If an account exists, you will receive reset instructions.' 
      })
    }

    const user = result.rows[0]
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 3600000) // 1 hour

    // In production, store the reset token in DB and send email/SMS
    // For MVP, we log the token (replace with actual email sending)
    console.log(`Password reset token for ${user.email || user.phone}: ${resetToken}`)
    
    // TODO: Send email via SMTP or SMS via provider
    // await sendResetEmail(user.email, resetToken)

    return res.status(200).json({ 
      message: 'If an account exists, you will receive reset instructions.' 
    })
  } catch (err) {
    console.error('Forgot password error:', err)
    return res.status(500).json({ error: 'Failed to process request' })
  }
})
