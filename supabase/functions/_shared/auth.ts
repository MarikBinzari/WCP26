import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function adminEmails() {
  return (Deno.env.get('ADMIN_EMAILS') || 'lupasqcatalin@gmail.com,admin@wcp2026.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

function bearerToken(req: Request) {
  const auth = req.headers.get('Authorization') || ''
  return auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
}

export async function requireAdminOrServiceRole(req: Request): Promise<Response | null> {
  const token = bearerToken(req)
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!token) return json({ error: 'Unauthorized' }, 401)
  if (serviceRoleKey && token === serviceRoleKey) return null

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Auth not configured' }, 500)

  const authClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await authClient.auth.getUser(token)
  const email = data?.user?.email?.toLowerCase()

  if (error || !email || !adminEmails().includes(email)) {
    return json({ error: 'Forbidden' }, 403)
  }

  return null
}

export async function requireServiceRole(req: Request): Promise<Response | null> {
  const token = bearerToken(req)
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const cronSecret = Deno.env.get('POLL_LIVE_SCORES_SECRET')
  if (!token) return json({ error: 'Unauthorized' }, 401)
  if (token === serviceRoleKey || token === cronSecret) return null

  // Supabase projects can have both a legacy service_role JWT and a newer
  // secret key. Validate legacy JWTs against PostgREST before trusting role.
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return json({ error: 'Unauthorized' }, 401)
    const padded = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded))
    if (payload?.role !== 'service_role') return json({ error: 'Unauthorized' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!supabaseUrl) return json({ error: 'Auth not configured' }, 500)
    const verification = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { apikey: token, Authorization: `Bearer ${token}` },
    })
    if (verification.ok) return null
  } catch {
    // Return the common unauthorized response below.
  }
  return json({ error: 'Unauthorized' }, 401)
}
