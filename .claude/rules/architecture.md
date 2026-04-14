---
paths:
  - "frontend/src/**"
  - "backend/src/**"
---

# Architecture Rules

## Frontend
- Pages are lazy-loaded via React Router with Suspense fallback
- Server state (API data) managed by TanStack Query hooks in `hooks/` directory
- Client state (auth token, theme) managed by Zustand stores in `store/` directory
- API calls go through services/ layer, never directly in components
- TanStack Query hooks wrap service calls and handle caching/invalidation
- Forms use React Hook Form + Zod resolver pattern
- Shadcn UI for base components, custom components extend them
- All user-facing strings use `t()` from react-i18next
- Use inline styles for flex layouts (linter-safe)
- Nav items organized in groups (operations, management, system)
- Admin-only features gated by `useRole()` hook

## Backend
- Controllers handle HTTP concerns only (parse request, send response)
- Services contain business logic and database operations via Prisma
- Validators define Zod schemas used in validation middleware
- Auth middleware extracts JWT and attaches user to request
- Admin middleware checks role for protected endpoints
- Activity logging on all CUD operations via activityLogService
- SSE broadcasts on data changes for real-time notifications
- Rate limiting on API (100 req/15min) and auth (20 req/15min)
- All database mutations wrapped in try-catch with proper error responses
