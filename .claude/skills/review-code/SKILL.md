---
description: Reviews recent code changes for correctness, security, and project conventions
disable-model-invocation: true
argument-hint: [branch or number-of-commits]
---

## Changes to review

!`git diff HEAD~${ARGUMENTS:-1}`

Review the changes above for:

1. **Correctness**: Logic errors, edge cases, null handling
2. **Security**: SQL injection, XSS, auth bypass, hardcoded secrets
3. **Conventions**: Follows CLAUDE.md rules, uses TanStack Query for server state, Shadcn UI components
4. **TypeScript**: Proper types, no `any` casts, strict mode compliance
5. **Performance**: Unnecessary re-renders, missing query keys, N+1 queries

Report findings with severity (critical/warning/info) and suggested fixes.
