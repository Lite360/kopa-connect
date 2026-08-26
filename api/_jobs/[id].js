// api/jobs/[id].js
import { query } from '../../_lib/db.js'
import { withAuth, verifyToken } from '../../_lib/auth.js'
import { withCors, parseBody } from '../../_lib/cors.js'

export default withCors(async (req, res) => {
  const { id } = req.query

  if (req.method === 'GET') {
    return getJob(req, res, id)
  }
  if (req.method === 'PUT') {
    return withAuth((req, res, user) => updateJob(req, res, user, id))(req, res)
  }
  if (req.method === 'DELETE') {
    return withAuth((req, res, user) => deleteJob(req, res, user, id))(req, res)
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getJob(req, res, jobId) {
  let tokenUser = null
  try { tokenUser = verifyToken(req) } catch {}

  try {
    // Increment view count (simple implementation, might overcount if refreshed)
    await query(`UPDATE jobs SET views_count = views_count + 1 WHERE id = $1`, [jobId])

    const result = await query(
      `SELECT j.*, 
              s.name as state_name,
              u.first_name, u.last_name, pr.avatar_url as poster_avatar,
              ${tokenUser ? `EXISTS(SELECT 1 FROM saved_jobs sj WHERE sj.job_id = j.id AND sj.user_id = '${tokenUser.id}') AS is_saved` : `FALSE AS is_saved`}
       FROM jobs j
       JOIN users u ON u.id = j.poster_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN states s ON s.id = j.state_id
       WHERE j.id = $1`,
      [jobId]
    )

    if (!result.rows.length) return res.status(404).json({ error: 'Job not found' })
    return res.status(200).json({ job: result.rows[0] })
  } catch (err) {
    console.error('Get job error:', err)
    return res.status(500).json({ error: 'Failed to get job' })
  }
}

async function updateJob(req, res, user, jobId) {
  const body = parseBody(req)
  const { is_active } = body
  
  try {
    const jobResult = await query(`SELECT poster_id FROM jobs WHERE id = $1`, [jobId])
    if (!jobResult.rows.length) return res.status(404).json({ error: 'Job not found' })
    if (jobResult.rows[0].poster_id !== user.id && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (is_active !== undefined) {
      await query(`UPDATE jobs SET is_active = $1, updated_at = NOW() WHERE id = $2`, [is_active, jobId])
    }
    
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Update job error:', err)
    return res.status(500).json({ error: 'Failed to update job' })
  }
}

async function deleteJob(req, res, user, jobId) {
  try {
    const jobResult = await query(`SELECT poster_id FROM jobs WHERE id = $1`, [jobId])
    if (!jobResult.rows.length) return res.status(404).json({ error: 'Job not found' })
    if (jobResult.rows[0].poster_id !== user.id && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    await query(`DELETE FROM jobs WHERE id = $1`, [jobId])
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Delete job error:', err)
    return res.status(500).json({ error: 'Failed to delete job' })
  }
}
