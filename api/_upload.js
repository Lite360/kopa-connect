// api/upload.js
import { put } from '@vercel/blob'
import { withAuth } from './_lib/auth.js'
import { withCors, parseBody } from './_lib/cors.js'
import crypto from 'crypto'

export default withCors(withAuth(async (req, res, user) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { filename, content_type } = parseBody(req)

  if (!filename) {
    return res.status(422).json({ error: 'Filename is required' })
  }

  // Generate a unique path to prevent overwrites
  const ext = filename.split('.').pop()
  const uniqueName = `${crypto.randomUUID()}.${ext}`
  const path = `uploads/${user.id}/${uniqueName}`

  try {
    // If BLOB_READ_WRITE_TOKEN is missing (e.g. local dev), return a dummy URL
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('BLOB_READ_WRITE_TOKEN missing, returning dummy URL for dev.')
      return res.status(200).json({ 
        url: `https://dummyimage.com/600x400/1a6b3a/fff.png&text=Dev+Upload+Fallback`,
        pathname: path,
        contentType: content_type
      })
    }

    // Client upload mode: server generates a token, client uploads directly to Vercel Blob
    // This requires the `@vercel/blob` client library on the frontend.
    // For simplicity in MVP without a complex multipart parser, we expect the frontend 
    // to call this to get a client token, OR send base64 data.

    // Handle base64 upload from client (simpler for MVP)
    const { base64_data } = parseBody(req)
    
    if (base64_data) {
      const buffer = Buffer.from(base64_data.replace(/^data:image\/\w+;base64,/, ""), 'base64')
      
      const blob = await put(path, buffer, {
        access: 'public',
        contentType: content_type
      })
      
      return res.status(200).json(blob)
    }

    // If client upload token generation is requested:
    // (Requires Vercel Blob client upload setup which is out of scope for a simple API)
    return res.status(400).json({ error: 'Please provide base64_data for upload' })

  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: 'Failed to process upload' })
  }
}))
