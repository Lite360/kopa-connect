// api/auth/register.js
import bcrypt from 'bcryptjs'
import { query, transaction } from '../_lib/db.js'
import { signToken } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = parseBody(req)
  const {
    first_name, last_name, email, phone,
    nysc_state_code, serving_state_id, batch_id,
    lga, camp_id, ppa_name,
    password, confirm_password
  } = body

  // Validation
  const errors = {}
  if (!first_name?.trim()) errors.first_name = 'First name is required'
  if (!last_name?.trim())  errors.last_name  = 'Last name is required'
  if (!email?.trim() && !phone?.trim()) errors.email = 'Email or phone is required'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address'
  if (phone && !/^[+]?[\d\s\-()]{7,20}$/.test(phone)) errors.phone = 'Invalid phone number'
  if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (password !== confirm_password) errors.confirm_password = 'Passwords do not match'
  if (Object.keys(errors).length) return res.status(422).json({ errors })

  try {
    // Check uniqueness
    if (email) {
      const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
      if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' })
    }
    if (phone) {
      const existing = await query('SELECT id FROM users WHERE phone = $1', [phone])
      if (existing.rows.length) return res.status(409).json({ error: 'Phone number already registered' })
    }
    if (nysc_state_code) {
      const existing = await query('SELECT id FROM users WHERE nysc_state_code = $1', [nysc_state_code.toUpperCase()])
      if (existing.rows.length) return res.status(409).json({ error: 'NYSC state code already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL

    const result = await transaction(async (client) => {
      // Create user
      const userResult = await client.query(
        `INSERT INTO users 
           (first_name, last_name, email, phone, nysc_state_code, password_hash,
            serving_state_id, batch_id, current_stage, role)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'before_nysc',$9)
         RETURNING id, first_name, last_name, email, phone, nysc_state_code, serving_state_id, batch_id, current_stage, role, created_at`,
        [
          first_name.trim(),
          last_name.trim(),
          email?.toLowerCase() || null,
          phone || null,
          nysc_state_code?.toUpperCase() || null,
          password_hash,
          serving_state_id || null,
          batch_id || null,
          email?.toLowerCase() === superAdminEmail ? 'super_admin' : 'user'
        ]
      )
      const user = userResult.rows[0]

      // Create profile
      await client.query(
        `INSERT INTO profiles (user_id, lga, ppa_name) VALUES ($1, $2, $3)`,
        [user.id, lga || null, ppa_name || null]
      )

      // Assign to camp if provided
      if (camp_id) {
        await client.query(
          `INSERT INTO user_camps (user_id, camp_id, batch_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [user.id, camp_id, batch_id || null]
        )
        await client.query(
          `UPDATE users SET current_stage = 'camp' WHERE id = $1`,
          [user.id]
        )
        user.current_stage = 'camp'
      }

      // If super admin email matches
      if (email?.toLowerCase() === superAdminEmail) {
        const adminResult = await client.query(
          `INSERT INTO admins (user_id, level) VALUES ($1, 'super') 
           ON CONFLICT (user_id) DO UPDATE SET level='super' RETURNING id`,
          [user.id]
        )
        await client.query(
          `UPDATE users SET role = 'super_admin' WHERE id = $1`,
          [user.id]
        )
        user.role = 'super_admin'
      }

      return user
    })

    const token = signToken({
      id:    result.id,
      email: result.email,
      phone: result.phone,
      role:  result.role,
      stage: result.current_stage,
      state: result.serving_state_id
    })

    return res.status(201).json({
      token,
      user: {
        id:          result.id,
        first_name:  result.first_name,
        last_name:   result.last_name,
        email:       result.email,
        phone:       result.phone,
        nysc_code:   result.nysc_state_code,
        role:        result.role,
        stage:       result.current_stage,
        state_id:    result.serving_state_id,
        created_at:  result.created_at
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})
