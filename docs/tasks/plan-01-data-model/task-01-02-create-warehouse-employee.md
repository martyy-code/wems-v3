---
name: Task 01-02 Create Warehouse & Employee Entities
description: Create Drizzle ORM tables for Warehouse and Employee entities
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-02: Create Warehouse, Role & Employee Entities

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Create the base entity tables for WEMS: Role, Warehouse, and Employee. These are foundational tables that other entities reference.

## Implementation Details

**File:** `packages/db/src/schema.ts`

All tables defined below are added to the same `schema.ts` file, following the order shown.

### 0. Base Schema (Timestamps Mixin)

Define a reusable timestamps function to avoid repetition across all tables:

```typescript
import { text, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core'

// Reusable timestamps for all tables
function timestamps() {
  return {
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
  }
}

// Base ID column for convenience
const baseId = {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
}
```

Use `...timestamps()` to add `createdAt` and `updatedAt` to any table.

### 1. Role Entity (User-managed table with soft delete)

```typescript
export const roles = sqliteTable('roles', {
  ...baseId,
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true), // Soft delete
  ...timestamps()
})
```

### 2. Warehouse Entity (with soft delete)

```typescript
export const warehouses = sqliteTable('warehouses', {
  ...baseId,
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true), // Soft delete
  ...timestamps()
})
```

### 3. Employee Entity

```typescript
export const employees = sqliteTable('employees', {
  ...baseId,
  employeeNumber: text('employee_number').notNull().unique(), // Auto-generated
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  arrivalDate: integer('arrival_date', { mode: 'timestamp' }).notNull(),
  contractType: text('contract_type').notNull(), // enum: CDI, CDD, Intérim, Alternance
  roleId: text('role_id').notNull().references(() => roles.id), // FK to Role table
  warehouseId: text('warehouse_id').notNull().references(() => warehouses.id),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  ...timestamps()
})
```

### 4. Add Indexes (Drizzle syntax)

In Drizzle, indexes are defined using `index()` from drizzle-orm:

```typescript
// For Role queries
export const rolesNameIdx = index('idx_roles_name').on(roles.name)
export const rolesActiveIdx = index('idx_roles_active').on(roles.isActive)

// For Warehouse queries
export const warehousesNameIdx = index('idx_warehouses_name').on(warehouses.name)
export const warehousesActiveIdx = index('idx_warehouses_active').on(warehouses.isActive)

// For Employee queries
export const employeesWarehouseIdx = index('idx_employees_warehouse').on(employees.warehouseId)
export const employeesRoleIdx = index('idx_employees_role').on(employees.roleId)
export const employeesActiveIdx = index('idx_employees_active').on(employees.isActive)
export const employeesNameIdx = index('idx_employees_name').on(employees.lastName, employees.firstName)
```

Add these index exports to `packages/db/src/schema.ts` after the table definitions.

### 5. Export Types

```typescript
export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
export type Warehouse = typeof warehouses.$inferSelect
export type NewWarehouse = typeof warehouses.$inferInsert
export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
```

## Files to Modify

| File | Action |
|------|--------|
| `packages/db/src/schema.ts` | Add role, warehouse, and employee tables |

## Notes

- **Roles is a table, NOT an enum.** Users can add/edit/delete roles freely.
- Employee number should be auto-generated as `EMP-{3-digit-sequence}` (e.g., EMP-001)
- Use UUID for IDs, not auto-increment integers
- Include indexes for frequently queried columns

## Acceptance Criteria

- [ ] `roles` table created with id, name, isActive (soft delete), createdAt, updatedAt
- [ ] `warehouses` table created with id, name, isActive (soft delete), createdAt, updatedAt
- [ ] `employees` table created with all fields including `roleId` (FK) and `isActive`
- [ ] Foreign key constraint exists for `roleId` → `roles.id`
- [ ] Foreign key constraint exists for `warehouseId` → `warehouses.id`
- [ ] Indexes created for: warehouse, role, active status, name
- [ ] Indexes for soft delete: rolesActiveIdx, warehousesActiveIdx
- [ ] TypeScript types export: `Role`, `Warehouse`, `Employee`, `New*` variants
- [ ] `pnpm typecheck` passes in packages/db

## Related

- [RFC-01: Data Model](../plans/rfc/rfc-01-data-model.md) — Entity definitions
- [Task 01-01](./task-01-01-create-enums.md) — Previous task
- [Task 01-03](./task-01-03-create-certification-entities.md) — Next task