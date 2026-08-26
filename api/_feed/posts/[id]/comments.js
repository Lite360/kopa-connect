// api/feed/posts/[id]/comments.js
import { query } from '../../../_lib/db.js'
import { withAuth } from '../../../_lib/auth.js'
import { withCors, parseBody, getPagination, paginatedResponse } from '../../../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getComments(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(createComment)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getComments(req, res) {
  const { id: postId } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    const countResult = await query(
      `SELECT COUNT(*) FROM comments WHERE post_id = $1`, [postId]
    )
    const total = parseInt(countResult.rows[0].count)

    const result = await query(
      `SELECT c.*, u.first_name, u.last_name, pr.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Get comments error:', err)
    return res.status(500).json({ error: 'Failed to load comments' })
  }
}

async function createComment(req, res, user) {
  const { id: postId } = req.query
  const { content } = parseBody(req)

  if (!content?.trim()) {
    return res.status(422).json({ error: 'Comment content is required' })
  }

  try {
    const result = await query(
      `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [postId, user.id, content.trim()]
    )
    const comment = result.rows[0]

    await query(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`, [postId])

    const userResult = await query(
      `SELECT u.first_name, u.last_name, pr.avatar_url
       FROM users u LEFT JOIN profiles pr ON pr.user_id = u.id WHERE u.id = $1`,
      [user.id]
    )

    return res.status(201).json({ 
      comment: { ...comment, ...userResult.rows[0] } 
    })
  } catch (err) {
    console.error('Create comment error:', err)
    return res.status(500).json({ error: 'Failed to create comment' })
  }
}
