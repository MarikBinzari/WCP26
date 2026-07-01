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

export function requireServiceRole(req: Request): Response | null {
  const token = bearerToken(req)
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const cronSecret = Deno.env.get('POLL_LIVE_SCORES_SECRET')
  if (!token || (token !== serviceRoleKey && token !== cronSecret)) {
    return json({ error: 'Unauthorized' }, 401)
  }
  return null
}
