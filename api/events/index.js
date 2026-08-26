// api/events/index.js
import { query } from '../_lib/db.js'
import { withAuth, verifyToken } from '../_lib/auth.js'
import { withCors, parseBody, getPagination, paginatedResponse } from '../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getEvents(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(createEvent)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getEvents(req, res) {
  let tokenUser = null
  try { tokenUser = verifyToken(req) } catch {}

  const { search, state_id, event_type, camp_id, community_id, timeframe = 'upcoming' } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE e.is_active = TRUE`
    const params = []
    let paramCount = 0

    if (timeframe === 'upcoming') {
      whereClause += ` AND e.starts_at > NOW()`
    } else if (timeframe === 'past') {
      whereClause += ` AND e.starts_at <= NOW()`
    }

    if (search) {
      paramCount++
      whereClause += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }
    if (state_id) {
      paramCount++
      whereClause += ` AND e.state_id = $${paramCount}`
      params.push(state_id)
    }
    if (event_type) {
      paramCount++
      whereClause += ` AND e.event_type = $${paramCount}`
      params.push(event_type)
    }
    if (camp_id) {
      paramCount++
      whereClause += ` AND e.camp_id = $${paramCount}`
      params.push(camp_id)
    }
    if (community_id) {
      paramCount++
      whereClause += ` AND e.community_id = $${paramCount}`
      params.push(community_id)
    }

    const countResult = await query(`SELECT COUNT(*) FROM events e ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT e.*, s.name as state_name, u.first_name, u.last_name, pr.avatar_url as organizer_avatar,
              ${tokenUser ? `EXISTS(SELECT 1 FROM event_attendees ea WHERE ea.event_id = e.id AND ea.user_id = '${tokenUser.id}') AS is_attending` : `FALSE AS is_attending`}
       FROM events e
       JOIN users u ON u.id = e.organizer_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN states s ON s.id = e.state_id
       ${whereClause}
       ORDER BY e.starts_at ASC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Get events error:', err)
    return res.status(500).json({ error: 'Failed to load events' })
  }
}

async function createEvent(req, res, user) {
  const body = parseBody(req)
  const { title, description, cover_url, event_type, location, state_id, community_id, camp_id, starts_at, ends_at, is_online, online_url, is_free, ticket_price } = body

  if (!title?.trim() || !starts_at) {
    return res.status(422).json({ error: 'Title and start time are required' })
  }

  try {
    const result = await query(
      `INSERT INTO events (organizer_id, title, description, cover_url, event_type, location, state_id, community_id, camp_id, starts_at, ends_at, is_online, online_url, is_free, ticket_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [user.id, title.trim(), description || null, cover_url || null, event_type || 'other', location || null, state_id || null, community_id || null, camp_id || null, starts_at, ends_at || null, is_online || false, online_url || null, is_free !== false, ticket_price || null]
    )

    // Auto-RSVP organizer
    await query(`INSERT INTO event_attendees (event_id, user_id, status) VALUES ($1, $2, 'going')`, [result.rows[0].id, user.id])

    return res.status(201).json({ event: result.rows[0] })
  } catch (err) {
    console.error('Create event error:', err)
    return res.status(500).json({ error: 'Failed to create event' })
  }
}
