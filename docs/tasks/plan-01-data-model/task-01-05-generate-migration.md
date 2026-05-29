---
name: Task 01-05 Generate Database Migration
description: Generate Drizzle ORM migration for the WEMS schema
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-05: Generate Database Migration

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Generate a Drizzle migration file from the updated schema. This creates the SQL migration that can be applied to create the database tables.

## Implementation Details

### 1. Check Current Schema

Before generating, verify all entities from tasks 01-01 through 01-04 are in `packages/db/src/schema.ts`:

**Tables (13 total):**
- [ ] roles
- [ ] warehouses
- [ ] employees
- [ ] certificationTypes
- [ ] certifications
- [ ] cacesCertifications
- [ ] medicalVisits
- [ ] onlineTrainings
- [ ] drivingAuthorizations
- [ ] alertSettings
- [ ] snoozedAlerts

**Indexes:**
- [ ] rolesNameIdx
- [ ] warehousesNameIdx
- [ ] employeesWarehouseIdx
- [ ] employeesRoleIdx
- [ ] employeesActiveIdx
- [ ] employeesNameIdx
- [ ] (indexes for certifications tables)
- [ ] alertSettingsTypeIdx
- [ ] snoozedAlertsEmployeeIdx
- [ ] snoozedAlertsCertificationIdx
- [ ] snoozedAlertsUntilIdx

### 2. Generate Migration

Run the following command:

```bash
pnpm db:generate
```

This will create a new migration file in `packages/db/drizzle/migrations/` with a timestamp filename.

### 3. Review Generated Migration

Check the generated SQL file to verify:
- All tables are created (13 CREATE TABLE statements)
- Column types are correct (TEXT for UUIDs, INTEGER for timestamps/dates)
- Foreign key constraints are present (references())
- Indexes are created (CREATE INDEX statements)
- `enabled` column in alertSettings
- `reason` column in snoozedAlerts

### 4. Apply Migration (Development)

```bash
pnpm db:migrate
```

This applies the migration to create the database.

### 5. Verify Programmatically

Create a verification script to check the database structure:

```typescript
// packages/db/src/__tests__/verify-schema.ts
import { db } from '../index'
import { sqliteMaster } from 'better-sqlite3'

async function verifySchema() {
  // Get all tables
  const tables = db.select({ name: sqliteMaster.name })
    .from(sqliteMaster)
    .where(eq(sqliteMaster.type, 'table'))

  const expectedTables = [
    'roles', 'warehouses', 'employees', 'certification_types',
    'certifications', 'caces_certifications', 'medical_visits',
    'online_trainings', 'driving_authorizations', 'alert_settings', 'snoozed_alerts'
  ]

  console.log('Tables found:', tables.map(t => t.name))
  console.log('Expected:', expectedTables)

  // Verify all expected tables exist
  for (const tableName of expectedTables) {
    const exists = tables.some(t => t.name === tableName)
    if (!exists) {
      throw new Error(`Missing table: ${tableName}`)
    }
  }

  console.log('All tables verified!')
}
```

Run the verification:

```bash
npx tsx src/__tests__/verify-schema.ts
```

### 6. Rollback Strategy

If migration fails:

1. **Check the error:**
   ```bash
   pnpm db:migrate
   # If fails, check error message
   ```

2. **Rollback last migration:**
   ```bash
   # Drizzle doesn't have built-in rollback - manual steps:
   # 1. Delete the migration file from drizzle/migrations/
   # 2. Delete the database file (wems.db)
   # 3. Re-run migration: pnpm db:migrate
   ```

3. **For production:** Always backup before running migrations.

## Files to Create

| File | Description |
|------|-------------|
| `packages/db/drizzle/migrations/{timestamp}_init_wems.sql` | Migration SQL file |
| `packages/db/src/__tests__/verify-schema.ts` | Programmatic schema verification |

## Commands

```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate

# Verify schema programmatically
npx tsx src/__tests__/verify-schema.ts
```

## Notes

- Migration names are auto-generated with timestamp
- Never modify generated migration files
- If schema changes later, generate a new migration
- Always verify programmatically, not with manual tools

## Acceptance Criteria

- [ ] `pnpm db:generate` runs without errors
- [ ] Migration file created in `packages/db/drizzle/migrations/`
- [ ] SQL contains all 13 CREATE TABLE statements
- [ ] SQL contains all 11 CREATE INDEX statements
- [ ] Foreign keys properly defined with ON DELETE constraints
- [ ] `alertSettings.enabled` column present
- [ ] `snoozedAlerts.reason` column present
- [ ] `pnpm db:migrate` applies successfully
- [ ] Programmatic verification script passes (all tables exist)
- [ ] TypeScript compiles without errors

## Related

- [Task 01-01](./task-01-01-create-enums.md)
- [Task 01-02](./task-01-02-create-warehouse-employee.md)
- [Task 01-03](./task-01-03-create-certification-entities.md)
- [Task 01-04](./task-01-04-create-snoozedalert-alertsettings.md)
- [Task 01-06](./task-01-06-create-queries.md) — Next task