import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'

const API_BASE = 'https://v3.football.api-sports.io'

function loadEnvFile(file) {
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

function parseArgs(argv) {
  const options = { matchKey: null, json: false }
  for (const arg of argv) {
    if (arg === '--json') options.json = true
    else if (arg.startsWith('--match=')) options.matchKey = arg.slice('--match='.length)
    else if (arg === '--help') {
      console.log('Usage: npm run validate:goals -- [--match=30-0] [--json]')
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return options
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function playerKey(name) {
  const parts = normalize(name).split(' ').filter(Boolean)
  return parts.at(-1) ?? ''
}

function isScoringGoal(event) {
  const detail = normalize(event.detail)
  return normalize(event.type) === 'goal'
    && detail !== 'own goal'
    && detail !== 'missed penalty'
}

function eventLabel(event) {
  const extra = event.extraMinute ? `+${event.extraMinute}` : ''
  return `${event.minute ?? '?'}${extra}' ${event.playerName} (${event.teamName})`
}

function sameGoal(apiGoal, dbGoal) {
  return apiGoal.minute === dbGoal.minute
    && (apiGoal.extraMinute ?? null) === (dbGoal.extraMinute ?? null)
    && normalize(apiGoal.teamName) === normalize(dbGoal.teamName)
    && playerKey(apiGoal.playerName) === playerKey(dbGoal.playerName)
}

async function apiGet(path, apiKey) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'x-apisports-key': apiKey },
    signal: AbortSignal.timeout(15_000),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(`API-Football HTTP ${response.status}`)
  if (body.errors && Object.keys(body.errors).length) {
    throw new Error(`API-Football: ${JSON.stringify(body.errors)}`)
  }
  return body.response ?? []
}

async function fetchAll(query) {
  const rows = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await query.range(from, from + pageSize - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < pageSize) return rows
  }
}

function toApiGoal(event) {
  return {
    minute: event.time?.elapsed ?? null,
    extraMinute: event.time?.extra ?? null,
    playerName: event.player?.name ?? '(unknown)',
    teamName: event.team?.name ?? '(unknown)',
    type: event.type,
    detail: event.detail,
  }
}

function toDbGoal(event) {
  return {
    minute: event.minute,
    extraMinute: event.extra_minute,
    playerName: event.player_name ?? '(unknown)',
    teamName: event.team_name ?? '(unknown)',
    type: event.type,
    detail: event.detail,
  }
}

async function main() {
  loadEnvFile('.env.local')
  loadEnvFile('.env')
  const options = parseArgs(process.argv.slice(2))
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const apiKey = process.env.API_FOOTBALL_KEY

  if (!url || !serviceKey || !apiKey) {
    throw new Error(
      'Missing SUPABASE_URL/VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or API_FOOTBALL_KEY.',
    )
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let scoresQuery = supabase
    .from('live_scores')
    .select('match_key,status,raw_api_response')
    .eq('status', 'FT')
    .order('match_key')
  if (options.matchKey) scoresQuery = scoresQuery.eq('match_key', options.matchKey)
  const scores = await fetchAll(scoresQuery)

  if (!scores.length) throw new Error('No completed matches found for the selected filter.')

  const fixtures = scores.map((row) => ({
    matchKey: row.match_key,
    fixtureId: row.raw_api_response?.fixture?.id,
    home: row.raw_api_response?.teams?.home?.name ?? '?',
    away: row.raw_api_response?.teams?.away?.name ?? '?',
    expectedGoals:
      (row.raw_api_response?.goals?.home ?? 0) + (row.raw_api_response?.goals?.away ?? 0),
  }))

  const withoutFixtureId = fixtures.filter((fixture) => !fixture.fixtureId)
  if (withoutFixtureId.length) {
    throw new Error(
      `Missing API fixture id in live_scores.raw_api_response: ${
        withoutFixtureId.map((fixture) => fixture.matchKey).join(', ')
      }`,
    )
  }

  let dbQuery = supabase
    .from('match_events')
    .select('match_key,minute,extra_minute,team_name,player_name,type,detail')
    .in('match_key', fixtures.map((fixture) => fixture.matchKey))
    .eq('type', 'Goal')
  const dbEvents = await fetchAll(dbQuery)
  const report = []

  for (const fixture of fixtures) {
    const apiEvents = await apiGet(`/fixtures/events?fixture=${fixture.fixtureId}`, apiKey)
    const apiGoals = apiEvents.map(toApiGoal).filter(isScoringGoal)
    const dbGoals = dbEvents
      .filter((event) => event.match_key === fixture.matchKey)
      .map(toDbGoal)
      .filter(isScoringGoal)

    const matchedDb = new Set()
    const missingInDb = apiGoals.filter((apiGoal) => {
      const index = dbGoals.findIndex(
        (dbGoal, candidate) => !matchedDb.has(candidate) && sameGoal(apiGoal, dbGoal),
      )
      if (index === -1) return true
      matchedDb.add(index)
      return false
    })
    const extraInDb = dbGoals.filter((_, index) => !matchedDb.has(index))

    report.push({
      matchKey: fixture.matchKey,
      match: `${fixture.home} - ${fixture.away}`,
      scoreGoals: fixture.expectedGoals,
      apiGoalEvents: apiGoals.length,
      databaseGoals: dbGoals.length,
      apiEventCountMatchesScore: apiGoals.length === fixture.expectedGoals,
      missingInDatabase: missingInDb.map(eventLabel),
      extraInDatabase: extraInDb.map(eventLabel),
    })
  }

  const problems = report.filter((item) =>
    !item.apiEventCountMatchesScore
    || item.missingInDatabase.length
    || item.extraInDatabase.length
  )

  if (options.json) {
    console.log(JSON.stringify({ checked: report.length, problems }, null, 2))
  } else {
    console.log(`Checked ${report.length} completed match(es).`)
    if (!problems.length) {
      console.log('OK: API scores, API goal events, and database goals are consistent.')
    }
    for (const item of problems) {
      console.log(`\n[${item.matchKey}] ${item.match}`)
      console.log(
        `  Score goals: ${item.scoreGoals}; API events: ${item.apiGoalEvents}; DB goals: ${item.databaseGoals}`,
      )
      if (!item.apiEventCountMatchesScore) {
        console.log('  WARNING: API goal-event count does not match the final score.')
      }
      for (const goal of item.missingInDatabase) console.log(`  MISSING IN DB: ${goal}`)
      for (const goal of item.extraInDatabase) console.log(`  EXTRA IN DB: ${goal}`)
    }
  }

  if (problems.length) process.exitCode = 2
}

main().catch((error) => {
  console.error(`Goal validation failed: ${error.message}`)
  process.exit(1)
})
