# MRT Station Management Dashboard

## Project Overview
Full-stack web application for managing MRT Jakarta stations and schedules. Built as a portfolio project demonstrating full-stack proficiency with 100+ commits, 14+ pages, 40+ features, 93 E2E tests.

## Commands

### Backend (`/backend`)
- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Database migrate: `npx prisma migrate dev`
- Database seed: `npm run seed`
- Database reset + seed: `npm run db:fresh:seed` (like Laravel migrate:fresh --seed)
- Database reset only: `npm run db:fresh`
- Generate Prisma client: `npx prisma generate`
- Prisma Studio: `npm run db:studio`
- Test: `NODE_ENV=test npm run test:run`

### Frontend (`/frontend`)
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`
- Test: `npm run test:run`
- Test watch: `npm test`

### E2E Tests (`/e2e`) — Playwright
- Prerequisites: both backend and frontend must be running
- Run all: `npm run e2e` (from project root)
- Run headed (see browser): `npm run e2e:headed`
- Run with UI mode: `npm run e2e:ui`
- Run single file: `npx playwright test e2e/stations.spec.ts`
- Run by grep: `npx playwright test -g "should create"`
- Show last report: `npm run e2e:report`
- Debug mode: `npx playwright test --debug`

### Docker
- Start all services: `docker-compose up -d`
- Stop all services: `docker-compose down`
- Rebuild: `docker-compose up -d --build`

## Tech Stack

### Frontend
- React 19 + TypeScript (Vite 8)
- Tailwind CSS 4 + Shadcn UI (19+ components)
- Zustand (client state: auth token, theme)
- TanStack Query (server state: data fetching, caching, mutations)
- React Hook Form + Zod (form handling & validation)
- Recharts (charts: bar, pie)
- Leaflet + React-Leaflet (interactive maps)
- react-i18next (internationalization: EN/ID)
- jsPDF + jspdf-autotable (PDF report export)
- react-joyride (onboarding tour)
- Framer Motion (animations)
- React Router v7 (routing with lazy loading)
- Axios (HTTP client)
- @react-oauth/google (Google OAuth)
- Vitest + React Testing Library (testing)

### Backend
- Node.js + Express.js 5 + TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication (jsonwebtoken + bcryptjs) + Google OAuth (google-auth-library)
- Zod (request validation)
- express-rate-limit (API rate limiting)
- Server-Sent Events (real-time notifications)
- Swagger/OpenAPI documentation

### Infrastructure
- Docker + docker-compose (PostgreSQL, backend, frontend)
- GitHub Actions CI/CD (lint, type check, test, build)
- PWA (manifest, service worker, offline map tiles)
- Playwright (E2E testing)

## Architecture

### Frontend (`/frontend/src`)
```
src/
├── components/     # Reusable UI components (Shadcn + custom)
├── pages/          # 14 route page components (lazy loaded)
├── hooks/          # TanStack Query hooks + custom hooks
├── store/          # Zustand stores (auth, theme)
├── services/       # API service layer (axios)
├── i18n/           # Internationalization (en.json, id.json)
├── lib/            # Utility functions (cn, export-pdf)
├── types/          # TypeScript type definitions
└── layouts/        # Layout components (auth, dashboard)
```

### Backend (`/backend/src`)
```
src/
├── controllers/    # Request handlers (auth, station, schedule, user, activity-log, permission, feedback)
├── middlewares/     # Auth, admin, error handling, validation, rate limiting
├── routes/         # Express route definitions
├── services/       # Business logic (+ activity-log, sse, permission, feedback)
├── validators/     # Zod schemas for request validation
├── __tests__/      # API tests (Supertest)
└── prisma/         # Schema, migrations, seed
```

## Pages
- Dashboard, Stations, Station Detail, Schedules, Station Map
- Route Planner, Station Compare, Users (Admin), Access Management (Admin)
- Activity Log, Settings, Changelog, Profile, 404

## Data Flow
```
React Page → TanStack Query Hook → API Service (axios) → Express Route → Controller → Service → Prisma → PostgreSQL
```

## State Management
- **Server state**: TanStack Query (5min staleTime, auto-invalidation)
- **Client state**: Zustand + localStorage (auth token, theme, language, permissions[])

## Rules
- Use TypeScript strict mode in both frontend and backend
- API responses follow envelope: `{ success, data?, message?, error?, meta? }`
- All form inputs validated with Zod schemas
- Use named exports, never default exports (except pages for lazy loading)
- Backend controllers are thin — business logic goes in services
- Server state uses TanStack Query hooks, not Zustand
- Mutations use `useMutation` with `queryClient.invalidateQueries`
- RBAC: use `usePermission()` hook for permission-based UI, `useRole()` for role checks
- Permissions: stored in DB (`permissions` + `role_permissions` tables), fetched via `GET /api/permissions/me` on login, stored in Zustand auth store `permissions[]`, enforced by backend adminMiddleware on CUD routes
- `lib/permissions.ts` contains only UI labels/groups (no hardcoded role data)
- i18n: use `t()` for all user-facing strings
- Use inline styles for flex layouts to prevent linter issues
- Fonts: Sora (body), Bebas Neue (`font-display` class), JetBrains Mono (`font-mono`) — loaded via Google Fonts in index.html
- Tests: co-locate with source, use Vitest + RTL
- E2E: Playwright tests in `/e2e`, use `adminPage` fixture for authenticated tests
- E2E: use `navigateTo(page, "/path")` for SPA navigation (sidebar link clicks)
- E2E: never use `waitForLoadState("networkidle")` — SSE connections prevent it

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->