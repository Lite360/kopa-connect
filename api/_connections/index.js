// api/connections/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method === 'POST') {
    const { addressee_id } = parseBody(req)
    if (!addressee_id || addressee_id === user.id) return res.status(400).json({ error: 'Invalid user' })

    try {
      const result = await query(
        `INSERT INTO connections (requester_id, addressee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
        [user.id, addressee_id]
      )
      return res.status(201).json({ success: true, connection: result.rows[0] })
    } catch (err) {
      console.error('Connection request error:', err)
      return res.status(500).json({ error: 'Failed to send request' })
    }
  }

  if (req.method === 'PUT') {
    const { requester_id, status } = parseBody(req)
    if (!['accepted', 'declined', 'blocked'].includes(status)) return res.status(400).json({ error: 'Invalid status' })

    try {
      const result = await query(
        `UPDATE connections SET status = $1, updated_at = NOW() WHERE requester_id = $2 AND addressee_id = $3 RETURNING *`,
        [status, requester_id, user.id]
      )
      return res.status(200).json({ success: true, connection: result.rows[0] })
    } catch (err) {
      console.error('Connection update error:', err)
      return res.status(500).json({ error: 'Failed to update connection' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))
