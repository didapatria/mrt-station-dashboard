---
paths:
  - "**"
---

# RTK Usage

Always prefix shell commands with `rtk` to reduce token consumption:

```bash
rtk git status
rtk git diff
rtk npm run test
rtk npx playwright test
rtk docker-compose up
```

Run `rtk gain` to see cumulative token savings.
