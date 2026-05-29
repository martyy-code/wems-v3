# MEMORY - Tech Lead

## My Role
I am the **Senior Technical Lead** for WEMS. I architect the system, make technical decisions, review RFCs, and ensure engineering aligns with product goals. I work closely with the Head of Product.

## Project: WEMS
- Electron desktop app for tracking warehouse employee certifications
- Single warehouse manager as primary user (low tech comfort)
- Monorepo: `apps/desktop`, `apps/web`, `packages/api`, `packages/db`, `packages/sdk`

## Key Conventions
- oRPC over REST for all data operations
- Drizzle ORM for database with better-sqlite3
- **Soft delete on ALL major entities** (Role, Warehouse, CertificationType, Certification)
- Append-only certifications (never update, create new)
- UUIDs for primary keys, soft delete pattern (isActive flag)
- Client-side alert computation (OK for < 500 employees)
- Roles are a user-managed TABLE (not enum) - use `roleId: uuid` FK
- Constants/enums in `constants.ts`, not in `schema.ts`
- Use Drizzle `index()` function for indexes (not pseudo-syntax)
- Do NOT use `.with()` in manual queries - use separate queries for relations

## Coding Conventions

### Types vs Interfaces
- **Always use `type`** for object shapes, never `interface`
- Exception: Drizzle schema types use `interface` when generated

```typescript
// ✅ Correct
type Role = { id: string; name: string }
type Config = { dataPath: string }

// ❌ Avoid
interface Role { id: string; name: string }
```

### Exports Pattern
- **Use `const`** for exports, not function declarations
- **Use arrow functions** for object methods, not method syntax

```typescript
// ✅ Correct - const + arrow function
export const role = {
  create: async (data: { name: string }) => { ... },
  list: async (includeInactive = false) => { ... }
}

// ❌ Avoid - function declarations and method syntax
export function roleCreate(data) { ... }
export const role = {
  async create(data) { ... }  // method, not arrow
}
```

### oRPC Procedures

```typescript
// ✅ Correct
export const roleProcedures = {
  create: os.input(z.object({ name: z.string() })).handler(async ({ input }) => { ... }),
  list: os.handler(async () => { ... })
}

// ❌ Avoid - separate const declarations
export const createRole = os.input(...).handler(...)
export const listRoles = os.handler(...)
```

### Router Structure

```typescript
// ✅ Correct - const with nested objects
export const router = {
  role: roleProcedures,
  warehouse: warehouseProcedures
}

// ❌ Avoid - function returning object
export function createRouter() {
  return { role: {...}, warehouse: {...} }
}
```

## Database Path Strategy
| Environment | Path | Notes |
|-------------|------|-------|
| Test | `{projectRoot}/.wems/test.sqlite` | Clean DB per suite |
| Dev | `{projectRoot}/.wems/dev.sqlite` | Local, ephemeral |
| Prod | `{appData}/wems/database.sqlite` | Persistent, user data |

**File:** `packages/db/src/initDb.ts` handles path configuration via `DatabaseConfig.dataPath`

## RFCs Status
- RFC-01: Data Model — **approved** (updated with enabled/reason fields)
- RFC-02: Dashboard & Navigation — draft
- RFC-03: Alert System — draft
- RFC-04: Export System — draft

## Implementation Status
**Plan-01: Data Model** — tasks 01-01 through 01-10 (all fixed after Senior Architect review)

### Completed Fixes (from Senior Architect review)
1. task-01-01: Fixed `.tolist()` → `[...CONSTANT]` spread
2. task-01-02: Fixed Drizzle index syntax
3. task-01-03: Fixed roleId FK, removed seed.ts reference
4. task-01-04: Added `enabled` field, `reason` field, proper index syntax
5. task-01-05: Added verification script, rollback strategy
6. task-01-06: Fixed Drizzle syntax, no `.with()`, use `roleId: string`
7. task-01-07: Added missing getter procedures
8. task-01-08: Fixed Role export (TYPE only, not constant)
9. task-01-09: Fixed roleId, idempotent seed, complete code
10. task-01-10: Fixed roleId, complete test code with helpers

### Updated
- RFC-01: Added `enabled` field to AlertSettings, `reason` field to SnoozedAlerts
- **Soft delete strategy**: Role, Warehouse, CertificationType, Certification use isActive flag

## Recent Changes (2026-05-27)
- Added soft delete (`isActive`) to: Role, Warehouse, CertificationType, Certification
- Employees already had isActive for soft delete
- Added `reactivate*` procedures to all soft-delete entities
- Updated queries to support `includeInactive` parameter

## Agents on Team
- Head of Product
- Release Engineer
- TanStack Query Expert (specialized)

## Known Issues
- better-sqlite3 requires `electron-rebuild` for dev
- Use 127.0.0.1 (not localhost) for IPC/dev server

## Communication
- French with user, English in documentation
- CEO is the business stakeholder

## Files
- [project_architecture.md](project_architecture.md) — Architecture decisions
- [rfc_review.md](rfc_review.md) — RFC status and review notes
- [drizzle-patterns.md](drizzle-patterns.md) — Drizzle ORM patterns (base mixins, indexes, queries)
- [implementation-progress.md](implementation-progress.md) — Plan-01 implementation status
