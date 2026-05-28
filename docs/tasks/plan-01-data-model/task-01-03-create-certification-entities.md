---
name: Task 01-03 Create Certification Entities
description: Create Drizzle ORM tables for all certification types
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-03: Create Certification Entities

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Create the certification entity tables. This includes the base certification table and type-specific extensions (CACES, Medical, Training, Driving Authorization).

## Implementation Details

**File:** `packages/db/src/schema.ts`

Add these tables to the existing `schema.ts` file (after the Role, Warehouse, Employee tables from Task 01-02).

**Note:** Use the `...timestamps()` and `...baseId` mixins defined in Task 01-02.

### 1. CertificationTypes (Lookup Table with soft delete)

```typescript
export const certificationTypes = sqliteTable('certification_types', {
  ...baseId,
  name: text('name').notNull().unique(), // CACES R489, Medical Visit, etc.
  hasCategory: integer('has_category', { mode: 'boolean' }).$defaultFn(() => false),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true), // Soft delete
  ...timestamps()
})
```

### 2. Certifications (Base with soft delete)

```typescript
export const certifications = sqliteTable('certifications', {
  ...baseId,
  employeeId: text('employee_id').notNull().references(() => employees.id),
  certificationTypeId: text('certification_type_id').notNull().references(() => certificationTypes.id),
  obtainedDate: integer('obtained_date', { mode: 'timestamp' }).notNull(),
  expirationDate: integer('expiration_date', { mode: 'timestamp' }), // Nullable for indefinite
  documentPath: text('document_path'), // Path to scanned document
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true), // Soft delete
  ...timestamps()
})
```

### 3. CACES Certifications

```typescript
export const cacesCertifications = sqliteTable('caces_certifications', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  category: text('category').notNull(), // enum: '1a', '1b', '2b', '3', '4', '5', '6', '7'
  ...timestamps()
})
```

### 4. Medical Visits

```typescript
export const medicalVisits = sqliteTable('medical_visits', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  visitType: text('visit_type').notNull(), // enum: Embauche, Périodique, Reprise, Spécifique
  visitDate: integer('visit_date', { mode: 'timestamp' }).notNull(),
  result: text('result').notNull(), // enum: Apte, Apte avec restrictions, Inapte
  ...timestamps()
})
```

### 5. Online Trainings

```typescript
export const onlineTrainings = sqliteTable('online_trainings', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  trainingDate: integer('training_date', { mode: 'timestamp' }).notNull(),
  ...timestamps()
})
```

### 6. Driving Authorizations

```typescript
export const drivingAuthorizations = sqliteTable('driving_authorizations', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  authorizationDate: integer('authorization_date', { mode: 'timestamp' }).notNull(),
  ...timestamps()
})
```

### 7. Add Indexes

```typescript
import { index } from 'drizzle-orm/sqlite-core'

// For certification types queries
export const certificationTypesActiveIdx = index('idx_certification_types_active').on(certificationTypes.isActive)

// For certification queries
export const certificationsEmployeeIdx = index('idx_certifications_employee').on(certifications.employeeId)
export const certificationsTypeIdx = index('idx_certifications_type').on(certifications.certificationTypeId)
export const certificationsExpirationIdx = index('idx_certifications_expiration').on(certifications.expirationDate)
export const certificationsActiveIdx = index('idx_certifications_active').on(certifications.isActive)
```

### 8. Export Types

```typescript
export type CertificationType = typeof certificationTypes.$inferSelect
export type NewCertificationType = typeof certificationTypes.$inferInsert
export type Certification = typeof certifications.$inferSelect
export type NewCertification = typeof certifications.$inferInsert
export type CacesCertification = typeof cacesCertifications.$inferSelect
export type NewCacesCertification = typeof cacesCertifications.$inferInsert
export type MedicalVisit = typeof medicalVisits.$inferSelect
export type NewMedicalVisit = typeof medicalVisits.$inferInsert
export type OnlineTraining = typeof onlineTrainings.$inferSelect
export type NewOnlineTraining = typeof onlineTrainings.$inferInsert
export type DrivingAuthorization = typeof drivingAuthorizations.$inferSelect
export type NewDrivingAuthorization = typeof drivingAuthorizations.$inferInsert
```

## Files to Modify

| File | Action |
|------|--------|
| `packages/db/src/schema.ts` | Add all certification tables |

## Notes

- Document storage path will be `{appData}/documents/{employeeId}/{certificationId}/{filename}`
- expirationDate is nullable for certifications that don't expire
- Medical visit "Inapte" result means employee cannot operate equipment

## Acceptance Criteria

- [ ] `certificationTypes` table created with isActive (soft delete)
- [ ] `certifications` base table created with isActive (soft delete)
- [ ] `cacesCertifications` table created with FK to certifications
- [ ] `medicalVisits` table created with FK to certifications
- [ ] `onlineTrainings` table created with FK to certifications
- [ ] `drivingAuthorizations` table created with FK to certifications
- [ ] All indexes created (employee, type, expiration, active)
- [ ] All TypeScript types export correctly (Type and NewType variants)
- [ ] `pnpm typecheck` passes in packages/db

## Related

- [RFC-01: Data Model](../plans/rfc/rfc-01-data-model.md) — Entity definitions
- [Task 01-02](./task-01-02-create-warehouse-employee.md) — Previous task
- [Task 01-04](./task-01-04-create-snoozedalert-alertsettings.md) — Next task