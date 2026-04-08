---
paths:
  - "frontend/src/**"
  - "backend/src/**"
---

# Architecture Rules

## Frontend
- Pages are lazy-loaded via React Router
- Zustand stores are per-domain (authStore, stationStore, scheduleStore)
- API calls go through services/ layer, never directly in components
- Forms use React Hook Form + Zod resolver pattern
- Shadcn UI for base components, custom components extend them

## Backend
- Controllers handle HTTP concerns only (parse request, send response)
- Services contain business logic and database operations via Prisma
- Validators define Zod schemas used in validation middleware
- Auth middleware extracts JWT and attaches user to request
- All database mutations wrapped in try-catch with proper error responses
