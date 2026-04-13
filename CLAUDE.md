# KidCode — Claude Code Guide

## Quick Start

```bash
# 1. Install frontend deps
npm install

# 2. Start frontend dev server (http://localhost:5173)
npm run dev

# 3. In a second terminal — install and start the API
cd api && npm install && npm run start:dev
```

The app works in **demo mode** (no API needed). The AI tutor falls back to typed local responses when the API is not running.

## Project Structure

```
kid-code/
├── src/                    # Vite + React frontend
│   ├── pages/              # One file per route
│   ├── components/
│   │   ├── ui/             # Button, Card, Progress, Modal
│   │   ├── layout/         # Sidebar, TopBar, AppShell
│   │   ├── mascot/         # Spark animated mascot
│   │   └── gamification/   # BadgeUnlockModal, XpNotification
│   ├── atoms/              # Jotai atoms (user, progress, theme, tutor, playground, mascot)
│   ├── lib/
│   │   ├── supabase.ts     # Browser Supabase client
│   │   ├── content/        # curriculum.ts — full lesson data
│   │   ├── gamification/   # badges.ts, xp.ts, streaks.ts
│   │   └── utils/          # cn.ts, age.ts
│   └── types/              # curriculum, user, progress, project
│
├── api/                    # NestJS backend (Cloud Run)
│   └── src/
│       ├── tutor/          # POST /api/tutor — Claude SSE streaming
│       ├── github/         # OAuth callback + Octokit push
│       ├── progress/       # XP, badges, streaks, lesson completions
│       ├── projects/       # Project CRUD + file upsert
│       └── common/
│           ├── supabase.service.ts   # Admin Supabase client
│           └── guards/auth.guard.ts  # JWT validation via Supabase
│
└── supabase/migrations/    # 001–004 SQL migrations
```

## Dev Servers

| Server | Command | URL |
|---|---|---|
| Frontend (Vite) | `npm run dev` | http://localhost:5173 |
| API (NestJS) | `cd api && npm run start:dev` | http://localhost:3030 |

Vite proxies `/api/*` → `localhost:3030` so no CORS issues in dev.

## Git Workflow

**Always create a branch before making any code changes** — no commits directly to `main`, ever.

### Branch naming
```
feature/short-description    # new functionality
fix/short-description        # bug fixes
chore/short-description      # config, deps, docs, refactors
```

### Workflow for every task
```bash
# 1. Make sure main is up to date
git checkout main && git pull

# 2. Create and switch to a new branch
git checkout -b feature/my-feature

# 3. Make changes, commit with a clear message
git add <files>
git commit -m "feat: description of what and why"

# 4. Push and open a PR — but DO NOT merge it
git push -u origin feature/my-feature
gh pr create --title "..." --body "..."
```

**Never merge a PR without explicit permission from the user.** After opening a PR, stop and share the PR URL. Wait for the user to review and say "merge it" (or similar) before running `gh pr merge`.

## Key Conventions

- **State**: All global state is in Jotai atoms under `src/atoms/`. Never use React context for shared state.
- **Styling**: Tailwind only. Custom colors are `kc-purple`, `kc-coral`, `kc-blue`, `kc-green`, `kc-yellow` (defined in `tailwind.config.ts`). Custom shadows: `shadow-kid`, `shadow-card`.
- **Routing**: React Router v6. All routes defined in `src/App.tsx`. Pages live in `src/pages/`.
- **API calls**: Use the `VITE_API_BASE_URL` env var (falls back to `http://localhost:3030`). The frontend Vite proxy handles `/api` in dev — direct fetch to `/api/...` works without the full base URL.
- **Auth**: Supabase Auth. The `profileAtom` in `src/atoms/userAtoms.ts` holds the user profile. Server routes are protected by `AuthGuard` which validates the Supabase JWT from the `Authorization: Bearer` header.
- **SSE streaming**: The tutor page reads the API response as a `ReadableStream` — `response.body.getReader()`. The NestJS side writes `data: <json>\n\n` lines.

## Environment

### Frontend (`/.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GITHUB_CLIENT_ID=      # optional
VITE_API_BASE_URL=http://localhost:3030
```

### API (`/api/.env`)
```
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=  # NOT the anon key
GITHUB_CLIENT_ID=           # optional
GITHUB_CLIENT_SECRET=       # optional
GITHUB_REDIRECT_URI=http://localhost:3030/api/github/callback
SPA_ORIGIN=http://localhost:5173
PORT=3030
```

## Common Tasks

### Add a new lesson topic

1. Edit `src/lib/content/curriculum.ts` — add a `Topic` to the relevant `Subject.topics` array.
2. Each topic has `sections: Section[]` with types: `text`, `code`, `try-it`, `visual`.
3. The `LearnTopic` page renders sections automatically — no new components needed.

### Add a new badge

1. Edit `src/lib/gamification/badges.ts` — add a `BadgeDefinition` to `ALL_BADGES`.
2. Add the corresponding `INSERT` to `supabase/migrations/002_gamification.sql`.
3. Trigger badge unlock by calling `POST /api/progress/badge` with the badge ID.

### Add a new API endpoint

1. Add method to the relevant service in `api/src/`.
2. Add the route to the controller.
3. Protected routes: add `@UseGuards(AuthGuard)` — user is available as `(req as any).user`.

### Run the NestJS type check

```bash
cd api && npm run build
```

### Deploy

```bash
# Frontend
npm run build && npx firebase deploy --only hosting

# API
gcloud run deploy kidcode-api --source ./api --region us-central1 --allow-unauthenticated
```

## Database (Supabase)

Run migrations in order via the Supabase SQL Editor or CLI:

```
supabase/migrations/001_initial_schema.sql   # profiles, xp_log, user_stats, lesson_completions
supabase/migrations/002_gamification.sql     # badges, quiz tables + badge seed data
supabase/migrations/003_projects.sql         # projects, project_files
supabase/migrations/004_parent_dashboard.sql # parent-student links, student_summary view
```

All tables have RLS enabled. The API uses the **service role key** to bypass RLS server-side. The browser client uses the **anon key** and relies on RLS policies.

## Gotchas

- **Monaco Editor** is loaded via `React.lazy` — don't import it at the top of a file.
- **iframe sandbox**: the playground preview uses `sandbox="allow-scripts"` only — no `allow-same-origin`. Console output is bridged via `postMessage`.
- **Supabase demo mode**: the browser client gracefully degrades if env vars are missing (sets placeholder URLs). Auth won't work but the UI renders.
- **NestJS Express types**: use `import type { Request, Response } from 'express'` (not value imports) due to `isolatedModules` + `emitDecoratorMetadata` constraints.
- **Block editor**: the "Run" button simulates execution safely — no `eval`. It only processes print/loop blocks.
