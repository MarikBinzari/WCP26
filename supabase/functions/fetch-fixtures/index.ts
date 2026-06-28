Deno.serve(async (req) => {
  const apiKey = Deno.env.get('API_FOOTBALL_KEY')
  if (!apiKey) return new Response(JSON.stringify({ error: 'API_FOOTBALL_KEY not set' }), { status: 500 })

  const url = new URL(req.url)
  const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10)

  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${date}`,
    { headers: { 'x-apisports-key': apiKey } }
  )
  const data = await res.json()

  const fixtures = (data.response || []).map((f: any) => ({
    id: f.fixture?.id,
    date: f.fixture?.date,
    home: f.teams?.home?.name,
    away: f.teams?.away?.name,
    status: f.fixture?.status?.short,
    score_home: f.score?.fullTime?.home,
    score_away: f.score?.fullTime?.away,
  }))

  return new Response(JSON.stringify({ date, fixtures, total: fixtures.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
