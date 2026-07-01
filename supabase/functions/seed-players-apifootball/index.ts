// Edge Function: seed-players-apifootball
//
// One-time initial load of all WC 2026 players from API-Football.
// Called by pg_cron every 3 minutes — auto-detects next unseeded batch of 8 teams,
// processes them, then unschedules the cron job when all 48 teams are done.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireAdminOrServiceRole } from '../_shared/auth.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const TEAM_IDS: Record<string, number> = {
  'Argentina':              26,
  'Australia':              20,
  'Belgium':                 1,
  'Brazil':                  6,
  'Canada':               5529,
  'Croatia':                 3,
  'Ecuador':              2382,
  'England':                10,
  'France':                  2,
  'Germany':                25,
  'Ghana':                1504,
  'Iran':                   22,
  'Japan':                  12,
  'Mexico':                 16,
  'Morocco':                31,
  'Netherlands':          1118,
  'Portugal':               27,
  'Qatar':                1569,
  'Saudi Arabia':           23,
  'Senegal':                13,
  'Korea Republic':         17,
  'Spain':                   9,
  'Switzerland':            15,
  'Tunisia':                28,
  'USA':                  2384,
  'Uruguay':                 7,
  'Algeria':              1532,
  'Austria':               775,
  'Bosnia and Herzegovina': 1113,
  'Cape Verde':           1533,
  'Colombia':                8,
  'Czech Republic':        770,
  'Curaçao':             5530,
  'DR Congo':             1508,
  'Haiti':                2386,
  "Côte d'Ivoire":        1501,
  'Egypt':                  32,
  'Iraq':                 1567,
  'Jordan':               1548,
  'New Zealand':          4673,
  'Norway':               1090,
  'Panama':                 11,
  'Paraguay':             2380,
  'Scotland':             1108,
  'South Africa':         1531,
  'Sweden':                  5,
  'Turkey':                777,
  'Uzbekistan':           1568,
}

const ALL_TEAMS = Object.entries(TEAM_IDS)
const BATCH_SIZE = 8
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

Deno.serve(async (req) => {
  const authError = await requireAdminOrServiceRole(req)
  if (authError) return authError

  const url = new URL(req.url)
  const dryRun = url.searchParams.get('dry') === '1'

  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API_FOOTBALL_KEY not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Paginate through world_cup_football_players table — PostgREST server cap is 1000 rows per request
  const seededNames = new Set<string>()
  let totalRows = 0
  for (let from = 0; ; from += 1000) {
    const { data: page } = await supabase
      .from('world_cup_football_players')
      .select('team_name')
      .range(from, from + 999)
    if (!page || page.length === 0) break
    totalRows += page.length
    for (const r of page) seededNames.add(r.team_name)
    if (page.length < 1000) break
  }
  const remaining = ALL_TEAMS.filter(([name]) => !seededNames.has(name))

  if (dryRun) {
    return new Response(
      JSON.stringify({
        dryRun: true,
        totalRows,
        seededCount: seededNames.size,
        remainingTeams: remaining.map(([n]) => n),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (remaining.length === 0) {
    await supabase.rpc('unschedule_cron', { job_name: 'seed-players-initial' })
    return new Response(
      JSON.stringify({ ok: true, done: true, message: 'All 48 teams seeded. Cron job removed.' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const batch = remaining.slice(0, BATCH_SIZE)
  const upserts: object[] = []
  const warnings: string[] = []

  for (let i = 0; i < batch.length; i++) {
    const [teamName, teamId] = batch[i]
    if (i > 0) await sleep(7000) // stay within 10 req/min

    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
        { headers: { 'x-apisports-key': apiKey } }
      )
      const data = await res.json()

      if (data.errors && Object.keys(data.errors).length) {
        warnings.push(`${teamName}: ${JSON.stringify(data.errors)}`)
        continue
      }

      const players: any[] = data.response?.[0]?.players ?? []
      if (players.length === 0) {
        warnings.push(`${teamName}: no players returned`)
        continue
      }

      for (const p of players) {
        upserts.push({
          api_football_id: p.id,
          team_name:       teamName,
          player_name:     p.name,
          position:        p.position ?? null,
          shirt_number:    p.number   ?? null,
          photo_url:       p.photo    ?? null,
          updated_at:      new Date().toISOString(),
        })
      }
    } catch (err: any) {
      warnings.push(`${teamName}: ${err.message}`)
    }
  }

  let dbError: string | null = null
  if (upserts.length > 0) {
    const { error } = await supabase
      .from('world_cup_football_players')
      .upsert(upserts, { onConflict: 'api_football_id' })
    if (error) dbError = error.message
  }

  const teamsRemaining = remaining.length - batch.length

  return new Response(
    JSON.stringify({
      ok:             !dbError,
      done:           teamsRemaining === 0,
      teamsProcessed: batch.length,
      teamsRemaining,
      remainingTeams: remaining.map(([name]) => name),
      playersUpserted: upserts.length,
      dbError,
      warnings:       warnings.length ? warnings : undefined,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
