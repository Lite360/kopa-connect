// api/communities/index.js
import { query } from '../_lib/db.js'
import { withAuth, verifyToken } from '../_lib/auth.js'
import { withCors, parseBody, getPagination, paginatedResponse } from '../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getCommunities(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(createCommunity)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getCommunities(req, res) {
  let tokenUser = null
  try { tokenUser = verifyToken(req) } catch {}

  const { search, category, state_id, filter } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE c.is_private = FALSE OR c.created_by = $1`
    const params = [tokenUser ? tokenUser.id : null]
    let paramCount = 1

    if (search) {
      paramCount++
      whereClause += ` AND (c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }
    if (category) {
      paramCount++
      whereClause += ` AND c.category = $${paramCount}`
      params.push(category)
    }
    if (state_id) {
      paramCount++
      whereClause += ` AND (c.state_id = $${paramCount} OR c.state_id IS NULL)`
      params.push(state_id)
    }
    if (filter === 'joined' && tokenUser) {
      whereClause += ` AND EXISTS (SELECT 1 FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = $1)`
    }

    const countResult = await query(`SELECT COUNT(*) FROM communities c ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT c.*, s.name as state_name,
              ${tokenUser ? `EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = $1) AS is_member` : `FALSE AS is_member`}
       FROM communities c
       LEFT JOIN states s ON s.id = c.state_id
       ${whereClause}
       ORDER BY c.members_count DESC, c.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Get communities error:', err)
    return res.status(500).json({ error: 'Failed to load communities' })
  }
}

async function createCommunity(req, res, user) {
  const body = parseBody(req)
  const { name, description, category, state_id, is_private, avatar_url, cover_url } = body

  if (!name?.trim()) {
    return res.status(422).json({ error: 'Community name is required' })
  }

  try {
    const result = await query(
      `INSERT INTO communities (name, description, category, state_id, is_private, avatar_url, cover_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name.trim(), description || null, category || 'general', state_id || null, is_private || false, avatar_url || null, cover_url || null, user.id]
    )
    const community = result.rows[0]

    await query(
      `INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, 'admin')`,
      [community.id, user.id]
    )

    return res.status(201).json({ community })
  } catch (err) {
    console.error('Create community error:', err)
    return res.status(500).json({ error: 'Failed to create community' })
  }
}
