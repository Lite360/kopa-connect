// api/camp/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Get user's active camp
    const campResult = await query(
      `SELECT c.*, s.name as state_name, uc.stage as user_stage, uc.check_in_date
       FROM user_camps uc
       JOIN camps c ON c.id = uc.camp_id
       LEFT JOIN states s ON s.id = c.state_id
       WHERE uc.user_id = $1 AND uc.stage = 'active'
       ORDER BY uc.created_at DESC LIMIT 1`,
      [user.id]
    )

    if (!campResult.rows.length) {
      return res.status(200).json({ camp: null })
    }

    const camp = campResult.rows[0]

    // Get latest announcements for this camp
    const announcementsResult = await query(
      `SELECT * FROM camp_announcements 
       WHERE camp_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC LIMIT 5`,
      [camp.id]
    )

    // Get people count in this camp
    const countResult = await query(
      `SELECT COUNT(*) FROM user_camps WHERE camp_id = $1 AND stage = 'active'`,
      [camp.id]
    )

    return res.status(200).json({
      camp: {
        ...camp,
        active_members_count: parseInt(countResult.rows[0].count)
      },
      announcements: announcementsResult.rows
    })
  } catch (err) {
    console.error('Camp index error:', err)
    return res.status(500).json({ error: 'Failed to load camp info' })
  }
}))
