// Edge Function: backfill-match-events
// One-time run — fetches all WC 2026 matches from June 11 to yesterday
// and populates match_events table with goals, cards, substitutions.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const LEAGUE = 1
const SEASON = 2026

const TEAM_NORM: Record<string, string> = {
  'Mexico': 'Mexico', 'Canada': 'Canada', 'Brazil': 'Brazil', 'France': 'France',
  'Argentina': 'Argentina', 'Spain': 'Spain', 'Germany': 'Germany', 'Portugal': 'Portugal',
  'Netherlands': 'Netherlands', 'Belgium': 'Belgium', 'England': 'England', 'Croatia': 'Croatia',
  'Uruguay': 'Uruguay', 'Colombia': 'Colombia', 'Ecuador': 'Ecuador', 'Paraguay': 'Paraguay',
  'Morocco': 'Morocco', 'Senegal': 'Senegal', 'Egypt': 'Egypt', 'Ghana': 'Ghana',
  'Tunisia': 'Tunisia', 'Algeria': 'Algeria', 'Japan': 'Japan', 'Australia': 'Australia',
  'Norway': 'Norway', 'Sweden': 'Sweden', 'Austria': 'Austria', 'Switzerland': 'Switzerland',
  'Qatar': 'Qatar', 'Iran': 'Iran', 'Iraq': 'Iraq', 'Jordan': 'Jordan',
  'Saudi Arabia': 'Saudi Arabia', 'Uzbekistan': 'Uzbekistan', 'Panama': 'Panama',
  'Haiti': 'Haiti', 'Scotland': 'Scotland', 'New Zealand': 'New Zealand',
  'Cape Verde': 'Cape Verde', 'Cape Verde Islands': 'Cape Verde', 'DR Congo': 'DR Congo',
  'Korea Republic': 'Korea Republic', 'South Korea': 'Korea Republic',
  'Czechia': 'Czech Republic', 'Czech Republic': 'Czech Republic',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina', 'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Türkiye': 'Turkey', 'Turkey': 'Turkey',
  'Ivory Coast': "Côte d'Ivoire", "Côte d'Ivoire": "Côte d'Ivoire", "Cote d'Ivoire": "Côte d'Ivoire",
  'Curacao': 'Curaçao', 'Curaçao': 'Curaçao',
  'United States': 'USA', 'USA': 'USA',
  'South Africa': 'South Africa',
  'Democratic Republic of Congo': 'DR Congo', 'Congo DR': 'DR Congo', 'Congo, DR': 'DR Congo',
}

const SCHEDULE: { matchKey: string; home: string; away: string; kickoffUtc: string }[] = [
  { matchKey:'11-0', home:'Mexico',                      away:'South Africa',          kickoffUtc:'2026-06-11T19:00:00Z' },
  { matchKey:'11-1', home:'Korea Republic',              away:'Czech Republic',        kickoffUtc:'2026-06-12T02:00:00Z' },
  { matchKey:'12-0', home:'Canada',                      away:'Bosnia and Herzegovina',kickoffUtc:'2026-06-12T19:00:00Z' },
  { matchKey:'12-1', home:'Qatar',                       away:'Switzerland',           kickoffUtc:'2026-06-13T19:00:00Z' },
  { matchKey:'12-2', home:'USA',                         away:'Paraguay',              kickoffUtc:'2026-06-13T01:00:00Z' },
  { matchKey:'12-3', home:'Australia',                   away:'Turkey',                kickoffUtc:'2026-06-14T04:00:00Z' },
  { matchKey:'13-0', home:'Brazil',                      away:'Morocco',               kickoffUtc:'2026-06-13T22:00:00Z' },
  { matchKey:'13-1', home:'Haiti',                       away:'Scotland',              kickoffUtc:'2026-06-14T01:00:00Z' },
  { matchKey:'14-0', home:'Germany',                     away:'Curaçao',               kickoffUtc:'2026-06-14T17:00:00Z' },
  { matchKey:'14-1', home:"Côte d'Ivoire",               away:'Ecuador',               kickoffUtc:'2026-06-14T23:00:00Z' },
  { matchKey:'14-2', home:'Netherlands',                 away:'Japan',                 kickoffUtc:'2026-06-14T20:00:00Z' },
  { matchKey:'14-3', home:'Sweden',                      away:'Tunisia',               kickoffUtc:'2026-06-15T02:00:00Z' },
  { matchKey:'15-0', home:'Belgium',                     away:'Egypt',                 kickoffUtc:'2026-06-15T19:00:00Z' },
  { matchKey:'15-1', home:'Iran',                        away:'New Zealand',           kickoffUtc:'2026-06-16T01:00:00Z' },
  { matchKey:'15-2', home:'Spain',                       away:'Cape Verde',            kickoffUtc:'2026-06-15T16:00:00Z' },
  { matchKey:'15-3', home:'Saudi Arabia',                away:'Uruguay',               kickoffUtc:'2026-06-15T22:00:00Z' },
  { matchKey:'16-0', home:'France',                      away:'Senegal',               kickoffUtc:'2026-06-16T19:00:00Z' },
  { matchKey:'16-1', home:'Iraq',                        away:'Norway',                kickoffUtc:'2026-06-16T22:00:00Z' },
  { matchKey:'16-2', home:'Argentina',                   away:'Algeria',               kickoffUtc:'2026-06-17T01:00:00Z' },
  { matchKey:'16-3', home:'Austria',                     away:'Jordan',                kickoffUtc:'2026-06-17T04:00:00Z' },
  { matchKey:'17-0', home:'Portugal',                    away:'DR Congo',              kickoffUtc:'2026-06-17T17:00:00Z' },
  { matchKey:'17-1', home:'Uzbekistan',                  away:'Colombia',              kickoffUtc:'2026-06-18T02:00:00Z' },
  { matchKey:'17-2', home:'England',                     away:'Croatia',               kickoffUtc:'2026-06-17T20:00:00Z' },
  { matchKey:'17-3', home:'Ghana',                       away:'Panama',                kickoffUtc:'2026-06-17T23:00:00Z' },
  { matchKey:'18-0', home:'Czech Republic',              away:'South Africa',          kickoffUtc:'2026-06-18T16:00:00Z' },
  { matchKey:'18-1', home:'Mexico',                      away:'Korea Republic',        kickoffUtc:'2026-06-19T01:00:00Z' },
  { matchKey:'18-2', home:'Switzerland',                 away:'Bosnia and Herzegovina',kickoffUtc:'2026-06-18T19:00:00Z' },
  { matchKey:'18-3', home:'Canada',                      away:'Qatar',                 kickoffUtc:'2026-06-18T22:00:00Z' },
  { matchKey:'19-0', home:'Brazil',                      away:'Haiti',                 kickoffUtc:'2026-06-20T00:30:00Z' },
  { matchKey:'19-1', home:'Scotland',                    away:'Morocco',               kickoffUtc:'2026-06-19T22:00:00Z' },
  { matchKey:'19-2', home:'Turkey',                      away:'Paraguay',              kickoffUtc:'2026-06-20T03:00:00Z' },
  { matchKey:'19-3', home:'USA',                         away:'Australia',             kickoffUtc:'2026-06-19T19:00:00Z' },
  { matchKey:'20-0', home:'Germany',                     away:"Côte d'Ivoire",         kickoffUtc:'2026-06-20T20:00:00Z' },
  { matchKey:'20-1', home:'Ecuador',                     away:'Curaçao',               kickoffUtc:'2026-06-21T00:00:00Z' },
  { matchKey:'20-2', home:'Netherlands',                 away:'Sweden',                kickoffUtc:'2026-06-20T17:00:00Z' },
  { matchKey:'20-3', home:'Tunisia',                     away:'Japan',                 kickoffUtc:'2026-06-21T04:00:00Z' },
  { matchKey:'21-0', home:'Belgium',                     away:'Iran',                  kickoffUtc:'2026-06-21T19:00:00Z' },
  { matchKey:'21-1', home:'New Zealand',                 away:'Egypt',                 kickoffUtc:'2026-06-22T01:00:00Z' },
  { matchKey:'21-2', home:'Spain',                       away:'Saudi Arabia',          kickoffUtc:'2026-06-21T16:00:00Z' },
  { matchKey:'21-3', home:'Uruguay',                     away:'Cape Verde',            kickoffUtc:'2026-06-21T22:00:00Z' },
  { matchKey:'22-0', home:'France',                      away:'Iraq',                  kickoffUtc:'2026-06-22T21:00:00Z' },
  { matchKey:'22-1', home:'Norway',                      away:'Senegal',               kickoffUtc:'2026-06-23T00:00:00Z' },
  { matchKey:'22-2', home:'Argentina',                   away:'Austria',               kickoffUtc:'2026-06-22T17:00:00Z' },
  { matchKey:'22-3', home:'Jordan',                      away:'Algeria',               kickoffUtc:'2026-06-23T03:00:00Z' },
  { matchKey:'23-0', home:'Portugal',                    away:'Uzbekistan',            kickoffUtc:'2026-06-23T17:00:00Z' },
  { matchKey:'23-1', home:'Colombia',                    away:'DR Congo',              kickoffUtc:'2026-06-24T02:00:00Z' },
  { matchKey:'23-2', home:'England',                     away:'Ghana',                 kickoffUtc:'2026-06-23T20:00:00Z' },
  { matchKey:'23-3', home:'Panama',                      away:'Croatia',               kickoffUtc:'2026-06-23T23:00:00Z' },
  { matchKey:'24-0', home:'Czech Republic',              away:'Mexico',                kickoffUtc:'2026-06-25T01:00:00Z' },
  { matchKey:'24-1', home:'South Africa',                away:'Korea Republic',        kickoffUtc:'2026-06-25T01:00:00Z' },
  { matchKey:'24-2', home:'Switzerland',                 away:'Canada',                kickoffUtc:'2026-06-24T19:00:00Z' },
  { matchKey:'24-3', home:'Bosnia and Herzegovina',      away:'Qatar',                 kickoffUtc:'2026-06-24T19:00:00Z' },
  { matchKey:'24-4', home:'Scotland',                    away:'Brazil',                kickoffUtc:'2026-06-24T22:00:00Z' },
  { matchKey:'24-5', home:'Morocco',                     away:'Haiti',                 kickoffUtc:'2026-06-24T22:00:00Z' },
  { matchKey:'25-0', home:'Turkey',                      away:'USA',                   kickoffUtc:'2026-06-26T02:00:00Z' },
  { matchKey:'25-1', home:'Paraguay',                    away:'Australia',             kickoffUtc:'2026-06-26T02:00:00Z' },
  { matchKey:'25-2', home:'Ecuador',                     away:'Germany',               kickoffUtc:'2026-06-25T20:00:00Z' },
  { matchKey:'25-3', home:'Curaçao',                     away:"Côte d'Ivoire",         kickoffUtc:'2026-06-25T20:00:00Z' },
  { matchKey:'25-4', home:'Tunisia',                     away:'Netherlands',           kickoffUtc:'2026-06-25T23:00:00Z' },
  { matchKey:'25-5', home:'Japan',                       away:'Sweden',                kickoffUtc:'2026-06-25T23:00:00Z' },
  { matchKey:'25-6', home:'New Zealand',                 away:'Belgium',               kickoffUtc:'2026-06-27T03:00:00Z' },
  { matchKey:'25-7', home:'Egypt',                       away:'Iran',                  kickoffUtc:'2026-06-27T03:00:00Z' },
  { matchKey:'25-8', home:'Uruguay',                     away:'Spain',                 kickoffUtc:'2026-06-27T00:00:00Z' },
  { matchKey:'25-9', home:'Cape Verde',                  away:'Saudi Arabia',          kickoffUtc:'2026-06-27T00:00:00Z' },
  { matchKey:'26-0', home:'Norway',                      away:'France',                kickoffUtc:'2026-06-26T19:00:00Z' },
  { matchKey:'26-1', home:'Senegal',                     away:'Iraq',                  kickoffUtc:'2026-06-26T19:00:00Z' },
  { matchKey:'26-2', home:'Colombia',                    away:'Portugal',              kickoffUtc:'2026-06-27T23:30:00Z' },
  { matchKey:'26-3', home:'DR Congo',                    away:'Uzbekistan',            kickoffUtc:'2026-06-27T23:30:00Z' },
  { matchKey:'26-4', home:'Panama',                      away:'England',               kickoffUtc:'2026-06-27T21:00:00Z' },
  { matchKey:'26-5', home:'Croatia',                     away:'Ghana',                 kickoffUtc:'2026-06-27T21:00:00Z' },
  { matchKey:'27-0', home:'Jordan',                      away:'Argentina',             kickoffUtc:'2026-06-28T02:00:00Z' },
  { matchKey:'27-1', home:'Algeria',                     away:'Austria',               kickoffUtc:'2026-06-28T02:00:00Z' },
]

function normalizeTeam(name: string): string {
  return TEAM_NORM[name] ?? name
}

function findMatchKey(homeNorm: string, awayNorm: string): string | null {
  return SCHEDULE.find(m => m.home === homeNorm && m.away === awayNorm)?.matchKey ?? null
}

function dateRange(from: string, to: string): string[] {
  const dates: string[] = []
  const cur = new Date(from)
  const end = new Date(to)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
}

Deno.serve(async () => {
  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API_FOOTBALL_KEY not set' }), { status: 500 })
  }

  const now = new Date()
  const todayUtc = now.toISOString().slice(0, 10)
  const dates = dateRange('2026-06-11', todayUtc)

  console.log(`Backfilling dates: ${dates.join(', ')}`)

  let totalEvents = 0
  let totalMatches = 0
  const results: Record<string, number> = {}

  const debugDates: Record<string, any> = {}

  for (const date of dates) {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}&date=${date}`,
      { headers: { 'x-apisports-key': apiKey } }
    )

    if (!res.ok) {
      console.log(`[${date}] fetch failed: ${res.status}`)
      debugDates[date] = { error: `HTTP ${res.status}` }
      continue
    }

    const data = await res.json()
    const fixtures: any[] = data.response ?? []
    debugDates[date] = {
      fixtures: fixtures.length,
      errors: data.errors,
      sample: fixtures[0] ? {
        home: fixtures[0].teams?.home?.name,
        away: fixtures[0].teams?.away?.name,
        status: fixtures[0].fixture?.status?.short,
        eventsCount: fixtures[0].events?.length ?? 0,
      } : null,
    }
    console.log(`[${date}] ${fixtures.length} fixtures`)

    for (const f of fixtures) {
      const homeNorm = normalizeTeam(f.teams?.home?.name ?? '')
      const awayNorm = normalizeTeam(f.teams?.away?.name ?? '')
      const matchKey = findMatchKey(homeNorm, awayNorm)

      if (!matchKey) {
        console.log(`[${date}] NO MATCH KEY: ${homeNorm} vs ${awayNorm}`)
        continue
      }

      const fixtureId = f.fixture?.id
      if (!fixtureId) continue

      // Fetch events separat per meci
      await new Promise(r => setTimeout(r, 300))
      const evRes = await fetch(
        `https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`,
        { headers: { 'x-apisports-key': apiKey } }
      )
      if (!evRes.ok) {
        console.log(`[${matchKey}] events fetch failed: ${evRes.status}`)
        continue
      }
      const evData = await evRes.json()
      const events: any[] = evData.response ?? []

      const toUpsert = events
        .filter(e => e.player?.name)
        .map(e => ({
          match_key:    matchKey,
          minute:       e.time?.elapsed ?? null,
          extra_minute: e.time?.extra ?? null,
          team_name:    normalizeTeam(e.team?.name ?? ''),
          player_name:  e.player?.name ?? null,
          assist_name:  e.assist?.name ?? null,
          type:         e.type ?? null,
          detail:       e.detail ?? null,
          updated_at:   now.toISOString(),
        }))

      if (!toUpsert.length) {
        console.log(`[${matchKey}] 0 events`)
        continue
      }

      const { error } = await supabase
        .from('match_events')
        .upsert(toUpsert, { onConflict: 'match_key,minute,type,team_name' })

      if (error) {
        console.log(`[${matchKey}] upsert error: ${error.message}`)
      } else {
        totalEvents += toUpsert.length
        totalMatches++
        results[matchKey] = toUpsert.length
        console.log(`[${matchKey}] ${homeNorm} vs ${awayNorm}: ${toUpsert.length} events`)
      }
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    datesProcessed: dates.length,
    matchesProcessed: totalMatches,
    totalEvents,
    results,
    debug: debugDates,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
