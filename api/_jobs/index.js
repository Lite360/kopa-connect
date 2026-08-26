// api/jobs/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody, getPagination, paginatedResponse } from '../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getJobs(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(createJob)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getJobs(req, res) {
  const { search, state_id, job_type } = req.query
  const { page, limit, offset } = getPagination(req.query)

  try {
    let whereClause = `WHERE j.is_active = TRUE AND (j.expires_at IS NULL OR j.expires_at > CURRENT_DATE)`
    const params = []
    let paramCount = 0

    if (search) {
      paramCount++
      whereClause += ` AND (j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR j.company_name ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (state_id) {
      paramCount++
      whereClause += ` AND (j.state_id = $${paramCount} OR j.job_type = 'remote')`
      params.push(state_id)
    }

    if (job_type) {
      paramCount++
      whereClause += ` AND j.job_type = $${paramCount}`
      params.push(job_type)
    }

    const countResult = await query(`SELECT COUNT(*) FROM jobs j ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    paramCount++
    params.push(limit)
    paramCount++
    params.push(offset)

    const result = await query(
      `SELECT j.id, j.title, j.company_name, j.location, j.job_type, j.pay_min, j.pay_max, j.pay_currency, j.pay_period, j.created_at,
              s.name as state_name,
              u.first_name, u.last_name, pr.avatar_url as poster_avatar
       FROM jobs j
       JOIN users u ON u.poster_id = u.id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN states s ON s.id = j.state_id
       ${whereClause}
       ORDER BY j.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    )

    return res.status(200).json(paginatedResponse(result.rows, total, page, limit))
  } catch (err) {
    console.error('Get jobs error:', err)
    return res.status(500).json({ error: 'Failed to load jobs' })
  }
}

async function createJob(req, res, user) {
  const body = parseBody(req)
  const { 
    title, description, company_name, location, state_id, job_type, 
    pay_min, pay_max, pay_currency, pay_period, requirements, 
    application_method, application_email, application_phone, application_url, whatsapp_number, expires_at 
  } = body

  if (!title?.trim() || !description?.trim()) {
    return res.status(422).json({ error: 'Title and description are required' })
  }

  try {
    const result = await query(
      `INSERT INTO jobs (
        poster_id, title, description, company_name, location, state_id, job_type, 
        pay_min, pay_max, pay_currency, pay_period, requirements, 
        application_method, application_email, application_phone, application_url, whatsapp_number, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [
        user.id, title.trim(), description.trim(), company_name || null, location || null, state_id || null, job_type || null,
        pay_min || null, pay_max || null, pay_currency || 'NGN', pay_period || null, requirements || null,
        application_method || null, application_email || null, application_phone || null, application_url || null, whatsapp_number || null, expires_at || null
      ]
    )

    return res.status(201).json({ job: result.rows[0] })
  } catch (err) {
    console.error('Create job error:', err)
    return res.status(500).json({ error: 'Failed to create job' })
  }
}
