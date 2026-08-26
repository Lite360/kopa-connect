// api/feed/index.js — GET social feed + POST create post
import { query } from '../_lib/db.js'
import { withCors, parseBody, getPagination, paginatedResponse } from '../_lib/cors.js'
import { withAuth, verifyToken } from '../_lib/auth.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getFeed(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(createPost)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getFeed(req, res) {
  // Try to get user from token (optional for public feed)
  let tokenUser = null
  try { tokenUser = verifyToken(req) } catch {}

  const { tab = 'for_you', state_id, camp_id } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE p.is_archived = FALSE`
    const params = []
    let paramCount = 0

    // Feed tabs
    if (tab === 'following' && tokenUser) {
      paramCount++
      whereClause += ` AND (
        p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $${paramCount})
        OR p.user_id = $${paramCount}
      )`
      params.push(tokenUser.id)
    } else if (tab === 'nearby' && tokenUser) {
      // Nearby: same state as user
      paramCount++
      whereClause += ` AND (p.visibility = 'public' OR p.state_id = $${paramCount})`
      params.push(tokenUser.state || null)
    } else if (tab === 'trending') {
      whereClause += ` AND p.visibility = 'public' AND p.created_at > NOW() - INTERVAL '7 days'`
    } else {
      // for_you: public posts
      whereClause += ` AND p.visibility = 'public'`
    }

    // Fetch total count
    const countResult = await query(
      `SELECT COUNT(*) FROM posts p ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    // Order
    let orderBy = 'p.created_at DESC'
    if (tab === 'trending') {
      orderBy = '(p.likes_count * 2 + p.comments_count * 3 + p.shares_count) DESC, p.created_at DESC'
    }

    // Fetch posts
    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT 
        p.id, p.content, p.post_type, p.visibility, p.likes_count, p.comments_count,
        p.shares_count, p.saves_count, p.is_pinned, p.created_at,
        u.id AS user_id, u.first_name, u.last_name,
        pr.avatar_url, pr.bio,
        s.name AS state_name,
        COALESCE(
          json_agg(pm ORDER BY pm.sort_order) FILTER (WHERE pm.id IS NOT NULL), 
          '[]'
        ) AS media,
        ${tokenUser ? `
          EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = '${tokenUser.id}') AS is_liked,
          EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = '${tokenUser.id}') AS is_saved
        ` : `FALSE AS is_liked, FALSE AS is_saved`}
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN states s ON s.id = p.state_id
       LEFT JOIN post_media pm ON pm.post_id = p.id
       ${whereClause}
       GROUP BY p.id, u.id, pr.avatar_url, pr.bio, s.name
       ORDER BY ${orderBy}
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Feed error:', err)
    return res.status(500).json({ error: 'Failed to load feed' })
  }
}

async function createPost(req, res, tokenUser) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = parseBody(req)
  const { content, post_type = 'update', visibility = 'public', state_id, camp_id, community_id, media_urls = [] } = body

  if (!content?.trim() && media_urls.length === 0) {
    return res.status(422).json({ error: 'Post content or media is required' })
  }

  try {
    const postResult = await query(
      `INSERT INTO posts (user_id, content, post_type, visibility, state_id, camp_id, community_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tokenUser.id, content?.trim() || null, post_type, visibility, state_id || null, camp_id || null, community_id || null]
    )
    const post = postResult.rows[0]

    // Insert media
    if (media_urls.length > 0) {
      for (let i = 0; i < media_urls.length; i++) {
        const m = media_urls[i]
        await query(
          `INSERT INTO post_media (post_id, url, media_type, sort_order) VALUES ($1, $2, $3, $4)`,
          [post.id, m.url, m.type || 'image', i]
        )
      }
    }

    // Increment user post count
    await query(`UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = $1`, [tokenUser.id])

    // Get full post with user info
    const full = await query(
      `SELECT p.*, u.first_name, u.last_name, pr.avatar_url,
              COALESCE(json_agg(pm ORDER BY pm.sort_order) FILTER (WHERE pm.id IS NOT NULL), '[]') AS media
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN post_media pm ON pm.post_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, u.first_name, u.last_name, pr.avatar_url`,
      [post.id]
    )

    return res.status(201).json({ post: full.rows[0] })
  } catch (err) {
    console.error('Create post error:', err)
    return res.status(500).json({ error: 'Failed to create post' })
  }
}
