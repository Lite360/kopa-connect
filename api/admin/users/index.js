// api/admin/users/index.js
import { query } from '../../../_lib/db.js'
import { withAdmin } from '../../../_lib/auth.js'
import { withCors, getPagination, paginatedResponse, parseBody } from '../../../_lib/cors.js'

export default withCors(withAdmin(async (req, res, adminUser) => {
  if (req.method === 'GET') {
    return getUsers(req, res, adminUser)
  }
  if (req.method === 'PUT') {
    return updateUserStatus(req, res, adminUser)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}))

async function getUsers(req, res, adminUser) {
  const { search, state_id, role, stage } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE 1=1`
    const params = []
    let paramCount = 0

    // State admins can only see users in their assigned state
    if (adminUser.role === 'state_admin') {
      const stateAdminCheck = await query(`SELECT state_id FROM state_admins WHERE admin_id = (SELECT id FROM admins WHERE user_id = $1 LIMIT 1)`, [adminUser.id])
      if (stateAdminCheck.rows.length) {
        paramCount++
        whereClause += ` AND u.serving_state_id = $${paramCount}`
        params.push(stateAdminCheck.rows[0].state_id)
      } else {
        return res.status(403).json({ error: 'Admin state assignment missing' })
      }
    } else if (state_id) {
      paramCount++
      whereClause += ` AND u.serving_state_id = $${paramCount}`
      params.push(state_id)
    }

    if (search) {
      paramCount++
      whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.nysc_state_code ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }
    if (role) {
      paramCount++
      whereClause += ` AND u.role = $${paramCount}`
      params.push(role)
    }
    if (stage) {
      paramCount++
      whereClause += ` AND u.current_stage = $${paramCount}`
      params.push(stage)
    }

    const countResult = await query(`SELECT COUNT(*) FROM users u ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.nysc_state_code, 
              u.role, u.current_stage, u.is_active, u.is_verified, u.created_at, u.last_login,
              s.name as state_name
       FROM users u
       LEFT JOIN states s ON s.id = u.serving_state_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Admin getUsers error:', err)
    return res.status(500).json({ error: 'Failed to load users' })
  }
}

async function updateUserStatus(req, res, adminUser) {
  const { id, is_active, is_verified, role } = parseBody(req)

  if (!id) return res.status(400).json({ error: 'User ID is required' })

  try {
    // Only super admin can change roles
    if (role && adminUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can change roles' })
    }

    // State admins can only update users in their state
    if (adminUser.role === 'state_admin') {
      const stateAdminCheck = await query(`SELECT state_id FROM state_admins WHERE admin_id = (SELECT id FROM admins WHERE user_id = $1 LIMIT 1)`, [adminUser.id])
      const userStateCheck = await query(`SELECT serving_state_id FROM users WHERE id = $1`, [id])
      
      if (!stateAdminCheck.rows.length || !userStateCheck.rows.length || stateAdminCheck.rows[0].state_id !== userStateCheck.rows[0].serving_state_id) {
        return res.status(403).json({ error: 'You can only manage users in your assigned state' })
      }
    }

    const updates = []
    const params = [id]
    let paramCount = 1

    if (is_active !== undefined) {
      paramCount++
      updates.push(`is_active = $${paramCount}`)
      params.push(is_active)
    }
    if (is_verified !== undefined) {
      paramCount++
      updates.push(`is_verified = $${paramCount}`)
      params.push(is_verified)
    }
    if (role && adminUser.role === 'super_admin') {
      paramCount++
      updates.push(`role = $${paramCount}`)
      params.push(role)
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' })

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING id, is_active, is_verified, role`,
      params
    )

    return res.status(200).json({ success: true, user: result.rows[0] })
  } catch (err) {
    console.error('Admin updateUser error:', err)
    return res.status(500).json({ error: 'Failed to update user' })
  }
}
