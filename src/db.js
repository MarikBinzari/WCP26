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
  if (!matchId) { console.error('match_key not found:', matchKey); return }
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
  if (error) console.error('saveExactScore:', error)
}

// ─── BOARDS ───────────────────────────────────────────────────────────────────
export async function loadUserBoards(userId) {
  const { data } = await supabase
    .from('board_members')
    .select('role, boards(*)')
    .eq('user_id', userId)
  return (data || []).map(row => ({
    ...row.boards,
    label:    row.boards.emoji || '⚽',
    isGlobal: false,
    role:     row.role,
  }))
}

export async function createBoard(userId, { name, emoji, type, password, max_players, prizes }) {
  const { data, error } = await supabase
    .from('boards')
    .insert({ name, emoji, type, password, max_players, prizes: prizes || [], created_by: userId })
    .select()
    .single()
  if (error) { console.error('createBoard:', error); return { error } }
  return { data: { ...data, label: data.emoji || '⚽', isGlobal: false } }
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
export async function loadLeaderboard(boardId) {
  const { data } = await supabase
    .from('board_scores')
    .select('total_pts, group_pts, best3_pts, knockout_pts, exact_score_pts, profiles(display_name)')
    .eq('board_id', boardId)
    .order('total_pts', { ascending: false })
    .limit(50)
  return (data || []).map((row, i) => ({
    rank:   i + 1,
    name:   row.profiles?.display_name || '—',
    pts:    row.total_pts || 0,
    accent: '#fff',
  }))
}
