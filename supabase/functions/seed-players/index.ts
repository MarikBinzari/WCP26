// Edge Function: seed-players
// One-time (or manual refresh) call — fetches all WC 2026 squads from
// football-data.org and upserts them into the public.players table.
// Trigger from Supabase Dashboard → Edge Functions → seed-players → Invoke,
// or from the Admin panel in the app.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// football-data.org team name → our app team name
const TEAM_NORM: Record<string, string> = {
  'Mexico': 'Mexico',
  'Canada': 'Canada',
  'Brazil': 'Brazil',
  'France': 'France',
  'Argentina': 'Argentina',
  'Spain': 'Spain',
  'Germany': 'Germany',
  'Portugal': 'Portugal',
  'Netherlands': 'Netherlands',
  'Belgium': 'Belgium',
  'England': 'England',
  'Croatia': 'Croatia',
  'Uruguay': 'Uruguay',
  'Colombia': 'Colombia',
  'Ecuador': 'Ecuador',
  'Paraguay': 'Paraguay',
  'Morocco': 'Morocco',
  'Senegal': 'Senegal',
  'Egypt': 'Egypt',
  'Ghana': 'Ghana',
  'Tunisia': 'Tunisia',
  'Algeria': 'Algeria',
  'Japan': 'Japan',
  'Australia': 'Australia',
  'Norway': 'Norway',
  'Sweden': 'Sweden',
  'Austria': 'Austria',
  'Switzerland': 'Switzerland',
  'Qatar': 'Qatar',
  'Iran': 'Iran',
  'Iraq': 'Iraq',
  'Jordan': 'Jordan',
  'Saudi Arabia': 'Saudi Arabia',
  'Uzbekistan': 'Uzbekistan',
  'Panama': 'Panama',
  'Haiti': 'Haiti',
  'Scotland': 'Scotland',
  'New Zealand': 'New Zealand',
  'Cape Verde': 'Cape Verde',
  'DR Congo': 'DR Congo',
  'South Africa': 'South Africa',
  'Korea Republic': 'Korea Republic',
  'South Korea': 'Korea Republic',
  'Czechia': 'Czech Republic',
  'Czech Republic': 'Czech Republic',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Türkiye': 'Turkey',
  'Turkey': 'Turkey',
  "Ivory Coast": "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Cote d'Ivoire": "Côte d'Ivoire",
  'Curacao': 'Curaçao',
  'Curaçao': 'Curaçao',
  'United States': 'USA',
  'USA': 'USA',
  'Democratic Republic of Congo': 'DR Congo',
  'Congo DR': 'DR Congo',
}

Deno.serve(async () => {
  const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'FOOTBALL_DATA_API_KEY not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // WC 2026 = competition id 2000; embed=SQUADS to get player lists
  const res = await fetch(
    'https://api.football-data.org/v4/competitions/2000/teams?season=2026',
    { headers: { 'X-Auth-Token': apiKey } }
  )

  if (!res.ok) {
    const text = await res.text()
    return new Response(
      JSON.stringify({ error: `API error ${res.status}`, body: text }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const data = await res.json()
  const teams: any[] = data.teams ?? []

  const upserts: {
    api_id: number | null
    team_name: string
    player_name: string
    position: string | null
    shirt_number: number | null
    date_of_birth: string | null
    nationality: string | null
    photo_url: string | null
    updated_at: string
  }[] = []

  for (const team of teams) {
    const teamName = TEAM_NORM[team.name] ?? team.name
    const squad: any[] = team.squad ?? []

    if (squad.length === 0) {
      console.warn(`No squad found for: ${team.name} (normalized: ${teamName})`)
      continue
    }

    for (const player of squad) {
      // Skip coaches / staff
      if (player.role === 'COACH' || player.position === 'Coach') continue

      upserts.push({
        api_id:        player.id ?? null,
        team_name:     teamName,
        player_name:   player.name,
        position:      player.position ?? null,
        shirt_number:  player.shirtNumber ?? null,
        date_of_birth: player.dateOfBirth ?? null,
        nationality:   player.nationality ?? null,
        photo_url:     player.photo ?? null,
        updated_at:    new Date().toISOString(),
      })
    }
  }

  if (upserts.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, warning: 'No players found — squads may not be published yet', teams: teams.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Upsert by api_id when available, else by (team_name, player_name)
  const withId    = upserts.filter(u => u.api_id !== null)
  const withoutId = upserts.filter(u => u.api_id === null)

  let totalSaved = 0
  let lastError: string | null = null

  if (withId.length) {
    const { error, count } = await supabase
      .from('players')
      .upsert(withId, { onConflict: 'api_id' })
    if (error) { lastError = error.message } else { totalSaved += withId.length }
  }

  if (withoutId.length) {
    const { error } = await supabase
      .from('players')
      .upsert(withoutId, { onConflict: 'team_name,player_name' })
    if (error) { lastError = lastError ?? error.message } else { totalSaved += withoutId.length }
  }

  if (lastError) {
    return new Response(
      JSON.stringify({ error: lastError }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ ok: true, teams: teams.length, players: totalSaved }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
