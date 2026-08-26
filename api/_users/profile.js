// api/users/profile.js
import { query } from '../_lib/db.js'
import { withAuth } from '../_lib/auth.js'
import { withCors, parseBody } from '../_lib/cors.js'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = parseBody(req)
  const { 
    first_name, last_name, bio, avatar_url, cover_url, 
    lga, ppa_name, ppa_address, gender, date_of_birth,
    website_url, twitter_handle, instagram_handle, linkedin_url,
    is_public
  } = body

  try {
    // Update users table for name
    if (first_name || last_name) {
      await query(
        `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), updated_at = NOW() WHERE id = $3`,
        [first_name, last_name, user.id]
      )
    }

    // Update profiles table
    const result = await query(
      `UPDATE profiles SET
        bio = COALESCE($1, bio),
        avatar_url = COALESCE($2, avatar_url),
        cover_url = COALESCE($3, cover_url),
        lga = COALESCE($4, lga),
        ppa_name = COALESCE($5, ppa_name),
        ppa_address = COALESCE($6, ppa_address),
        gender = COALESCE($7, gender),
        date_of_birth = COALESCE($8, date_of_birth),
        website_url = COALESCE($9, website_url),
        twitter_handle = COALESCE($10, twitter_handle),
        instagram_handle = COALESCE($11, instagram_handle),
        linkedin_url = COALESCE($12, linkedin_url),
        is_public = COALESCE($13, is_public),
        updated_at = NOW()
       WHERE user_id = $14 RETURNING *`,
      [
        bio, avatar_url, cover_url, lga, ppa_name, ppa_address, gender, date_of_birth,
        website_url, twitter_handle, instagram_handle, linkedin_url, is_public, user.id
      ]
    )

    return res.status(200).json({ success: true, profile: result.rows[0] })
  } catch (err) {
    console.error('Update profile error:', err)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
}))
