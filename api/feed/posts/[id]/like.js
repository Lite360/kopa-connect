// api/feed/posts/[id]/like.js
import { query } from '../../../_lib/db.js'
import { withAuth } from '../../../_lib/auth.js'
import { withCors } from '../../../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  const { id: postId } = req.query

  if (req.method === 'POST') {
    try {
      const result = await query(
        `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`,
        [user.id, postId]
      )
      if (result.rowCount > 0) {
        await query(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, [postId])
      }
      return res.status(200).json({ success: true, liked: true })
    } catch (err) {
      console.error('Like error:', err)
      return res.status(500).json({ error: 'Failed to like post' })
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const result = await query(
        `DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING id`,
        [user.id, postId]
      )
      if (result.rowCount > 0) {
        await query(`UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1`, [postId])
      }
      return res.status(200).json({ success: true, liked: false })
    } catch (err) {
      console.error('Unlike error:', err)
      return res.status(500).json({ error: 'Failed to unlike post' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}))
