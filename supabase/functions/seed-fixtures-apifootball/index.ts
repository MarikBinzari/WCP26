// Edge Function: seed-fixtures-apifootball
// One-time fetch of all WC 2026 fixtures (104 matches) from API-Football
// 6 pages × 20 fixtures/page = all matches with venue, scores, teams, logos

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const LEAGUE = 1
const SEASON = 2026
const TOTAL_PAGES = 6

Deno.serve(async () => {
  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API_FOOTBALL_KEY not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const upserts: object[] = []
  const warnings: string[] = []

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    if (page > 1) await sleep(7000)

    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}&page=${page}`,
        { headers: { 'x-apisports-key': apiKey } }
      )
      const data = await res.json()

      if (data.errors && Object.keys(data.errors).length) {
        warnings.push(`Page ${page}: ${JSON.stringify(data.errors)}`)
        continue
      }

      const fixtures: any[] = data.response ?? []
      if (fixtures.length === 0) {
        warnings.push(`Page ${page}: no fixtures returned`)
        continue
      }

      for (const f of fixtures) {
        upserts.push({
          fixture_id:   f.fixture.id,
          utc_date:     f.fixture.date,
          status_short: f.fixture.status.short,
          status_long:  f.fixture.status.long,
          elapsed:      f.fixture.status.elapsed ?? null,
          venue_name:   f.fixture.venue?.name    ?? null,
          venue_city:   f.fixture.venue?.city    ?? null,
          round:        f.league.round,
          home_team_id: f.teams.home.id,
          home_team:    f.teams.home.name,
          home_logo:    f.teams.home.logo,
          away_team_id: f.teams.away.id,
          away_team:    f.teams.away.name,
          away_logo:    f.teams.away.logo,
          home_score:   f.goals.home   ?? null,
          away_score:   f.goals.away   ?? null,
          home_ht:      f.score.halftime.home  ?? null,
          away_ht:      f.score.halftime.away  ?? null,
          home_et:      f.score.extratime.home ?? null,
          away_et:      f.score.extratime.away ?? null,
          home_pen:     f.score.penalty.home   ?? null,
          away_pen:     f.score.penalty.away   ?? null,
          updated_at:   new Date().toISOString(),
        })
      }
    } catch (err: any) {
      warnings.push(`Page ${page}: ${err.message}`)
    }
  }

  if (upserts.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, message: 'No fixtures fetched', warnings }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabase
    .from('wc_fixtures')
    .upsert(upserts, { onConflict: 'fixture_id' })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      ok:       true,
      fixtures: upserts.length,
      warnings: warnings.length ? warnings : undefined,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
