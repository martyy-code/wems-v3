---
name: Task 01-07 Update oRPC Router
description: Add oRPC procedures using modular queries API
plan: plan-01-data-model
status: pending
priority: p0
created: 2026-05-26
---

# Task 01-07: Update oRPC Router

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Update the oRPC router to expose database operations as type-safe procedures using the modular queries API (`queries.role.create()`, `queries.warehouse.list()`, etc.).

**Pattern:** Each procedure is defined as a `const`, not an object method.

## Implementation Details

### 1. File Structure

```
packages/api/src/
├── router.ts       # Main router with namespace structure
├── procedures/
│   ├── role.ts     # roleProcedures
│   ├── warehouse.ts # warehouseProcedures
│   ├── employee.ts # employeeProcedures
│   ├── certification.ts # certificationProcedures
│   └── alert.ts    # alertProcedures
└── index.ts        # Re-exports router
```

### 2. Import Queries

```typescript
import { queries } from '@electron-template/db'
```

### 3. Role Procedures

```typescript
// packages/api/src/procedures/role.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'

export const roleProcedures = {
  create: os
    .input(z.object({ name: z.string() }))
    .handler(async ({ input }) => {
      return queries.role.create(input)
    }),

  list: os
    .input(z.object({ includeInactive: z.boolean().optional() }).optional())
    .handler(async ({ input }) => {
      return queries.role.list(input?.includeInactive ?? false)
    }),

  getById: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.role.getById(input.id)
    }),

  getByName: os
    .input(z.object({ name: z.string() }))
    .handler(async ({ input }) => {
      return queries.role.getByName(input.name)
    }),

  update: os
    .input(z.object({ id: z.string(), name: z.string() }))
    .handler(async ({ input }) => {
      return queries.role.update(input.id, { name: input.name })
    }),

  delete: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      await queries.role.delete(input.id)
      return { success: true }
    }),

  reactivate: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.role.reactivate(input.id)
    })
}
```

### 4. Warehouse Procedures

```typescript
// packages/api/src/procedures/warehouse.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'

export const warehouseProcedures = {
  create: os
    .input(z.object({ name: z.string() }))
    .handler(async ({ input }) => {
      return queries.warehouse.create(input)
    }),

  list: os
    .input(z.object({ includeInactive: z.boolean().optional() }).optional())
    .handler(async ({ input }) => {
      return queries.warehouse.list(input?.includeInactive ?? false)
    }),

  getById: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.warehouse.getById(input.id)
    }),

  update: os
    .input(z.object({ id: z.string(), name: z.string() }))
    .handler(async ({ input }) => {
      return queries.warehouse.update(input.id, { name: input.name })
    }),

  delete: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      await queries.warehouse.delete(input.id)
      return { success: true }
    }),

  reactivate: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.warehouse.reactivate(input.id)
    })
}
```

### 5. Employee Procedures

```typescript
// packages/api/src/procedures/employee.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'
import { contractTypesList } from '@electron-template/db'

export const employeeProcedures = {
  create: os
    .input(z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      arrivalDate: z.string(),
      contractType: z.enum(contractTypesList as [string, ...string[]]),
      roleId: z.string(),
      warehouseId: z.string()
    }))
    .handler(async ({ input }) => {
      return queries.employee.create({
        ...input,
        arrivalDate: new Date(input.arrivalDate)
      })
    }),

  list: os
    .input(z.object({
      isActive: z.boolean().optional(),
      warehouseId: z.string().optional(),
      roleId: z.string().optional(),
      search: z.string().optional()
    }).optional())
    .handler(async ({ input }) => {
      return queries.employee.list(input || {})
    }),

  getById: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.employee.getById(input.id)
    }),

  update: os
    .input(z.object({
      id: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      arrivalDate: z.string().optional(),
      contractType: z.string().optional(),
      roleId: z.string().optional(),
      warehouseId: z.string().optional()
    }))
    .handler(async ({ input }) => {
      const { id, ...data } = input
      return queries.employee.update(id, {
        ...data,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : undefined
      })
    }),

  deactivate: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.employee.deactivate(input.id)
    }),

  reactivate: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.employee.reactivate(input.id)
    })
}
```

### 6. Certification Procedures

```typescript
// packages/api/src/procedures/certification.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'
import { cacesCategoriesList, medicalVisitTypesList, medicalVisitResultsList } from '@electron-template/db'

export const certificationProcedures = {
  // Base Certification
  create: os
    .input(z.object({
      employeeId: z.string(),
      certificationTypeId: z.string(),
      obtainedDate: z.string(),
      expirationDate: z.string().optional(),
      documentPath: z.string().optional()
    }))
    .handler(async ({ input }) => {
      return queries.certification.create({
        ...input,
        obtainedDate: new Date(input.obtainedDate),
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined
      })
    }),

  listByEmployee: os
    .input(z.object({
      employeeId: z.string(),
      includeInactive: z.boolean().optional()
    }))
    .handler(async ({ input }) => {
      return queries.certification.listByEmployee(input.employeeId, input.includeInactive ?? false)
    }),

  getById: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.certification.getById(input.id)
    }),

  delete: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      await queries.certification.delete(input.id)
      return { success: true }
    }),

  reactivate: os
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return queries.certification.reactivate(input.id)
    }),

  // CACES
  createCaces: os
    .input(z.object({
      certificationId: z.string(),
      category: z.enum(cacesCategoriesList as [string, ...string[]])
    }))
    .handler(async ({ input }) => {
      return queries.caces.create(input)
    }),

  listCacesByEmployee: os
    .input(z.object({ employeeId: z.string() }))
    .handler(async ({ input }) => {
      return queries.caces.listByEmployee(input.employeeId)
    }),

  // Medical Visit
  createMedical: os
    .input(z.object({
      certificationId: z.string(),
      visitType: z.enum(medicalVisitTypesList as [string, ...string[]]),
      visitDate: z.string(),
      result: z.enum(medicalVisitResultsList as [string, ...string[]])
    }))
    .handler(async ({ input }) => {
      return queries.medical.create({
        ...input,
        visitDate: new Date(input.visitDate)
      })
    }),

  listMedicalByEmployee: os
    .input(z.object({ employeeId: z.string() }))
    .handler(async ({ input }) => {
      return queries.medical.listByEmployee(input.employeeId)
    }),

  updateMedicalResult: os
    .input(z.object({
      id: z.string(),
      result: z.enum(medicalVisitResultsList as [string, ...string[]])
    }))
    .handler(async ({ input }) => {
      await queries.medical.updateResult(input.id, input.result)
      return { success: true }
    }),

  // Online Training
  createTraining: os
    .input(z.object({
      certificationId: z.string(),
      trainingDate: z.string()
    }))
    .handler(async ({ input }) => {
      return queries.training.create({
        certificationId: input.certificationId,
        trainingDate: new Date(input.trainingDate)
      })
    }),

  listTrainingByEmployee: os
    .input(z.object({ employeeId: z.string() }))
    .handler(async ({ input }) => {
      return queries.training.listByEmployee(input.employeeId)
    }),

  // Driving Authorization
  createDriving: os
    .input(z.object({
      certificationId: z.string(),
      authorizationDate: z.string()
    }))
    .handler(async ({ input }) => {
      return queries.driving.create({
        certificationId: input.certificationId,
        authorizationDate: new Date(input.authorizationDate)
      })
    }),

  listDrivingByEmployee: os
    .input(z.object({ employeeId: z.string() }))
    .handler(async ({ input }) => {
      return queries.driving.listByEmployee(input.employeeId)
    })
}
```

### 7. Alert Procedures (Simpler, Inline)

```typescript
// packages/api/src/procedures/alert.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'
import { alertSettings, snoozedAlerts } from '@electron-template/db'
import { eq, gte, lt, and } from 'drizzle-orm'
import { db } from '@electron-template/db'

export const alertProcedures = {
  // Alert Settings
  getSettings: os.handler(async () => {
    return db.select().from(alertSettings)
  }),

  updateSettings: os
    .input(z.object({
      certificationTypeId: z.string(),
      alertDays: z.number().min(1).max(365),
      warningDays: z.number().min(1).max(365)
    }))
    .handler(async ({ input }) => {
      const existing = await db.select().from(alertSettings)
        .where(eq(alertSettings.certificationTypeId, input.certificationTypeId)).limit(1)

      if (existing[0]) {
        await db.update(alertSettings)
          .set({ alertDays: input.alertDays, warningDays: input.warningDays, updatedAt: new Date() })
          .where(eq(alertSettings.certificationTypeId, input.certificationTypeId))
      } else {
        await db.insert(alertSettings).values({
          id: crypto.randomUUID(),
          certificationTypeId: input.certificationTypeId,
          alertDays: input.alertDays,
          warningDays: input.warningDays,
          enabled: true
        })
      }

      const result = await db.select().from(alertSettings)
        .where(eq(alertSettings.certificationTypeId, input.certificationTypeId)).limit(1)
      return result[0]
    }),

  // Snoozed Alerts
  createSnoozed: os
    .input(z.object({
      employeeId: z.string(),
      certificationId: z.string(),
      reason: z.string().optional(),
      snoozedUntil: z.string()
    }))
    .handler(async ({ input }) => {
      const id = crypto.randomUUID()
      await db.insert(snoozedAlerts).values({
        id,
        employeeId: input.employeeId,
        certificationId: input.certificationId,
        reason: input.reason || null,
        snoozedUntil: new Date(input.snoozedUntil)
      })
      const result = await db.select().from(snoozedAlerts).where(eq(snoozedAlerts.id, id)).limit(1)
      return result[0]
    }),

  listSnoozed: os.handler(async () => {
    return db.select().from(snoozedAlerts).where(gte(snoozedAlerts.snoozedUntil, new Date()))
  }),

  deleteSnoozed: os
    .input(z.object({
      employeeId: z.string(),
      certificationId: z.string()
    }))
    .handler(async ({ input }) => {
      await db.delete(snoozedAlerts).where(and(
        eq(snoozedAlerts.employeeId, input.employeeId),
        eq(snoozedAlerts.certificationId, input.certificationId)
      ))
      return { success: true }
    }),

  cleanupExpired: os.handler(async () => {
    await db.delete(snoozedAlerts).where(lt(snoozedAlerts.snoozedUntil, new Date()))
    return { success: true }
  })
}
```

### 8. Main Router

```typescript
// packages/api/src/router.ts
import { roleProcedures } from './procedures/role'
import { warehouseProcedures } from './procedures/warehouse'
import { employeeProcedures } from './procedures/employee'
import { certificationProcedures } from './procedures/certification'
import { alertProcedures } from './procedures/alert'

export const router = {
  role: roleProcedures,
  warehouse: warehouseProcedures,
  employee: employeeProcedures,
  certification: certificationProcedures,
  alert: alertProcedures
}

export type RouterRouter = typeof router
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `packages/api/src/procedures/role.ts` | Create |
| `packages/api/src/procedures/warehouse.ts` | Create |
| `packages/api/src/procedures/employee.ts` | Create |
| `packages/api/src/procedures/certification.ts` | Create |
| `packages/api/src/procedures/alert.ts` | Create |
| `packages/api/src/router.ts` | Replace with modular structure |
| `packages/api/src/index.ts` | Update exports |

## Notes

- **Pattern:** Use `const` properties: `{ create: os.input(...).handler(...) }`
- Use Zod for input validation on all procedures
- Return descriptive errors, not generic messages
- Dates are passed as ISO strings and converted to Date objects in handlers
- Procedures use the modular queries API: `queries.{entity}.{method}()`
- Enums use `*List` constants: `contractTypesList`, `cacesCategoriesList`, etc.

## Acceptance Criteria

- [ ] `roleProcedures`: create, list, getById, getByName, update, delete (soft), reactivate
- [ ] `warehouseProcedures`: create, list, getById, update, delete (soft), reactivate
- [ ] `employeeProcedures`: create, list, getById, update, deactivate, reactivate
- [ ] `certificationProcedures`: create, listByEmployee, getById, delete (soft), reactivate + CACES, Medical, Training, Driving
- [ ] `alertProcedures`: getSettings, updateSettings, createSnoozed, listSnoozed, deleteSnoozed, cleanupExpired
- [ ] Router uses modular structure: `router.role.list()`, `router.warehouse.create()`, etc.
- [ ] All inputs validated with Zod (use z.enum() with *List constants)
- [ ] All dates handled properly (convert ISO strings to Date objects)
- [ ] Router type exports: `RouterRouter = typeof router`
- [ ] All procedures defined as `const` properties
- [ ] TypeScript compiles without errors

## Related

- [Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)
- [Task 01-06](./task-01-06-create-queries.md) — Previous task
- [Task 01-08](./task-01-08-update-sdk-exports.md) — Next task