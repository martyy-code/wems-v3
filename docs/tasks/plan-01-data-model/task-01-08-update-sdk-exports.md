---
name: Task 01-08 Update SDK Exports
description: Export all types and router from the SDK package
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-08: Update SDK Exports

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Update the SDK package to export all WEMS types and the oRPC router type. This allows frontend code to import type-safe types without accessing the database package directly.

## Implementation Details

### 1. Update packages/sdk/src/index.ts

```typescript
// Re-export types from database package
export type {
  // Enums (fixed values)
  ContractType,
  CacesCategory,
  MedicalVisitType,
  MedicalVisitResult,

  // Entity types (Role is a table, not an enum)
  Role,
  NewRole,
  Warehouse,
  NewWarehouse,
  Employee,
  NewEmployee,
  CertificationType,
  Certification,
  NewCertification,
  CacesCertification,
  NewCacesCertification,
  MedicalVisit,
  NewMedicalVisit,
  OnlineTraining,
  NewOnlineTraining,
  DrivingAuthorization,
  NewDrivingAuthorization,
  AlertSetting,
  SnoozedAlert,

  // Input types (for mutations)
  EmployeeInput,
  CertificationInput,
  CacesCertificationInput,
  MedicalVisitInput,
  UpdateEmployeeInput
} from '@electron-template/db'

// Re-export enums as const objects (Role is NOT included - it's a table)
export {
  contractTypesList,
  cacesCategoriesList,
  medicalVisitTypesList,
  medicalVisitResultsList
} from '@electron-template/db'

// Re-export router type
export type { RouterRouter } from '@electron-template/api'
```

### 2. Update packages/sdk/src/router.ts

```typescript
// Re-export router for convenience
export { router } from '@electron-template/api'
export type { RouterRouter } from '@electron-template/api'
```

### 3. Verify Package Dependencies

In `packages/sdk/package.json`:

```json
{
  "dependencies": {
    "@electron-template/db": "workspace:*",
    "@electron-template/api": "workspace:*"
  }
}
```

### 4. Update TypeScript Configuration

Ensure `packages/sdk/tsconfig.json` has correct paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@electron-template/db": ["../db/src"],
      "@electron-template/api": ["../api/src"]
    }
  }
}
```

## Files to Modify

| File | Action |
|------|--------|
| `packages/sdk/src/index.ts` | Add all type exports |
| `packages/sdk/src/router.ts` | Re-export router |
| `packages/sdk/package.json` | Verify dependencies |

## Important: Enum vs Entity Types

**Enums (constants)** - exported as arrays for Zod:
- `contractTypes` → `contractTypesList` (for `z.enum()`)
- `cacesCategories` → `cacesCategoriesList`
- `medicalVisitTypes` → `medicalVisitTypesList`
- `medicalVisitResults` → `medicalVisitResultsList`

**Entity types (tables)** - exported as types only:
- `Role`, `Warehouse`, `Employee` → `export type { Role }` (NOT as constant)

**Note:** Role is a TABLE, not an enum. It should only be exported as a type, not as a constant array.

## Acceptance Criteria

- [ ] `packages/sdk/src/index.ts` exports all enum TYPES: ContractType, CacesCategory, MedicalVisitType, MedicalVisitResult
- [ ] `packages/sdk/src/index.ts` exports all entity TYPES: Role, Warehouse, Employee, Certification, etc.
- [ ] `packages/sdk/src/index.ts` exports constant LISTS for Zod: contractTypesList, cacesCategoriesList, medicalVisitTypesList, medicalVisitResultsList (NOT contractTypes, cacesCategories, etc.)
- [ ] Role is exported as TYPE only (NOT as constant array)
- [ ] SDK exports router type: `RouterRouter`
- [ ] SDK re-exports router from api
- [ ] `packages/sdk/src/router.ts` re-exports router
- [ ] No circular dependencies between packages
- [ ] `pnpm build` succeeds for packages/sdk
- [ ] Frontend can import types from `@electron-template/sdk`

## Related

- [Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)
- [Task 01-07](./task-01-07-update-orpc-router.md) — Previous task
- [Task 01-09](./task-01-09-create-seed-data.md) — Next task