// api/auth/login.js
import bcrypt from 'bcryptjs'
import { query } from '../_lib/db.js'
import { signToken } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { identifier, password } = parseBody(req)

  if (!identifier?.trim() || !password) {
    return res.status(422).json({ error: 'Login identifier and password are required' })
  }

  try {
    const id = identifier.trim()

    // Detect login method: email, phone, or NYSC state code
    let whereClause
    let lookupValue = id

    if (id.includes('@')) {
      whereClause = 'LOWER(email) = LOWER($1)'
    } else if (/^[+]?[\d\s\-()]{7,20}$/.test(id)) {
      whereClause = 'phone = $1'
    } else {
      // NYSC state code e.g. LA/25C/1234
      whereClause = 'UPPER(nysc_state_code) = UPPER($1)'
    }

    const result = await query(
      `SELECT u.*, p.avatar_url, p.bio
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.${whereClause} AND u.is_active = TRUE
       LIMIT 1`,
      [lookupValue]
    )

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    // Check camp transition (auto-update stage based on camp end date)
    if (user.current_stage === 'camp') {
      const campCheck = await query(
        `SELECT c.camp_end_date 
         FROM user_camps uc
         JOIN camps c ON c.id = uc.camp_id
         WHERE uc.user_id = $1 AND uc.stage = 'active'
         ORDER BY uc.created_at DESC LIMIT 1`,
        [user.id]
      )
      if (campCheck.rows.length) {
        const endDate = campCheck.rows[0].camp_end_date
        if (endDate && new Date(endDate) < new Date()) {
          await query(
            `UPDATE users SET current_stage = 'ppa' WHERE id = $1`,
            [user.id]
          )
          await query(
            `UPDATE user_camps SET stage = 'completed' WHERE user_id = $1 AND stage = 'active'`,
            [user.id]
          )
          user.current_stage = 'ppa'
        }
      }
    }

    const token = signToken({
      id:    user.id,
      email: user.email,
      phone: user.phone,
      role:  user.role,
      stage: user.current_stage,
      state: user.serving_state_id
    })

    return res.status(200).json({
      token,
      user: {
        id:          user.id,
        first_name:  user.first_name,
        last_name:   user.last_name,
        email:       user.email,
        phone:       user.phone,
        nysc_code:   user.nysc_state_code,
        avatar_url:  user.avatar_url,
        bio:         user.bio,
        role:        user.role,
        stage:       user.current_stage,
        state_id:    user.serving_state_id,
        batch_id:    user.batch_id,
        last_login:  user.last_login
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})
