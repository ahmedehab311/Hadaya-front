---
name: Lib build order
description: Composite libs must be built before leaf packages can typecheck against them
---

**Rule:** Always run `pnpm run typecheck:libs` before running `pnpm --filter @workspace/api-server run typecheck` (or any leaf package typecheck that imports from a `lib/*` package).

**Why:** `lib/*` packages are composite and emit `.d.ts` declaration files to their `dist/` directory. Leaf packages reference these declarations. If `dist/` is missing or stale, TypeScript reports "Module has no exported member" even though the source is correct.

**How to apply:** Whenever CI or manual typecheck fails with "has no exported member" from a `@workspace/lib-*` package, run `pnpm run typecheck:libs` first. The root `pnpm run typecheck` already calls `typecheck:libs` first, so it is safe to use end-to-end.
