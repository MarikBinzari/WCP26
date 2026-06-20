# Predicto — World Cup 2026 Prediction App

A full-stack football prediction platform built for the FIFA World Cup 2026. Players predict group standings, the knockout bracket, exact match scores, and bonus picks (champion, runner-up, top scorer) — competing in a global league or private friend groups.

**Stack:** React 19 · Vite 8 · Supabase · PostgreSQL · Vercel · PWA

---

## Features

### Prediction System

Three independent prediction phases with separate deadlines and scoring:

| Phase | Description | Deadline |
|---|---|---|
| Groups + Best Third | Rank all 12 groups (48 teams) and pick 8 best-third qualifiers | Jun 11 |
| Knockout Bracket | R32 → R16 → QF → SF → Final path to the trophy | Jun 27 |
| Exact Scores | Predict exact scoreline for every match (unlocks every Sunday) | Per match kickoff |

### Bonus Picks (Special Picks)

- **Champion** — pick the tournament winner (+100 pts if correct)
- **Runner-up** — pick the finalist (+30 pts)
- **Top Scorer** — pick the player; earns **+5 pts per goal scored live**, and a +50 pt bonus at tournament end if they finish as overall top scorer

Live bonus scoring is handled by a PostgreSQL trigger on `match_events` — points update automatically after each goal, no manual intervention needed.

### Live Scores & Real-time Updates

- Live score feed with status indicators: LIVE, ET (extra time), PEN, FT
- Current minute display during live matches
- Penalty shootout scores tracked separately
- Supabase Realtime subscription for instant UI updates
- **Central Stats screen:** view live scorelines, current ranking, and everyone's predictions per match — all in one place

### Leagues (Boards)

- **Global League** — open to all users, live leaderboard
- **Private Leagues** — create groups with custom name, emoji, cover image, optional password (bcrypt via pgcrypto), max player limit, and prize descriptions
- Join by invite code or search by name
- Admin controls: remove members, edit settings, delete league
- Copy predictions or exact scores from one league to another

### Leaderboard & Ranking Movement

- Real-time leaderboard with total points across all scoring sources
- `ranking_snapshots` table captures rankings periodically; leaderboard shows **▲ / ▼ movement arrows** per player
- Determinist tiebreaker (`pts desc, uid asc`) to prevent false movement indicators at equal points
- Full per-user score breakdown by source

### Chat

- Real-time chat per league via Supabase Realtime
- Rolling 50-message limit per board (no daily reset)
- Like / dislike reactions, message editing, admin moderation

### Notifications

- **Web Push Notifications** — subscriptions stored server-side, works on mobile as PWA
- **In-app system notifications** — multilingual (EN / RO / FR), with read state tracked per user and configurable expiry

### Authentication

- Email + password, magic link, password reset, set-password flow for magic-link signups
- hCaptcha anti-bot protection on registration
- Avatar upload and league cover image upload via Supabase Storage
- Full Row Level Security on every table

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Backend / DB | Supabase (PostgreSQL 15, Auth, Realtime, Storage) |
| Deployment | Vercel (CI/CD on push) |
| PWA | vite-plugin-pwa — installable on iOS and Android |
| Image optimization | sharp (WebP conversion at build time) |
| Captcha | hCaptcha |
| Testing / automation | Playwright |

---

## Database Architecture

35+ SQL migrations defining the full schema, business logic, and automation:

```
supabase/migrations/
├── wc_fixtures_setup.sql                          # teams, groups, matches
├── special_picks_setup.sql                        # champion / runner-up / top scorer picks
├── live_scores_setup.sql                          # live score feed schema
├── 20260617000000_match_events.sql                # goal-level event tracking
├── 20260618000000_live_bonus_scoring.sql          # triggers: goal → pts, FT final → champion
├── 20260618000002_ranking_snapshots.sql           # snapshot table for movement arrows
├── 20260619000000_fix_ranking_movement_tiebreaker.sql
├── setup_cron_jobs.sql                            # pg_cron: auto scoring + snapshot jobs
└── ...
```

**Key PostgreSQL functions:**

| Function | Description |
|---|---|
| `apply_bracket_scores()` | Score all knockout bracket predictions |
| `apply_exact_scores()` | Score exact scoreline predictions per match |
| `auto_score_special_picks()` | Recalculate champion / runner-up / top scorer pts |
| `get_leaderboard(board_id, search)` | Returns ranked leaderboard with movement delta |
| `take_ranking_snapshot()` | Saves current rankings to `ranking_snapshots` |
| `_trg_goal_top_scorer_pts()` | Trigger: updates top scorer pts on every goal insert |
| `_trg_final_ft_bonus()` | Trigger: detects FT on final match → auto-sets champion |

Scoring rules (points per prediction type and phase) are stored in a `scoring_rules` table — fully configurable without code changes.

---

## Project Structure

```
src/
├── App.jsx              # Single-file React app (all screens and UI components)
├── db.js                # All Supabase client calls (predictions, boards, leaderboard, chat, push…)
├── supabase.js          # Supabase client init
├── data/
│   └── worldcup2026.js  # Official WC2026 draw: groups, fixtures, flags, team colors
└── assets/              # Images, icons, logos (WebP optimized)

supabase/
├── migrations/          # All SQL migrations (schema + logic)
└── scripts/             # One-off admin scripts (score inserts, etc.)

scripts/
├── backup-predictions.mjs
└── optimize-images.js
```

---

## Local Development

**Prerequisites:** Node 20+, a Supabase project (or local Supabase CLI)

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_HCAPTCHA_SITE_KEY

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_HCAPTCHA_SITE_KEY` | hCaptcha site key |
| `VITE_CAPTCHA_PROVIDER` | `"hcaptcha"` / `"emoji"` / `"none"` (default: `"hcaptcha"`) |

---

## Scoring Rules

| Prediction | Points |
|---|---|
| Group winner (correct) | 30 pts |
| Runner-up (correct) | 20 pts |
| 3rd place (correct) | 10 pts |
| Best-third team advancing | 15 pts |
| Knockout match winner | 30 pts (scales by round) |
| Exact scoreline | 90 pts |
| Correct result (wrong score) | 30 pts |
| Score diff bonus (±1 goal) | +15 pts |
| Champion pick | 100 pts |
| Runner-up pick | 30 pts |
| Top scorer (per goal, live) | 5 pts / goal |
| Top scorer (tournament winner bonus) | +50 pts |

---

## Deployment

Deployed automatically on every push to `main` via Vercel. Database migrations are applied manually via Supabase CLI or the Supabase dashboard SQL editor.

```bash
# Apply a migration
supabase db push
```

---

## Internationalization

Full UI translation in three languages, switchable per user:

- English (EN)
- Romanian (RO)
- French (FR)

All strings are defined in a single `T` object in `App.jsx`, keyed by language code.

---

## License

Private project — all rights reserved.
