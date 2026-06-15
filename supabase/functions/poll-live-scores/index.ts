// Edge Function: poll-live-scores
// Runs every 60s via pg_cron — fetches live/finished matches from football-data.org
// and upserts into live_scores table (Supabase Realtime pushes to all clients).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Tournament start: first match kickoff UTC
const TOURNAMENT_START = new Date('2026-06-11T19:00:00Z')

// ── Match schedule ────────────────────────────────────────────────────────────
// matchKey matches CALENDAR_EVENTS in worldcup2026.js: "${day}-${matchIdx}"
// kickoffUtc is authoritative; no ET conversion needed.
const SCHEDULE: { matchKey: string; kickoffUtc: string; home: string; away: string }[] = [
  // ── Etapa 1 ─────────────────────────────────────────────────────────────────
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
  // ── Etapa 2 ─────────────────────────────────────────────────────────────────
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
  // ── Etapa 3 ─────────────────────────────────────────────────────────────────
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
  // ── R32 (KO — echipe TBD) ────────────────────────────────────────────────────
  { matchKey:'28-0', home:'TBD', away:'TBD', kickoffUtc:'2026-06-28T23:00:00Z' },
  { matchKey:'29-0', home:'TBD', away:'TBD', kickoffUtc:'2026-06-29T20:00:00Z' },
  { matchKey:'29-1', home:'TBD', away:'TBD', kickoffUtc:'2026-06-29T23:00:00Z' },
  { matchKey:'29-2', home:'TBD', away:'TBD', kickoffUtc:'2026-06-29T21:00:00Z' },
  { matchKey:'30-0', home:'TBD', away:'TBD', kickoffUtc:'2026-06-30T21:00:00Z' },
  { matchKey:'30-1', home:'TBD', away:'TBD', kickoffUtc:'2026-06-30T21:00:00Z' },
  { matchKey:'30-2', home:'TBD', away:'TBD', kickoffUtc:'2026-06-30T23:00:00Z' },
  { matchKey:'31-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-01T20:00:00Z' },
  { matchKey:'31-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-02T00:00:00Z' },
  { matchKey:'31-2', home:'TBD', away:'TBD', kickoffUtc:'2026-07-02T00:00:00Z' },
  { matchKey:'32-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-02T23:00:00Z' },
  { matchKey:'32-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-02T23:00:00Z' },
  { matchKey:'32-2', home:'TBD', away:'TBD', kickoffUtc:'2026-07-03T00:00:00Z' },
  { matchKey:'33-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-03T22:00:00Z' },
  { matchKey:'33-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-04T00:30:00Z' },
  { matchKey:'33-2', home:'TBD', away:'TBD', kickoffUtc:'2026-07-03T23:00:00Z' },
  // ── R16 ─────────────────────────────────────────────────────────────────────
  { matchKey:'34-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-04T21:00:00Z' },
  { matchKey:'34-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-04T22:00:00Z' },
  { matchKey:'35-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-05T20:00:00Z' },
  { matchKey:'35-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-05T22:00:00Z' },
  { matchKey:'36-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-06T23:00:00Z' },
  { matchKey:'36-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-06T23:00:00Z' },
  { matchKey:'37-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-07T20:00:00Z' },
  { matchKey:'37-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-07T23:00:00Z' },
  // ── QF ──────────────────────────────────────────────────────────────────────
  { matchKey:'39-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-09T20:00:00Z' },
  { matchKey:'40-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-10T23:00:00Z' },
  { matchKey:'41-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-11T21:00:00Z' },
  { matchKey:'41-1', home:'TBD', away:'TBD', kickoffUtc:'2026-07-12T00:00:00Z' },
  // ── SF ──────────────────────────────────────────────────────────────────────
  { matchKey:'44-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-15T01:00:00Z' },
  { matchKey:'45-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-16T01:00:00Z' },
  // ── Locul 3 + Finală ─────────────────────────────────────────────────────────
  { matchKey:'48-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-19T01:00:00Z' },
  { matchKey:'49-0', home:'TBD', away:'TBD', kickoffUtc:'2026-07-20T01:00:00Z' },
]

// ── api-sports.io status → our status ────────────────────────────────────────
function mapApiSportsStatus(short: string): string {
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

// ── Team name normalization (football-data.org → our app) ────────────────────
const TEAM_NORM: Record<string, string> = {
  // Exact matches
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
  // Name variants
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function isInWindow(now: Date): boolean {
  const nowMs = now.getTime()
  return SCHEDULE.some(m => {
    const kickMs = new Date(m.kickoffUtc).getTime()
    const diffMin = (nowMs - kickMs) / 60000
    return diffMin >= -30 && diffMin <= 150
  })
}

function getActiveWindowMatchKeys(now: Date): string[] {
  const nowMs = now.getTime()
  return SCHEDULE
    .filter(m => {
      const kickMs = new Date(m.kickoffUtc).getTime()
      const diffMin = (nowMs - kickMs) / 60000
      return diffMin >= -30 && diffMin <= 150
    })
    .map(m => m.matchKey)
}

function findMatchKey(homeNorm: string, awayNorm: string): string | null {
  return SCHEDULE.find(m => m.home === homeNorm && m.away === awayNorm)?.matchKey ?? null
}

function findKoMatchKey(utcDateStr: string): string | null {
  if (!utcDateStr) return null
  const matchMs = new Date(utcDateStr).getTime()
  const tbdSlots = SCHEDULE.filter(s => s.home === 'TBD')
  let best: typeof SCHEDULE[0] | null = null
  let bestDiff = Infinity
  for (const slot of tbdSlots) {
    const diff = Math.abs(matchMs - new Date(slot.kickoffUtc).getTime())
    if (diff < bestDiff && diff <= 45 * 60000) {
      bestDiff = diff
      best = slot
    }
  }
  return best?.matchKey ?? null
}

function normalizeTeam(name: string): string {
  return TEAM_NORM[name] ?? name
}

function isCLFinalWindow(now: Date): boolean {
  const y = now.getUTCFullYear(), mo = now.getUTCMonth() + 1, d = now.getUTCDate()
  if (y !== 2026 || mo !== 5 || d !== 30) return false
  const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
  return utcMins >= 15 * 60 && utcMins <= 23 * 60
}

function mapMatchStatus(match: any, now: Date): string {
  const rawStatus = match.status
  const duration = match.score?.duration
  const rawStatusText = String(rawStatus ?? '').toUpperCase()
  const durationText = String(duration ?? '').toUpperCase()
  const elapsed = match.utcDate
    ? Math.floor((now.getTime() - new Date(match.utcDate).getTime()) / 60000)
    : null

  if (rawStatus === 'FINISHED' || rawStatus === 'AWARDED') return 'FT'
  if (rawStatusText.includes('PEN') || durationText.includes('PEN') || (elapsed != null && elapsed >= 120 && rawStatus !== 'FINISHED')) return 'PEN'
  if (rawStatusText.includes('EXTRA') || durationText.includes('EXTRA')) return 'ET'
  if (rawStatus === 'PAUSED') return elapsed != null && elapsed >= 105 ? 'ET' : 'HT'
  if (rawStatus === 'IN_PLAY') return elapsed != null && elapsed >= 105 ? 'ET' : 'LIVE'
  return 'NS'
}

function getLiveMinute(match: any, status: string): number | null {
  if (status !== 'LIVE' && status !== 'ET') return null
  if (match.minute != null) return match.minute + (match.injuryTime ?? 0)
  return null
}

function scorePair(score: any): { home: number; away: number } | null {
  return score?.home != null && score?.away != null
    ? { home: score.home, away: score.away }
    : null
}

function getApiScore(match: any): { home: number | null; away: number | null } {
  const score =
    scorePair(match.score?.regularTime) ??
    scorePair(match.score?.fullTime) ??
    scorePair(match.score?.extraTime) ??
    scorePair(match.score?.halfTime)
  return { home: score?.home ?? null, away: score?.away ?? null }
}

function getPenaltyScore(match: any, mappedStatus: string): { home: number | null; away: number | null } {
  const regular = scorePair(match.score?.regularTime)
  const full = scorePair(match.score?.fullTime)

  if (mappedStatus === 'FT' && regular && full && (full.home !== regular.home || full.away !== regular.away)) {
    return {
      home: Math.max(0, full.home - regular.home),
      away: Math.max(0, full.away - regular.away),
    }
  }

  const score =
    scorePair(match.score?.penalties) ??
    scorePair(match.score?.penaltyShootout)
  return { home: score?.home ?? null, away: score?.away ?? null }
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async () => {
  const now = new Date()

  const inWCWindow = isInWindow(now)
  const inCLWindow = isCLFinalWindow(now)

  if (!inWCWindow && !inCLWindow) {
    const { data: stillLive } = await supabase
      .from('live_scores')
      .select('match_key')
      .in('status', ['LIVE', 'HT', 'ET', 'PEN'])
      .limit(1)
    if (!stillLive?.length) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no active window' }), { status: 200 })
    }
  }

  const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'FOOTBALL_DATA_API_KEY not set' }), { status: 500 })
  }

  const upserts: {
    match_key: string; status: string;
    regular_time_home_score: number | null; regular_time_away_score: number | null;
    penalty_home_score: number | null; penalty_away_score: number | null;
    raw_api_response: unknown;
    api_minute: number | null; updated_at: string;
    utc_date: string | null;
    first_half_start?: string | null;
    second_half_start?: string | null;
  }[] = []

  const koTeamUpdates: { matchKey: string; home: string; away: string }[] = []

  // ── WC 2026 matches ────────────────────────────────────────────────────────
  if (inWCWindow || now >= TOURNAMENT_START) {
    const activeWindowKeys = getActiveWindowMatchKeys(now)

    // ── Primar: api-sports.io ─────────────────────────────────────────────────
    const apifbKey = Deno.env.get('API_FOOTBALL_KEY')
    if (apifbKey) {
      const todayUtc = now.toISOString().slice(0, 10)
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      try {
        const [liveRes, todayRes] = await Promise.all([
          fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026&live=all',
            { headers: { 'x-apisports-key': apifbKey }, signal: ctrl.signal }),
          fetch(`https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${todayUtc}`,
            { headers: { 'x-apisports-key': apifbKey }, signal: ctrl.signal }),
        ])
        clearTimeout(timer)

        if (liveRes.ok && todayRes.ok) {
          const liveData = await liveRes.json()
          const todayData = await todayRes.json()

          const seenIds = new Set<number>()
          const allFixtures: any[] = []
          for (const f of [...(liveData.response ?? []), ...(todayData.response ?? [])]) {
            if (!seenIds.has(f.fixture.id)) { seenIds.add(f.fixture.id); allFixtures.push(f) }
          }

          console.log(`[api-sports] live: ${liveData.response?.length ?? 0} | today: ${todayData.response?.length ?? 0} | total unique: ${allFixtures.length}`)

          for (const f of allFixtures) {
            const homeNorm = normalizeTeam(f.teams?.home?.name ?? '')
            const awayNorm = normalizeTeam(f.teams?.away?.name ?? '')
            const statusShort: string = f.fixture?.status?.short ?? 'NS'
            const matchKey = findMatchKey(homeNorm, awayNorm)

            if (!matchKey) {
              console.log(`[api-sports] NO MATCH KEY: ${homeNorm} vs ${awayNorm} | status: ${statusShort}`)
              continue
            }

            const mappedStatus = mapApiSportsStatus(statusShort)
            const isAfterRegular = statusShort === 'AET' || statusShort === 'PEN'
            const regularHome: number | null = isAfterRegular
              ? (f.score?.fulltime?.home ?? f.goals?.home ?? null)
              : (f.goals?.home ?? null)
            const regularAway: number | null = isAfterRegular
              ? (f.score?.fulltime?.away ?? f.goals?.away ?? null)
              : (f.goals?.away ?? null)

            console.log(`[api-sports] ${homeNorm} vs ${awayNorm} | status: ${statusShort}→${mappedStatus} | score: ${regularHome}-${regularAway} | min: ${f.fixture?.status?.elapsed}`)

            upserts.push({
              match_key: matchKey,
              status: mappedStatus,
              regular_time_home_score: regularHome,
              regular_time_away_score: regularAway,
              penalty_home_score: f.score?.penalty?.home ?? null,
              penalty_away_score: f.score?.penalty?.away ?? null,
              raw_api_response: f,
              api_minute: (mappedStatus === 'LIVE' || mappedStatus === 'ET')
                ? (f.fixture?.status?.elapsed ?? null) : null,
              utc_date: f.fixture?.date ?? null,
              updated_at: now.toISOString(),
            })
          }
        } else {
          console.log(`[api-sports] fetch failed: live=${liveRes.status} today=${todayRes.status}`)
        }
      } catch (e) {
        clearTimeout(timer)
        console.log(`[api-sports] error: ${e}`)
      }
    }

    // ── Fallback: football-data.org dacă api-sports.io n-a returnat nimic ────
    if (upserts.length === 0) {
      console.log('[fallback] using football-data.org')
      const res = await fetch(
        'https://api.football-data.org/v4/competitions/2000/matches?status=IN_PLAY,PAUSED,EXTRA_TIME,PENALTY_SHOOTOUT,FINISHED',
        { headers: { 'X-Auth-Token': apiKey } }
      )

      if (res.ok) {
        const data = await res.json()
        const apiMatches = data.matches ?? []
        console.log(`[fallback] API returned ${apiMatches.length} matches`)

        for (const m of apiMatches) {
          const homeNorm = normalizeTeam(m.homeTeam?.name ?? '')
          const awayNorm = normalizeTeam(m.awayTeam?.name ?? '')
          let matchKey = findMatchKey(homeNorm, awayNorm)

          if (!matchKey && m.utcDate) {
            const koKey = findKoMatchKey(m.utcDate)
            if (koKey) {
              matchKey = koKey
              koTeamUpdates.push({ matchKey: koKey, home: homeNorm, away: awayNorm })
            }
          }

          if (!matchKey) {
            console.log(`[fallback] NO MATCH KEY: ${homeNorm} vs ${awayNorm}`)
            continue
          }

          const status = mapMatchStatus(m, now)
          const apiScore = getApiScore(m)
          console.log(`[fallback] ${homeNorm} vs ${awayNorm} | status: ${status} | score: ${apiScore.home}-${apiScore.away}`)

          const penaltyScore = getPenaltyScore(m, status)
          const liveMin = getLiveMinute(m, status)

          upserts.push({
            match_key: matchKey,
            status,
            regular_time_home_score: apiScore.home,
            regular_time_away_score: apiScore.away,
            penalty_home_score: penaltyScore.home,
            penalty_away_score: penaltyScore.away,
            raw_api_response: m,
            api_minute: liveMin,
            utc_date: m.utcDate ?? null,
            updated_at: now.toISOString(),
          })
        }

        if (activeWindowKeys.length) {
          const seenKeys = new Set(upserts.map((u) => u.match_key))
          const missingActiveKeys = activeWindowKeys.filter((key) => !seenKeys.has(key))
          if (missingActiveKeys.length) {
            await supabase
              .from('live_scores')
              .update({
                status: 'NS',
                regular_time_home_score: null,
                regular_time_away_score: null,
                penalty_home_score: null,
                penalty_away_score: null,
                api_minute: null,
                raw_api_response: data,
                updated_at: now.toISOString(),
              })
              .in('match_key', missingActiveKeys)
              .in('status', ['LIVE', 'HT', 'ET', 'PEN'])
          }
        }
      }
    }
  }

  // ── UCL Final (May 30, 2026) ───────────────────────────────────────────────
  if (inCLWindow) {
    const clRes = await fetch(
      'https://api.football-data.org/v4/competitions/CL/matches?dateFrom=2026-05-30&dateTo=2026-05-30',
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (clRes.ok) {
      const clData = await clRes.json()
      const clMatches = clData.matches ?? []
      const final = clMatches.find((m: { stage?: string }) =>
        m.stage === 'FINAL' || clMatches.length === 1
      ) ?? clMatches[0]

      if (final) {
        const clStatus = mapMatchStatus(final, now)
        const clScore = getApiScore(final)
        const clPenaltyScore = getPenaltyScore(final, clStatus)
        const clMin = getLiveMinute(final, clStatus)

        upserts.push({
          match_key: '-1-0',
          status: clStatus,
          regular_time_home_score: clScore.home,
          regular_time_away_score: clScore.away,
          penalty_home_score: clPenaltyScore.home,
          penalty_away_score: clPenaltyScore.away,
          raw_api_response: final,
          api_minute: clMin,
          utc_date: final.utcDate ?? null,
          updated_at: now.toISOString(),
        })
      }
    }
  }

  // ── Actualizează team1_id / team2_id în matches pentru meciurile KO ─────────
  for (const upd of koTeamUpdates) {
    const { data: teamRows } = await supabase
      .from('teams')
      .select('id, name')
      .in('name', [upd.home, upd.away])
    if (!teamRows || teamRows.length < 2) continue
    const t1 = teamRows.find((t: { id: string; name: string }) => t.name === upd.home)
    const t2 = teamRows.find((t: { id: string; name: string }) => t.name === upd.away)
    if (!t1 || !t2) continue
    await supabase
      .from('matches')
      .update({ team1_id: t1.id, team2_id: t2.id })
      .eq('match_key', upd.matchKey)
      .is('team1_id', null)
  }

  if (upserts.length) {
    const scoreKeysToProtect = upserts
      .filter(row =>
        row.regular_time_home_score == null ||
        row.regular_time_away_score == null ||
        row.penalty_home_score != null ||
        row.penalty_away_score != null
      )
      .map(row => row.match_key)

    if (scoreKeysToProtect.length) {
      const { data: previousScores } = await supabase
        .from('live_scores')
        .select('match_key, regular_time_home_score, regular_time_away_score, penalty_home_score, penalty_away_score')
        .in('match_key', scoreKeysToProtect)

      const previousByKey = new Map(
        (previousScores ?? []).map((row: {
          match_key: string;
          regular_time_home_score: number | null;
          regular_time_away_score: number | null;
          penalty_home_score: number | null;
          penalty_away_score: number | null;
        }) => [row.match_key, row])
      )

      for (const row of upserts) {
        const previous = previousByKey.get(row.match_key)
        const hasApiPenalty = row.penalty_home_score != null || row.penalty_away_score != null
        if (previous?.regular_time_home_score != null && previous?.regular_time_away_score != null) {
          if (hasApiPenalty || row.regular_time_home_score == null || row.regular_time_away_score == null) {
            row.regular_time_home_score = previous.regular_time_home_score
            row.regular_time_away_score = previous.regular_time_away_score
          }
        }
        if (previous?.penalty_home_score != null && previous?.penalty_away_score != null) {
          row.penalty_home_score = previous.penalty_home_score
          row.penalty_away_score = previous.penalty_away_score
        }
      }
    }

    const { error } = await supabase.from('live_scores').upsert(upserts, { onConflict: 'match_key' })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    const ftGroupMatchKeys = upserts
      .filter(u => u.status === 'FT')
      .map(u => u.match_key)

    if (ftGroupMatchKeys.length > 0) {
      const { data: ftGroupData } = await supabase
        .from('matches')
        .select('group_id')
        .in('match_key', ftGroupMatchKeys)
        .eq('stage', 'group')
        .not('group_id', 'is', null)

      const affectedGroups = [...new Set(
        (ftGroupData ?? []).map((m: { group_id: string }) => m.group_id)
      )]

      for (const gid of affectedGroups) {
        const { data: groupKeys } = await supabase
          .from('matches')
          .select('match_key')
          .eq('stage', 'group')
          .eq('group_id', gid)

        const allKeys = (groupKeys ?? []).map((m: { match_key: string }) => m.match_key)

        const { count: ftCount } = await supabase
          .from('live_scores')
          .select('match_key', { count: 'exact', head: true })
          .in('match_key', allKeys)
          .eq('status', 'FT')

        if (ftCount === allKeys.length && allKeys.length > 0) {
          await supabase.rpc('apply_bracket_scores')
          await supabase.rpc('apply_exact_scores')
          break
        }
      }
    }

    const hasNewFt = upserts.some(u => u.status === 'FT')
    const hasNewKoFt = upserts.some(u => {
      if (u.status !== 'FT') return false
      const dayNum = parseInt(u.match_key.split('-')[0], 10)
      return dayNum >= 28
    })

    if (hasNewKoFt) {
      await supabase.rpc('apply_bracket_scores')
    }

    if (hasNewFt) {
      await supabase.rpc('apply_exact_scores')
    }
  }

  console.log(`[poll] done | upserts: ${upserts.length} | wcWindow: ${inWCWindow} | clWindow: ${inCLWindow}`)

  return new Response(JSON.stringify({
    ok: true,
    updated: upserts.length,
    clWindow: inCLWindow,
    wcWindow: inWCWindow,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
