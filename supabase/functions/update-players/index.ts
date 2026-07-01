// update-players — refreshes WC 2026 squads from api-sports.io
// Processes BATCH_SIZE teams per call, offset by ?offset=N (0, 8, 16, 24, 32, 40)
// Deletes old players for each team before inserting fresh data (removes duplicates)
// Scheduled daily via pg_cron in 6 batches × 5 min apart

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
  'Bosnia-Herzegovina':   1113,
  'Brazil':                  6,
  'Canada':               5529,
  'Cape Verde':           1533,
  'Colombia':                8,
  'Croatia':                 3,
  'Curacao':              5530,
  'Czech Republic':         770,
  'DR Congo':             1508,
  'Ecuador':              2382,
  'Egypt':                  32,
  'England':                10,
  'France':                  2,
  'Germany':                25,
  'Ghana':                1504,
  'Haiti':                2386,
  'Iran':                   22,
  'Iraq':                 1567,
  'Ivory Coast':          1501,
  'Japan':                  12,
  'Jordan':               1548,
  'Mexico':                 16,
  'Morocco':                31,
  'Netherlands':          1118,
  'New Zealand':          4673,
  'Norway':               1090,
  'Panama':                 11,
  'Paraguay':             2380,
  'Portugal':               27,
  'Qatar':                1569,
  'Saudi Arabia':           23,
  'Scotland':             1108,
  'Senegal':                13,
  'South Africa':         1531,
  'South Korea':            17,
  'Spain':                   9,
  'Sweden':                  5,
  'Switzerland':            15,
  'Tunisia':                28,
  'Turkiye':               777,
  'Uruguay':                 7,
  'USA':                  2384,
  'Uzbekistan':           1568,
  'Algeria':              1532,
  'Austria':               775,
}

const ALL_TEAMS = Object.entries(TEAM_IDS)
const BATCH_SIZE = 8
const DELAY_MS = 2500
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

Deno.serve(async (req) => {
  const authError = await requireAdminOrServiceRole(req)
  if (authError) return authError

  const url = new URL(req.url)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API_FOOTBALL_KEY not set' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  const batch = ALL_TEAMS.slice(offset, offset + BATCH_SIZE)
  if (batch.length === 0) {
    return new Response(JSON.stringify({ ok: true, done: true, message: 'offset out of range' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const inserts: object[] = []
  const processedTeams: string[] = []
  const warnings: string[] = []

  for (let i = 0; i < batch.length; i++) {
    const [teamName, teamId] = batch[i]
    if (i > 0) await sleep(DELAY_MS)

    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
        { headers: { 'x-apisports-key': apiKey }, signal: AbortSignal.timeout(8000) }
      )
      const data = await res.json()

      if (data.errors && Object.keys(data.errors).length) {
        warnings.push(`${teamName}: ${JSON.stringify(data.errors)}`)
        continue
      }

      const players: any[] = data.response?.[0]?.players ?? []
      if (players.length === 0) {
        warnings.push(`${teamName}: 0 players returned`)
        continue
      }

      processedTeams.push(teamName)
      for (const p of players) {
        inserts.push({
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

  let deleteError: string | null = null
  let insertError: string | null = null

  if (processedTeams.length > 0) {
    const { error: delErr } = await supabase
      .from('world_cup_football_players')
      .delete()
      .in('team_name', processedTeams)
    if (delErr) deleteError = delErr.message
  }

  if (inserts.length > 0 && !deleteError) {
    const { error: insErr } = await supabase
      .from('world_cup_football_players')
      .upsert(inserts, { onConflict: 'api_football_id' })
    if (insErr) insertError = insErr.message
  }

  const nextOffset = offset + BATCH_SIZE
  const done = nextOffset >= ALL_TEAMS.length

  return new Response(
    JSON.stringify({
      ok:              !deleteError && !insertError,
      offset,
      nextOffset:      done ? null : nextOffset,
      done,
      teamsProcessed:  processedTeams,
      playersInserted: inserts.length,
      deleteError,
      insertError,
      warnings:        warnings.length ? warnings : undefined,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
