// api/auth/me.js — Get current user from token
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, tokenUser) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.nysc_state_code,
              u.role, u.current_stage, u.serving_state_id, u.batch_id, u.is_verified,
              u.last_login, u.created_at,
              p.bio, p.avatar_url, p.cover_url, p.lga, p.ppa_name, p.ppa_address,
              p.gender, p.website_url, p.twitter_handle, p.instagram_handle, p.linkedin_url,
              p.is_public, p.followers_count, p.following_count, p.posts_count,
              s.name AS serving_state_name, s.code AS serving_state_code
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN states s ON s.id = u.serving_state_id
       WHERE u.id = $1 AND u.is_active = TRUE`,
      [tokenUser.id]
    )

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({ user: result.rows[0] })
  } catch (err) {
    console.error('Me error:', err)
    return res.status(500).json({ error: 'Failed to get user' })
  }
}))
