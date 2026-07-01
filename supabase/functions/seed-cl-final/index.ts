// One-time seed: inserts UCL Final 2026 into match_days + matches tables
// so that exact-score predictions can be saved for match_key "-1-0"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireAdminOrServiceRole } from '../_shared/auth.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const authError = await requireAdminOrServiceRole(req)
  if (authError) return authError

  // 1. Upsert match_day for May 30 (day_number = -1)
  const { error: dayErr } = await supabase
    .from('match_days')
    .upsert({
      id:          'b5c2a1d0-4e3f-4a2b-9c1d-0e5f6a7b8c9d',
      day_number:  -1,
      match_date:  '2026-05-30',
      label:       '30 May',
    }, { onConflict: 'id' })

  if (dayErr) {
    return new Response(JSON.stringify({ error: 'match_days insert failed', detail: dayErr.message }), { status: 500 })
  }

  // 2. Upsert match for UCL Final (match_key = "-1-0")
  const { error: matchErr } = await supabase
    .from('matches')
    .upsert({
      id:           'a1b2c3d4-e5f6-4a2b-9c1d-0e5f6a7b8c9d',
      match_key:    '-1-0',
      match_day_id: 'b5c2a1d0-4e3f-4a2b-9c1d-0e5f6a7b8c9d',
      match_time:   '18:00',
      stage:        'final',
      venue:        'Puskás Aréna, Budapest',
    }, { onConflict: 'id' })

  if (matchErr) {
    return new Response(JSON.stringify({ error: 'matches insert failed', detail: matchErr.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true, message: 'UCL Final seeded: match_key=-1-0' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
