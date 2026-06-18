import { supabase } from './supabase.js'

const BOARD_SAFE_COLUMNS = 'id, name, emoji, type, max_players, prizes, created_by, invite_code, image_url, created_at, has_password'
const mapBoard = (b) => ({
  ...b,
  password: undefined,
  label: b.emoji || 'âš½',
  image_url: b.image_url || null,
  isGlobal: false,
  code: b.invite_code,
  max: b.max_players,
})

// â”€â”€â”€ MATCH KEY â†’ ID MAP (cached) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let _matchKeyMap = null
async function getMatchKeyMap() {
  if (_matchKeyMap) return _matchKeyMap
  const { data } = await supabase.from('matches').select('id, match_key')
  _matchKeyMap = {}
  ;(data || []).forEach(m => { _matchKeyMap[m.match_key] = m.id })
  return _matchKeyMap
}

// â”€â”€â”€ SCORING RULES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function fetchScoringRules() {
  const { data } = await supabase
    .from('scoring_rules')
    .select('*')
    .order('sort_order')
  const rules = { prediction: {}, exact_score: {} }
  ;(data || []).forEach(r => { rules[r.type][r.phase] = r.points })
  return rules
}

// â”€â”€â”€ PREDICTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  if (error && error.code !== '42501') console.error('savePredictions:', error)
}

// â”€â”€â”€ SPECIAL PICKS (champion + top scorer) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function loadSpecialPick(userId, boardId) {
  const { data } = await supabase
    .from('special_picks')
    .select('champion, top_scorer_team, top_scorer_player, runner_up')
    .eq('user_id', userId)
    .eq('board_id', boardId)
    .maybeSingle()
  if (!data) return { champion: null, topScorer: null, runnerUp: null }
  return {
    champion: data.champion || null,
    topScorer: data.top_scorer_player
      ? { team: data.top_scorer_team, player: data.top_scorer_player }
      : null,
    runnerUp: data.runner_up || null,
  }
}

export async function saveSpecialPick(userId, boardId, { champion, topScorer, runnerUp }) {
  const fields = { user_id: userId, board_id: boardId, updated_at: new Date().toISOString() };
  if (champion !== undefined) fields.champion = champion || null;
  if (topScorer !== undefined) {
    fields.top_scorer_team   = topScorer?.team   || null;
    fields.top_scorer_player = topScorer?.player || null;
  }
  if (runnerUp !== undefined) fields.runner_up = runnerUp || null;
  const { error } = await supabase
    .from('special_picks')
    .upsert(fields, { onConflict: 'user_id,board_id' })
  if (error) console.error('saveSpecialPick:', error)
}

// â”€â”€â”€ EXACT SCORES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ BOARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Returns boards with isAdmin=true (created_by) and/or isMember=true (board_members)
export async function loadUserBoards(userId) {
  const [memberships, created] = await Promise.all([
    supabase.from('board_members').select('board_id, role').eq('user_id', userId),
    supabase.from('boards').select(BOARD_SAFE_COLUMNS).eq('created_by', userId),
  ])
  if (memberships.error) { console.error('loadUserBoards memberships:', memberships.error); return [] }
  if (created.error) console.error('loadUserBoards created:', created.error)
  const memberRows = memberships.data || []
  const memberBoardIds = [...new Set(memberRows.map(row => row.board_id).filter(Boolean))]
  const memberBoards = memberBoardIds.length
    ? await supabase.from('boards').select(BOARD_SAFE_COLUMNS).in('id', memberBoardIds)
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
  // Creatorul vede mereu boardul sÄƒu (indiferent de board_members)
  ;(created.data || []).forEach(b => {
    map.set(b.id, { ...mapBoard(b), isAdmin: true, isMember: false })
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
      map.set(b.id, { ...mapBoard(b), isAdmin: false, isMember: true })
    }
  })
  return Array.from(map.values())
}

export async function loadAvailableBoards(userId) {
  const [allRes, memberRes] = await Promise.all([
    supabase.from('boards').select(BOARD_SAFE_COLUMNS),
    supabase.from('board_members').select('board_id').eq('user_id', userId),
  ])
  if (allRes.error) { console.error('loadAvailableBoards:', allRes.error); return [] }
  const excludeSet = new Set((memberRes.data || []).map(r => r.board_id))
  return (allRes.data || [])
    .filter(b => !excludeSet.has(b.id))
    .map(mapBoard)
}

export async function createBoard(userId, { name, emoji, type, password, max_players, prizes }) {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const invite_code = letters[Math.floor(Math.random()*letters.length)] +
    String(Math.floor(10000 + Math.random() * 90000))
  const { data, error } = await supabase
    .from('boards')
    .insert({ name, emoji, type, password, max_players, prizes: prizes || [], created_by: userId, invite_code })
    .select(BOARD_SAFE_COLUMNS)
    .single()
  if (error) { console.error('createBoard:', error); return { error } }
  // Add creator to board_members so membership is tracked uniformly
  await supabase.from('board_members').upsert({ board_id: data.id, user_id: userId, role: 'admin' }, { onConflict: 'board_id,user_id' })
  await ensureBoardScores(userId, [data.id])
  return { data: { ...mapBoard(data), isAdmin: true, isMember: true } }
}

export async function updateBoard(boardId, { name, emoji, type, password, max_players, prizes, image_url }) {
  const updates = { name, emoji, type, max_players, prizes: prizes || [] };
  if (image_url !== undefined) updates.image_url = image_url;
  // Only send password if the user actually typed one; empty string = no change
  if (password) updates.password = password;
  const { data, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', boardId)
    .select(BOARD_SAFE_COLUMNS)
    .single()
  if (error) { console.error('updateBoard:', error); return { error } }
  return { data: mapBoard(data) }
}

export async function joinBoardByCode(userId, code, password = '') {
  const { data, error } = await supabase.rpc('join_board', {
    p_invite_code: code.trim().toUpperCase(),
    p_password: password || null,
  })
  const board = Array.isArray(data) ? data[0] : data
  if (error || !board) return { error: error?.message || 'Cod invalid. Verifica si incearca din nou.' }
  await ensureBoardScores(userId, [board.id])
  return { data: mapBoard(board) }
}

export async function loadBoardMembers(boardId) {
  const { data: members, error } = await supabase
    .from('board_members')
    .select('user_id, role')
    .eq('board_id', boardId)
  if (error) { console.error('loadBoardMembers:', error); return [] }
  if (!members?.length) return []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', members.map(m => m.user_id))
  const profileMap = {}
  ;(profiles || []).forEach(p => { profileMap[p.id] = p.display_name })
  return members.map(row => ({
    id:   row.user_id,
    name: profileMap[row.user_id] || '-',
    role: row.role,
  }))
}

export async function loadMatchPredictions(matchKey, boardId) {
  const { data, error } = await supabase.rpc('get_match_predictions', {
    p_match_key: matchKey,
    p_board_id: boardId,
  })
  if (error) { console.error('loadMatchPredictions:', error); return [] }
  return (data || []).map(row => ({
    userId: row.user_id,
    name: row.name || '?',
    avatarUrl: row.avatar_url || null,
    predHome: row.pred_home,
    predAway: row.pred_away,
  }))
}

export async function loadCentralStats(boardId) {
  const resolvedId = boardId === '00000000-0000-0000-0000-000000000000' ? 'global' : boardId
  const { data, error } = await supabase.rpc('get_central_stats', { p_board_id: resolvedId })
  if (error) { console.error('loadCentralStats:', error); return { members: [], matches: [] } }
  const membersMap = {}
  ;(data || []).forEach(row => {
    if (!membersMap[row.user_id]) {
      membersMap[row.user_id] = { userId: row.user_id, name: row.name || '?', avatarUrl: row.avatar_url || null, predictions: {} }
    }
    if (row.match_key) {
      membersMap[row.user_id].predictions[row.match_key] = { home: row.pred_home, away: row.pred_away }
    }
  })
  return { members: Object.values(membersMap) }
}

export async function joinBoardById(userId, boardId, password = '') {
  const { error } = await supabase.rpc('join_board', {
    p_board_id: boardId,
    p_password: password || null,
  })
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

// Global board: UUID Ã®n boards/board_members, dar 'global' pentru scoring (exact_scores, board_scores, special_picks)
const GLOBAL_BOARD_UUID = '00000000-0000-0000-0000-000000000000'
const toScoringId = (id) => id === GLOBAL_BOARD_UUID ? 'global' : id

// â”€â”€â”€ BULK LOADERS (optimized â€” fewer requests) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Replaces loadUserBoards + loadAvailableBoards: 2 requests instead of 5
export async function loadAllBoards(userId) {
  const [memberships, allBoards] = await Promise.all([
    supabase.from('board_members').select('board_id, role').eq('user_id', userId),
    supabase.from('boards').select(BOARD_SAFE_COLUMNS),
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
    const boardObj = { ...mapBoard(b), id: toScoringId(b.id), isGlobal }
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

// Replaces N Ã— loadForBoard calls: 3 requests instead of NÃ—3
export async function loadAllUserPicks(userId) {
  const [predsRes, scoresRes, specialRes] = await Promise.all([
    supabase.from('predictions').select('*').eq('user_id', userId),
    supabase.from('exact_scores')
      .select('team1_score, team2_score, board_id, matches!inner(match_key)')
      .eq('user_id', userId),
    supabase.from('special_picks')
      .select('champion, top_scorer_team, top_scorer_player, runner_up, board_id')
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
      runnerUp: row.runner_up || null,
    }
  })

  return { predictions, exactScores, specialPicks }
}

// â”€â”€â”€ MEMBER COUNTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ AUTH HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ PLAYERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// Players for a single team â€” loaded lazily when team is selected
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

// Top scorers across all teams â€” sorted by goals desc, then assists desc
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

// Seed players via football-data.org Edge Function (legacy â€” basic info + photos)
export async function seedPlayersFromApi() {
  const { data, error } = await supabase.functions.invoke('seed-players')
  if (error) { console.error('seedPlayersFromApi:', error); return { error: error.message } }
  return data
}

// Initial load of all 48 WC 2026 teams via API-Football (6 batches Ã— 8 teams)
// offset: 0, 8, 16, 24, 32, 40 â€” call sequentially from the admin UI
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

// â”€â”€â”€ REAL GROUP STANDINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Returns { "A": ["Mexico","South Africa",...], "B": [...], ... } sorted by rank
// ─── BOARD CHAT ───────────────────────────────────────────────────────────────
const resolveChatBoardId = (id) => id === 'global' ? '00000000-0000-0000-0000-000000000000' : id;

export async function loadChatMessages(boardId) {
  boardId = resolveChatBoardId(boardId);
  if (!navigator.onLine) return { __offline: true, messages: [] };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const { data, error } = await supabase
      .from('board_chat')
      .select('id, user_id, nickname, content, is_system, created_at, edited_at, likes, dislikes, reply_to_id, reply_to_nickname, reply_to_content')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true })
      .abortSignal(ctrl.signal);
    clearTimeout(timer);
    if (error) {
      console.error('loadChatMessages:', error);
      return { __offline: true, messages: [] };
    }
    return { __offline: false, messages: data || [] };
  } catch (e) {
    console.error('loadChatMessages catch:', e);
    return { __offline: true, messages: [] };
  }
}

export async function sendChatMessage(boardId, userId, nickname, content, reply = null) {
  boardId = resolveChatBoardId(boardId);
  const row = { board_id: boardId, user_id: userId, nickname, content };
  if (reply) {
    row.reply_to_id      = reply.id;
    row.reply_to_nickname = reply.nickname;
    row.reply_to_content  = reply.content;
  }
  const { data, error } = await supabase
    .from('board_chat')
    .insert(row)
    .select('id, board_id, user_id, nickname, content, is_system, created_at, edited_at, likes, dislikes, reply_to_id, reply_to_nickname, reply_to_content')
    .single()
  if (error) { console.error('sendChatMessage:', error); return { error: error.message, data: null } }
  return { error: null, data }
}

export async function toggleChatLike(messageId) {
  const { data, error } = await supabase.rpc('toggle_chat_like', { p_message_id: messageId })
  if (error) { console.error('toggleChatLike:', error); return { error: error.message } }
  return { error: null, likes: data?.likes || [], dislikes: data?.dislikes || [] }
}

export async function toggleChatDislike(messageId) {
  const { data, error } = await supabase.rpc('toggle_chat_dislike', { p_message_id: messageId })
  if (error) { console.error('toggleChatDislike:', error); return { error: error.message } }
  return { error: null, likes: data?.likes || [], dislikes: data?.dislikes || [] }
}

export async function editChatMessage(messageId, content) {
  const { data, error } = await supabase
    .from('board_chat')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('id, content, edited_at')
    .single()
  if (error) { console.error('editChatMessage:', error); return { error: error.message, data: null } }
  return { error: null, data }
}

export function subscribeChatMessages(boardId, onNew, onEdit, onReaction, onPresence, presenceUser) {
  boardId = resolveChatBoardId(boardId);
  let connected = false;
  const channel = supabase.channel(`chat_${boardId}`, {
    config: { broadcast: { self: true }, presence: { key: presenceUser?.id || 'anon' } },
  })
  channel
    .on('broadcast', { event: 'chat' }, ({ payload }) => onNew(payload))
    .on('broadcast', { event: 'chat_edit' }, ({ payload }) => onEdit && onEdit(payload))
    .on('broadcast', { event: 'chat_reaction' }, ({ payload }) => onReaction && onReaction(payload))
    .on('presence', { event: 'sync' }, () => {
      const count = Object.keys(channel.presenceState()).length;
      onPresence && onPresence(count);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        connected = true;
        if (presenceUser) await channel.track({ user_id: presenceUser.id, nickname: presenceUser.nickname });
      }
    })
  const safe = (fn) => (...args) => { if (connected) fn(...args); }
  return {
    unsubscribe: () => supabase.removeChannel(channel),
    broadcast:        safe((msg)  => channel.send({ type: 'broadcast', event: 'chat',          payload: msg })),
    broadcastEdit:    safe((edit) => channel.send({ type: 'broadcast', event: 'chat_edit',     payload: edit })),
    broadcastReaction:safe((r)    => channel.send({ type: 'broadcast', event: 'chat_reaction', payload: r })),
  }
}

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

// â”€â”€â”€ LIVE SCORES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function loadLiveScores() {
  const { data } = await supabase.from('live_scores').select('*')
  const result = {}
  ;(data || []).forEach(row => {
    result[row.match_key] = {
      status:  row.status,
      home:    row.regular_time_home_score,
      away:    row.regular_time_away_score,
      homePen: row.penalty_home_score,
      awayPen: row.penalty_away_score,
      min:     row.api_minute,
      utcDate: row.utc_date ?? null,
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

// â”€â”€â”€ BOARD IMAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function uploadBoardImage(userId, boardId, file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${userId}/${boardId}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('board-images')
    .upload(path, file, { contentType: file.type })
  if (error) { console.error('uploadBoardImage:', error); return null }
  const { data: { publicUrl } } = supabase.storage.from('board-images').getPublicUrl(path)
  const { error: updateError } = await supabase.from('boards').update({ image_url: publicUrl }).eq('id', boardId)
  if (updateError) { console.error('uploadBoardImage board update:', updateError); return null }
  return publicUrl
}

// â”€â”€â”€ AVATAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ SCORE BREAKDOWN (per user per board) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const pred  = boardRes.data?.pred_pts  ?? total  // fallback: total dacÄƒ coloana nu existÄƒ Ã®ncÄƒ
  const exact = boardRes.data?.exact_pts ?? 0
  return {
    specialPts: (specialRes.data?.champion_pts ?? 0) + (specialRes.data?.top_scorer_pts ?? 0),
    predPts:    pred,
    exactPts:   exact,
  }
}

// â”€â”€â”€ SYSTEM NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function loadSystemNotifications(lang = 'ro') {
  // Try with multilingual columns; fall back to base columns if migration not applied yet
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('system_notifications')
    .select('id, title, title_en, title_fr, body, body_en, body_fr, display_date')
    .eq('active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
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

// â”€â”€â”€ NOTIFICATION READS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// ─── PUSH SUBSCRIPTIONS ────────────────────────────────────────────────────────
export async function savePushSubscription(userId, subscription) {
  const { endpoint, keys } = subscription.toJSON()
  await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: 'endpoint' }
    )
}

export async function deletePushSubscription(endpoint) {
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
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
      name:      row.display_name || 'â€”',
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

export async function loadBoardExactScores(boardId) {
  const { data, error } = await supabase.rpc('get_central_stats', { p_board_id: boardId })
  if (error) { console.error('loadBoardExactScores:', error); return {} }
  const byUser = {}
  ;(data || []).forEach(row => {
    if (!row.match_key) return
    if (!byUser[row.user_id]) byUser[row.user_id] = {}
    byUser[row.user_id][row.match_key] = { home: row.pred_home, away: row.pred_away }
  })
  return byUser
}

export async function loadUserBreakdown(userId, boardId) {
  const [groupRes, exactRes, specialRes] = await Promise.all([
    supabase.rpc('get_user_group_breakdown', { p_user_id: userId, p_board_id: boardId }),
    supabase.rpc('get_user_exact_breakdown', { p_user_id: userId, p_board_id: boardId }),
    supabase
      .from('special_picks')
      .select('champion, runner_up, top_scorer_player, top_scorer_team, champion_pts, top_scorer_pts')
      .eq('user_id', userId)
      .eq('board_id', boardId)
      .maybeSingle(),
  ])
  if (groupRes.error) console.error('loadUserBreakdown groups:', groupRes.error)
  if (exactRes.error) console.error('loadUserBreakdown exact:', exactRes.error)

  let topScorerGoals = 0
  if (specialRes.data?.top_scorer_player) {
    const { count } = await supabase
      .from('match_events')
      .select('*', { count: 'exact', head: true })
      .eq('player_name', specialRes.data.top_scorer_player)
      .eq('type', 'Goal')
      .neq('detail', 'Own Goal')
    topScorerGoals = count ?? 0
  }

  const sp = specialRes.data
  return {
    groups: groupRes.data || [],
    exact:  exactRes.data || [],
    bonus: sp ? {
      champion:          sp.champion ?? null,
      champion_pts:      sp.champion_pts ?? 0,
      runner_up:         sp.runner_up ?? null,
      runner_up_pts:     0,
      top_scorer_player: sp.top_scorer_player ?? null,
      top_scorer_team:   sp.top_scorer_team ?? null,
      top_scorer_pts:    topScorerGoals * 5,
    } : null,
  }
}
