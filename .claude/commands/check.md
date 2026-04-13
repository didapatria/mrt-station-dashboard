---
description: Run all checks (lint, type check, test, build) for the project
---

Run all project checks sequentially:

1. Frontend lint: `cd frontend && npm run lint`
2. Frontend type check: `cd frontend && npx tsc -b`
3. Frontend tests: `cd frontend && npm run test:run`
4. Frontend build: `cd frontend && npm run build`
5. Backend build: `cd backend && npm run build`

Report a summary of pass/fail for each step.
