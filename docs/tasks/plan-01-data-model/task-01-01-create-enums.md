---
name: Task 01-01 Create Database Enums
description: Create TypeScript enums for contract types, roles, CACES categories, medical visit types and results
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-01: Create Database Constants

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Create a constants file for all WEMS fixed domain values (enums). These are NOT in the schema - they live in a separate `constants.ts` file to keep schema.ts focused on table definitions.

## Implementation Details

**File:** `packages/db/src/constants.ts`

Create `packages/db/src/constants.ts` with all fixed domain values:

### 1. Contract Types

```typescript
export const CONTRACT_TYPES = ['CDI', 'CDD', 'Intérim', 'Alternance'] as const
export type ContractType = typeof CONTRACT_TYPES[number]
export const contractTypesList = [...CONTRACT_TYPES]  // For Zod z.enum()
```

### 2. CACES Categories

```typescript
export const CACES_CATEGORIES = ['1a', '1b', '2b', '3', '4', '5', '6', '7'] as const
export type CacesCategory = typeof CACES_CATEGORIES[number]
export const cacesCategoriesList = [...CACES_CATEGORIES]  // For Zod z.enum()
```

### 3. Medical Visit Types

```typescript
export const MEDICAL_VISIT_TYPES = ['Embauche', 'Périodique', 'Reprise', 'Spécifique'] as const
export type MedicalVisitType = typeof MEDICAL_VISIT_TYPES[number]
export const medicalVisitTypesList = [...MEDICAL_VISIT_TYPES]  // For Zod z.enum()
```

### 4. Medical Visit Results

```typescript
export const MEDICAL_VISIT_RESULTS = ['Apte', 'Apte avec restrictions', 'Inapte'] as const
export type MedicalVisitResult = typeof MEDICAL_VISIT_RESULTS[number]
export const medicalVisitResultsList = [...MEDICAL_VISIT_RESULTS]  // For Zod z.enum()
```

### 5. Full File Structure

```typescript
// packages/db/src/constants.ts

// Contract types - fixed values for employee contracts
export const CONTRACT_TYPES = ['CDI', 'CDD', 'Intérim', 'Alternance'] as const
export type ContractType = typeof CONTRACT_TYPES[number]
export const contractTypesList = [...CONTRACT_TYPES]

// CACES R489 categories - French forklift license categories
export const CACES_CATEGORIES = ['1a', '1b', '2b', '3', '4', '5', '6', '7'] as const
export type CacesCategory = typeof CACES_CATEGORIES[number]
export const cacesCategoriesList = [...CACES_CATEGORIES]

// Medical visit types - when the visit occurs
export const MEDICAL_VISIT_TYPES = ['Embauche', 'Périodique', 'Reprise', 'Spécifique'] as const
export type MedicalVisitType = typeof MEDICAL_VISIT_TYPES[number]
export const medicalVisitTypesList = [...MEDICAL_VISIT_TYPES]

// Medical visit results - outcome of examination
export const MEDICAL_VISIT_RESULTS = ['Apte', 'Apte avec restrictions', 'Inapte'] as const
export type MedicalVisitResult = typeof MEDICAL_VISIT_RESULTS[number]
export const medicalVisitResultsList = [...MEDICAL_VISIT_RESULTS]
```

## Files to Create

| File | Action |
|------|--------|
| `packages/db/src/constants.ts` | Create with all enums/constants |

## Notes

- **Schema.ts should NOT contain enums** - it only has table definitions
- Constants file can be imported anywhere (schema, queries, api, sdk)
- Lists (`contractTypesList`) are useful for Zod `z.enum()` validation
- Roles is NOT a constant - it's a user-managed table (created in Task 01-02)

## Acceptance Criteria

- [ ] `packages/db/src/constants.ts` file created
- [ ] `CONTRACT_TYPES` defined: CDI, CDD, Intérim, Alternance
- [ ] `CACES_CATEGORIES` defined: 1a, 1b, 2b, 3, 4, 5, 6, 7
- [ ] `MEDICAL_VISIT_TYPES` defined: Embauche, Périodique, Reprise, Spécifique
- [ ] `MEDICAL_VISIT_RESULTS` defined: Apte, Apte avec restrictions, Inapte
- [ ] All types export correctly (`ContractType`, `CacesCategory`, etc.)
- [ ] All lists export for Zod validation
- [ ] `pnpm typecheck` passes in packages/db
- [ ] Other packages can import from `@electron-template/db`