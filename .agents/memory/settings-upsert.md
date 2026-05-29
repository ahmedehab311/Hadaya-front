---
name: Settings upsert pattern
description: Single-row settings table requires explicit WHERE to avoid Drizzle crash
---

**Rule:** Never call `db.update(settingsTable).set(...).where(undefined as any)`. Use an `ensureSettings()` helper that inserts the row on first access, then update using `sql\`id = ${existing.id}\``.

**Why:** Drizzle ORM passes undefined directly to the SQL WHERE clause, which causes a runtime error or silently updates nothing. The settings table has exactly one row; auto-creating it on first GET is simpler than requiring a separate migration seed.

**How to apply:** In `artifacts/api-server/src/routes/admin/settings.ts`, the `ensureSettings()` function handles insert-on-missing. PATCH calls `ensureSettings()` first to get the row id, then updates with `sql\`id = ${existing.id}\``.
