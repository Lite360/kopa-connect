// api/skills/index.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(async (req, res) => {
  if (req.method === 'GET') {
    return getSkills(req, res)
  }
  if (req.method === 'POST') {
    return withAuth(addSkillToUser)(req, res)
  }
  if (req.method === 'DELETE') {
    return withAuth(removeSkillFromUser)(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

async function getSkills(req, res) {
  try {
    const result = await query(`SELECT * FROM skills ORDER BY category, name`)
    return res.status(200).json({ skills: result.rows })
  } catch (err) {
    console.error('Get skills error:', err)
    return res.status(500).json({ error: 'Failed to load skills' })
  }
}

async function addSkillToUser(req, res, user) {
  const { skill_id, level = 'intermediate' } = parseBody(req)
  if (!skill_id) return res.status(400).json({ error: 'skill_id is required' })

  try {
    const result = await query(
      `INSERT INTO user_skills (user_id, skill_id, level) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *`,
      [user.id, skill_id, level]
    )
    return res.status(201).json({ success: true, user_skill: result.rows[0] })
  } catch (err) {
    console.error('Add skill error:', err)
    return res.status(500).json({ error: 'Failed to add skill' })
  }
}

async function removeSkillFromUser(req, res, user) {
  const { skill_id } = parseBody(req)
  if (!skill_id) return res.status(400).json({ error: 'skill_id is required' })

  try {
    await query(`DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2`, [user.id, skill_id])
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Remove skill error:', err)
    return res.status(500).json({ error: 'Failed to remove skill' })
  }
}
