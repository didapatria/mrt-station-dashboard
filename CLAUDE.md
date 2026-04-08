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

### Docker
- Start all services: `docker-compose up -d`
- Stop all services: `docker-compose down`
- Rebuild: `docker-compose up -d --build`

## Tech Stack

### Frontend
- React 19 + TypeScript (Vite)
- Zustand (state management)
- Tailwind CSS 4 + Shadcn UI (styling)
- React Hook Form + Zod (form handling & validation)
- Framer Motion (animations)
- React Router v7 (routing)
- Axios (HTTP client)

### Backend
- Node.js + Express.js + TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication (jsonwebtoken + bcryptjs)
- Zod (request validation)

### Infrastructure
- Docker + docker-compose (PostgreSQL, backend, frontend)

## Architecture

### Frontend (`/frontend/src`)
```
src/
├── components/     # Reusable UI components (Shadcn + custom)
├── pages/          # Route page components
├── store/          # Zustand stores
├── services/       # API service layer (axios)
├── hooks/          # Custom React hooks
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
React Page → Zustand Store → API Service (axios) → Express Route → Controller → Service → Prisma → PostgreSQL
```

## Rules
- Use TypeScript strict mode in both frontend and backend
- API responses follow consistent envelope: `{ success, data?, message?, error? }`
- All form inputs validated with Zod schemas (shared patterns between FE/BE)
- Use named exports, never default exports (except pages for lazy loading)
- Backend controllers are thin — business logic goes in services
- Frontend components are functional components with hooks only
- Environment variables via `.env` files (never commit secrets)
