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
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('board_id', boardId)
    .single()
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

export async function checkDbHealth() {
  const results = {}
  // Check matches table
  const { data: matches, error: matchErr } = await supabase.from('matches').select('id, match_key').limit(5)
  results.matchesTable = matchErr
    ? { ok: false, error: matchErr.message }
    : { ok: true, count: matches?.length, sample: matches?.map(m => m.match_key) }
  // Check total match count
  const { count } = await supabase.from('matches').select('id', { count: 'exact', head: true })
  results.matchesTotal = count ?? 0
  // Check exact_scores table accessible
  const { error: scErr } = await supabase.from('exact_scores').select('id').limit(1)
  results.exactScoresTable = scErr ? { ok: false, error: scErr.message } : { ok: true }
  return results
}

// ─── BOARDS ───────────────────────────────────────────────────────────────────
// Returns boards with isAdmin=true (created_by) and/or isMember=true (board_members)
export async function loadUserBoards(userId) {
  const [memberships, created] = await Promise.all([
    supabase.from('board_members').select('boards(*)').eq('user_id', userId),
    supabase.from('boards').select('*').eq('created_by', userId),
  ])
  const map = new Map()
  ;(created.data || []).forEach(b => {
    map.set(b.id, { ...b, label: b.emoji || '⚽', isGlobal: false, code: b.invite_code, max: b.max_players, isAdmin: true, isMember: false })
  })
  ;(memberships.data || []).forEach(row => {
    const b = row.boards
    const existing = map.get(b.id)
    if (existing) {
      map.set(b.id, { ...existing, isMember: true })
    } else {
      map.set(b.id, { ...b, label: b.emoji || '⚽', isGlobal: false, code: b.invite_code, max: b.max_players, isAdmin: false, isMember: true })
    }
  })
  return Array.from(map.values())
}

export async function loadAvailableBoards(userId) {
  const [allRes, memberRes, adminRes] = await Promise.all([
    supabase.from('boards').select('*'),
    supabase.from('board_members').select('board_id').eq('user_id', userId),
    supabase.from('boards').select('id').eq('created_by', userId),
  ])
  if (allRes.error) { console.error('loadAvailableBoards:', allRes.error); return [] }
  const excludeSet = new Set([
    ...(memberRes.data || []).map(r => r.board_id),
    ...(adminRes.data || []).map(r => r.id),
  ])
  return (allRes.data || [])
    .filter(b => !excludeSet.has(b.id))
    .map(b => ({ ...b, label: b.emoji || '⚽', isGlobal: false, code: b.invite_code, max: b.max_players }))
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
  return { data: { ...data, label: data.emoji || '⚽', isGlobal: false, code: data.invite_code, isAdmin: true, isMember: false } }
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
  return { data: { ...board, label: board.emoji || '⚽', isGlobal: false } }
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
  return { data: true }
}

export async function removeBoardMember(boardId, userId) {
  await Promise.all([
    supabase.from('board_members').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('predictions').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('exact_scores').delete().eq('board_id', boardId).eq('user_id', userId),
  ])
}

export async function removeParticipation(boardId, userId) {
  await Promise.all([
    supabase.from('predictions').delete().eq('board_id', boardId).eq('user_id', userId),
    supabase.from('exact_scores').delete().eq('board_id', boardId).eq('user_id', userId),
  ])
}

export async function deleteBoard(boardId) {
  await Promise.all([
    supabase.from('exact_scores').delete().eq('board_id', boardId),
    supabase.from('predictions').delete().eq('board_id', boardId),
    supabase.from('board_members').delete().eq('board_id', boardId),
  ])
  const { error } = await supabase.from('boards').delete().eq('id', boardId)
  if (error) console.error('deleteBoard:', error)
  return { error }
}

// ─── MEMBER COUNTS ───────────────────────────────────────────────────────────
export async function fetchMemberCounts(boardIds) {
  const [boardRes, globalRes] = await Promise.all([
    supabase
      .from('board_members')
      .select('board_id')
      .in('board_id', boardIds.filter(id => id !== 'global')),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),
  ]);

  const counts = { global: globalRes.count || 0 };
  ;(boardRes.data || []).forEach(row => {
    counts[row.board_id] = (counts[row.board_id] || 0) + 1;
  });
  return counts;
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
export async function loadLeaderboard(boardId, search = null, userId = null) {
  const [rpcRes, profileRes] = await Promise.all([
    supabase.rpc('get_leaderboard', {
      p_board_id: boardId,
      p_search: search?.trim() || null,
    }),
    userId
      ? supabase.from('profiles').select('display_name').eq('id', userId).single()
      : Promise.resolve({ data: null }),
  ])
  if (rpcRes.error) console.error('loadLeaderboard:', rpcRes.error)
  const myName = profileRes.data?.display_name || null
  return (rpcRes.data || []).map((row, i) => {
    const isMe = myName ? row.display_name === myName : false
    return {
      rank:   i + 1,
      name:   row.display_name || '—',
      pts:    row.total_pts || 0,
      accent: isMe ? '#E8F0FF' : '#fff',
      isMe,
    }
  })
}
