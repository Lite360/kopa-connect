// api/users/[id].js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  const { id: profileId } = req.query

  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT u.id, u.first_name, u.last_name, u.current_stage,
                pr.bio, pr.avatar_url, pr.cover_url, pr.lga, pr.ppa_name, pr.ppa_address,
                pr.followers_count, pr.following_count, pr.posts_count,
                s.name as state_name,
                (SELECT json_agg(sk.name) FROM user_skills usk JOIN skills sk ON sk.id = usk.skill_id WHERE usk.user_id = u.id) as skills,
                (SELECT status FROM connections WHERE (requester_id = $1 AND addressee_id = u.id) OR (requester_id = u.id AND addressee_id = $1) LIMIT 1) as connection_status
         FROM users u
         LEFT JOIN profiles pr ON pr.user_id = u.id
         LEFT JOIN states s ON s.id = u.serving_state_id
         WHERE u.id = $2 AND u.is_active = TRUE`,
        [user.id, profileId]
      )

      if (!result.rows.length) return res.status(404).json({ error: 'User not found' })
      return res.status(200).json({ profile: result.rows[0] })
    } catch (err) {
      console.error('Get profile error:', err)
      return res.status(500).json({ error: 'Failed to get profile' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))
