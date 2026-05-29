---
name: Plan - RFC-01 Data Model
description: Implementation plan for WEMS database schema and entities
status: in_progress
rfc: rfc-01-data-model
priority: p0
created: 2026-05-26
---

# Plan: RFC-01 Data Model Implementation

## Overview

This plan defines the implementation of the WEMS data model. It covers all database entities, relationships, and seed data for the application.

## Prerequisites

- None (this is the first plan to implement)

## Implementation Steps

### Step 1: Update Database Schema

**File:** `packages/db/src/schema.ts`

Create all entities in the following order (dependencies):

1. **Constants** (`packages/db/src/constants.ts`) - Fixed values, not tables
   - `CONTRACT_TYPES` - CDI, CDD, Intérim, Alternance
   - `CACES_CATEGORIES` - 1a, 1b, 2b, 3, 4, 5, 6, 7
   - `MEDICAL_VISIT_TYPES` - Embauche, Périodique, Reprise, Spécifique
   - `MEDICAL_VISIT_RESULTS` - Apte, Apte avec restrictions, Inapte

   **Note:** Enums are in constants.ts, NOT in schema.ts. Schema.ts only contains tables.

2. **Roles** (no dependencies) - User-managed table
   - id (UUID)
   - name (unique string)
   - createdAt, updatedAt

   Users can freely add/edit/delete roles. Default seed: "Préparateur de commandes", "Cariste".

3. **Warehouses** (no dependencies)
   - id (UUID)
   - name
   - createdAt, updatedAt

4. **Employees** (depends on Warehouses, Roles)
   - id (UUID)
   - employeeNumber (auto-generated)
   - firstName, lastName
   - email, phone (optional)
   - arrivalDate
   - contractType (enum)
   - roleId (FK → Roles)
   - warehouseId (FK → Warehouses)
   - isActive (default: true)
   - createdAt, updatedAt

4. **CertificationTypes** (no dependencies) - lookup table
   - id (UUID)
   - name (CACES R489, Medical Visit, Online Training, Driving Authorization)
   - hasCategory (boolean)
   - createdAt, updatedAt

5. **AlertSettings** (depends on CertificationTypes)
   - id (UUID)
   - certificationTypeId (FK → CertificationTypes)
   - alertDays (default: 30)
   - warningDays (default: 60)
   - createdAt, updatedAt

6. **Certifications (Base)** (depends on Employees, CertificationTypes)
   - id (UUID)
   - employeeId (FK → Employees)
   - certificationTypeId (FK → CertificationTypes)
   - obtainedDate
   - expirationDate (nullable for indefinite)
   - documentPath (nullable)
   - createdAt, updatedAt

7. **CacesCertifications** (depends on Certifications)
   - id (UUID)
   - certificationId (FK → Certifications)
   - category (enum)
   - createdAt, updatedAt

8. **MedicalVisits** (depends on Certifications)
   - id (UUID)
   - certificationId (FK → Certifications)
   - visitType (enum)
   - visitDate
   - result (enum)
   - createdAt, updatedAt

9. **OnlineTrainings** (depends on Certifications)
   - id (UUID)
   - certificationId (FK → Certifications)
   - trainingDate
   - createdAt, updatedAt

10. **DrivingAuthorizations** (depends on Certifications)
    - id (UUID)
    - certificationId (FK → Certifications)
    - authorizationDate
    - createdAt, updatedAt

11. **SnoozedAlerts** (depends on Employees, Certifications)
    - id (UUID)
    - employeeId (FK → Employees)
    - certificationId (FK → Certifications)
    - snoozedUntil
    - createdAt, updatedAt

### Step 2: Generate Migration

**Command:**
```bash
pnpm db:generate
```

Creates `packages/db/drizzle/migrations/{timestamp}_init_wems.sql`

### Step 3: Create Queries Module

**Files:** `packages/db/src/queries/*.ts`

Create modular query functions organized by entity namespace:

```
packages/db/src/queries/
├── index.ts              # Re-exports all namespaces
├── role.ts               # queries.role.*
├── warehouse.ts          # queries.warehouse.*
├── employee.ts           # queries.employee.*
├── certification.ts      # queries.certification.*
├── caces.ts              # queries.caces.*
├── medical.ts            # queries.medical.*
├── training.ts           # queries.training.*
└── driving.ts            # queries.driving.*
```

**Usage:**

```typescript
import { queries } from '@electron-template/db'

// Role queries
const role = await queries.role.create({ name: 'Cariste' })
const roles = await queries.role.list()
const role = await queries.role.getById(id)
await queries.role.update(id, { name: 'New Name' })
await queries.role.delete(id)  // Soft delete
await queries.role.reactivate(id)

// Warehouse queries
const warehouse = await queries.warehouse.create({ name: 'Paris' })
const warehouses = await queries.warehouse.list({ includeInactive: false })

// Employee queries
const employee = await queries.employee.create({ ... })
const employees = await queries.employee.list({ warehouseId: '...' })

// Certification queries
const certs = await queries.certification.listByEmployee(employeeId)
await queries.certification.delete(id)  // Soft delete
```

### Step 4: Update oRPC Router

**Files:** `packages/api/src/procedures/*.ts` + `packages/api/src/router.ts`

Create modular router with procedure groups:

```
packages/api/src/
├── router.ts             # Main router with namespace structure
└── procedures/
    ├── role.ts           # roleProcedures
    ├── warehouse.ts      # warehouseProcedures
    ├── employee.ts       # employeeProcedures
    ├── certification.ts  # certificationProcedures (base + CACES/Medical/Training/Driving)
    └── alert.ts          # alertProcedures (settings + snooze)
```

**Router structure:**

```typescript
export const router = {
  role: {
    create, list, getById, getByName, update, delete, reactivate
  },
  warehouse: {
    create, list, getById, update, delete, reactivate
  },
  employee: {
    create, list, getById, update, deactivate, reactivate
  },
  certification: {
    create, listByEmployee, getById, delete, reactivate,
    createCaces, listCacesByEmployee,
    createMedical, listMedicalByEmployee, updateMedicalResult,
    createTraining, listTrainingByEmployee,
    createDriving, listDrivingByEmployee
  },
  alert: {
    getSettings, updateSettings,
    createSnoozed, listSnoozed, deleteSnoozed, cleanupExpired
  }
}
```

**Usage:**

```typescript
// Client side (SDK)
import { sdk } from '@electron-template/sdk'

const roles = await sdk.router.role.list()
await sdk.router.role.create({ name: 'Cariste' })
const employee = await sdk.router.employee.getById(id)
```

### Step 5: Update SDK Exports

**File:** `packages/sdk/src/index.ts`

Export all types and router:

```typescript
export type {
  // Entity types
  Employee, Warehouse, Certification, etc.
  // Input types
  NewEmployee, UpdateEmployee, etc.
  // Enums
  ContractType, Role, CacesCategory, etc.
} from '@electron-template/db'

export type RouterRouter = typeof router
```

### Step 6: Create Seed Data

**File:** `packages/db/src/seed.ts`

Create seed function for development:
- 2-3 warehouses (Paris, Lyon, Marseille)
- 10-15 sample employees across warehouses
- Sample certifications for each employee
- Default alert settings

### Step 7: Write Tests

**File:** `packages/db/src/__tests__/queries.test.ts`

Test critical query functions:
- Employee CRUD
- Certification creation (all types)
- Computed status logic
- Snoozed alerts

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `packages/db/src/constants.ts` | Create | Enums/constants (not in schema) |
| `packages/db/src/schema.ts` | Modify | Tables with soft delete (isActive) |
| `packages/db/src/queries/index.ts` | Create | Re-exports all query namespaces |
| `packages/db/src/queries/role.ts` | Create | queries.role.* |
| `packages/db/src/queries/warehouse.ts` | Create | queries.warehouse.* |
| `packages/db/src/queries/employee.ts` | Create | queries.employee.* |
| `packages/db/src/queries/certification.ts` | Create | queries.certification.* |
| `packages/db/src/queries/caces.ts` | Create | queries.caces.* |
| `packages/db/src/queries/medical.ts` | Create | queries.medical.* |
| `packages/db/src/queries/training.ts` | Create | queries.training.* |
| `packages/db/src/queries/driving.ts` | Create | queries.driving.* |
| `packages/db/src/seed.ts` | Create | Development seed data |
| `packages/api/src/procedures/role.ts` | Create | roleProcedures |
| `packages/api/src/procedures/warehouse.ts` | Create | warehouseProcedures |
| `packages/api/src/procedures/employee.ts` | Create | employeeProcedures |
| `packages/api/src/procedures/certification.ts` | Create | certificationProcedures |
| `packages/api/src/procedures/alert.ts` | Create | alertProcedures |
| `packages/api/src/router.ts` | Replace | Modular router with namespaces |
| `packages/api/src/index.ts` | Modify | Export router |
| `packages/sdk/src/index.ts` | Modify | Export router type |
| `packages/db/src/__tests__/queries.test.ts` | Create | Unit tests |

## Dependencies

- None (foundation plan)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Missing fields on entity | Review RFC-01 field list carefully |
| Enum values wrong | Use French terms as specified in RFC |
| Foreign key constraints | Add indexes on FK columns for performance |

## Verification

After implementation:
1. Run `pnpm db:migrate` - migrations apply successfully
2. Run `pnpm db:seed` - sample data created
3. Run `pnpm db:verify` - programmatic schema verification (from Task 01-05)
4. Run `pnpm test` - all unit tests pass
5. Run `pnpm dev:desktop` - app starts without errors

## Related

- [RFC-01: Data Model](../rfc/rfc-01-data-model.md)
- [Plan - RFC-02: Dashboard](./plan-02-dashboard.md) (blocked by this)

## Status

- [ ] Step 1: Schema
- [ ] Step 2: Migration
- [ ] Step 3: Queries
- [ ] Step 4: oRPC Router
- [ ] Step 5: SDK Exports
- [ ] Step 6: Seed Data
- [ ] Step 7: Tests
- [x] Verification: Updated to use programmatic check (pnpm db:verify) instead of manual Drizzle Studio