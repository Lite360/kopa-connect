// api/camp/people.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, getPagination, paginatedResponse } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { camp_id } = req.query
  if (!camp_id) return res.status(400).json({ error: 'camp_id is required' })

  const { page, limit, offset } = getPagination(req.query)

  try {
    const countResult = await query(
      `SELECT COUNT(*) FROM user_camps WHERE camp_id = $1 AND stage = 'active'`,
      [camp_id]
    )
    const total = parseInt(countResult.rows[0].count)

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, pr.avatar_url, pr.bio,
              s.name as state_name,
              (SELECT json_agg(sk.name) 
               FROM user_skills usk 
               JOIN skills sk ON sk.id = usk.skill_id 
               WHERE usk.user_id = u.id) as skills
       FROM user_camps uc
       JOIN users u ON u.id = uc.user_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN states s ON s.id = u.serving_state_id
       WHERE uc.camp_id = $1 AND uc.stage = 'active'
       ORDER BY uc.created_at DESC
       LIMIT $2 OFFSET $3`,
      [camp_id, limit, offset]
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Camp people error:', err)
    return res.status(500).json({ error: 'Failed to load people in camp' })
  }
}))
