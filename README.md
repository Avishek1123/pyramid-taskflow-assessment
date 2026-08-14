# Pyramid — Task Management System

Full-stack technical assessment: a task management app implemented from the provided Figma design.

**Repository:** [https://github.com/Avishek1123/pyramid-taskflow-assessment](https://github.com/Avishek1123/pyramid-taskflow-assessment)  
**Live app:** _add your Vercel URL after deploy_  
**API health:** _add your Render URL_ `/api/health`  
**Part 2:** [docs/PART2-ABLESPACE.md](docs/PART2-ABLESPACE.md)

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| UI | Reusable components (buttons, dialogs, selects, badges, sidebar, task cards) |
| Data | TanStack Query, dnd-kit (Kanban drag and drop) |
| Theme | `next-themes` (light / dark) + Color Mode accent (persisted) |
| Backend | NestJS 11, class-validator, JWT guest auth |
| Database | SQLite via Prisma (assignment allows any DB) |

---

## Features

- Guest login (and Google button that explains this is a demo, then signs in as guest)
- Workspace switcher, create workspace, delete workspace with “Are you sure?” confirm
- Current workspace indicator
- Project list and Kanban / list task views
- Task detail: properties, labels, resources, subtasks, comments, details, updates
- Light / dark theme persisted across refresh (`taskflow-theme`)
- Color Mode (Amber, Blue, Pink, Rose, Emerald, Black) persisted (`taskflow_color_mode`)
- Collapsible sidebar (icon rail, not fully hidden)
- Responsive layout for desktop, tablet, and mobile
- Validated NestJS APIs with JWT on protected routes

---

## Local development

### Prerequisites

- Node.js 20+
- npm

### Backend (port 4000)

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run start:dev
```

API: `http://localhost:4000/api`  
Health: `http://localhost:4000/api/health`

### Frontend (port 3001)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3001`

Open the app, click **Continue as Guest**, and you land on the seeded **Design Homepage** board (Dexter workspace).

---

## Environment variables

### Backend

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma SQLite path, e.g. `file:./dev.db` |
| `JWT_SECRET` | Secret used to sign guest JWTs |
| `PORT` | Defaults to `4000` locally; hosts set this automatically |
| `FRONTEND_URL` | Comma-separated allowed CORS origins |
| `NODE_ENV` | `development` or `production` |

### Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base including `/api`, e.g. `https://your-api.onrender.com/api` |

---

## Theme support

- **Appearance:** Light and Dark, matching the Figma theme control. Stored in `localStorage` via `next-themes` (`taskflow-theme`) so the choice survives refresh.
- **Color Mode:** Changes the accent / focus ring used on inputs, buttons, and drag states. Stored in `localStorage` (`taskflow_color_mode`).

---

## API overview

All routes are under `/api`. Protected routes expect `Authorization: Bearer <jwt>`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Liveness check |
| POST | `/auth/guest` | No | Create or resume guest session |
| GET | `/auth/me` | Yes | Current user |
| GET/POST | `/workspaces` | Yes | List / create workspaces |
| DELETE | `/workspaces/:id` | Yes | Delete workspace (owner, keep at least one) |
| GET/POST | `/projects` | Yes | List / create projects |
| GET/POST | `/columns` | Yes | Board columns |
| GET/POST/PATCH/DELETE | `/tasks` | Yes | Tasks with validation |
| GET/POST | `/labels` | Yes | Labels |

Validation uses NestJS `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) plus `class-validator` DTOs.

---

## Project structure

```
backend/          NestJS API, Prisma schema, JWT auth
frontend/         Next.js App Router UI
docs/             Part 2 product write-up
render.yaml       Render backend blueprint
```

Reusable frontend pieces live under `frontend/src/components` (layout, task cards, filters, UI primitives). Backend modules are split by domain: `auth`, `workspaces`, `projects`, `columns`, `tasks`, `labels`.

---

## Design notes / intentional deviations

Implementation follows the Figma assessment file and the provided screenshots as closely as possible (layout, typography, spacing, colors, icons, theme, and interactions).

Documented product choices:

- **Google login** is not wired to Firebase. The button shows a demo notice and continues as guest, as specified for this assessment.
- **SQLite** is used so the project runs with zero cloud database setup. Guest login reseeds the Dexter / Design Homepage demo if the database is empty.
- On free hosting, the SQLite file can reset when the backend restarts. Guest login recreates the demo data automatically.

---

## Deploy (easiest path — free)

You need two free accounts: [Render](https://render.com) (API) and [Vercel](https://vercel.com) (frontend). Deploy **backend first**, then frontend.

### 1. Push this repo to GitHub

Create a **public** repository, then:

```bash
git init
git add .
git commit -m "Initial commit: TaskFlow assessment app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Keep the repo public for at least 45 days after submission.

### 2. Deploy the NestJS API on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service** → connect the GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance:** Free
3. Environment variables:

   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `file:./prod.db` |
   | `JWT_SECRET` | any long random string |
   | `FRONTEND_URL` | `https://YOUR-VERCEL-APP.vercel.app` (update after step 3; `*.vercel.app` is already allowed) |

4. Deploy. Copy the service URL, for example `https://taskflow-api-xxxx.onrender.com`.
5. Confirm `https://taskflow-api-xxxx.onrender.com/api/health` returns `{ "ok": true }`.

Free Render services sleep after idle time. The first request after sleep can take 30–60 seconds. Open the health URL once before you demo the app.

### 3. Deploy the Next.js app on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new) → import the same GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js
3. Environment variable (Production + Preview):

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://taskflow-api-xxxx.onrender.com/api` |

4. Deploy. Copy the URL, for example `https://your-app.vercel.app`.
5. Back on Render, set `FRONTEND_URL` to that exact origin (no trailing slash) and redeploy the API if needed.

### 4. Smoke test before you submit

- Open the Vercel URL (not localhost).
- Click **Continue as Guest**.
- Confirm the Kanban board, task detail, theme toggle, color mode, workspace switcher, and settings/profile load.
- Refresh the page and confirm theme + session persist.

---

## Part 2 — Product understanding

See [docs/PART2-ABLESPACE.md](docs/PART2-ABLESPACE.md) for the AbleSpace Caseload → Take Data walkthrough and UX notes.

---

## License

UNLICENSED — assessment submission only.
