// Edge Function: poll-live-scores
// Runs every 60s via pg_cron — fetches live/finished matches from football-data.org
// and upserts into live_scores table (Supabase Realtime pushes to all clients).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ── Match schedule (derived from CALENDAR_EVENTS) ────────────────────────────
// Day encoding: June N = day N, July N = day N+30
// match_key = "${day}-${matchIdx}"
// Times are ET (Eastern Time, UTC-4 during summer)
const SCHEDULE: Record<number, { idx: number; home: string; away: string; timeET: string }[]> = {
  11: [
    { idx:0, home:'Mexico',            away:'South Africa',          timeET:'20:00' },
    { idx:1, home:'Korea Republic',    away:'Czech Republic',        timeET:'23:00' },
  ],
  12: [
    { idx:0, home:'Canada',            away:'Bosnia and Herzegovina',timeET:'13:00' },
    { idx:1, home:'Qatar',             away:'Switzerland',           timeET:'16:00' },
    { idx:2, home:'USA',               away:'Paraguay',              timeET:'19:00' },
    { idx:3, home:'Australia',         away:'Turkey',                timeET:'22:00' },
  ],
  13: [
    { idx:0, home:'Brazil',            away:'Morocco',               timeET:'16:00' },
    { idx:1, home:'Haiti',             away:'Scotland',              timeET:'20:00' },
  ],
  14: [
    { idx:0, home:'Germany',           away:'Curaçao',               timeET:'13:00' },
    { idx:1, home:'Côte d\'Ivoire',    away:'Ecuador',               timeET:'16:00' },
    { idx:2, home:'Netherlands',       away:'Japan',                 timeET:'19:00' },
    { idx:3, home:'Sweden',            away:'Tunisia',               timeET:'22:00' },
  ],
  15: [
    { idx:0, home:'Belgium',           away:'Egypt',                 timeET:'13:00' },
    { idx:1, home:'Iran',              away:'New Zealand',           timeET:'16:00' },
    { idx:2, home:'Spain',             away:'Cape Verde',            timeET:'19:00' },
    { idx:3, home:'Saudi Arabia',      away:'Uruguay',               timeET:'22:00' },
  ],
  16: [
    { idx:0, home:'France',            away:'Senegal',               timeET:'13:00' },
    { idx:1, home:'Iraq',              away:'Norway',                timeET:'16:00' },
    { idx:2, home:'Argentina',         away:'Algeria',               timeET:'19:00' },
    { idx:3, home:'Austria',           away:'Jordan',                timeET:'22:00' },
  ],
  17: [
    { idx:0, home:'Portugal',          away:'DR Congo',              timeET:'13:00' },
    { idx:1, home:'Uzbekistan',        away:'Colombia',              timeET:'16:00' },
    { idx:2, home:'England',           away:'Croatia',               timeET:'19:00' },
    { idx:3, home:'Ghana',             away:'Panama',                timeET:'22:00' },
  ],
  18: [
    { idx:0, home:'Czech Republic',    away:'South Africa',          timeET:'13:00' },
    { idx:1, home:'Mexico',            away:'Korea Republic',        timeET:'16:00' },
    { idx:2, home:'Switzerland',       away:'Bosnia and Herzegovina',timeET:'19:00' },
    { idx:3, home:'Canada',            away:'Qatar',                 timeET:'22:00' },
  ],
  19: [
    { idx:0, home:'Brazil',            away:'Haiti',                 timeET:'13:00' },
    { idx:1, home:'Scotland',          away:'Morocco',               timeET:'16:00' },
    { idx:2, home:'Turkey',            away:'Paraguay',              timeET:'19:00' },
    { idx:3, home:'USA',               away:'Australia',             timeET:'22:00' },
  ],
  20: [
    { idx:0, home:'Germany',           away:'Côte d\'Ivoire',        timeET:'13:00' },
    { idx:1, home:'Ecuador',           away:'Curaçao',               timeET:'16:00' },
    { idx:2, home:'Netherlands',       away:'Sweden',                timeET:'19:00' },
    { idx:3, home:'Tunisia',           away:'Japan',                 timeET:'22:00' },
  ],
  21: [
    { idx:0, home:'Belgium',           away:'Iran',                  timeET:'13:00' },
    { idx:1, home:'New Zealand',       away:'Egypt',                 timeET:'16:00' },
    { idx:2, home:'Spain',             away:'Saudi Arabia',          timeET:'19:00' },
    { idx:3, home:'Uruguay',           away:'Cape Verde',            timeET:'22:00' },
  ],
  22: [
    { idx:0, home:'France',            away:'Iraq',                  timeET:'13:00' },
    { idx:1, home:'Norway',            away:'Senegal',               timeET:'16:00' },
    { idx:2, home:'Argentina',         away:'Austria',               timeET:'19:00' },
    { idx:3, home:'Jordan',            away:'Algeria',               timeET:'22:00' },
  ],
  23: [
    { idx:0, home:'Portugal',          away:'Uzbekistan',            timeET:'13:00' },
    { idx:1, home:'Colombia',          away:'DR Congo',              timeET:'16:00' },
    { idx:2, home:'England',           away:'Ghana',                 timeET:'19:00' },
    { idx:3, home:'Panama',            away:'Croatia',               timeET:'22:00' },
  ],
  24: [
    { idx:0, home:'Czech Republic',    away:'Mexico',                timeET:'15:00' },
    { idx:1, home:'South Africa',      away:'Korea Republic',        timeET:'15:00' },
    { idx:2, home:'Switzerland',       away:'Canada',                timeET:'19:00' },
    { idx:3, home:'Bosnia and Herzegovina', away:'Qatar',            timeET:'19:00' },
    { idx:4, home:'Scotland',          away:'Brazil',                timeET:'19:00' },
    { idx:5, home:'Morocco',           away:'Haiti',                 timeET:'19:00' },
  ],
  25: [
    { idx:0, home:'Turkey',            away:'USA',                   timeET:'15:00' },
    { idx:1, home:'Paraguay',          away:'Australia',             timeET:'15:00' },
    { idx:2, home:'Ecuador',           away:'Germany',               timeET:'15:00' },
    { idx:3, home:'Curaçao',           away:'Côte d\'Ivoire',        timeET:'15:00' },
    { idx:4, home:'Tunisia',           away:'Netherlands',           timeET:'19:00' },
    { idx:5, home:'Japan',             away:'Sweden',                timeET:'19:00' },
    { idx:6, home:'New Zealand',       away:'Belgium',               timeET:'19:00' },
    { idx:7, home:'Egypt',             away:'Iran',                  timeET:'19:00' },
    { idx:8, home:'Uruguay',           away:'Spain',                 timeET:'19:00' },
    { idx:9, home:'Cape Verde',        away:'Saudi Arabia',          timeET:'19:00' },
  ],
  26: [
    { idx:0, home:'Norway',            away:'France',                timeET:'15:00' },
    { idx:1, home:'Senegal',           away:'Iraq',                  timeET:'15:00' },
  ],
  27: [
    { idx:0, home:'Jordan',            away:'Argentina',             timeET:'19:00' },
    { idx:1, home:'Algeria',           away:'Austria',               timeET:'19:00' },
    { idx:2, home:'Colombia',          away:'Portugal',              timeET:'19:00' },
    { idx:3, home:'DR Congo',          away:'Uzbekistan',            timeET:'19:00' },
    { idx:4, home:'Panama',            away:'England',               timeET:'19:00' },
    { idx:5, home:'Croatia',           away:'Ghana',                 timeET:'19:00' },
  ],
  // R32 (Jun 28 - Jul 3) — teams TBD for KO, keys needed for window detection
  28: [{ idx:0, home:'TBD', away:'TBD', timeET:'19:00' }],
  29: [{ idx:0, home:'TBD', away:'TBD', timeET:'16:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'19:00' }, { idx:2, home:'TBD', away:'TBD', timeET:'17:00' }],
  30: [{ idx:0, home:'TBD', away:'TBD', timeET:'17:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'17:00' }, { idx:2, home:'TBD', away:'TBD', timeET:'19:00' }],
  31: [{ idx:0, home:'TBD', away:'TBD', timeET:'16:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'20:00' }, { idx:2, home:'TBD', away:'TBD', timeET:'20:00' }],
  32: [{ idx:0, home:'TBD', away:'TBD', timeET:'19:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'19:00' }, { idx:2, home:'TBD', away:'TBD', timeET:'20:00' }],
  33: [{ idx:0, home:'TBD', away:'TBD', timeET:'18:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'20:30' }, { idx:2, home:'TBD', away:'TBD', timeET:'19:00' }],
  // R16 (Jul 4-7)
  34: [{ idx:0, home:'TBD', away:'TBD', timeET:'17:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'18:00' }],
  35: [{ idx:0, home:'TBD', away:'TBD', timeET:'16:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'18:00' }],
  36: [{ idx:0, home:'TBD', away:'TBD', timeET:'19:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'19:00' }],
  37: [{ idx:0, home:'TBD', away:'TBD', timeET:'16:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'19:00' }],
  // QF (Jul 9-11)
  39: [{ idx:0, home:'TBD', away:'TBD', timeET:'16:00' }],
  40: [{ idx:0, home:'TBD', away:'TBD', timeET:'19:00' }],
  41: [{ idx:0, home:'TBD', away:'TBD', timeET:'17:00' }, { idx:1, home:'TBD', away:'TBD', timeET:'20:00' }],
  // SF (Jul 14-15)
  44: [{ idx:0, home:'TBD', away:'TBD', timeET:'21:00' }],
  45: [{ idx:0, home:'TBD', away:'TBD', timeET:'21:00' }],
  // 3rd place (Jul 18) + Final (Jul 19)
  48: [{ idx:0, home:'TBD', away:'TBD', timeET:'21:00' }],
  49: [{ idx:0, home:'TBD', away:'TBD', timeET:'21:00' }],
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
  'Cape Verde': 'Cape Verde', 'DR Congo': 'DR Congo',
  // Name variants
  'Korea Republic': 'Korea Republic', 'South Korea': 'Korea Republic',
  'Czechia': 'Czech Republic', 'Czech Republic': 'Czech Republic',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina', 'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Türkiye': 'Turkey', 'Turkey': 'Turkey',
  'Ivory Coast': 'Côte d\'Ivoire', "Côte d'Ivoire": 'Côte d\'Ivoire', 'Cote d\'Ivoire': 'Côte d\'Ivoire',
  'Curacao': 'Curaçao', 'Curaçao': 'Curaçao',
  'United States': 'USA', 'USA': 'USA',
  'South Africa': 'South Africa',
  'Democratic Republic of Congo': 'DR Congo', 'Congo DR': 'DR Congo', 'Congo, DR': 'DR Congo',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDayNum(date: Date): number {
  // Use ET (UTC-4) to determine match day
  const etMs = date.getTime() - 4 * 60 * 60 * 1000
  const et = new Date(etMs)
  const month = et.getUTCMonth() + 1
  const day = et.getUTCDate()
  if (month === 6) return day
  if (month === 7) return day + 30
  return -1
}

function isInWindow(dayNum: number, now: Date): boolean {
  const matches = SCHEDULE[dayNum]
  if (!matches) return false
  const etMs = now.getTime() - 4 * 60 * 60 * 1000
  const et = new Date(etMs)
  const etHour = et.getUTCHours()
  const etMin = et.getUTCMinutes()
  const nowMins = etHour * 60 + etMin
  for (const m of matches) {
    const [h, mn] = m.timeET.split(':').map(Number)
    const kickoffMins = h * 60 + mn
    if (nowMins >= kickoffMins - 30 && nowMins <= kickoffMins + 150) return true
  }
  return false
}

function findMatchKey(homeNorm: string, awayNorm: string): string | null {
  for (const [day, matches] of Object.entries(SCHEDULE)) {
    for (const m of matches) {
      if (m.home === homeNorm && m.away === awayNorm) {
        return `${day}-${m.idx}`
      }
    }
  }
  return null
}

function normalizeTeam(name: string): string {
  return TEAM_NORM[name] ?? name
}

// ── CL Final window check (May 30, 2026 · 16:00–21:00 UTC = 18:00–23:00 CEST) ─
function isCLFinalWindow(now: Date): boolean {
  const y = now.getUTCFullYear(), mo = now.getUTCMonth() + 1, d = now.getUTCDate()
  if (y !== 2026 || mo !== 5 || d !== 30) return false
  const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
  return utcMins >= 15 * 60 && utcMins <= 21 * 60   // 15:00–21:00 UTC
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async () => {
  const now = new Date()
  const dayNum = getDayNum(now)

  const inWCWindow = isInWindow(dayNum, now)
  const inCLWindow = isCLFinalWindow(now)

  if (!inWCWindow && !inCLWindow) {
    // Still poll if there are LIVE matches in DB (handles extra time / delays)
    const { data: stillLive } = await supabase
      .from('live_scores')
      .select('match_key')
      .eq('status', 'LIVE')
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
    home_score: number | null; away_score: number | null;
    live_min: number | null; updated_at: string
  }[] = []

  // ── WC 2026 matches ────────────────────────────────────────────────────────
  if (inWCWindow || (dayNum >= 11)) {
    const res = await fetch(
      'https://api.football-data.org/v4/competitions/2000/matches?status=IN_PLAY,PAUSED,EXTRA_TIME,PENALTY_SHOOTOUT,FINISHED',
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (res.ok) {
      const data = await res.json()
      const apiMatches = data.matches ?? []

      for (const m of apiMatches) {
        const homeNorm = normalizeTeam(m.homeTeam?.name ?? '')
        const awayNorm = normalizeTeam(m.awayTeam?.name ?? '')
        const matchKey = findMatchKey(homeNorm, awayNorm)
        if (!matchKey) continue

        let status = 'NS'
        if (m.status === 'FINISHED' || m.status === 'AWARDED') status = 'FT'
        else if (m.status === 'PAUSED') status = 'HT'
        else if (['IN_PLAY', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(m.status)) status = 'LIVE'

        const homeScore = m.score?.fullTime?.home ?? null
        const awayScore = m.score?.fullTime?.away ?? null

        let liveMin: number | null = null
        if (status === 'LIVE' && m.utcDate) {
          liveMin = Math.max(1, Math.min(90, Math.floor((now.getTime() - new Date(m.utcDate).getTime()) / 60000)))
        }

        upserts.push({
          match_key: matchKey,
          status,
          home_score: homeScore,
          away_score: awayScore,
          live_min: liveMin,
          updated_at: now.toISOString(),
        })
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
      // The final is the only CL match on this date
      const final = clMatches.find((m: { stage?: string }) =>
        m.stage === 'FINAL' || clMatches.length === 1
      ) ?? clMatches[0]

      if (final) {
        let clStatus = 'NS'
        if (final.status === 'FINISHED' || final.status === 'AWARDED') clStatus = 'FT'
        else if (final.status === 'PAUSED') clStatus = 'HT'
        else if (['IN_PLAY', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(final.status)) clStatus = 'LIVE'

        const clHome = final.score?.fullTime?.home ?? final.score?.regularTime?.home ?? null
        const clAway = final.score?.fullTime?.away ?? final.score?.regularTime?.away ?? null

        // Compute minute from utcDate (timezone-independent, works for free tier)
        let clMin: number | null = null
        if (clStatus === 'LIVE' && final.utcDate) {
          clMin = Math.max(1, Math.min(90, Math.floor((now.getTime() - new Date(final.utcDate).getTime()) / 60000)))
        }

        upserts.push({
          match_key: '-1-0',
          status: clStatus,
          home_score: clHome,
          away_score: clAway,
          live_min: clMin,
          updated_at: now.toISOString(),
        })
      }
    }
  }

  if (upserts.length) {
    const { error } = await supabase.from('live_scores').upsert(upserts, { onConflict: 'match_key' })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

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
