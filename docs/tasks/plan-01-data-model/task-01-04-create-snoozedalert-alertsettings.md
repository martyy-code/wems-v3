---
name: Task 01-04 Create SnoozedAlert & AlertSettings
description: Create Drizzle ORM tables for alert snoozing and threshold configuration
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-04: Create SnoozedAlert & AlertSettings

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Create tables for storing alert snooze state (persistence across sessions) and alert threshold configuration per certification type.

## Implementation Details

**File:** `packages/db/src/schema.ts`

Add these tables to the existing `schema.ts` file (after the certification tables from Task 01-03).

**Note:** Use the `...timestamps()` and `...baseId` mixins defined in Task 01-02.

### 1. AlertSettings Table

```typescript
export const alertSettings = sqliteTable('alert_settings', {
  ...baseId,
  certificationTypeId: text('certification_type_id').notNull().references(() => certificationTypes.id),
  enabled: integer('enabled', { mode: 'boolean' }).$defaultFn(() => true),  // Can disable alerts per type
  alertDays: integer('alert_days').notNull().$defaultFn(() => 30), // Default 30 days
  warningDays: integer('warning_days').notNull().$defaultFn(() => 60), // Default 60 days
  ...timestamps()
})
```

### 2. SnoozedAlerts Table

```typescript
export const snoozedAlerts = sqliteTable('snoozed_alerts', {
  ...baseId,
  employeeId: text('employee_id').notNull().references(() => employees.id),
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  reason: text('reason'),  // Optional: why was this snoozed? For audit trail
  snoozedUntil: integer('snoozed_until', { mode: 'timestamp' }).notNull(),
  ...timestamps()
})
```

### 3. Add Indexes (Drizzle syntax)

```typescript
import { index } from 'drizzle-orm/sqlite-core'

// For alert settings
export const alertSettingsTypeIdx = index('idx_alert_settings_type')
  .on(alertSettings.certificationTypeId)

// For snoozed alerts
export const snoozedAlertsEmployeeIdx = index('idx_snoozed_alerts_employee')
  .on(snoozedAlerts.employeeId)
export const snoozedAlertsCertificationIdx = index('idx_snoozed_alerts_certification')
  .on(snoozedAlerts.certificationId)
export const snoozedAlertsUntilIdx = index('idx_snoozed_alerts_until')
  .on(snoozedAlerts.snoozedUntil)
```

Add these index exports to schema.ts after the table definitions.

### 4. Export Types

```typescript
export type AlertSetting = typeof alertSettings.$inferSelect
export type NewAlertSetting = typeof alertSettings.$inferInsert
export type SnoozedAlert = typeof snoozedAlerts.$inferSelect
export type NewSnoozedAlert = typeof snoozedAlerts.$inferInsert
```

## Files to Modify

| File | Action |
|------|--------|
| `packages/db/src/schema.ts` | Add alertSettings and snoozedAlerts tables + indexes |

## Notes

- SnoozedAlerts are used by RFC-03 Alert System
- AlertSettings allow per-certification-type threshold configuration
- `snoozedUntil` column enables automatic "wake" when time passes
- `enabled` flag allows disabling alerts for specific certification types
- `reason` field provides audit trail for compliance

## Acceptance Criteria

- [ ] `alertSettings` table created with: id, certificationTypeId (FK), enabled (default true), alertDays (default 30), warningDays (default 60), createdAt, updatedAt
- [ ] `snoozedAlerts` table created with: id, employeeId (FK), certificationId (FK), reason (nullable), snoozedUntil, createdAt, updatedAt
- [ ] All indexes created using Drizzle index() syntax: alertSettingsTypeIdx, snoozedAlertsEmployeeIdx, snoozedAlertsCertificationIdx, snoozedAlertsUntilIdx
- [ ] TypeScript types export: `AlertSetting`, `NewAlertSetting`, `SnoozedAlert`, `NewSnoozedAlert`
- [ ] `pnpm typecheck` passes in packages/db

## Related

- [RFC-01: Data Model](../plans/rfc/rfc-01-data-model.md) — Entity definitions
- [RFC-03: Alert System](../plans/rfc/rfc-03-alert-system.md) — SnoozedAlert usage
- [Task 01-03](./task-01-03-create-certification-entities.md) — Previous task
- [Task 01-05](./task-01-05-generate-migration.md) — Next task