---
name: drizzle-patterns
description: Drizzle ORM patterns and best practices learned from documentation
type: reference
---

# Drizzle ORM Patterns

## Schema Definition

### Base Mixins (Reusable Pattern)

```typescript
import { text, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core'

// Reusable base ID for all tables (const, not function)
const baseId = {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
}

// Reusable timestamps for all tables (const arrow function)
const timestamps = () => ({
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// Use with spread operator
export const users = sqliteTable('users', {
  ...baseId,
  name: text('name').notNull(),
  ...timestamps()
})
```

**Why:** Avoids repeating `createdAt`/`updatedAt` across 11+ tables. Makes schema DRY and maintainable.

## Query Functions Pattern

**Use `const` + arrow functions, NOT function declarations:**

```typescript
// ✅ Correct - const with arrow functions
export const role = {
  create: async (data: { name: string }) => {
    const id = crypto.randomUUID()
    await db.insert(roles).values({ id, name: data.name, isActive: true })
    return role.getById(id)
  },

  list: async (includeInactive = false) => {
    if (includeInactive) {
      return db.select().from(roles).orderBy(roles.name)
    }
    return db.select().from(roles).where(eq(roles.isActive, true)).orderBy(roles.name)
  },

  getById: async (id: string) => {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1)
    return result[0] || null
  }
}

// ❌ Avoid - function declarations and methods
export async function createRole(data) { ... }
export const role = {
  async getById(id) { ... }  // method, not arrow
}
```

## Index Syntax

**Correct:**
```typescript
import { index } from 'drizzle-orm/sqlite-core'

export const usersNameIdx = index('idx_users_name').on(users.name)
export const usersEmailIdx = index('idx_users_email').on(users.email)
```

**Wrong (pseudo-syntax doesn't work):**
```typescript
// ❌ This is NOT valid Drizzle syntax
.index('idx_users_name', ['name'])
```

## Query Patterns

### Manual Queries (No .with())

**Correct:** Use separate queries for relations
```typescript
export async function getEmployeeById(id: string) {
  const empResult = await db.select().from(employees).where(eq(employees.id, id)).limit(1)
  const employee = empResult[0]
  if (!employee) return null

  // Fetch related data separately
  const [role, warehouse] = await Promise.all([
    getRoleById(employee.roleId),
    getWarehouseById(employee.warehouseId)
  ])

  return { ...employee, role, warehouse }
}
```

**Wrong:**
```typescript
// ❌ .with() is for Drizzle relation system, not manual queries
db.select().from(employees).with(...)
```

### Batch Queries with inArray

```typescript
const typeIds = [...new Set(certs.map(c => c.certificationTypeId))]
const types = await db.select().from(certificationTypes)
  .where(inArray(certificationTypes.id, typeIds))
```

## Enum/Constant Pattern

**File:** `constants.ts` (NOT in schema.ts)

```typescript
// Constants file for fixed domain values
export const CONTRACT_TYPES = ['CDI', 'CDD', 'Intérim', 'Alternance'] as const
export type ContractType = typeof CONTRACT_TYPES[number]
export const contractTypesList = [...CONTRACT_TYPES]  // For Zod z.enum()

// Tuple for TypeScript (readonly)
export const CACES_CATEGORIES = ['1a', '1b', '2b', '3', '4', '5', '6', '7'] as const
export type CacesCategory = typeof CACES_CATEGORIES[number]
```

**Key distinction:**
- `CONTRACT_TYPES` → readonly tuple (PascalCase)
- `contractTypesList` → mutable array for Zod (camelCase + List suffix)

## Soft Delete Pattern

All major entities use soft delete (`isActive` boolean flag) instead of hard delete:

**Entities with soft delete:**
- `Role` - preserve employee history
- `Warehouse` - preserve employee history
- `CertificationType` - referenced by AlertSettings
- `Certification` - audit trail for compliance

**Entities without soft delete (ephemeral by nature):**
- `Employee` - uses `isActive` for soft delete
- `SnoozedAlerts` - auto-cleanup by `cleanupExpiredSnoozedAlerts`
- `AlertSettings` - can be recreated

**Query pattern:**
```typescript
// Soft delete
await db.update(entity).set({ isActive: false, updatedAt: new Date() }).where(eq(entity.id, id))

// Reactivate
await db.update(entity).set({ isActive: true, updatedAt: new Date() }).where(eq(entity.id, id))

// Get by default (active only)
db.select().from(roles).where(eq(roles.isActive, true))

// Get all (including inactive)
db.select().from(roles)
```

**Router procedures:** `deleteRole` (soft), `reactivateRole`, `deleteWarehouse` (soft), etc.

## Testing with In-Memory DB

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

const sqlite = new Database(':memory:')
export const testDb = drizzle(sqlite, { schema })

// Create tables matching schema.ts (snake_case columns)
testDb.run(sql`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  )
`)
```

**Important:** Drizzle schema uses camelCase field names that map to snake_case column names in SQL.