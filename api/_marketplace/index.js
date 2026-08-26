// api/marketplace/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody, getPagination, paginatedResponse } from '../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getListings(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(createListing)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getListings(req, res) {
  const { search, category, state_id, vendor_id } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE ml.is_active = TRUE`
    const params = []
    let paramCount = 0

    if (search) {
      paramCount++
      whereClause += ` AND (ml.title ILIKE $${paramCount} OR ml.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (category) {
      paramCount++
      whereClause += ` AND ml.category = $${paramCount}`
      params.push(category)
    }

    if (state_id) {
      paramCount++
      whereClause += ` AND ml.state_id = $${paramCount}`
      params.push(state_id)
    }

    if (vendor_id) {
      paramCount++
      whereClause += ` AND ml.vendor_id = $${paramCount}`
      params.push(vendor_id)
    }

    const countResult = await query(`SELECT COUNT(*) FROM marketplace_listings ml ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT ml.*, 
              v.business_name, v.logo_url as vendor_logo, v.rating,
              s.name as state_name,
              COALESCE(json_agg(lm ORDER BY lm.sort_order) FILTER (WHERE lm.id IS NOT NULL), '[]') AS media
       FROM marketplace_listings ml
       JOIN vendors v ON v.id = ml.vendor_id
       LEFT JOIN states s ON s.id = ml.state_id
       LEFT JOIN listing_media lm ON lm.listing_id = ml.id
       ${whereClause}
       GROUP BY ml.id, v.id, s.name
       ORDER BY ml.is_featured DESC, ml.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Get listings error:', err)
    return res.status(500).json({ error: 'Failed to load listings' })
  }
}

async function createListing(req, res, user) {
  const body = parseBody(req)
  const { title, description, price, price_label, category, location, state_id, is_negotiable, media_urls = [] } = body

  if (!title?.trim()) {
    return res.status(422).json({ error: 'Title is required' })
  }

  try {
    const vendorResult = await query(`SELECT id FROM vendors WHERE owner_id = $1`, [user.id])
    if (!vendorResult.rows.length) {
      return res.status(403).json({ error: 'You must create a vendor profile first' })
    }
    const vendorId = vendorResult.rows[0].id

    const result = await query(
      `INSERT INTO marketplace_listings (vendor_id, title, description, price, price_label, category, location, state_id, is_negotiable)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [vendorId, title.trim(), description?.trim() || null, price || null, price_label || null, category || null, location || null, state_id || null, is_negotiable || false]
    )
    const listing = result.rows[0]

    if (media_urls.length > 0) {
      for (let i = 0; i < media_urls.length; i++) {
        await query(
          `INSERT INTO listing_media (listing_id, url, is_primary, sort_order) VALUES ($1, $2, $3, $4)`,
          [listing.id, media_urls[i], i === 0, i]
        )
      }
    }

    return res.status(201).json({ listing })
  } catch (err) {
    console.error('Create listing error:', err)
    return res.status(500).json({ error: 'Failed to create listing' })
  }
}
