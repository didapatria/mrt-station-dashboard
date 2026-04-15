# MRT Station Management Dashboard

## Project Overview
Full-stack web application for managing MRT Jakarta stations and schedules. Built as a portfolio project demonstrating full-stack proficiency with 100+ commits, 14+ pages, 40+ features, 46 E2E tests.

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
- Vitest + React Testing Library (testing)

### Backend
- Node.js + Express.js 5 + TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication (jsonwebtoken + bcryptjs)
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
├── controllers/    # Request handlers (auth, station, schedule, user, activity-log)
├── middlewares/     # Auth, admin, error handling, validation, rate limiting
├── routes/         # Express route definitions
├── services/       # Business logic (+ activity-log, sse)
├── validators/     # Zod schemas for request validation
├── __tests__/      # API tests (Supertest)
└── prisma/         # Schema, migrations, seed
```

## Pages
- Dashboard, Stations, Station Detail, Schedules, Station Map
- Route Planner, Station Compare, Users (Admin), Activity Log
- Settings, Changelog, Profile, 404

## Data Flow
```
React Page → TanStack Query Hook → API Service (axios) → Express Route → Controller → Service → Prisma → PostgreSQL
```

## State Management
- **Server state**: TanStack Query (5min staleTime, auto-invalidation)
- **Client state**: Zustand + localStorage (auth token, theme, language)

## Rules
- Use TypeScript strict mode in both frontend and backend
- API responses follow envelope: `{ success, data?, message?, error?, meta? }`
- All form inputs validated with Zod schemas
- Use named exports, never default exports (except pages for lazy loading)
- Backend controllers are thin — business logic goes in services
- Server state uses TanStack Query hooks, not Zustand
- Mutations use `useMutation` with `queryClient.invalidateQueries`
- RBAC: use `useRole()` hook for conditional UI
- i18n: use `t()` for all user-facing strings
- Use inline styles for flex layouts to prevent linter issues
- Tests: co-locate with source, use Vitest + RTL
- E2E: Playwright tests in `/e2e`, use `adminPage` fixture for authenticated tests
- E2E: use `navigateTo(page, "/path")` for SPA navigation (sidebar link clicks)
- E2E: never use `waitForLoadState("networkidle")` — SSE connections prevent it
