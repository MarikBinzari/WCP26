import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TABLES = [
  'teams',
  'match_days',
  'matches',
  'profiles',
  'boards',
  'board_members',
  'predictions',
  'exact_scores',
  'special_picks',
  'board_scores',
  'live_scores',
  'scoring_rules',
  'tournament_meta',
  'system_notifications',
]

function loadEnvFile(file) {
  if (!existsSync(file)) return
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

async function fetchAll(supabase, table) {
  const pageSize = 1000
  const rows = []

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, to)

    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data || []))
    if (!data || data.length < pageSize) break
  }

  return rows
}

async function main() {
  loadEnvFile('.env.local')
  loadEnvFile('.env')

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
    console.error('Add SUPABASE_SERVICE_ROLE_KEY to .env.local, then run: npm run backup:predictions')
    process.exit(1)
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outDir = join('backups', `predictions-${stamp}`)
  mkdirSync(outDir, { recursive: true })

  const manifest = {
    created_at: new Date().toISOString(),
    supabase_url: url,
    tables: {},
  }

  for (const table of TABLES) {
    const rows = await fetchAll(supabase, table)
    manifest.tables[table] = rows.length
    writeFileSync(join(outDir, `${table}.json`), `${JSON.stringify(rows, null, 2)}\n`)
    console.log(`${table}: ${rows.length}`)
  }

  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Backup saved to ${outDir}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
