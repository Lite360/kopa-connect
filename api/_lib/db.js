// api/_lib/db.js
// Neon PostgreSQL connection pool (shared across serverless functions)
import { Pool } from 'pg'

let pool

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    })
    pool.on('error', (err) => {
      console.error('Unexpected DB pool error:', err)
    })
  }
  return pool
}

export async function query(text, params) {
  const db = getDb()
  const start = Date.now()
  try {
    const result = await db.query(text, params)
    const duration = Date.now() - start
    if (duration > 1000) {
      console.warn('Slow query detected:', { text, duration })
    }
    return result
  } catch (err) {
    console.error('DB query error:', { text, err: err.message })
    throw err
  }
}

export async function transaction(callback) {
  const db = getDb()
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
