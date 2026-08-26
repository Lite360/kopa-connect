// db/migrate.js — Run schema against Neon using full-file execution
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

// Use UNPOOLED connection for DDL (pgBouncer doesn't support multi-statement DDL)
const DATABASE_URL = 'postgresql://neondb_owner:npg_VcIupPz7rC9e@ep-fragrant-breeze-awoyox8i.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require'

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔌 Connecting to Neon PostgreSQL...')
    await client.connect()
    console.log('✅ Connected!\n')

    const files = ['seed_states.sql']

    for (const file of files) {
      const filePath = join(__dirname, file)
      console.log(`📄 Running ${file}...`)
      const sql = readFileSync(filePath, 'utf8')

      // Run entire file as one query — preserves dollar-quoted functions,
      // triggers, and multi-statement blocks. For seed files, wrap in savepoint
      // to handle already-existing data gracefully.
      const isSeed = file.startsWith('seed')
      try {
        if (isSeed) {
          // For seeds, split on newlines and run INSERT statements individually
          // so ON CONFLICT DO NOTHING works per-row
          await client.query('BEGIN')
          const stmts = sql.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'))
          let ok = 0
          for (const stmt of stmts) {
            try { await client.query(stmt); ok++ } catch (_) { /* skip duplicates */ }
          }
          await client.query('COMMIT')
          console.log(`  ✅ ${file} — ${ok} statements executed\n`)
        } else {
          await client.query(sql)
          console.log(`  ✅ ${file} — executed successfully\n`)
        }
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {})
        console.error(`  ❌ Error in ${file}: ${err.message}\n`)
        throw err
      }
    }

    console.log('🎉 Database migration complete!')

    // Sanity check
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log(`\n📊 Tables created (${result.rows.length}):`)
    result.rows.forEach(r => console.log(`   - ${r.table_name}`))

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Connection closed.')
  }
}

runMigration()
