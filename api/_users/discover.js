// api/users/discover.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, getPagination, paginatedResponse } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { search, state_id, camp_id, skill, lat, lng, radius_km = 50 } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE u.is_active = TRUE AND u.id != $1 AND pr.is_public = TRUE`
    const params = [user.id]
    let paramCount = 1

    if (search) {
      paramCount++
      whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR pr.bio ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (state_id) {
      paramCount++
      whereClause += ` AND u.serving_state_id = $${paramCount}`
      params.push(state_id)
    }

    if (camp_id) {
      paramCount++
      whereClause += ` AND EXISTS (SELECT 1 FROM user_camps uc WHERE uc.user_id = u.id AND uc.camp_id = $${paramCount} AND uc.stage = 'active')`
      params.push(camp_id)
    }

    if (skill) {
      paramCount++
      whereClause += ` AND EXISTS (SELECT 1 FROM user_skills usk JOIN skills sk ON sk.id = usk.skill_id WHERE usk.user_id = u.id AND sk.name ILIKE $${paramCount})`
      params.push(`%${skill}%`)
    }
    
    // Proximity search logic would go here if lat/lng are provided, using PostGIS or Haversine formula
    // For MVP, we'll keep it simple and filter by state_id instead if lat/lng is too complex without PostGIS

    const countResult = await query(
      `SELECT COUNT(*) FROM users u LEFT JOIN profiles pr ON pr.user_id = u.id ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.current_stage,
              pr.avatar_url, pr.bio, pr.ppa_name,
              s.name as state_name,
              (SELECT json_agg(sk.name) 
               FROM user_skills usk 
               JOIN skills sk ON sk.id = usk.skill_id 
               WHERE usk.user_id = u.id) as skills
       FROM users u
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN states s ON s.id = u.serving_state_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Discover error:', err)
    return res.status(500).json({ error: 'Failed to search people' })
  }
}))
