// api/admin/reports/index.js
import { query } from '../../_lib/db.js'
import { withAdmin } from '../../_lib/auth.js'
import { withCors, getPagination, paginatedResponse, parseBody } from '../../_lib/cors.js'

export default withCors(withAdmin(async (req, res, adminUser) => {
  if (req.method === 'GET') {
    return getReports(req, res, adminUser)
  }
  if (req.method === 'PUT') {
    return resolveReport(req, res, adminUser)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}))

async function getReports(req, res, adminUser) {
  const { status = 'pending', target_type } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE r.status = $1`
    const params = [status]
    let paramCount = 1

    if (target_type) {
      paramCount++
      whereClause += ` AND r.target_type = $${paramCount}`
      params.push(target_type)
    }

    const countResult = await query(`SELECT COUNT(*) FROM reports r ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT r.*, 
              u.first_name as reporter_first_name, u.last_name as reporter_last_name
       FROM reports r
       JOIN users u ON u.id = r.reporter_id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Admin getReports error:', err)
    return res.status(500).json({ error: 'Failed to load reports' })
  }
}

async function resolveReport(req, res, adminUser) {
  const { id, action_taken, status = 'resolved' } = parseBody(req)

  if (!id) return res.status(400).json({ error: 'Report ID is required' })
  if (!['resolved', 'dismissed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })

  try {
    const result = await query(
      `UPDATE reports 
       SET status = $1, action_taken = $2, reviewed_by = $3, reviewed_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [status, action_taken || null, adminUser.id, id]
    )

    return res.status(200).json({ success: true, report: result.rows[0] })
  } catch (err) {
    console.error('Admin resolveReport error:', err)
    return res.status(500).json({ error: 'Failed to resolve report' })
  }
}
