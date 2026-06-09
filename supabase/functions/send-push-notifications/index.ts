// Edge Function: send-push-notifications
// Trimite un push Web Push la toți utilizatorii abonați.
// Apelat manual (sau dintr-un trigger) cu: { title, body, url? }
// Autorizare: header Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>

import webpush from 'npm:web-push@3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  const authHeader = req.headers.get('Authorization') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  if (authHeader !== `Bearer ${serviceKey}`) {
    return new Response('Unauthorized', { status: 401 })
  }

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

  let query = supabase.from('push_subscriptions').select('endpoint, p256dh, auth')
  if (userIds?.length) query = query.in('user_id', userIds)

  const { data: subs, error } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!subs?.length) {
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
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const statusCode = (r.reason as any)?.statusCode
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
    JSON.stringify({ sent, failed, removed: expiredEndpoints.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
