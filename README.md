# KidCode 🚀

An interactive web app that teaches kids (ages 6–14) computing basics, HTML, CSS, and JavaScript — with an AI tutor, live code playground, GitHub integration, and a gamification system.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS (custom `kc-*` color palette) |
| State | Jotai |
| Animations | Framer Motion |
| Code Editor | Monaco Editor |
| Backend API | NestJS (deployed to Cloud Run) |
| AI Tutor | Claude `claude-sonnet-4-6` via Anthropic SDK (SSE streaming) |
| Auth + DB | Supabase (Postgres + Auth + RLS) |
| GitHub | Octokit REST |
| Hosting | Firebase Hosting (frontend) + Google Cloud Run (API) |

---

## Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com) project (free tier works)
- An [Anthropic API key](https://console.anthropic.com)
- A [GitHub OAuth App](https://github.com/settings/applications/new) (optional — for GitHub integration)

---

## Docker Development (recommended)

The fastest way to get everything running. Two modes are available: **fully local** (no cloud accounts needed) or **cloud Supabase** (bring your own project).

### 1. Clone the repo

```bash
git clone https://github.com/jokamjohn/kid-code.git
cd kid-code
```

### 2. Configure environment

```bash
cp .env.docker .env
```

Then fill in `ANTHROPIC_API_KEY` (required for the AI tutor) and choose a Supabase mode below.

---

### Option A — Fully local (zero cloud dependencies)

Spins up a local Supabase stack (Postgres + GoTrue auth + PostgREST + Studio + Kong) alongside the app. No Supabase account needed.

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| API (NestJS) | http://localhost:3030/api |
| Supabase Studio | http://localhost:54323 |
| Supabase API gateway | http://localhost:54321 |
| Postgres (direct) | localhost:54322 |

**Test credentials** (created by seed.sql automatically):
| Email | Password | Role |
|---|---|---|
| `student@kidcode.local` | `password123` | student |
| `parent@kidcode.local` | `password123` | parent |

**Reset the local database:**
```bash
docker compose down -v   # removes the db-data volume
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

---

### Option B — Cloud Supabase

Edit `.env` and fill in your cloud Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then start normally:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| API (NestJS) | http://localhost:3030/api |

Both servers support **hot reload** — edit files locally and changes reflect instantly inside the containers.

### Useful Docker commands

```bash
# Start in background
docker compose up -d

# View logs
docker compose logs -f
docker compose logs -f api   # API only
docker compose logs -f web   # Frontend only

# Rebuild after adding npm packages
docker compose up --build

# Stop everything
docker compose down

# Install a new frontend package
docker compose run --rm web npm install <package>

# Install a new API package
docker compose run --rm api npm install <package>
```

---

## Local Development (without Docker)

### 1. Clone the repo

```bash
git clone https://github.com/jokamjohn/kid-code.git
cd kid-code
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GITHUB_CLIENT_ID=your-github-client-id   # optional
VITE_API_BASE_URL=http://localhost:3030
```

### 4. Start the frontend dev server

```bash
npm run dev
```

Opens at **http://localhost:5173**

> The Vite dev server proxies all `/api/*` requests to `localhost:3030` — no CORS issues.  
> The app works in **demo mode** without the API running (AI tutor uses a local fallback).

---

### 5. Install API dependencies

```bash
cd api
npm install
```

### 6. Configure API environment

```bash
cp .env.example .env
```

Edit `api/.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # service role key, not anon key
GITHUB_CLIENT_ID=your-github-client-id   # optional
GITHUB_CLIENT_SECRET=your-github-secret  # optional
GITHUB_REDIRECT_URI=http://localhost:3030/api/github/callback
SPA_ORIGIN=http://localhost:5173
PORT=3030
```

### 7. Start the NestJS API server

```bash
# from /api directory
npm run start:dev
```

Starts at **http://localhost:3030/api**

---

## Running Both Servers Together

Open two terminal tabs:

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — API
cd api && npm run start:dev
```

---

## Database Setup (Supabase)

Run the migrations in order against your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually in the Supabase SQL Editor:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_gamification.sql
# supabase/migrations/003_projects.sql
# supabase/migrations/004_parent_dashboard.sql
```

---

## Project Structure

```
kid-code/
├── src/                    # React frontend
│   ├── pages/              # Route-level pages
│   ├── components/         # UI, layout, mascot, gamification
│   ├── atoms/              # Jotai state atoms
│   ├── lib/                # Supabase client, curriculum, gamification logic
│   ├── types/              # TypeScript types
│   └── content/            # Lesson JSON files
├── api/                    # NestJS backend
│   └── src/
│       ├── tutor/          # Claude API SSE streaming
│       ├── github/         # OAuth + Octokit push
│       ├── progress/       # XP, badges, streaks
│       ├── projects/       # Project CRUD
│       └── common/         # Auth guard, Supabase service
├── supabase/
│   └── migrations/         # SQL migrations (001–004)
├── firebase.json           # Firebase Hosting config
└── .firebaserc             # Firebase project alias
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/tutor` | Stream AI tutor response (SSE) |
| POST | `/api/tutor/hint` | Stream a single code hint (SSE) |
| GET | `/api/github/callback` | GitHub OAuth callback |
| POST | `/api/github/connect` | Save GitHub token |
| GET | `/api/github/repos` | List user repos |
| POST | `/api/github/repo` | Create repo |
| POST | `/api/github/push` | Push files to GitHub |
| GET | `/api/progress` | Get XP, badges, completions |
| POST | `/api/progress/xp` | Award XP |
| POST | `/api/progress/lesson` | Mark lesson complete |
| POST | `/api/progress/badge` | Unlock badge |
| POST | `/api/progress/streak` | Update streak |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project + files |
| PUT | `/api/projects/:id/files` | Save file |
| DELETE | `/api/projects/:id` | Delete project |

---

## Deployment

### Frontend → Firebase Hosting

```bash
npm run build
npx firebase deploy --only hosting
```

### API → Google Cloud Run

```bash
gcloud run deploy kidcode-api \
  --source ./api \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets ANTHROPIC_API_KEY=anthropic-key:latest,\
SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,\
GITHUB_CLIENT_SECRET=github-client-secret:latest \
  --set-env-vars SUPABASE_URL=https://your-project.supabase.co,\
SPA_ORIGIN=https://your-firebase-app.web.app,\
GITHUB_CLIENT_ID=your-client-id,\
GITHUB_REDIRECT_URI=https://your-cloud-run-url/api/github/callback
```

> Secrets are stored in [Google Secret Manager](https://cloud.google.com/secret-manager) — never in source code.

---

## Environment Variables Reference

### Frontend (`/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `VITE_GITHUB_CLIENT_ID` | No | GitHub OAuth App client ID |
| `VITE_API_BASE_URL` | No | API base URL (default: `http://localhost:3030`) |

### API (`/api/.env`)

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth App client secret |
| `GITHUB_REDIRECT_URI` | No | GitHub OAuth callback URL |
| `SPA_ORIGIN` | No | Frontend URL for CORS (default: `http://localhost:5173`) |
| `PORT` | No | Server port (default: `3030`, Cloud Run sets this automatically) |
