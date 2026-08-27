// api/chat/messages/[id].js
import { query } from '../../_lib/db.js'
import { withAuth } from '../../_lib/auth.js'
import { withCors, parseBody } from '../../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  const { id: conversationId } = req.query

  // Ensure user is in this conversation
  try {
    const memberCheck = await query(
      `SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, user.id]
    )
    if (!memberCheck.rows.length) {
      return res.status(403).json({ error: 'Not a member of this conversation' })
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify membership' })
  }

  if (req.method === 'GET') {
    return getMessages(req, res, conversationId)
  }
  if (req.method === 'POST') {
    return sendMessage(req, res, user, conversationId)
  }
  if (req.method === 'PUT') {
    return markAsRead(req, res, user, conversationId)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}))

async function getMessages(req, res, conversationId) {
  const limit = parseInt(req.query.limit) || 50
  const before = req.query.before // for pagination based on message id/time

  try {
    let whereClause = `WHERE m.conversation_id = $1`
    const params = [conversationId, limit]
    if (before) {
      whereClause += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $3)`
      params.push(before)
    }

    const result = await query(
      `SELECT m.*, u.first_name, u.last_name, p.avatar_url
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       LEFT JOIN profiles p ON p.user_id = u.id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT $2`,
      params
    )

    // Reverse to chronological order
    const messages = result.rows.reverse()
    return res.status(200).json({ messages })
  } catch (err) {
    console.error('Get messages error:', err)
    return res.status(500).json({ error: 'Failed to load messages' })
  }
}

async function sendMessage(req, res, user, conversationId) {
  const { content, message_type = 'text', media_url } = parseBody(req)

  if (!content?.trim() && !media_url) {
    return res.status(422).json({ error: 'Message content is required' })
  }

  try {
    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, content, message_type, media_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [conversationId, user.id, content?.trim() || null, message_type, media_url || null]
    )
    
    await query(`UPDATE conversations SET last_message_at = NOW() WHERE id = $1`, [conversationId])
    
    // Mark as read for sender immediately
    await query(
      `UPDATE conversation_members SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, user.id]
    )

    return res.status(201).json({ message: result.rows[0] })
  } catch (err) {
    console.error('Send message error:', err)
    return res.status(500).json({ error: 'Failed to send message' })
  }
}

async function markAsRead(req, res, user, conversationId) {
  try {
    await query(
      `UPDATE conversation_members SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, user.id]
    )
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark as read' })
  }
}
