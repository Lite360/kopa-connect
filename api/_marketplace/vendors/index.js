// api/marketplace/vendors/index.js
import { query } from '../../_lib/db.js'
import { withAuth } from '../../_lib/auth.js'
import { withCors, parseBody } from '../../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getVendors(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(createVendor)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getVendors(req, res) {
  try {
    const result = await query(
      `SELECT v.*, s.name as state_name, u.first_name, u.last_name
       FROM vendors v
       JOIN users u ON u.id = v.owner_id
       LEFT JOIN states s ON s.id = v.state_id
       WHERE v.is_active = TRUE
       ORDER BY v.created_at DESC`
    )
    return res.status(200).json({ vendors: result.rows })
  } catch (err) {
    console.error('Get vendors error:', err)
    return res.status(500).json({ error: 'Failed to load vendors' })
  }
}

async function createVendor(req, res, user) {
  const body = parseBody(req)
  const { business_name, description, logo_url, location, state_id, phone, whatsapp, email, website_url, category } = body

  if (!business_name?.trim()) {
    return res.status(422).json({ error: 'Business name is required' })
  }

  try {
    const existing = await query(`SELECT id FROM vendors WHERE owner_id = $1`, [user.id])
    if (existing.rows.length) {
      return res.status(409).json({ error: 'You already have a vendor profile' })
    }

    const result = await query(
      `INSERT INTO vendors (owner_id, business_name, description, logo_url, location, state_id, phone, whatsapp, email, website_url, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [user.id, business_name.trim(), description || null, logo_url || null, location || null, state_id || null, phone || null, whatsapp || null, email || null, website_url || null, category || null]
    )

    return res.status(201).json({ vendor: result.rows[0] })
  } catch (err) {
    console.error('Create vendor error:', err)
    return res.status(500).json({ error: 'Failed to create vendor profile' })
  }
}
