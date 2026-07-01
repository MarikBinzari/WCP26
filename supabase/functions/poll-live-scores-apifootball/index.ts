// Edge Function: poll-live-scores-apifootball
// Manual trigger — fetches live/finished WC 2026 matches from api-sports.io
// and upserts into live_scores (same structure as poll-live-scores).
// Use when football-data.org is delayed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireAdminOrServiceRole } from '../_shared/auth.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const LEAGUE = 1
const SEASON = 2026

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
  { matchKey:'27-0', home:'Jordan',                      away:'Argentina',             kickoffUtc:'2026-06-28T02:00:00Z' },
  { matchKey:'27-1', home:'Algeria',                     away:'Austria',               kickoffUtc:'2026-06-28T02:00:00Z' },
  { matchKey:'27-2', home:'Colombia',                    away:'Portugal',              kickoffUtc:'2026-06-27T23:30:00Z' },
  { matchKey:'27-3', home:'DR Congo',                    away:'Uzbekistan',            kickoffUtc:'2026-06-27T23:30:00Z' },
  { matchKey:'27-4', home:'Panama',                      away:'England',               kickoffUtc:'2026-06-27T21:00:00Z' },
  { matchKey:'27-5', home:'Croatia',                     away:'Ghana',                 kickoffUtc:'2026-06-27T21:00:00Z' },
  // R32 — Round of 32
  { matchKey:'28-0', home:'South Africa',                away:'Canada',                kickoffUtc:'2026-06-28T19:00:00Z' },
  { matchKey:'29-0', home:'Germany',                     away:'Paraguay',              kickoffUtc:'2026-06-29T17:00:00Z' },
  { matchKey:'29-1', home:'Netherlands',                 away:'Morocco',               kickoffUtc:'2026-06-29T20:30:00Z' },
  { matchKey:'29-2', home:'Brazil',                      away:'Japan',                 kickoffUtc:'2026-06-30T01:00:00Z' },
  { matchKey:'30-0', home:'France',                      away:'Sweden',                kickoffUtc:'2026-06-30T17:00:00Z' },
  { matchKey:'30-1', home:"Côte d'Ivoire",               away:'Norway',                kickoffUtc:'2026-06-30T21:00:00Z' },
  { matchKey:'30-2', home:'Mexico',                      away:'Ecuador',               kickoffUtc:'2026-07-01T01:00:00Z' },
  { matchKey:'31-0', home:'England',                     away:'DR Congo',              kickoffUtc:'2026-07-01T16:00:00Z' },
  { matchKey:'31-1', home:'USA',                         away:'Bosnia and Herzegovina',kickoffUtc:'2026-07-01T20:00:00Z' },
  { matchKey:'31-2', home:'Belgium',                     away:'Senegal',               kickoffUtc:'2026-07-02T00:00:00Z' },
  { matchKey:'32-0', home:'Portugal',                    away:'Croatia',               kickoffUtc:'2026-07-02T19:00:00Z' },
  { matchKey:'32-1', home:'Spain',                       away:'Austria',               kickoffUtc:'2026-07-02T23:00:00Z' },
  { matchKey:'32-2', home:'Switzerland',                 away:'Algeria',               kickoffUtc:'2026-07-03T03:00:00Z' },
  { matchKey:'33-0', home:'Argentina',                   away:'Cape Verde',            kickoffUtc:'2026-07-03T22:00:00Z' },
  { matchKey:'33-1', home:'Colombia',                    away:'Ghana',                 kickoffUtc:'2026-07-04T01:30:00Z' },
  { matchKey:'33-2', home:'Australia',                   away:'Egypt',                 kickoffUtc:'2026-07-03T18:00:00Z' },
]

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
  'Cape Verde': 'Cape Verde', 'DR Congo': 'DR Congo',
  'South Korea': 'Korea Republic', 'Korea Republic': 'Korea Republic', 'Korea': 'Korea Republic',
  'Czechia': 'Czech Republic', 'Czech Republic': 'Czech Republic',
  'Bosnia': 'Bosnia and Herzegovina',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Turkey': 'Turkey', 'Turkiye': 'Turkey', 'Türkiye': 'Turkey',
  "Ivory Coast": "Côte d'Ivoire", "Côte d'Ivoire": "Côte d'Ivoire", "Cote d'Ivoire": "Côte d'Ivoire",
  'Curacao': 'Curaçao', 'Curaçao': 'Curaçao',
  'United States': 'USA', 'USA': 'USA', 'US': 'USA',
  'South Africa': 'South Africa',
  'Congo DR': 'DR Congo', 'Congo, DR': 'DR Congo',
  'Democratic Republic of Congo': 'DR Congo',
  'Scotland': 'Scotland',
}

// api-sports.io status → our status
function mapStatus(short: string): string {
  switch (short) {
    case '1H': case '2H': case 'LIVE': return 'LIVE'
    case 'HT': case 'BT': case 'INT': return 'HT'
    case 'ET': return 'ET'
    case 'P': return 'PEN'
    case 'FT': case 'AET': case 'AWD': case 'WO': return 'FT'
    case 'PEN': return 'FT'
    default: return 'NS'
  }
}

function normalizeTeam(name: string): string {
  return TEAM_NORM[name] ?? name
}

function findMatchKey(homeNorm: string, awayNorm: string): string | null {
  return SCHEDULE.find(m => m.home === homeNorm && m.away === awayNorm)?.matchKey ?? null
}

// Pentru KO — identificăm după kickoffUtc
function findKoMatchKey(utcDate: string): string | null {
  const matchMs = new Date(utcDate).getTime()
  const tbdSlots = SCHEDULE.filter(s => s.home === 'TBD' as any)
  let best: typeof SCHEDULE[0] | null = null
  let bestDiff = Infinity
  for (const slot of tbdSlots) {
    const diff = Math.abs(matchMs - new Date(slot.kickoffUtc).getTime())
    if (diff < bestDiff && diff <= 45 * 60000) { bestDiff = diff; best = slot }
  }
  return best?.matchKey ?? null
}

async function apiFetch(url: string, apiKey: string): Promise<any> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, { headers: { 'x-apisports-key': apiKey }, signal: ctrl.signal })
    const data = await res.json()
    return data
  } finally {
    clearTimeout(timer)
  }
}

Deno.serve(async (req) => {
  const authError = await requireAdminOrServiceRole(req)
  if (authError) return authError

  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API_FOOTBALL_KEY not set' }), { status: 500 })
  }

  const now = new Date()
  const todayUtc = now.toISOString().slice(0, 10)
  const yesterdayUtc = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10)

  let liveData: any, todayData: any, yesterdayData: any
  try {
    ;[liveData, todayData, yesterdayData] = await Promise.all([
      apiFetch(`https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}&live=all`, apiKey),
      apiFetch(`https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}&date=${todayUtc}`, apiKey),
      apiFetch(`https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}&date=${yesterdayUtc}`, apiKey),
    ])
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'API fetch failed', detail: err.message }), { status: 500 })
  }

  // Returnează erori API dacă există
  const apiErrors = { live: liveData?.errors, today: todayData?.errors, yesterday: yesterdayData?.errors }
  const hasErrors = Object.values(apiErrors).some(e => e && Object.keys(e).length)
  if (hasErrors) {
    return new Response(JSON.stringify({ error: 'API returned errors', apiErrors }), { status: 500 })
  }

  // Merge și deduplicăm după fixture.id (live > today > yesterday)
  const seenIds = new Set<number>()
  const allFixtures: any[] = []
  for (const f of [
    ...(liveData.response ?? []),
    ...(todayData.response ?? []),
    ...(yesterdayData.response ?? []),
  ]) {
    if (!seenIds.has(f.fixture.id)) {
      seenIds.add(f.fixture.id)
      allFixtures.push(f)
    }
  }

  const upserts: {
    match_key: string; status: string;
    regular_time_home_score: number | null; regular_time_away_score: number | null;
    penalty_home_score: number | null; penalty_away_score: number | null;
    api_minute: number | null; utc_date: string | null;
    raw_api_response: unknown; updated_at: string;
  }[] = []

  const notFound: string[] = []

  for (const f of allFixtures) {
    const homeNorm = normalizeTeam(f.teams.home.name ?? '')
    const awayNorm = normalizeTeam(f.teams.away.name ?? '')
    const statusShort: string = f.fixture.status.short ?? 'NS'

    let matchKey = findMatchKey(homeNorm, awayNorm)
    if (!matchKey && f.fixture.date) {
      matchKey = findKoMatchKey(f.fixture.date)
    }
    if (!matchKey) {
      notFound.push(`${f.teams.home.name} vs ${f.teams.away.name}`)
      continue
    }

    const mappedStatus = mapStatus(statusShort)

    // regular_time: goals.home/away (excludes penalties)
    // La AET/PEN folosim score.fulltime dacă disponibil (= scorul la 90')
    const isAfterRegular = statusShort === 'AET' || statusShort === 'PEN'
    const regularHome: number | null = isAfterRegular
      ? (f.score?.fulltime?.home ?? f.goals?.home ?? null)
      : (f.goals?.home ?? null)
    const regularAway: number | null = isAfterRegular
      ? (f.score?.fulltime?.away ?? f.goals?.away ?? null)
      : (f.goals?.away ?? null)

    const penHome: number | null = f.score?.penalty?.home ?? null
    const penAway: number | null = f.score?.penalty?.away ?? null

    const liveMin: number | null = (mappedStatus === 'LIVE' || mappedStatus === 'ET')
      ? (f.fixture.status.elapsed ?? null)
      : null

    upserts.push({
      match_key: matchKey,
      status: mappedStatus,
      regular_time_home_score: regularHome,
      regular_time_away_score: regularAway,
      penalty_home_score: penHome,
      penalty_away_score: penAway,
      api_minute: liveMin,
      utc_date: f.fixture.date ?? null,
      raw_api_response: f,
      updated_at: now.toISOString(),
    })
  }

  if (!upserts.length) {
    return new Response(JSON.stringify({
      ok: true, updated: 0, notFound,
      liveCount: liveData.response?.length ?? 0,
      todayCount: todayData.response?.length ?? 0,
      yesterdayCount: yesterdayData.response?.length ?? 0,
    }), { status: 200 })
  }

  const { error } = await supabase
    .from('live_scores')
    .upsert(upserts, { onConflict: 'match_key' })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // Cleanup: forțăm FT pe orice meci blocat ca LIVE în DB dar absent din API >150 min după kickoff
  const updatedKeys = new Set(upserts.map(u => u.match_key))
  const { data: staleLive } = await supabase
    .from('live_scores')
    .select('match_key, utc_date')
    .eq('status', 'LIVE')
  const staleFixed: string[] = []
  if (staleLive?.length) {
    const cutoff = new Date(now.getTime() - 150 * 60 * 1000) // 150 min ago
    const toFix = staleLive.filter(row =>
      !updatedKeys.has(row.match_key) &&
      row.utc_date &&
      new Date(row.utc_date) < cutoff
    )
    if (toFix.length) {
      await supabase
        .from('live_scores')
        .update({ status: 'FT', updated_at: now.toISOString() })
        .in('match_key', toFix.map(r => r.match_key))
      toFix.forEach(r => staleFixed.push(r.match_key))
    }
  }

  // Trigger scoring pentru FT
  const hasFt = upserts.some(u => u.status === 'FT') || staleFixed.length > 0
  const hasKoFt = upserts.some(u => {
    if (u.status !== 'FT') return false
    return parseInt(u.match_key.split('-')[0], 10) >= 28
  }) || staleFixed.some(k => parseInt(k.split('-')[0], 10) >= 28)
  if (hasKoFt) await supabase.rpc('apply_bracket_scores')
  if (hasFt) await supabase.rpc('apply_exact_scores')

  return new Response(JSON.stringify({
    ok: true,
    updated: upserts.length,
    matches: upserts.map(u => ({ key: u.match_key, status: u.status, score: `${u.regular_time_home_score}-${u.regular_time_away_score}` })),
    staleFixed: staleFixed.length ? staleFixed : undefined,
    notFound: notFound.length ? notFound : undefined,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
