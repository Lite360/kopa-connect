// api/cds/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    try {
      const result = await query(`SELECT * FROM cds_information WHERE user_id = $1`, [user.id])
      return res.status(200).json({ cds: result.rows[0] || null })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load CDS info' })
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    const { cds_group, cds_day, cds_location, cds_time, cds_state_id } = parseBody(req)

    try {
      const result = await query(
        `INSERT INTO cds_information (user_id, cds_group, cds_day, cds_location, cds_time, cds_state_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET
           cds_group = EXCLUDED.cds_group,
           cds_day = EXCLUDED.cds_day,
           cds_location = EXCLUDED.cds_location,
           cds_time = EXCLUDED.cds_time,
           cds_state_id = EXCLUDED.cds_state_id,
           updated_at = NOW()
         RETURNING *`,
        [user.id, cds_group, cds_day, cds_location, cds_time || null, cds_state_id || null]
      )

      // Auto-update user stage to CDS if they are in a previous stage
      if (user.stage === 'camp' || user.stage === 'ppa') {
        await query(`UPDATE users SET current_stage = 'cds' WHERE id = $1 AND current_stage IN ('camp', 'ppa')`, [user.id])
      }

      return res.status(200).json({ success: true, cds: result.rows[0] })
    } catch (err) {
      console.error('Update CDS error:', err)
      return res.status(500).json({ error: 'Failed to update CDS info' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))
