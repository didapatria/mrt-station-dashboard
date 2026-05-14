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
- Permissions fetched from `GET /api/permissions/me` on login, stored in Zustand `auth.store` as `permissions[]`
- `usePermission().can(perm)` reads from store — no hardcoded role→permission mapping in frontend
- `lib/permissions.ts` contains only UI labels/groups, not permission data
- RBAC is Spatie-style 5-table: `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`
- `permissionService.getPermissionsForUser(userId)` = role perms ∪ direct user perms (deduped Set)

## Backend
- Controllers handle HTTP concerns only (parse request, send response)
- Services contain business logic and database operations via Prisma
- Validators define Zod schemas used in validation middleware
- Auth middleware extracts JWT and attaches user to request
- Google OAuth via google-auth-library (verify ID token, auto-register)
- Admin middleware checks role for protected endpoints
- RBAC: `permissionService.getPermissionsForUser(userId)` merges role + direct permissions; called in auth.service on login/register/google-auth
- Activity logging on all CUD operations via activityLogService
- SSE broadcasts on data changes for real-time notifications
- Rate limiting on API (100 req/15min) and auth (20 req/15min)
- All database mutations wrapped in try-catch with proper error responses
