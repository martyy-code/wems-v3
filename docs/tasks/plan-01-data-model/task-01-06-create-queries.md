---
name: Task 01-06 Create Queries Module
description: Create modular query functions organized by entity namespace
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-06: Create Queries Module

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Create modular query functions for all WEMS entities. Queries are organized by entity into separate files with a namespace-based API structure (`queries.role.create()`, `queries.warehouse.list()`, etc.).

**Important:** Use correct Drizzle ORM syntax. Do NOT use `.with()` in manual queries - use proper joins or separate queries.

**Pattern:** Each function is defined as a `const` property, not an object method.

## API Structure

```typescript
// Usage examples
const role = await queries.role.create({ name: 'Cariste' })
const roles = await queries.role.list()
const role = await queries.role.getById(id)
await queries.role.update(id, { name: 'New Name' })
await queries.role.delete(id)  // Soft delete
await queries.role.reactivate(id)

const warehouse = await queries.warehouse.create({ name: 'Paris' })
const warehouses = await queries.warehouse.list({ includeInactive: false })
```

## File Structure

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

**Note:** AlertSettings and SnoozedAlerts are simpler entities, handled inline in the router (Task 01-07).

## Implementation Details

### 1. packages/db/src/queries/index.ts

```typescript
import { db } from '../index'
import { role } from './role'
import { warehouse } from './warehouse'
import { employee } from './employee'
import { certification } from './certification'
import { caces } from './caces'
import { medical } from './medical'
import { training } from './training'
import { driving } from './driving'

export const queries = {
  role,
  warehouse,
  employee,
  certification,
  caces,
  medical,
  training,
  driving
}

export type Queries = typeof queries
```

### 2. packages/db/src/queries/role.ts

```typescript
import { eq } from 'drizzle-orm'
import { db } from '../index'
import { roles } from '../schema'

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
  },

  getByName: async (name: string) => {
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1)
    return result[0] || null
  },

  update: async (id: string, data: { name: string }) => {
    await db.update(roles).set({ name: data.name, updatedAt: new Date() }).where(eq(roles.id, id))
    return role.getById(id)
  },

  delete: async (id: string) => {
    // Soft delete - preserve employee history
    await db.update(roles).set({ isActive: false, updatedAt: new Date() }).where(eq(roles.id, id))
  },

  reactivate: async (id: string) => {
    await db.update(roles).set({ isActive: true, updatedAt: new Date() }).where(eq(roles.id, id))
    return role.getById(id)
  }
}
```

### 3. packages/db/src/queries/warehouse.ts

```typescript
import { eq } from 'drizzle-orm'
import { db } from '../index'
import { warehouses } from '../schema'

export const warehouse = {
  create: async (data: { name: string }) => {
    const id = crypto.randomUUID()
    await db.insert(warehouses).values({ id, name: data.name, isActive: true })
    return warehouse.getById(id)
  },

  list: async (includeInactive = false) => {
    if (includeInactive) {
      return db.select().from(warehouses).orderBy(warehouses.name)
    }
    return db.select().from(warehouses).where(eq(warehouses.isActive, true)).orderBy(warehouses.name)
  },

  getById: async (id: string) => {
    const result = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1)
    return result[0] || null
  },

  update: async (id: string, data: { name: string }) => {
    await db.update(warehouses).set({ name: data.name, updatedAt: new Date() }).where(eq(warehouses.id, id))
    return warehouse.getById(id)
  },

  delete: async (id: string) => {
    // Soft delete - preserve employee history
    await db.update(warehouses).set({ isActive: false, updatedAt: new Date() }).where(eq(warehouses.id, id))
  },

  reactivate: async (id: string) => {
    await db.update(warehouses).set({ isActive: true, updatedAt: new Date() }).where(eq(warehouses.id, id))
    return warehouse.getById(id)
  }
}
```

### 4. packages/db/src/queries/employee.ts

```typescript
import { eq, and, sql } from 'drizzle-orm'
import { db } from '../index'
import { employees } from '../schema'
import { role } from './role'
import { warehouse } from './warehouse'

export const employee = {
  create: async (data: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    arrivalDate: Date
    contractType: string
    roleId: string
    warehouseId: string
  }) => {
    // Generate employee number
    const existing = await db.select({ count: sql<number>`count(*)` }).from(employees)
    const nextNum = (Number(existing[0]?.count) || 0) + 1
    const employeeNumber = `EMP-${String(nextNum).padStart(3, '0')}`

    const id = crypto.randomUUID()
    await db.insert(employees).values({
      id,
      employeeNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      arrivalDate: data.arrivalDate,
      contractType: data.contractType,
      roleId: data.roleId,
      warehouseId: data.warehouseId,
      isActive: true
    })
    return employee.getById(id)
  },

  list: async (filters?: {
    isActive?: boolean
    warehouseId?: string
    roleId?: string
    search?: string
  }) => {
    const conditions = []

    if (filters?.isActive !== undefined) {
      conditions.push(eq(employees.isActive, filters.isActive))
    }
    if (filters?.warehouseId) {
      conditions.push(eq(employees.warehouseId, filters.warehouseId))
    }
    if (filters?.roleId) {
      conditions.push(eq(employees.roleId, filters.roleId))
    }

    let query = db.select().from(employees)

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    return query.orderBy(employees.lastName, employees.firstName)
  },

  getById: async (id: string) => {
    const empResult = await db.select().from(employees).where(eq(employees.id, id)).limit(1)
    const emp = empResult[0]
    if (!emp) return null

    // Fetch related data separately
    const [roleData, warehouseData] = await Promise.all([
      role.getById(emp.roleId),
      warehouse.getById(emp.warehouseId)
    ])

    return { ...emp, role: roleData, warehouse: warehouseData }
  },

  update: async (id: string, data: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    arrivalDate?: Date
    contractType?: string
    roleId?: string
    warehouseId?: string
  }) => {
    const updateData: Record<string, any> = { updatedAt: new Date() }
    if (data.firstName) updateData.firstName = data.firstName
    if (data.lastName) updateData.lastName = data.lastName
    if (data.email !== undefined) updateData.email = data.email || null
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.arrivalDate) updateData.arrivalDate = data.arrivalDate
    if (data.contractType) updateData.contractType = data.contractType
    if (data.roleId) updateData.roleId = data.roleId
    if (data.warehouseId) updateData.warehouseId = data.warehouseId

    await db.update(employees).set(updateData).where(eq(employees.id, id))
    return employee.getById(id)
  },

  deactivate: async (id: string) => {
    await db.update(employees).set({ isActive: false, updatedAt: new Date() }).where(eq(employees.id, id))
    return employee.getById(id)
  },

  reactivate: async (id: string) => {
    await db.update(employees).set({ isActive: true, updatedAt: new Date() }).where(eq(employees.id, id))
    return employee.getById(id)
  }
}
```

### 5. packages/db/src/queries/certification.ts

```typescript
import { eq, desc, inArray } from 'drizzle-orm'
import { db } from '../index'
import { certifications, certificationTypes } from '../schema'

export const certification = {
  create: async (data: {
    employeeId: string
    certificationTypeId: string
    obtainedDate: Date
    expirationDate?: Date
    documentPath?: string
  }) => {
    const id = crypto.randomUUID()
    await db.insert(certifications).values({
      id,
      employeeId: data.employeeId,
      certificationTypeId: data.certificationTypeId,
      obtainedDate: data.obtainedDate,
      expirationDate: data.expirationDate || null,
      documentPath: data.documentPath || null,
      isActive: true
    })
    return certification.getById(id)
  },

  listByEmployee: async (employeeId: string, includeInactive = false) => {
    let query = db.select().from(certifications)
      .where(eq(certifications.employeeId, employeeId))

    if (!includeInactive) {
      query = query.where(eq(certifications.isActive, true)) as any
    }

    const certs = await query.orderBy(desc(certifications.obtainedDate))

    // Fetch certification types
    const typeIds = [...new Set(certs.map(c => c.certificationTypeId))]
    const types = typeIds.length > 0
      ? await db.select().from(certificationTypes).where(inArray(certificationTypes.id, typeIds))
      : []

    const typeMap = new Map(types.map(t => [t.id, t]))

    return certs.map(cert => ({
      ...cert,
      certificationType: typeMap.get(cert.certificationTypeId)
    }))
  },

  getById: async (id: string) => {
    const result = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1)
    const cert = result[0]
    if (!cert) return null

    const [certType] = await db.select().from(certificationTypes)
      .where(eq(certificationTypes.id, cert.certificationTypeId)).limit(1)

    return { ...cert, certificationType: certType || null }
  },

  delete: async (id: string) => {
    // Soft delete - preserve audit trail
    await db.update(certifications).set({ isActive: false, updatedAt: new Date() }).where(eq(certifications.id, id))
  },

  reactivate: async (id: string) => {
    await db.update(certifications).set({ isActive: true, updatedAt: new Date() }).where(eq(certifications.id, id))
    return certification.getById(id)
  }
}
```

### 6. packages/db/src/queries/caces.ts

```typescript
import { eq, inArray } from 'drizzle-orm'
import { db } from '../index'
import { cacesCertifications, certificationTypes } from '../schema'
import { certification } from './certification'

export const caces = {
  create: async (data: { certificationId: string; category: string }) => {
    const id = crypto.randomUUID()
    await db.insert(cacesCertifications).values({
      id,
      certificationId: data.certificationId,
      category: data.category
    })
    const result = await db.select().from(cacesCertifications).where(eq(cacesCertifications.id, id)).limit(1)
    return result[0] || null
  },

  getByCertification: async (certificationId: string) => {
    const result = await db.select().from(cacesCertifications)
      .where(eq(cacesCertifications.certificationId, certificationId)).limit(1)
    return result[0] || null
  },

  listByEmployee: async (employeeId: string) => {
    const certs = await certification.listByEmployee(employeeId)
    const cacesType = await db.select().from(certificationTypes)
      .where(eq(certificationTypes.name, 'CACES R489')).limit(1)

    if (!cacesType[0]) return []

    const cacesCerts = certs.filter(c => c.certificationTypeId === cacesType[0].id)

    const cacesIds = cacesCerts.map(c => c.id)
    if (cacesIds.length === 0) return []

    const cacesDetails = await db.select().from(cacesCertifications)
      .where(inArray(cacesCertifications.certificationId, cacesIds))

    return cacesCerts.map(cert => ({
      ...cert,
      cacesDetails: cacesDetails.find(cd => cd.certificationId === cert.id) || null
    }))
  }
}
```

### 7. packages/db/src/queries/medical.ts

```typescript
import { eq, inArray } from 'drizzle-orm'
import { db } from '../index'
import { medicalVisits, certificationTypes } from '../schema'
import { certification } from './certification'

export const medical = {
  create: async (data: {
    certificationId: string
    visitType: string
    visitDate: Date
    result: string
  }) => {
    const id = crypto.randomUUID()
    await db.insert(medicalVisits).values({
      id,
      certificationId: data.certificationId,
      visitType: data.visitType,
      visitDate: data.visitDate,
      result: data.result
    })
    const result = await db.select().from(medicalVisits).where(eq(medicalVisits.id, id)).limit(1)
    return result[0] || null
  },

  listByEmployee: async (employeeId: string) => {
    const certs = await certification.listByEmployee(employeeId)
    const medicalType = await db.select().from(certificationTypes)
      .where(eq(certificationTypes.name, 'Medical Visit')).limit(1)

    if (!medicalType[0]) return []

    const medicalCerts = certs.filter(c => c.certificationTypeId === medicalType[0].id)

    const certIds = medicalCerts.map(c => c.id)
    if (certIds.length === 0) return []

    const visits = await db.select().from(medicalVisits)
      .where(inArray(medicalVisits.certificationId, certIds))

    return medicalCerts.map(cert => ({
      ...cert,
      medicalVisit: visits.find(v => v.certificationId === cert.id) || null
    }))
  },

  updateResult: async (id: string, result: string) => {
    await db.update(medicalVisits).set({ result, updatedAt: new Date() }).where(eq(medicalVisits.id, id))
  }
}
```

### 8. packages/db/src/queries/training.ts

```typescript
import { eq, inArray } from 'drizzle-orm'
import { db } from '../index'
import { onlineTrainings, certificationTypes } from '../schema'
import { certification } from './certification'

export const training = {
  create: async (data: { certificationId: string; trainingDate: Date }) => {
    const id = crypto.randomUUID()
    await db.insert(onlineTrainings).values({
      id,
      certificationId: data.certificationId,
      trainingDate: data.trainingDate
    })
    const result = await db.select().from(onlineTrainings).where(eq(onlineTrainings.id, id)).limit(1)
    return result[0] || null
  },

  listByEmployee: async (employeeId: string) => {
    const certs = await certification.listByEmployee(employeeId)
    const trainingType = await db.select().from(certificationTypes)
      .where(eq(certificationTypes.name, 'Online Training')).limit(1)

    if (!trainingType[0]) return []

    const trainingCerts = certs.filter(c => c.certificationTypeId === trainingType[0].id)

    const certIds = trainingCerts.map(c => c.id)
    if (certIds.length === 0) return []

    const trainings = await db.select().from(onlineTrainings)
      .where(inArray(onlineTrainings.certificationId, certIds))

    return trainingCerts.map(cert => ({
      ...cert,
      training: trainings.find(t => t.certificationId === cert.id) || null
    }))
  }
}
```

### 9. packages/db/src/queries/driving.ts

```typescript
import { eq, inArray } from 'drizzle-orm'
import { db } from '../index'
import { drivingAuthorizations, certificationTypes } from '../schema'
import { certification } from './certification'

export const driving = {
  create: async (data: { certificationId: string; authorizationDate: Date }) => {
    const id = crypto.randomUUID()
    await db.insert(drivingAuthorizations).values({
      id,
      certificationId: data.certificationId,
      authorizationDate: data.authorizationDate
    })
    const result = await db.select().from(drivingAuthorizations).where(eq(drivingAuthorizations.id, id)).limit(1)
    return result[0] || null
  },

  listByEmployee: async (employeeId: string) => {
    const certs = await certification.listByEmployee(employeeId)
    const drivingType = await db.select().from(certificationTypes)
      .where(eq(certificationTypes.name, 'Driving Authorization')).limit(1)

    if (!drivingType[0]) return []

    const drivingCerts = certs.filter(c => c.certificationTypeId === drivingType[0].id)

    const certIds = drivingCerts.map(c => c.id)
    if (certIds.length === 0) return []

    const authorizations = await db.select().from(drivingAuthorizations)
      .where(inArray(drivingAuthorizations.certificationId, certIds))

    return drivingCerts.map(cert => ({
      ...cert,
      authorization: authorizations.find(a => a.certificationId === cert.id) || null
    }))
  }
}
```

## Files to Create

| File | Description |
|------|-------------|
| `packages/db/src/queries/index.ts` | Main export, re-exports all namespaces |
| `packages/db/src/queries/role.ts` | Role queries |
| `packages/db/src/queries/warehouse.ts` | Warehouse queries |
| `packages/db/src/queries/employee.ts` | Employee queries |
| `packages/db/src/queries/certification.ts` | Certification queries |
| `packages/db/src/queries/caces.ts` | CACES queries |
| `packages/db/src/queries/medical.ts` | Medical visit queries |
| `packages/db/src/queries/training.ts` | Online training queries |
| `packages/db/src/queries/driving.ts` | Driving authorization queries |

## Notes

- **Pattern:** Use `const` property with arrow function: `{ create: async (...) => {...} }`
- **Do NOT use `.with()`** in manual queries - it's only for Drizzle's relation system
- **Use `roleId: string`** (UUID), not `role: Role`
- Fetch related data in separate queries when needed
- Use `inArray` for "where id IN (...)" patterns
- Use `limit(1)` and access `result[0]` for single-row queries

## Acceptance Criteria

- [ ] `queries.role`: create, list (with includeInactive), getById, getByName, update, delete (soft), reactivate
- [ ] `queries.warehouse`: create, list (with includeInactive), getById, update, delete (soft), reactivate
- [ ] `queries.employee`: create (auto number), list (with filters), getById (with relations), update, deactivate, reactivate
- [ ] `queries.certification`: create, listByEmployee (with includeInactive), getById, delete (soft), reactivate
- [ ] `queries.caces`: create, getByCertification, listByEmployee
- [ ] `queries.medical`: create, listByEmployee, updateResult
- [ ] `queries.training`: create, listByEmployee
- [ ] `queries.driving`: create, listByEmployee
- [ ] All queries use correct Drizzle syntax (no `.with()` in manual queries)
- [ ] All queries use `roleId: string` (not `role: Role`)
- [ ] All functions defined as `const` properties (not object methods)
- [ ] TypeScript compiles without errors
- [ ] `packages/db/src/queries/index.ts` re-exports all namespaces
- [ ] API structure: `queries.{entity}.{method}()` works

## Related

- [Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)
- [Task 01-05](./task-01-05-generate-migration.md) — Previous task
- [Task 01-07](./task-01-07-update-orpc-router.md) — Next task