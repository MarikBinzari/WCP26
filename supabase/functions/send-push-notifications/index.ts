// Edge Function: send-push-notifications
// Trimite un push Web Push la toți utilizatorii abonați.
// Apelat manual (sau dintr-un trigger) cu: { title, body, url? }
// Autorizare: header Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>

import webpush from 'npm:web-push@3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireServiceRole } from '../_shared/auth.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

Deno.serve(async (req) => {
  const authError = await requireServiceRole(req)
  if (authError) return authError

  let title = '', body = '', url = '/', userIds: string[] | null = null
  try {
    const payload = await req.json()
    title   = payload.title    ?? ''
    body    = payload.body     ?? ''
    url     = payload.url      ?? '/'
    userIds = Array.isArray(payload.user_ids) ? payload.user_ids : null
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  if (!title) return new Response('title is required', { status: 400 })

  let query = supabase.from('push_subscriptions').select('user_id,endpoint,p256dh,auth,created_at')
  if (userIds?.length) query = query.in('user_id', userIds)

  const { data: subscriptionRows, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const latestByUser = new Map<string, any>()
  for (const sub of subscriptionRows ?? []) {
    if (!latestByUser.has(sub.user_id)) latestByUser.set(sub.user_id, sub)
  }
  const subs = Array.from(latestByUser.values())

  if (!subs.length) {
    return new Response(JSON.stringify({ sent: 0, failed: 0, removed: 0 }), { status: 200 })
  }

  const pushPayload = JSON.stringify({ title, body, url })

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        pushPayload
      )
    )
  )

  // Șterge subscripțiile expirate / invalide (410 Gone, 404 Not Found)
  const expiredEndpoints: string[] = []
  const failureCodes: Record<string, number> = {}
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const statusCode = (r.reason as any)?.statusCode
      const code = String(statusCode ?? 'unknown')
      failureCodes[code] = (failureCodes[code] ?? 0) + 1
      console.error(`[push] failed ${code}: ${(r.reason as any)?.body ?? (r.reason as any)?.message ?? r.reason}`)
      if (statusCode === 410 || statusCode === 404) {
        expiredEndpoints.push(subs[i].endpoint)
      }
    }
  })

  if (expiredEndpoints.length) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expiredEndpoints)
  }

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return new Response(
    JSON.stringify({ total:subs.length, sent, failed, removed:expiredEndpoints.length, failureCodes }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
