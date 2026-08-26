// api/feed/posts/[id].js — GET/DELETE/LIKE post; POST comment; GET comments
import { query } from '../../_lib/db.js'
import { withCors, parseBody } from '../../_lib/cors.js'
import { withAuth, verifyToken } from '../../_lib/auth.js'

export default withCors(async (req, res) => {
  const { id } = req.query

  if (req.method === 'GET') {
    return getPost(req, res, id)
  }
  if (req.method === 'DELETE') {
    return withAuth((req, res, user) => deletePost(req, res, user, id))(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getPost(req, res, postId) {
  let tokenUser = null
  try { tokenUser = verifyToken(req) } catch {}

  try {
    const result = await query(
      `SELECT p.*, u.first_name, u.last_name, pr.avatar_url,
              COALESCE(json_agg(DISTINCT pm ORDER BY pm.sort_order) FILTER (WHERE pm.id IS NOT NULL), '[]') AS media,
              ${tokenUser ? `
                EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = '${tokenUser.id}') AS is_liked,
                EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = '${tokenUser.id}') AS is_saved
              ` : `FALSE AS is_liked, FALSE AS is_saved`}
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN post_media pm ON pm.post_id = p.id
       WHERE p.id = $1 AND p.is_archived = FALSE
       GROUP BY p.id, u.first_name, u.last_name, pr.avatar_url`,
      [postId]
    )

    if (!result.rows.length) return res.status(404).json({ error: 'Post not found' })
    return res.status(200).json({ post: result.rows[0] })
  } catch (err) {
    console.error('Get post error:', err)
    return res.status(500).json({ error: 'Failed to get post' })
  }
}

async function deletePost(req, res, tokenUser, postId) {
  try {
    const result = await query(
      `SELECT user_id FROM posts WHERE id = $1`, [postId]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Post not found' })
    if (result.rows[0].user_id !== tokenUser.id && tokenUser.role !== 'super_admin' && tokenUser.role !== 'state_admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await query(`UPDATE posts SET is_archived = TRUE WHERE id = $1`, [postId])
    await query(`UPDATE profiles SET posts_count = GREATEST(posts_count - 1, 0) WHERE user_id = $1`, [tokenUser.id])
    return res.status(200).json({ message: 'Post deleted' })
  } catch (err) {
    console.error('Delete post error:', err)
    return res.status(500).json({ error: 'Failed to delete post' })
  }
}
