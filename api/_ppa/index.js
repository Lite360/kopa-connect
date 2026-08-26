// api/ppa/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    try {
      const result = await query(`SELECT * FROM user_locations WHERE user_id = $1 AND label = 'ppa'`, [user.id])
      return res.status(200).json({ location: result.rows[0] || null })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load PPA location' })
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    const { latitude, longitude, address, lga, state_id } = parseBody(req)

    if (latitude === undefined || longitude === undefined) {
      return res.status(422).json({ error: 'Latitude and longitude are required' })
    }

    try {
      const result = await query(
        `INSERT INTO user_locations (user_id, latitude, longitude, address, lga, state_id, label)
         VALUES ($1, $2, $3, $4, $5, $6, 'ppa')
         ON CONFLICT (user_id) DO UPDATE SET
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           address = COALESCE(EXCLUDED.address, user_locations.address),
           lga = COALESCE(EXCLUDED.lga, user_locations.lga),
           state_id = COALESCE(EXCLUDED.state_id, user_locations.state_id),
           label = 'ppa',
           updated_at = NOW()
         RETURNING *`,
        [user.id, latitude, longitude, address || null, lga || null, state_id || null]
      )

      // Also update profiles table with PPA address for convenience
      if (address) {
        await query(`UPDATE profiles SET ppa_address = $1 WHERE user_id = $2`, [address, user.id])
      }

      return res.status(200).json({ success: true, location: result.rows[0] })
    } catch (err) {
      console.error('Update PPA error:', err)
      return res.status(500).json({ error: 'Failed to update PPA location' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))
