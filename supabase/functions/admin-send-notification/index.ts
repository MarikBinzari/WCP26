// Edge Function: admin-send-notification
// Apelat din app cu JWT-ul admin-ului.
// Inserează în system_notifications + trimite push la toți abonații.

import webpush from 'npm:web-push@3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const ADMIN_EMAILS = ['lupasqcatalin@gmail.com', 'admin@wcp2026.com']

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')

  // Verifică că apelantul e admin
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return new Response('Unauthorized', { status: 401 })
  }

  let title = '', body = '', display_date = ''
  try {
    const payload = await req.json()
    title        = (payload.title        ?? '').trim()
    body         = (payload.body         ?? '').trim()
    display_date = (payload.display_date ?? new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }))
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!title) return new Response('title is required', { status: 400 })

  // Inserează notificarea în tabel
  const { data: notif, error: insertErr } = await supabaseAdmin
    .from('system_notifications')
    .insert({ title, body, display_date, active: true, sort_order: 0 })
    .select('id')
    .single()

  if (insertErr) {
    return new Response(JSON.stringify({ error: insertErr.message }), { status: 500 })
  }

  // Trimite push la toți abonații
  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

  if (!subs?.length) {
    return new Response(JSON.stringify({ sent: 0, notifId: notif.id }), { status: 200 })
  }

  const pushPayload = JSON.stringify({ title, body, url: '/' })

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        pushPayload
      )
    )
  )

  // Șterge subscripțiile expirate
  const expiredEndpoints = subs
    .filter((_, i) => {
      const r = results[i]
      return r.status === 'rejected' && [410, 404].includes((r.reason as any)?.statusCode)
    })
    .map(s => s.endpoint)

  if (expiredEndpoints.length) {
    await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  const failureCodes: Record<string, number> = {}
  results.forEach(result => {
    if (result.status !== 'rejected') return
    const code = String((result.reason as any)?.statusCode ?? 'unknown')
    failureCodes[code] = (failureCodes[code] ?? 0) + 1
    console.error(`[push] failed ${code}: ${(result.reason as any)?.body ?? (result.reason as any)?.message ?? result.reason}`)
  })

  return new Response(
    JSON.stringify({ total:subs.length, sent, failed, removed:expiredEndpoints.length, failureCodes, notifId:notif.id }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
