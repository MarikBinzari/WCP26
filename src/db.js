import { supabase } from './supabase.js'

// ─── MATCH KEY → ID MAP (cached) ─────────────────────────────────────────────
let _matchKeyMap = null
async function getMatchKeyMap() {
  if (_matchKeyMap) return _matchKeyMap
  const { data } = await supabase.from('matches').select('id, match_key')
  _matchKeyMap = {}
  ;(data || []).forEach(m => { _matchKeyMap[m.match_key] = m.id })
  return _matchKeyMap
}

// ─── SCORING RULES ────────────────────────────────────────────────────────────
export async function fetchScoringRules() {
  const { data } = await supabase
    .from('scoring_rules')
    .select('*')
    .order('sort_order')
  const rules = { prediction: {}, exact_score: {} }
  ;(data || []).forEach(r => { rules[r.type][r.phase] = r.points })
  return rules
}

// ─── PREDICTIONS ──────────────────────────────────────────────────────────────
export async function loadPredictions(userId, boardId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('board_id', boardId)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('loadPredictions:', error)
    return null
  }
  return data
}

export async function savePredictions(userId, boardId, pickState) {
  const { error } = await supabase
    .from('predictions')
    .upsert({
      user_id: userId,
      board_id: boardId,
      group_rankings: pickState.groupRankings ?? {},
      best3_picks:    pickState.best3 ?? [],
      ko_picks:       pickState.koPicks ?? {},
      updated_at:     new Date().toISOString(),
    }, { onConflict: 'user_id,board_id' })
  if (error) console.error('savePredictions:', error)
}

// ─── SPECIAL PICKS (champion + top scorer) ───────────────────────────────────
export async function loadSpecialPick(userId, boardId) {
  const { data } = await supabase
    .from('special_picks')
    .select('champion, top_scorer_team, top_scorer_player')
    .eq('user_id', userId)
    .eq('board_id', boardId)
    .maybeSingle()
  if (!data) return { champion: null, topScorer: null }
  return {
    champion: data.champion || null,
    topScorer: data.top_scorer_player
      ? { team: data.top_scorer_team, player: data.top_scorer_player }
      : null,
  }
}

export async function saveSpecialPick(userId, boardId, { champion, topScorer }) {
  const fields = { user_id: userId, board_id: boardId, updated_at: new Date().toISOString() };
  if (champion !== undefined) fields.champion = champion || null;
  if (topScorer !== undefined) {
    fields.top_scorer_team   = topScorer?.team   || null;
    fields.top_scorer_player = topScorer?.player || null;
  }
  const { error } = await supabase
    .from('special_picks')
    .upsert(fields, { onConflict: 'user_id,board_id' })
  if (error) console.error('saveSpecialPick:', error)
}

// ─── EXACT SCORES ─────────────────────────────────────────────────────────────
export async function loadExactScores(userId, boardId) {
  const { data } = await supabase
    .from('exact_scores')
    .select('team1_score, team2_score, matches!inner(match_key)')
    .eq('user_id', userId)
    .eq('board_id', boardId)
  const result = {}
  ;(data || []).forEach(row => {
    result[row.matches.match_key] = { home: row.team1_score, away: row.team2_score }
  })
  return result
}

export async function saveExactScore(userId, boardId, matchKey, home, away) {
  const map = await getMatchKeyMap()
  const matchId = map[matchKey]
  if (!matchId) {
    const msg = `match_key not found in DB: "${matchKey}". Matches table may be empty or use a different key format.`
    console.error('saveExactScore:', msg)
    return { error: msg }
  }
  const { error } = await supabase
    .from('exact_scores')
    .upsert({
      user_id:     userId,
      board_id:    boardId,
      match_id:    matchId,
      team1_score: home,
      team2_score: away,
      updated_at:  new Date().toISOString(),
    }, { onConflict: 'user_id,board_id,match_id' })
  if (error) { console.error('saveExactScore:', error); return { error: error.message } }
  return { error: null }
}

export async function ensureBoardScores(userId, boardIds) {
  const ids = [...new Set((Array.isArray(boardIds) ? boardIds : [boardIds]).filter(Boolean))]
  if (!userId || ids.length === 0) return { error: null }
  const { error } = await supabase.rpc('ensure_board_scores', {
    p_user_id: userId,
    p_board_ids: ids,
  })
  if (error) {
    console.error('ensureBoardScores:', error)
    return { error: error.message }
  }
  return { error: null }
}

export async function checkDbHealth() {
  const results = {}
  // Check matches table
  const { data: matches, error: matchErr } = await supabase.from('matches').select('id, match_key').limit(5)
  results.matchesTable = matchErr
    ? { ok: false, error: matchErr.message }
    : { ok: true, count: matches?.length, sample: matches?.map(m => m.match_key) }
  // Check total match count
  const { count: matchCount } = await supabase.from('matches').select('id', { count: 'exact', head: true })
  results.matchesTotal = matchCount ?? 0
  // Check exact_scores table accessible
  const { error: scErr } = await supabase.from('exact_scores').select('id').limit(1)
  results.exactScoresTable = scErr ? { ok: false, error: scErr.message } : { ok: true }
  // Check world cup football players table
  const { error: plErr } = await supabase.from('world_cup_football_players').select('id').limit(1)
  results.playersTable = plErr ? { ok: false, error: plErr.message } : { ok: true }
  const { count: playerCount } = await supabase.from('world_cup_football_players').select('id', { count: 'exact', head: true })
  results.playersTotal = playerCount ?? 0
  return results
}

// ─── BOARDS ───────────────────────────────────────────────────────────────────
// Returns boards with isAdmin=true (created_by) and/or isMember=true (board_members)
export async function loadUserBoards(userId) {
  const [memberships, created] = await Promise.all([
    supabase.from('board_members').select('board_id, role').eq('user_id', userId),
    supabase.from('boards').select('*').eq('created_by', userId),
  ])
  if (memberships.error) { console.error('loadUserBoards memberships:', memberships.error); return [] }
  if (created.error) console.error('loadUserBoards created:', created.error)
  const memberRows = memberships.data || []
  const memberBoardIds = [...new Set(memberRows.map(row => row.board_id).filter(Boolean))]
  const memberBoards = memberBoardIds.length
    ? await supabase.from('boards').select('*').in('id', memberBoardIds)
    : { data: [], error: null }
  if (memberBoards.error) console.error('loadUserBoards member boards:', memberBoards.error)
  const boardsById = new Map((memberBoards.data || []).map(b => [b.id, b]))
  const memberBoardSet = new Set(memberRows.map(row => row.board_id))
  const missingCreatorMemberships = (created.data || [])
    .filter(b => b?.id && !memberBoardSet.has(b.id))
    .map(b => ({ board_id: b.id, user_id: userId, role: 'admin' }))
  if (missingCreatorMemberships.length) {
    const { error } = await supabase
      .from('board_members')
      .upsert(missingCreatorMemberships, { onConflict: 'board_id,user_id' })
    if (error) console.error('loadUserBoards repair memberships:', error)
  }
  const map = new Map()
  // Creatorul vede mereu boardul său (indiferent de board_members)
  ;(created.data || []).forEach(b => {
    map.set(b.id, { ...b, label: b.emoji || '⚽', image_url: b.image_url || null, isGlobal: false, code: b.invite_code, max: b.max_players, isAdmin: true, isMember: false })
  })
  ;(created.data || []).forEach(b => {
    if (b?.id && map.has(b.id)) map.set(b.id, { ...map.get(b.id), isMember: true })
  })
  // Membrii (inclusiv cu rol admin) din board_members
  ;(memberRows || []).forEach(row => {
    const b = boardsById.get(row.board_id)
    if (!b) return
    const existing = map.get(b.id)
    const joined_at = b.created_at || existing?.joined_at || null
    if (existing) {
      map.set(b.id, { ...existing, joined_at, isMember: true })
    } else {
      b.joined_at = joined_at
      map.set(b.id, { ...b, label: b.emoji || '⚽', image_url: b.image_url || null, isGlobal: false, code: b.invite_code, max: b.max_players, isAdmin: false, isMember: true })
    }
  })
  return Array.from(map.values())
}

export async function loadAvailableBoards(userId) {
  const [allRes, memberRes] = await Promise.all([
    supabase.from('boards').select('*'),
    supabase.from('board_members').select('board_id').eq('user_id', userId),
  ])
  if (allRes.error) { console.error('loadAvailableBoards:', allRes.error); return [] }
  const excludeSet = new Set((memberRes.data || []).map(r => r.board_id))
  return (allRes.data || [])
    .filter(b => !excludeSet.has(b.id))
    .map(b => ({ ...b, label: b.emoji || '⚽', image_url: b.image_url || null, isGlobal: false, code: b.invite_code, max: b.max_players }))
}

export async function createBoard(userId, { name, emoji, type, password, max_players, prizes }) {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const invite_code = letters[Math.floor(Math.random()*letters.length)] +
    String(Math.floor(10000 + Math.random() * 90000))
  const { data, error } = await supabase
    .from('boards')
    .insert({ name, emoji, type, password, max_players, prizes: prizes || [], created_by: userId, invite_code })
    .select()
    .single()
  if (error) { console.error('createBoard:', error); return { error } }
  // Add creator to board_members so membership is tracked uniformly
  await supabase.from('board_members').upsert({ board_id: data.id, user_id: userId, role: 'admin' }, { onConflict: 'board_id,user_id' })
  await ensureBoardScores(userId, [data.id])
  return { data: { ...data, label: data.emoji || '⚽', image_url: data.image_url || null, isGlobal: false, code: data.invite_code, isAdmin: true, isMember: true } }
}

export async function joinBoardByCode(userId, code) {
  const { data: board, error } = await supabase
    .from('boards')
    .select('*')
    .eq('invite_code', code.trim().toUpperCase())
    .single()
  if (error || !board) return { error: 'Cod invalid. Verifică și încearcă din nou.' }
  const { error: joinErr } = await supabase
    .from('board_members')
    .upsert({ board_id: board.id, user_id: userId, role: 'member' }, { onConflict: 'board_id,user_id' })
  if (joinErr) return { error: joinErr.message }
  await ensureBoardScores(userId, [board.id])
  return { data: { ...board, label: board.emoji || '⚽', image_url: board.image_url || null, isGlobal: false } }
}

export async function loadBoardMembers(boardId) {
  const { data: members, error: err1 } = await supabase
    .from('board_members')
    .select('user_id, role')
    .eq('board_id', boardId)
  if (!members?.length) return []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', members.map(m => m.user_id))
  const profileMap = {}
  ;(profiles || []).forEach(p => { profileMap[p.id] = p.display_name })
  return members.map(row => ({
    id:   row.user_id,
    name: profileMap[row.user_id] || '—',
    role: row.role,
  }))
}

export async function joinBoardById(userId, boardId) {
  const { error } = await supabase
    .from('board_members')
    .upsert({ board_id: boardId, user_id: userId, role: 'member' }, { onConflict: 'board_id,user_id' })
  if (error) { console.error('joinBoardById:', error); return { error: error.message } }
  await ensureBoardScores(userId, [boardId])
  return { data: true }
}

export async function removeBoardMember(boardId, userId) {
  const results = await Promise.all([
    supabase.from('board_members').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('predictions').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('exact_scores').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('special_picks').delete().eq('board_id', boardId).eq('user_id', userId),
  ])
  results.forEach((r, i) => { if (r.error) console.error('removeBoardMember:', i, r.error) })
}

export async function removeParticipation(boardId, userId) {
  const results = await Promise.all([
    supabase.from('predictions').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('exact_scores').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('special_picks').delete().eq('board_id', boardId).eq('user_id', userId),
  ])
  results.forEach((r, i) => { if (r.error) console.error('removeParticipation:', i, r.error) })
}

export async function deleteBoard(boardId) {
  const cleanup = await Promise.all([
    supabase.from('special_picks').delete().eq('board_id', boardId),
    supabase.from('exact_scores').delete().eq('board_id', boardId),
    supabase.from('predictions').delete().eq('board_id', boardId),
    supabase.from('board_members').delete().eq('board_id', boardId),
  ])
  const cleanupError = cleanup.find(res => res.error)?.error
  if (cleanupError) { console.error('deleteBoard cleanup:', cleanupError); return { error: cleanupError }; }
  const { error } = await supabase.from('boards').delete().eq('id', boardId)
  if (error) { console.error('deleteBoard:', error); return { error }; }
  return { error: null }
}

// Global board: UUID în boards/board_members, dar 'global' pentru scoring (exact_scores, board_scores, special_picks)
const GLOBAL_BOARD_UUID = '00000000-0000-0000-0000-000000000000'
const toScoringId = (id) => id === GLOBAL_BOARD_UUID ? 'global' : id

// ─── BULK LOADERS (optimized — fewer requests) ───────────────────────────────
// Replaces loadUserBoards + loadAvailableBoards: 2 requests instead of 5
export async function loadAllBoards(userId) {
  const [memberships, allBoards] = await Promise.all([
    supabase.from('board_members').select('board_id, role').eq('user_id', userId),
    supabase.from('boards').select('*'),
  ])
  if (allBoards.error) { console.error('loadAllBoards:', allBoards.error); return { userBoards: [], availableBoards: [] } }

  const memberRows = memberships.data || []
  const memberSet = new Set(memberRows.map(r => r.board_id))
  const roleMap = Object.fromEntries(memberRows.map(r => [r.board_id, r.role]))

  const userBoards = []
  const availableBoards = []

  ;(allBoards.data || []).forEach(b => {
    const isMember = memberSet.has(b.id)
    const isCreator = b.created_by === userId
    const isGlobal = b.id === GLOBAL_BOARD_UUID
    // Global board always uses 'global' string as id for scoring compatibility
    const boardObj = { ...b, id: toScoringId(b.id), label: b.emoji || '⚽', image_url: b.image_url || null, isGlobal, code: b.invite_code, max: b.max_players }
    if (isMember || isGlobal) {
      userBoards.push({ ...boardObj, isAdmin: isGlobal ? false : (roleMap[b.id] === 'admin' || isCreator), isMember: true })
    } else if (isCreator) {
      userBoards.push({ ...boardObj, isAdmin: true, isMember: false })
    } else {
      availableBoards.push(boardObj)
    }
  })

  return { userBoards, availableBoards }
}

// Replaces N × loadForBoard calls: 3 requests instead of N×3
export async function loadAllUserPicks(userId) {
  const [predsRes, scoresRes, specialRes] = await Promise.all([
    supabase.from('predictions').select('*').eq('user_id', userId),
    supabase.from('exact_scores')
      .select('team1_score, team2_score, board_id, matches!inner(match_key)')
      .eq('user_id', userId),
    supabase.from('special_picks')
      .select('champion, top_scorer_team, top_scorer_player, board_id')
      .eq('user_id', userId),
  ])

  const predictions = {}
  ;(predsRes.data || []).forEach(row => { predictions[row.board_id] = row })

  const exactScores = {}
  ;(scoresRes.data || []).forEach(row => {
    if (!exactScores[row.board_id]) exactScores[row.board_id] = {}
    exactScores[row.board_id][row.matches.match_key] = { home: row.team1_score, away: row.team2_score }
  })

  const specialPicks = {}
  ;(specialRes.data || []).forEach(row => {
    specialPicks[row.board_id] = {
      champion: row.champion || null,
      topScorer: row.top_scorer_player ? { team: row.top_scorer_team, player: row.top_scorer_player } : null,
    }
  })

  return { predictions, exactScores, specialPicks }
}

// ─── MEMBER COUNTS ───────────────────────────────────────────────────────────
export async function fetchMemberCounts(boardIds) {
  // Map 'global' back to real UUID for board_members query
  const realIds = boardIds.map(id => id === 'global' ? GLOBAL_BOARD_UUID : id);
  const { data } = await supabase
    .from('board_members')
    .select('board_id')
    .in('board_id', realIds);

  const counts = {};
  ;(data || []).forEach(row => {
    const displayId = row.board_id === GLOBAL_BOARD_UUID ? 'global' : row.board_id;
    counts[displayId] = (counts[displayId] || 0) + 1;
  });
  return counts;
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
// Requires Supabase SQL (run once in SQL editor):
//   create or replace function public.check_email_exists(p_email text)
//   returns boolean language plpgsql security definer set search_path = '' as $$
//   begin return exists (select 1 from auth.users where lower(email)=lower(p_email) and deleted_at is null); end; $$;
//   grant execute on function public.check_email_exists(text) to anon, authenticated;
export async function checkEmailExists(email) {
  try {
    const { data, error } = await supabase.rpc('check_email_exists', { p_email: email.toLowerCase() });
    if (error) return null;
    return data === true;
  } catch { return null; }
}

export async function checkNicknameExists(nickname) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .ilike('display_name', nickname.trim())
      .maybeSingle();
    return !!data;
  } catch { return false; }
}

// ─── PLAYERS ─────────────────────────────────────────────────────────────────
// Returns { [teamName]: [{name, position, number, photo, nationality, goals, assists, yellowCards, redCards, minutesPlayed, rating, appearances}, ...] }
// Sorted by shirt number ascending (nulls last).
// Prefers records seeded from API-Football (api_football_id IS NOT NULL) when available.
export async function loadPlayers() {
  const { data, error } = await supabase
    .from('world_cup_football_players')
    .select('team_name, player_name, position, shirt_number, photo_url, nationality, goals, assists, yellow_cards, red_cards, minutes_played, rating, appearances, api_football_id')
    .order('shirt_number', { ascending: true, nullsFirst: false })
  if (error) { console.error('loadPlayers:', error); return {} }
  const result = {}
  ;(data || []).forEach(row => {
    if (!result[row.team_name]) result[row.team_name] = []
    result[row.team_name].push({
      name:          row.player_name,
      position:      row.position,
      number:        row.shirt_number,
      photo:         row.photo_url,
      nationality:   row.nationality,
      goals:         row.goals         ?? 0,
      assists:       row.assists        ?? 0,
      yellowCards:   row.yellow_cards   ?? 0,
      redCards:      row.red_cards      ?? 0,
      minutesPlayed: row.minutes_played ?? 0,
      rating:        row.rating         ?? null,
      appearances:   row.appearances    ?? 0,
      hasStats:      row.api_football_id != null,
    })
  })
  return result
}

// Players for a single team — loaded lazily when team is selected
export async function loadPlayersByTeam(teamName) {
  const { data, error } = await supabase
    .from('world_cup_football_players')
    .select('player_name, position, shirt_number, photo_url, nationality')
    .eq('team_name', teamName)
    .order('shirt_number', { ascending: true, nullsFirst: false })
  if (error) { console.error('loadPlayersByTeam:', error); return [] }
  return (data || []).map(row => ({
    name:        row.player_name,
    position:    row.position,
    number:      row.shirt_number,
    photo:       row.photo_url,
    nationality: row.nationality,
  }))
}

// Top scorers across all teams — sorted by goals desc, then assists desc
export async function loadTopScorers(limit = 20) {
  const { data, error } = await supabase
    .from('world_cup_football_players')
    .select('team_name, player_name, photo_url, nationality, position, goals, assists, yellow_cards, red_cards, minutes_played, rating, appearances')
    .not('api_football_id', 'is', null)
    .order('goals', { ascending: false })
    .order('assists', { ascending: false })
    .limit(limit)
  if (error) { console.error('loadTopScorers:', error); return [] }
  return (data || []).map(row => ({
    team:          row.team_name,
    name:          row.player_name,
    photo:         row.photo_url,
    nationality:   row.nationality,
    position:      row.position,
    goals:         row.goals         ?? 0,
    assists:       row.assists        ?? 0,
    yellowCards:   row.yellow_cards   ?? 0,
    redCards:      row.red_cards      ?? 0,
    minutesPlayed: row.minutes_played ?? 0,
    rating:        row.rating         ?? null,
    appearances:   row.appearances    ?? 0,
  }))
}

// Seed players via football-data.org Edge Function (legacy — basic info + photos)
export async function seedPlayersFromApi() {
  const { data, error } = await supabase.functions.invoke('seed-players')
  if (error) { console.error('seedPlayersFromApi:', error); return { error: error.message } }
  return data
}

// Initial load of all 48 WC 2026 teams via API-Football (6 batches × 8 teams)
// offset: 0, 8, 16, 24, 32, 40 — call sequentially from the admin UI
export async function seedPlayersApiFootball(offset = 0) {
  const { data, error } = await supabase.functions.invoke('seed-players-apifootball', {
    body: { offset, batchSize: 8 },
  })
  if (error) { console.error('seedPlayersApiFootball:', error); return { error: error.message } }
  return data
}

// Daily stats update for teams playing today (called after matches finish)
// Pass a date string 'YYYY-MM-DD' to override today (useful for testing)
export async function updatePlayerStats(date) {
  const { data, error } = await supabase.functions.invoke('update-player-stats', {
    body: date ? { date } : {},
  })
  if (error) { console.error('updatePlayerStats:', error); return { error: error.message } }
  return data
}

// ─── REAL GROUP STANDINGS ────────────────────────────────────────────────────
// Returns { "A": ["Mexico","South Africa",...], "B": [...], ... } sorted by rank
export async function loadRealGroupStandings() {
  const { data, error } = await supabase.rpc('get_group_standings')
  if (error) { console.error('loadRealGroupStandings:', error); return {} }
  const standings = {}
  ;(data || []).forEach(row => {
    if (!standings[row.group_id]) standings[row.group_id] = []
    standings[row.group_id].push(row.team_name)
  })
  return standings
}

// ─── LIVE SCORES ──────────────────────────────────────────────────────────────
export async function loadLiveScores() {
  const { data } = await supabase.from('live_scores').select('*')
  const result = {}
  ;(data || []).forEach(row => {
    result[row.match_key] = {
      status: row.status,
      home:   row.regular_time_home_score,
      away:   row.regular_time_away_score,
      homePen: row.penalty_home_score,
      awayPen: row.penalty_away_score,
      min:    row.api_minute,
    }
  })
  return result
}

export function subscribeLiveScores(onChange) {
  return supabase
    .channel('live_scores_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_scores' }, onChange)
    .subscribe()
}

// ─── BOARD IMAGE ─────────────────────────────────────────────────────────────
export async function uploadBoardImage(userId, boardId, file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${userId}/${boardId}.${ext}`
  const { error } = await supabase.storage.from('board-images')
    .upload(path, file, { contentType: file.type, upsert: true })
  if (error) { console.error('uploadBoardImage:', error); return null }
  const { data: { publicUrl } } = supabase.storage.from('board-images').getPublicUrl(path)
  const urlWithBust = `${publicUrl}?t=${Date.now()}`
  await supabase.from('boards').update({ image_url: urlWithBust }).eq('id', boardId)
  return urlWithBust
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${userId}/avatar.${ext}`
  // Remove any existing avatar files for this user before uploading
  const { data: existing } = await supabase.storage.from('avatars').list(userId)
  if (existing?.length) {
    await supabase.storage.from('avatars').remove(existing.map(f => `${userId}/${f.name}`))
  }
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type })
  if (uploadError) { console.error('uploadAvatar storage:', uploadError); return null }
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  const urlWithBust = `${publicUrl}?t=${Date.now()}`
  const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: urlWithBust } })
  if (updateError) { console.error('uploadAvatar auth:', updateError); return null }
  await supabase.from('profiles').update({ avatar_url: urlWithBust }).eq('id', userId)
  return urlWithBust
}

// ─── SCORE BREAKDOWN (per user per board) ────────────────────────────────────
export async function loadMyScoreBreakdown(userId, boardId) {
  const [specialRes, boardRes] = await Promise.all([
    supabase
      .from('special_picks')
      .select('champion_pts, top_scorer_pts')
      .eq('user_id', userId)
      .eq('board_id', boardId)
      .maybeSingle(),
    supabase
      .from('board_scores')
      .select('pred_pts, exact_pts, total_pts')
      .eq('user_id', userId)
      .eq('board_id', boardId)
      .maybeSingle(),
  ])
  const total = boardRes.data?.total_pts ?? 0
  const pred  = boardRes.data?.pred_pts  ?? total  // fallback: total dacă coloana nu există încă
  const exact = boardRes.data?.exact_pts ?? 0
  return {
    specialPts: (specialRes.data?.champion_pts ?? 0) + (specialRes.data?.top_scorer_pts ?? 0),
    predPts:    pred,
    exactPts:   exact,
  }
}

// ─── SYSTEM NOTIFICATIONS ────────────────────────────────────────────────────
export async function loadSystemNotifications(lang = 'ro') {
  // Try with multilingual columns; fall back to base columns if migration not applied yet
  const { data, error } = await supabase
    .from('system_notifications')
    .select('id, title, body, display_date')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    // Columns may not exist yet — retry with base columns only
    const { data: base } = await supabase
      .from('system_notifications')
      .select('id, title, body, display_date')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    return (base || []).map(n => ({ id: n.id, title: n.title, body: n.body, date: n.display_date || '' }))
  }

  return (data || []).map(n => ({
    id:   n.id,
    title: (lang === 'en' ? n.title_en : lang === 'fr' ? n.title_fr : null) || n.title,
    body:  (lang === 'en' ? n.body_en  : lang === 'fr' ? n.body_fr  : null) || n.body,
    date:  n.display_date || '',
  }))
}

// ─── NOTIFICATION READS ───────────────────────────────────────────────────────
export async function loadNotifReads(userId) {
  const { data } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', userId)
  return (data || []).map(r => r.notification_id)
}

export async function markNotifRead(userId, notificationId) {
  await supabase
    .from('notification_reads')
    .upsert({ user_id: userId, notification_id: notificationId }, { onConflict: 'user_id,notification_id' })
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
export async function loadLeaderboard(boardId, search = null, userId = null) {
  const [rpcRes, profileRes] = await Promise.all([
    supabase.rpc('get_leaderboard', {
      p_board_id: boardId,
      p_search: search?.trim() || null,
    }),
    userId
      ? supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  if (rpcRes.error) console.error('loadLeaderboard:', rpcRes.error)
  const myName = profileRes.data?.display_name || null
  const rows = (rpcRes.data || []).map((row, i) => {
    const isMe = myName ? row.display_name === myName : false
    return {
      rank:      i + 1,
      userId:    row.user_id || null,
      name:      row.display_name || '—',
      pts:       row.total_pts || 0,
      avatarUrl: row.avatar_url || null,
      accent:    isMe ? '#E8F0FF' : '#fff',
      isMe,
    }
  })
  if (userId && myName && !rows.some(row => row.isMe)) {
    rows.push({
      rank: rows.length + 1,
      userId,
      name: myName,
      pts: 0,
      accent: '#E8F0FF',
      isMe: true,
    })
  }
  return rows
}

export async function loadUserBreakdown(userId, boardId) {
  const [groupRes, exactRes] = await Promise.all([
    supabase.rpc('get_user_group_breakdown', { p_user_id: userId, p_board_id: boardId }),
    supabase.rpc('get_user_exact_breakdown', { p_user_id: userId, p_board_id: boardId }),
  ])
  if (groupRes.error) console.error('loadUserBreakdown groups:', groupRes.error)
  if (exactRes.error) console.error('loadUserBreakdown exact:', exactRes.error)
  return {
    groups: groupRes.data || [],
    exact:  exactRes.data || [],
  }
}
