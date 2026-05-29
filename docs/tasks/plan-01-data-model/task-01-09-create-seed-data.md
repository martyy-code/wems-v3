---
name: Task 01-09 Create Seed Data
description: Create seed function with sample data for development
plan: plan-01-data-model
status: pending
priority: p1
created: 2026-05-26
---

# Task 01-09: Create Seed Data

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Create seed data for development and testing. This includes warehouses, employees with various certification types, and default alert settings.

## Implementation Details

### 1. Create packages/db/src/seed.ts

```typescript
import { db } from './index'
import { warehouses, roles, employees, certificationTypes, alertSettings, certifications } from './schema'
import { createWarehouse, createRole, createEmployee, createCertification, createMedicalVisit } from './queries'
import { eq } from 'drizzle-orm'

export async function seed() {
  console.log('Seeding database...')

  // 0. Check if already seeded (idempotent)
  const existingWarehouses = await db.select().from(warehouses).limit(1)
  if (existingWarehouses.length > 0) {
    console.log('Database already seeded, skipping...')
    return
  }

  // 1. Create roles FIRST (user-managed table)
  const caristeRole = await createRole({ name: 'Cariste' })
  const preparateurRole = await createRole({ name: 'Préparateur de commandes' })
  const agentRole = await createRole({ name: 'Agent de quai' })

  console.log('Created 3 roles')

  // 2. Create warehouses
  const warehouseParis = await createWarehouse({ name: 'Paris' })
  const warehouseLyon = await createWarehouse({ name: 'Lyon' })
  const warehouseMarseille = await createWarehouse({ name: 'Marseille' })

  console.log('Created 3 warehouses')

  // 3. Create certification types
  const certTypesResult = await db.insert(certificationTypes).values([
    { id: crypto.randomUUID(), name: 'CACES R489', hasCategory: true },
    { id: crypto.randomUUID(), name: 'Medical Visit', hasCategory: false },
    { id: crypto.randomUUID(), name: 'Online Training', hasCategory: false },
    { id: crypto.randomUUID(), name: 'Driving Authorization', hasCategory: false }
  ]).returning()

  const [cacesType, medicalType, trainingType, drivingType] = certTypesResult

  console.log(`Created ${certTypesResult.length} certification types`)

  // 4. Create default alert settings
  await db.insert(alertSettings).values([
    { id: crypto.randomUUID(), certificationTypeId: cacesType.id, alertDays: 30, warningDays: 60, enabled: true },
    { id: crypto.randomUUID(), certificationTypeId: medicalType.id, alertDays: 30, warningDays: 60, enabled: true },
    { id: crypto.randomUUID(), certificationTypeId: trainingType.id, alertDays: 30, warningDays: 60, enabled: true },
    { id: crypto.randomUUID(), certificationTypeId: drivingType.id, alertDays: 30, warningDays: 60, enabled: true }
  ])

  console.log('Created default alert settings')

  // 5. Create sample employees (using roleId UUID, NOT role name)
  const now = new Date()

  // Employee 1: Jean Dupont - All valid certifications
  const emp1 = await createEmployee({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    arrivalDate: new Date('2023-01-15'),
    contractType: 'CDI',
    roleId: caristeRole.id,  // UUID FK to roles table
    warehouseId: warehouseParis.id
  })

  // Create valid CACES for Jean
  await createCertification({
    employeeId: emp1.id,
    certificationTypeId: cacesType.id,
    obtainedDate: new Date(now.getFullYear() - 1, now.getMonth(), 15),
    expirationDate: new Date(now.getFullYear() + 2, now.getMonth(), 15),
    documentPath: `/documents/${emp1.id}/caces.pdf`
  })

  // Employee 2: Marie Martin - Has warning (cert expiring soon)
  const emp2 = await createEmployee({
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    phone: '06 23 45 67 89',
    arrivalDate: new Date('2022-06-01'),
    contractType: 'CDI',
    roleId: caristeRole.id,
    warehouseId: warehouseLyon.id
  })

  // Create CACES expiring in 45 days (warning)
  await createCertification({
    employeeId: emp2.id,
    certificationTypeId: cacesType.id,
    obtainedDate: new Date(now.getFullYear() - 1, now.getMonth(), 10),
    expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    documentPath: `/documents/${emp2.id}/caces.pdf`
  })

  // Employee 3: Pierre Durand - Has alert (cert expiring in 7 days)
  const emp3 = await createEmployee({
    firstName: 'Pierre',
    lastName: 'Durand',
    email: 'pierre.durand@example.com',
    arrivalDate: new Date('2021-03-20'),
    contractType: 'CDD',
    roleId: preparateurRole.id,
    warehouseId: warehouseParis.id
  })

  // Create CACES expiring in 7 days (alert)
  await createCertification({
    employeeId: emp3.id,
    certificationTypeId: cacesType.id,
    obtainedDate: new Date(now.getFullYear() - 1, now.getMonth(), 1),
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    documentPath: `/documents/${emp3.id}/caces.pdf`
  })

  // Employee 4: Sophie Bernard - Expired certification
  const emp4 = await createEmployee({
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@example.com',
    arrivalDate: new Date('2020-09-10'),
    contractType: 'CDI',
    roleId: caristeRole.id,
    warehouseId: warehouseMarseille.id
  })

  // Create expired CACES
  await createCertification({
    employeeId: emp4.id,
    certificationTypeId: cacesType.id,
    obtainedDate: new Date('2020-01-01'),
    expirationDate: new Date('2021-01-01'),
    documentPath: `/documents/${emp4.id}/caces.pdf`
  })

  // Employee 5: Lucas Moreau - Missing document
  const emp5 = await createEmployee({
    firstName: 'Lucas',
    lastName: 'Moreau',
    arrivalDate: new Date('2023-03-01'),
    contractType: 'Alternance',
    roleId: preparateurRole.id,
    warehouseId: warehouseParis.id
  })

  // Create training certification WITHOUT document
  await createCertification({
    employeeId: emp5.id,
    certificationTypeId: trainingType.id,
    obtainedDate: new Date(now.getFullYear() - 1, now.getMonth(), 20),
    expirationDate: new Date(now.getFullYear() + 1, now.getMonth(), 20)
    // No documentPath - triggers missing document alert
  })

  // Employee 6: Emma Petit - Medical Inapte
  const emp6 = await createEmployee({
    firstName: 'Emma',
    lastName: 'Petit',
    email: 'emma.petit@example.com',
    arrivalDate: new Date('2022-01-15'),
    contractType: 'CDI',
    roleId: agentRole.id,
    warehouseId: warehouseLyon.id
  })

  const emp6Cert = await createCertification({
    employeeId: emp6.id,
    certificationTypeId: medicalType.id,
    obtainedDate: new Date('2026-01-10'),
    expirationDate: new Date('2027-01-10'),
    documentPath: `/documents/${emp6.id}/medical.pdf`
  })

  // Create medical visit with "Inapte" result
  await createMedicalVisit({
    certificationId: emp6Cert.id,
    visitType: 'Embauche',
    visitDate: new Date('2026-01-10'),
    result: 'Inapte'
  })

  // Additional employees for variety (8 more = total 14)
  const additionalEmployees = [
    { firstName: 'Thomas', lastName: 'Robert', roleId: caristeRole.id, warehouseId: warehouseParis.id },
    { firstName: 'Julie', lastName: 'Dubois', roleId: preparateurRole.id, warehouseId: warehouseLyon.id },
    { firstName: 'Nicolas', lastName: 'Thomas', roleId: agentRole.id, warehouseId: warehouseMarseille.id },
    { firstName: 'Marie', lastName: 'Ferreira', roleId: caristeRole.id, warehouseId: warehouseParis.id },
    { firstName: 'Antoine', lastName: 'Laurent', roleId: preparateurRole.id, warehouseId: warehouseLyon.id },
    { firstName: 'Camille', lastName: 'Michel', roleId: agentRole.id, warehouseId: warehouseMarseille.id },
    { firstName: 'Alexandre', lastName: 'Leroy', roleId: caristeRole.id, warehouseId: warehouseParis.id },
    { firstName: 'Charlotte', lastName: 'Garcia', roleId: preparateurRole.id, warehouseId: warehouseLyon.id }
  ]

  for (const emp of additionalEmployees) {
    const employee = await createEmployee({
      firstName: emp.firstName,
      lastName: emp.lastName,
      arrivalDate: new Date(now.getFullYear() - Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      contractType: ['CDI', 'CDD', 'Intérim', 'Alternance'][Math.floor(Math.random() * 4)] as any,
      roleId: emp.roleId,
      warehouseId: emp.warehouseId
    })

    // Give each employee a valid certification
    await createCertification({
      employeeId: employee.id,
      certificationTypeId: trainingType.id,
      obtainedDate: new Date(now.getFullYear() - 1, now.getMonth(), 1),
      expirationDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
      documentPath: `/documents/${employee.id}/training.pdf`
    })
  }

  console.log(`Created 14 sample employees with certifications`)
  console.log('Seeding complete!')
}

// Run seed if called directly
seed().catch(console.error)
```

### 2. Add seed script to package.json

In `packages/db/package.json`:

```json
{
  "scripts": {
    "seed": "tsx src/seed.ts",
    "db:seed": "tsx src/seed.ts"
  }
}
```

## Sample Data Summary

| Employee | Status | Certifications |
|----------|--------|----------------|
| Jean Dupont | All Valid | CACES (valid, expires +2y) |
| Marie Martin | Warning | CACES (warning, expires 45d) |
| Pierre Durand | Alert | CACES (alert, expires 7d) |
| Sophie Bernard | Expired | CACES (expired 2021) |
| Lucas Moreau | Missing Doc | Training (no document) |
| Emma Petit | Inapte | Medical (Inapte result) |
| + 8 more | Varied | Training certifications |

## Files to Create

| File | Action |
|------|--------|
| `packages/db/src/seed.ts` | Create seed function |

## Commands

```bash
# Run seed
pnpm db:seed
```

## Notes

- **CRITICAL**: Always use `roleId: role.id` (UUID FK), NOT `role: 'Cariste'` (string)
- Seed is idempotent (checks for existing data before creating)
- Roles must be created BEFORE employees (foreign key dependency)
- Include variety of certification statuses: valid, warning, alert, expired, missing doc
- `enabled` field in alertSettings defaults to `true`

## Acceptance Criteria

- [ ] `packages/db/src/seed.ts` file created
- [ ] Seed is idempotent (checks `warehouses` table before seeding)
- [ ] Seed creates 3 roles FIRST: Cariste, Préparateur de commandes, Agent de quai
- [ ] Seed creates 3 warehouses: Paris, Lyon, Marseille
- [ ] Seed creates 4 certification types: CACES R489, Medical Visit, Online Training, Driving Authorization
- [ ] Seed creates default alert settings (30/60 days, enabled: true)
- [ ] Seed creates 14 employees with `roleId: uuid` (NOT role: string)
- [ ] Employee 1: Jean Dupont - All valid certifications
- [ ] Employee 2: Marie Martin - CACES expiring in 45 days (warning)
- [ ] Employee 3: Pierre Durand - CACES expiring in 7 days (alert)
- [ ] Employee 4: Sophie Bernard - CACES expired (2021)
- [ ] Employee 5: Lucas Moreau - Training without document
- [ ] Employee 6: Emma Petit - Medical with "Inapte" result
- [ ] Employees 7-14: Various roles and warehouses
- [ ] All employees have at least one certification
- [ ] `pnpm db:seed` runs without errors
- [ ] Seed can be run multiple times without error (idempotent)

## Related

- [Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)
- [Task 01-08](./task-01-08-update-sdk-exports.md) — Previous task
- [Task 01-10](./task-01-10-write-unit-tests.md) — Next task
