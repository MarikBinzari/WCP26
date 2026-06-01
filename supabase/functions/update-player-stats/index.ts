// Edge Function: update-player-stats
//
// Daily update — called once per match day during the tournament.
// Fetches WC 2026 player statistics (goals, assists, cards, minutes, rating)
// from API-Football for every team playing today, then upserts into the
// world_cup_football_players table so the app can display real-time Top Scorers / Dream Team.
//
// Rate limit: 10 req/min (free tier). Max teams per day = 8 (4 matches × 2).
// With a 7-second gap between requests this completes in under 60 seconds.
//
// Trigger: call this function once after the last match of the day finishes,
// or set a pg_cron / Supabase scheduler at e.g. 23:30 UTC on match days.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Our app team name → API-Football team ID (same map as seed function)
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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

Deno.serve(async (req) => {
  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API_FOOTBALL_KEY not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Allow manual override of date via body param (for testing)
  const body      = await req.json().catch(() => ({}))
  const targetDate = body.date ?? new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

  // 1. Find which teams play today
  const { data: matchRows, error: matchErr } = await supabase
    .from('matches')
    .select(`
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name),
      match_days!inner(match_date)
    `)
    .eq('match_days.match_date', targetDate)

  if (matchErr) {
    return new Response(
      JSON.stringify({ error: `DB error: ${matchErr.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Collect unique team names playing today
  const teamNamesSet = new Set<string>()
  for (const row of matchRows ?? []) {
    if (row.team1?.name) teamNamesSet.add(row.team1.name)
    if (row.team2?.name) teamNamesSet.add(row.team2.name)
  }
  const teamNames = [...teamNamesSet]

  if (teamNames.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, date: targetDate, message: 'No matches today', updated: 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Fetch WC 2026 stats for each team
  const upserts: {
    api_football_id: number
    team_name:       string
    player_name:     string
    nationality:     string | null
    position:        string | null
    photo_url:       string | null
    height:          string | null
    weight:          string | null
    goals:           number
    assists:         number
    yellow_cards:    number
    red_cards:       number
    minutes_played:  number
    rating:          number | null
    appearances:     number
    updated_at:      string
  }[] = []

  const warnings: string[] = []

  for (let i = 0; i < teamNames.length; i++) {
    const teamName = teamNames[i]
    const teamId   = TEAM_IDS[teamName]

    if (!teamId) {
      warnings.push(`No API-Football ID for team: ${teamName}`)
      continue
    }

    if (i > 0) await sleep(7000)

    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/players?league=1&season=2026&team=${teamId}`,
        { headers: { 'x-apisports-key': apiKey } }
      )
      const data = await res.json()

      if (data.errors && Object.keys(data.errors).length) {
        warnings.push(`${teamName}: ${JSON.stringify(data.errors)}`)
        continue
      }

      const players: any[] = data.response ?? []
      if (players.length === 0) {
        warnings.push(`${teamName}: no stats yet for WC 2026`)
        continue
      }

      for (const entry of players) {
        const p  = entry.player
        const st = entry.statistics?.[0]
        if (!p || !st) continue

        upserts.push({
          api_football_id: p.id,
          team_name:       teamName,
          player_name:     p.name,
          nationality:     p.nationality  ?? null,
          position:        st.games?.position ?? null,
          photo_url:       p.photo         ?? null,
          height:          p.height != null ? String(p.height) : null,
          weight:          p.weight != null ? String(p.weight) : null,
          goals:           st.goals?.total   ?? 0,
          assists:         st.goals?.assists ?? 0,
          yellow_cards:    st.cards?.yellow  ?? 0,
          red_cards:       st.cards?.red     ?? 0,
          minutes_played:  st.games?.minutes ?? 0,
          rating:          st.games?.rating  ? parseFloat(st.games.rating) : null,
          appearances:     st.games?.appearences ?? 0,
          updated_at:      new Date().toISOString(),
        })
      }
    } catch (err: any) {
      warnings.push(`${teamName}: fetch error — ${err.message}`)
    }
  }

  if (upserts.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, date: targetDate, teams: teamNames, updated: 0, warnings }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { error: upsertError } = await supabase
    .from('world_cup_football_players')
    .upsert(upserts, { onConflict: 'api_football_id' })

  return new Response(
    JSON.stringify({
      ok:       !upsertError,
      date:     targetDate,
      teams:    teamNames,
      updated:  upserts.length,
      warnings: warnings.length ? warnings : undefined,
      error:    upsertError?.message,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
