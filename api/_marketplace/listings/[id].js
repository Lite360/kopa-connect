// api/marketplace/listings/[id].js
import { query } from '../../../_lib/db.js'
import { withAuth } from '../../../_lib/auth.js'
import { withCors, parseBody } from '../../../_lib/cors.js'

export default withCors(async (req, res) => {
  const { id } = req.query

  if (req.method === 'GET') {
    return getListing(req, res, id)
  }
  if (req.method === 'DELETE') {
    return withAuth((req, res, user) => deleteListing(req, res, user, id))(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getListing(req, res, listingId) {
  try {
    await query(`UPDATE marketplace_listings SET views_count = views_count + 1 WHERE id = $1`, [listingId])

    const result = await query(
      `SELECT ml.*, 
              v.business_name, v.logo_url as vendor_logo, v.description as vendor_description, 
              v.phone, v.whatsapp, v.email, v.website_url, v.rating, v.total_reviews,
              s.name as state_name,
              COALESCE(json_agg(lm ORDER BY lm.sort_order) FILTER (WHERE lm.id IS NOT NULL), '[]') AS media
       FROM marketplace_listings ml
       JOIN vendors v ON v.id = ml.vendor_id
       LEFT JOIN states s ON s.id = ml.state_id
       LEFT JOIN listing_media lm ON lm.listing_id = ml.id
       WHERE ml.id = $1
       GROUP BY ml.id, v.id, s.name`,
      [listingId]
    )

    if (!result.rows.length) return res.status(404).json({ error: 'Listing not found' })
    return res.status(200).json({ listing: result.rows[0] })
  } catch (err) {
    console.error('Get listing error:', err)
    return res.status(500).json({ error: 'Failed to get listing' })
  }
}

async function deleteListing(req, res, user, listingId) {
  try {
    const listingResult = await query(
      `SELECT ml.id, v.owner_id 
       FROM marketplace_listings ml 
       JOIN vendors v ON v.id = ml.vendor_id 
       WHERE ml.id = $1`, 
      [listingId]
    )
    if (!listingResult.rows.length) return res.status(404).json({ error: 'Listing not found' })
    
    if (listingResult.rows[0].owner_id !== user.id && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    await query(`DELETE FROM marketplace_listings WHERE id = $1`, [listingId])
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Delete listing error:', err)
    return res.status(500).json({ error: 'Failed to delete listing' })
  }
}
