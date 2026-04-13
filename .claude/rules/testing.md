---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Testing Rules

- Use Vitest + React Testing Library (frontend)
- Co-locate test files with source: `foo.ts` → `foo.test.ts`
- Use descriptive test names: "should [expected] when [condition]"
- Group tests with `describe` blocks matching the module name
- Reset state in `beforeEach` (clear stores, localStorage)
- For Zustand stores: use `useStore.setState()` and `useStore.getState()` for direct testing
- For hooks: use `renderHook` from `@testing-library/react`
- Mock external services (API calls), not internal modules
