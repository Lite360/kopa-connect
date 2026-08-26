// api/notifications/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    try {
      const result = await query(
        `SELECT n.*, u.first_name, u.last_name, p.avatar_url 
         FROM notifications n
         LEFT JOIN users u ON u.id = n.from_user_id
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE n.user_id = $1
         ORDER BY n.created_at DESC
         LIMIT $2 OFFSET $3`,
        [user.id, limit, offset]
      )

      const unreadCount = await query(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`, [user.id])

      return res.status(200).json({ 
        notifications: result.rows,
        unread_count: parseInt(unreadCount.rows[0].count)
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load notifications' })
    }
  }

  if (req.method === 'PUT') {
    const { id, mark_all_read } = parseBody(req)

    try {
      if (mark_all_read) {
        await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [user.id])
      } else if (id) {
        await query(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`, [id, user.id])
      }
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update notifications' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))
