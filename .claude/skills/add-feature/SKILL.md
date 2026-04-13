---
description: Adds a new feature to the MRT Station Dashboard following project conventions
argument-hint: <feature description>
---

Implement the following feature: $ARGUMENTS

Follow these steps:
1. Read CLAUDE.md and relevant rules for project conventions
2. Plan the implementation (frontend, backend, or both)
3. Implement the feature following the architecture:
   - Backend: controller → service → Prisma (if needed)
   - Frontend: TanStack Query hook → page component with Shadcn UI
4. Use existing patterns: Zod validation, TanStack Query for server state, Zustand for client state
5. Run `npm run build` in frontend to verify TypeScript compiles
6. Run `npm run test:run` in frontend to verify tests pass
7. Commit with conventional commit format: `feat(scope): description`
