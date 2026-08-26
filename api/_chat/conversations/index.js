// api/chat/conversations/index.js
import { query, transaction } from '../../_lib/db.js'
import { withAuth } from '../../_lib/auth.js'
import { withCors, parseBody } from '../../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method === 'GET') {
    return getConversations(req, res, user)
  }
  if (req.method === 'POST') {
    return createConversation(req, res, user)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}))

async function getConversations(req, res, user) {
  try {
    const result = await query(
      `SELECT c.id, c.type, c.name, c.avatar_url, c.last_message_at,
              cm.last_read_at, cm.is_muted,
              (
                SELECT row_to_json(m) 
                FROM messages m 
                WHERE m.conversation_id = c.id 
                ORDER BY m.created_at DESC LIMIT 1
              ) as last_message,
              (
                SELECT COUNT(*) 
                FROM messages m 
                WHERE m.conversation_id = c.id AND m.created_at > cm.last_read_at
              ) as unread_count,
              (
                SELECT json_agg(json_build_object(
                  'id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'avatar_url', p.avatar_url
                ))
                FROM conversation_members other_cm
                JOIN users u ON u.id = other_cm.user_id
                LEFT JOIN profiles p ON p.user_id = u.id
                WHERE other_cm.conversation_id = c.id AND other_cm.user_id != $1
              ) as other_members
       FROM conversations c
       JOIN conversation_members cm ON cm.conversation_id = c.id
       WHERE cm.user_id = $1
       ORDER BY c.last_message_at DESC`,
      [user.id]
    )

    return res.status(200).json({ conversations: result.rows })
  } catch (err) {
    console.error('Get conversations error:', err)
    return res.status(500).json({ error: 'Failed to load conversations' })
  }
}

async function createConversation(req, res, user) {
  const { participant_id } = parseBody(req)
  if (!participant_id || participant_id === user.id) {
    return res.status(400).json({ error: 'Invalid participant' })
  }

  try {
    // Check if direct conversation already exists
    const existing = await query(
      `SELECT c.id 
       FROM conversations c
       JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = $1
       JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = $2
       WHERE c.type = 'direct'`,
      [user.id, participant_id]
    )

    if (existing.rows.length) {
      return res.status(200).json({ conversation_id: existing.rows[0].id })
    }

    const conversationId = await transaction(async (client) => {
      const convResult = await client.query(
        `INSERT INTO conversations (type) VALUES ('direct') RETURNING id`
      )
      const cId = convResult.rows[0].id

      await client.query(
        `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
        [cId, user.id, participant_id]
      )
      
      return cId
    })

    return res.status(201).json({ conversation_id: conversationId })
  } catch (err) {
    console.error('Create conversation error:', err)
    return res.status(500).json({ error: 'Failed to start conversation' })
  }
}
