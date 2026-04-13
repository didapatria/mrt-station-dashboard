# MRT Station Management Dashboard

## Project Overview
Full-stack web application for managing MRT Jakarta stations and schedules. Built as a portfolio project demonstrating MERN-like stack proficiency.

## Commands

### Backend (`/backend`)
- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Database migrate: `npx prisma migrate dev`
- Database seed: `npm run seed`
- Generate Prisma client: `npx prisma generate`

### Frontend (`/frontend`)
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`
- Test: `npm run test:run`
- Test watch: `npm test`

### Docker
- Start all services: `docker-compose up -d`
- Stop all services: `docker-compose down`
- Rebuild: `docker-compose up -d --build`

## Tech Stack

### Frontend
- React 19 + TypeScript (Vite)
- Tailwind CSS 4 + Shadcn UI (styling & UI components)
- Zustand (client state management: auth token, theme)
- TanStack Query (server state: data fetching, caching, mutations)
- React Hook Form + Zod (form handling & validation)
- Leaflet + React-Leaflet (interactive maps)
- Framer Motion (animations)
- React Router v7 (routing)
- Axios (HTTP client)
- Vitest + React Testing Library (testing)

### Backend
- Node.js + Express.js + TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication (jsonwebtoken + bcryptjs)
- Zod (request validation)

### Infrastructure
- Docker + docker-compose (PostgreSQL, backend, frontend)
- GitHub Actions CI/CD (lint, type check, test, build)

## Architecture

### Frontend (`/frontend/src`)
```
src/
├── components/     # Reusable UI components (Shadcn + custom)
├── pages/          # Route page components
├── hooks/          # TanStack Query hooks (use-stations, use-schedules, use-dashboard, use-auth)
├── store/          # Zustand stores (auth, theme — client state only)
├── services/       # API service layer (axios)
├── lib/            # Utility functions
├── types/          # TypeScript type definitions
└── layouts/        # Layout components (auth, dashboard)
```

### Backend (`/backend/src`)
```
src/
├── controllers/    # Request handlers
├── middlewares/     # Auth, error handling, validation
├── routes/         # Express route definitions
├── services/       # Business logic layer
├── validators/     # Zod schemas for request validation
└── prisma/         # Schema, migrations, seed
```

## Data Flow
```
React Page → TanStack Query Hook → API Service (axios) → Express Route → Controller → Service → Prisma → PostgreSQL
```

## State Management Strategy
- **Server state** (stations, schedules, dashboard stats, user profile): Managed by TanStack Query with automatic caching (5min staleTime), background refetching, and mutation invalidation
- **Client state** (auth token, theme preference): Managed by Zustand with localStorage persistence

## Rules
- Use TypeScript strict mode in both frontend and backend
- API responses follow consistent envelope: `{ success, data?, message?, error? }`
- All form inputs validated with Zod schemas (shared patterns between FE/BE)
- Use named exports, never default exports (except pages for lazy loading)
- Backend controllers are thin — business logic goes in services
- Frontend components are functional components with hooks only
- Environment variables via `.env` files (never commit secrets)
- Server state uses TanStack Query hooks in `hooks/` directory, not Zustand
- Mutations use `useMutation` with `queryClient.invalidateQueries` for cache sync
- RBAC: use `useRole()` hook to check `isAdmin`/`isOperator` for conditional UI
- Tests: co-locate test files with source (`foo.ts` → `foo.test.ts`), use Vitest + RTL
