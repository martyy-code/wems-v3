---
name: Task 01-10 Write Unit Tests
description: Write unit tests for critical database queries
plan: plan-01-data-model
status: pending
priority: p1
created: 2026-05-26
---

# Task 01-10: Write Unit Tests

## Plan

[Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)

## Description

Write unit tests for critical database query functions. These tests ensure the data layer works correctly and catches regressions.

## Implementation Details

### 1. Setup Test Database

Create `packages/db/src/__tests__/setup.ts`:

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { sql } from 'drizzle-orm'
import * as schema from '../schema'

// Create in-memory database for testing
const sqlite = new Database(':memory:')
export const testDb = drizzle(sqlite, { schema })

// Initialize tables using Drizzle migration
export async function setupTestDatabase() {
  // Use drizzle-kit's migrate function to create tables
  // This ensures the test DB schema matches the actual schema exactly
  const { migrate } = await import('drizzle-orm/better-sqlite3/migrator')

  // For in-memory testing, we run the CREATE statements from schema
  // This is more reliable than manual CREATE TABLE statements

  // Create all tables that match schema.ts exactly
  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS certification_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      has_category INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      employee_number TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      arrival_date INTEGER NOT NULL,
      contract_type TEXT NOT NULL,
      role_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      certification_type_id TEXT NOT NULL,
      obtained_date INTEGER NOT NULL,
      expiration_date INTEGER,
      document_path TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS caces_certifications (
      id TEXT PRIMARY KEY,
      certification_id TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS medical_visits (
      id TEXT PRIMARY KEY,
      certification_id TEXT NOT NULL,
      visit_type TEXT NOT NULL,
      visit_date INTEGER NOT NULL,
      result TEXT NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS online_trainings (
      id TEXT PRIMARY KEY,
      certification_id TEXT NOT NULL,
      training_date INTEGER NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS driving_authorizations (
      id TEXT PRIMARY KEY,
      certification_id TEXT NOT NULL,
      authorization_date INTEGER NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS alert_settings (
      id TEXT PRIMARY KEY,
      certification_type_id TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      alert_days INTEGER NOT NULL DEFAULT 30,
      warning_days INTEGER NOT NULL DEFAULT 60,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)

  testDb.run(sql`
    CREATE TABLE IF NOT EXISTS snoozed_alerts (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      certification_id TEXT NOT NULL,
      reason TEXT,
      snoozed_until INTEGER NOT NULL,
      created_at INTEGER,
      updated_at INTEGER
    )
  `)
}
```

**Important:** Column names in CREATE TABLE use snake_case (SQL convention), which matches what Drizzle generates. The Drizzle schema uses camelCase for field names but these map to snake_case column names.

### 2. Create Helper Functions

Create `packages/db/src/__tests__/helpers.ts`:

```typescript
import { testDb } from './setup'
import { warehouses, roles, certificationTypes, employees, certifications } from '../schema'
import { createWarehouse, createRole, createEmployee, createCertification } from '../queries'
import { eq } from 'drizzle-orm'

export async function createTestWarehouse(name = 'Test Warehouse') {
  return createWarehouse({ name })
}

export async function createTestRole(name = 'Test Role') {
  return createRole({ name })
}

export async function createTestEmployee(overrides: Partial<{
  firstName: string
  lastName: string
  warehouseId: string
  roleId: string
}> = {}) {
  // Create required warehouse and role if not provided
  const warehouse = overrides.warehouseId
    ? { id: overrides.warehouseId }
    : await createTestWarehouse()

  const role = overrides.roleId
    ? { id: overrides.roleId }
    : await createTestRole()

  return createEmployee({
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'Employee',
    arrivalDate: new Date('2023-01-15'),
    contractType: 'CDI',
    roleId: role.id,
    warehouseId: warehouse.id
  })
}

export async function createTestCertificationType(name = 'Test Cert Type') {
  const id = crypto.randomUUID()
  await testDb.insert(certificationTypes).values({
    id,
    name,
    hasCategory: false
  })
  const [result] = await testDb.select().from(certificationTypes).where(eq(certificationTypes.id, id))
  return result
}

export async function createTestCertification(employeeId: string, certTypeId: string, overrides: Partial<{
  obtainedDate: Date
  expirationDate: Date | undefined
  documentPath: string | undefined
}> = {}) {
  return createCertification({
    employeeId,
    certificationTypeId: certTypeId,
    obtainedDate: overrides.obtainedDate || new Date(),
    expirationDate: overrides.expirationDate,
    documentPath: overrides.documentPath
  })
}

export async function cleanupTestData() {
  await testDb.delete(certifications)
  await testDb.delete(employees)
  await testDb.delete(roles)
  await testDb.delete(warehouses)
  await testDb.delete(certificationTypes)
}
```

### 3. Create Role Tests

Create `packages/db/src/__tests__/queries/roles.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestRole, cleanupTestData } from '../helpers'
import * as queries from '../../queries'

describe('Role Queries', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('should create a role', async () => {
    const role = await queries.createRole({ name: 'Cariste' })

    expect(role.id).toBeDefined()
    expect(role.name).toBe('Cariste')
  })

  it('should get all roles ordered by name', async () => {
    await queries.createRole({ name: 'Préparateur' })
    await queries.createRole({ name: 'Agent' })
    await queries.createRole({ name: 'Cariste' })

    const roles = await queries.getRoles()

    expect(roles).toHaveLength(3)
    expect(roles[0].name).toBe('Agent')
    expect(roles[1].name).toBe('Cariste')
    expect(roles[2].name).toBe('Préparateur')
  })

  it('should get role by id', async () => {
    const created = await queries.createRole({ name: 'Test Role' })

    const role = await queries.getRoleById(created.id)

    expect(role).not.toBeNull()
    expect(role!.name).toBe('Test Role')
  })

  it('should get role by name', async () => {
    await queries.createRole({ name: 'Unique Role' })

    const role = await queries.getRoleByName('Unique Role')

    expect(role).not.toBeNull()
    expect(role!.name).toBe('Unique Role')
  })

  it('should return null for non-existent role', async () => {
    const role = await queries.getRoleById('non-existent-id')
    expect(role).toBeNull()
  })

  it('should update a role', async () => {
    const created = await queries.createRole({ name: 'Old Name' })

    const updated = await queries.updateRole(created.id, { name: 'New Name' })

    expect(updated).not.toBeNull()
    expect(updated!.name).toBe('New Name')
  })

  it('should delete a role', async () => {
    const created = await queries.createRole({ name: 'To Delete' })
    await queries.deleteRole(created.id)

    const role = await queries.getRoleById(created.id)
    expect(role).toBeNull()
  })
})
```

### 4. Create Warehouse Tests

Create `packages/db/src/__tests__/queries/warehouses.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cleanupTestData } from '../helpers'
import * as queries from '../../queries'

describe('Warehouse Queries', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('should create a warehouse', async () => {
    const warehouse = await queries.createWarehouse({ name: 'Paris' })

    expect(warehouse.id).toBeDefined()
    expect(warehouse.name).toBe('Paris')
  })

  it('should get all warehouses ordered by name', async () => {
    await queries.createWarehouse({ name: 'Lyon' })
    await queries.createWarehouse({ name: 'Marseille' })
    await queries.createWarehouse({ name: 'Paris' })

    const warehouses = await queries.getWarehouses()

    expect(warehouses).toHaveLength(3)
    expect(warehouses[0].name).toBe('Lyon')
    expect(warehouses[1].name).toBe('Marseille')
    expect(warehouses[2].name).toBe('Paris')
  })

  it('should get warehouse by id', async () => {
    const created = await queries.createWarehouse({ name: 'Test Warehouse' })

    const warehouse = await queries.getWarehouseById(created.id)

    expect(warehouse).not.toBeNull()
    expect(warehouse!.name).toBe('Test Warehouse')
  })

  it('should update a warehouse', async () => {
    const created = await queries.createWarehouse({ name: 'Old Name' })

    const updated = await queries.updateWarehouse(created.id, { name: 'New Name' })

    expect(updated).not.toBeNull()
    expect(updated!.name).toBe('New Name')
  })

  it('should delete a warehouse', async () => {
    const created = await queries.createWarehouse({ name: 'To Delete' })
    await queries.deleteWarehouse(created.id)

    const warehouse = await queries.getWarehouseById(created.id)
    expect(warehouse).toBeNull()
  })
})
```

### 5. Create Employee Tests

Create `packages/db/src/__tests__/queries/employees.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestWarehouse, createTestRole, cleanupTestData } from '../helpers'
import * as queries from '../../queries'

describe('Employee Queries', () => {
  let warehouseId: string
  let roleId: string

  beforeEach(async () => {
    await cleanupTestData()
    const warehouse = await createTestWarehouse()
    const role = await createTestRole()
    warehouseId = warehouse.id
    roleId = role.id
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('should create an employee with auto-generated number', async () => {
    const employee = await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date('2023-01-15'),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    expect(employee.employeeNumber).toMatch(/^EMP-\d{3}$/)
    expect(employee.firstName).toBe('Jean')
    expect(employee.lastName).toBe('Dupont')
    expect(employee.isActive).toBe(true)
    expect(employee.roleId).toBe(roleId)
    expect(employee.warehouseId).toBe(warehouseId)
  })

  it('should get all active employees', async () => {
    await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date(),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    await queries.createEmployee({
      firstName: 'Marie',
      lastName: 'Martin',
      arrivalDate: new Date(),
      contractType: 'CDD',
      roleId,
      warehouseId
    })

    const result = await queries.getEmployees({ isActive: true })
    expect(result).toHaveLength(2)
  })

  it('should filter employees by warehouse', async () => {
    const warehouse2 = await createTestWarehouse()
    const role2 = await createTestRole()

    await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date(),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    await queries.createEmployee({
      firstName: 'Marie',
      lastName: 'Martin',
      arrivalDate: new Date(),
      contractType: 'CDD',
      roleId: role2.id,
      warehouseId: warehouse2.id
    })

    const result = await queries.getEmployees({ warehouseId })
    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('Jean')
  })

  it('should filter employees by role', async () => {
    const role2 = await createTestRole()

    await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date(),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    await queries.createEmployee({
      firstName: 'Marie',
      lastName: 'Martin',
      arrivalDate: new Date(),
      contractType: 'CDD',
      roleId: role2.id,
      warehouseId
    })

    const result = await queries.getEmployees({ roleId })
    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('Jean')
  })

  it('should deactivate an employee', async () => {
    const employee = await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date(),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    const deactivated = await queries.deactivateEmployee(employee.id)
    expect(deactivated).not.toBeNull()
    expect(deactivated!.isActive).toBe(false)
  })

  it('should reactivate a deactivated employee', async () => {
    const employee = await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date(),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    await queries.deactivateEmployee(employee.id)
    const reactivated = await queries.reactivateEmployee(employee.id)

    expect(reactivated).not.toBeNull()
    expect(reactivated!.isActive).toBe(true)
  })

  it('should update an employee', async () => {
    const employee = await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date(),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    const updated = await queries.updateEmployee(employee.id, {
      firstName: 'Pierre',
      email: 'pierre@example.com'
    })

    expect(updated).not.toBeNull()
    expect(updated!.firstName).toBe('Pierre')
    expect(updated!.email).toBe('pierre@example.com')
  })

  it('should get employee with role and warehouse relations', async () => {
    const employee = await queries.createEmployee({
      firstName: 'Jean',
      lastName: 'Dupont',
      arrivalDate: new Date(),
      contractType: 'CDI',
      roleId,
      warehouseId
    })

    const result = await queries.getEmployeeById(employee.id)

    expect(result).not.toBeNull()
    expect(result!.role).toBeDefined()
    expect(result!.role!.id).toBe(roleId)
    expect(result!.warehouse).toBeDefined()
    expect(result!.warehouse!.id).toBe(warehouseId)
  })
})
```

### 6. Create Certification Tests

Create `packages/db/src/__tests__/queries/certifications.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestEmployee, createTestCertificationType, cleanupTestData } from '../helpers'
import * as queries from '../../queries'

describe('Certification Queries', () => {
  let employeeId: string
  let certTypeId: string

  beforeEach(async () => {
    await cleanupTestData()
    const employee = await createTestEmployee()
    const certType = await createTestCertificationType()
    employeeId = employee.id
    certTypeId = certType.id
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('should create a certification', async () => {
    const certification = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date(),
      expirationDate: new Date('2027-01-01')
    })

    expect(certification.id).toBeDefined()
    expect(certification.employeeId).toBe(employeeId)
    expect(certification.certificationTypeId).toBe(certTypeId)
  })

  it('should create certification without expiration', async () => {
    const certification = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
      // No expirationDate
    })

    expect(certification.id).toBeDefined()
    expect(certification.expirationDate).toBeNull()
  })

  it('should get certifications by employee', async () => {
    await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    const certs = await queries.getCertificationsByEmployee(employeeId)
    expect(certs).toHaveLength(2)
  })

  it('should get certification by id', async () => {
    const created = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    const cert = await queries.getCertificationById(created.id)

    expect(cert).not.toBeNull()
    expect(cert!.id).toBe(created.id)
  })

  it('should delete a certification', async () => {
    const cert = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    await queries.deleteCertification(cert.id)

    const result = await queries.getCertificationById(cert.id)
    expect(result).toBeNull()
  })

  it('should include certification type in result', async () => {
    const cert = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    const result = await queries.getCertificationsByEmployee(employeeId)

    expect(result[0].certificationType).toBeDefined()
    expect(result[0].certificationType!.id).toBe(certTypeId)
  })
})
```

### 7. Create Snoozed Alert Tests

Create `packages/db/src/__tests__/queries/snoozed-alerts.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestEmployee, createTestCertificationType, cleanupTestData } from '../helpers'
import * as queries from '../../queries'

describe('Snoozed Alert Queries', () => {
  let employeeId: string
  let certTypeId: string

  beforeEach(async () => {
    await cleanupTestData()
    const employee = await createTestEmployee()
    employeeId = employee.id
    const certType = await createTestCertificationType()
    certTypeId = certType.id
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('should create a snoozed alert', async () => {
    const cert = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    const snoozedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const snoozed = await queries.createSnoozedAlert({
      employeeId,
      certificationId: cert.id,
      snoozedUntil
    })

    expect(snoozed.id).toBeDefined()
    expect(snoozed.employeeId).toBe(employeeId)
    expect(snoozed.certificationId).toBe(cert.id)
  })

  it('should get active snoozed alerts', async () => {
    const cert = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    const snoozedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await queries.createSnoozedAlert({
      employeeId,
      certificationId: cert.id,
      snoozedUntil
    })

    const snoozed = await queries.getActiveSnoozedAlerts()
    expect(snoozed).toHaveLength(1)
    expect(snoozed[0].employeeId).toBe(employeeId)
  })

  it('should not return expired snoozed alerts', async () => {
    const cert = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    // Create expired snooze (yesterday)
    const expiredSnooze = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Insert directly to bypass the gte check
    const { snoozedAlerts } = await import('../../schema')
    const { testDb } = await import('../setup')
    await testDb.insert(snoozedAlerts).values({
      id: crypto.randomUUID(),
      employeeId,
      certificationId: cert.id,
      snoozedUntil: expiredSnooze
    })

    const snoozed = await queries.getActiveSnoozedAlerts()
    expect(snoozed).toHaveLength(0)
  })

  it('should delete snoozed alert', async () => {
    const cert = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    await queries.createSnoozedAlert({
      employeeId,
      certificationId: cert.id,
      snoozedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    await queries.deleteSnoozedAlert(employeeId, cert.id)

    const snoozed = await queries.getActiveSnoozedAlerts()
    expect(snoozed).toHaveLength(0)
  })

  it('should cleanup expired snoozed alerts', async () => {
    const cert = await queries.createCertification({
      employeeId,
      certificationTypeId: certTypeId,
      obtainedDate: new Date()
    })

    // Insert expired snooze directly
    const { snoozedAlerts } = await import('../../schema')
    const { testDb } = await import('../setup')
    await testDb.insert(snoozedAlerts).values({
      id: crypto.randomUUID(),
      employeeId,
      certificationId: cert.id,
      snoozedUntil: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
    })

    await queries.cleanupExpiredSnoozedAlerts()

    const snoozed = await queries.getActiveSnoozedAlerts()
    expect(snoozed).toHaveLength(0)
  })
})
```

### 8. Run Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test packages/db/src/__tests__/queries/employees.test.ts

# Run with coverage
pnpm test --coverage
```

## Files to Create

| File | Description |
|------|-------------|
| `packages/db/src/__tests__/setup.ts` | Test database setup |
| `packages/db/src/__tests__/helpers.ts` | Test helper functions |
| `packages/db/src/__tests__/queries/roles.test.ts` | Role query tests |
| `packages/db/src/__tests__/queries/warehouses.test.ts` | Warehouse query tests |
| `packages/db/src/__tests__/queries/employees.test.ts` | Employee query tests |
| `packages/db/src/__tests__/queries/certifications.test.ts` | Certification query tests |
| `packages/db/src/__tests__/queries/snoozed-alerts.test.ts` | Snoozed alert tests |

## Notes

- Use Vitest for testing (already in dependencies)
- Tests should be idempotent (can run in any order)
- Each test should clean up after itself with `afterEach`
- Use `beforeEach` to set up fresh test data
- No mocking — use actual test database
- **CRITICAL**: Always use `roleId: string` (UUID FK), NOT `role: 'Cariste'` (string)

## Acceptance Criteria

- [ ] `packages/db/src/__tests__/setup.ts` creates in-memory test database
- [ ] `packages/db/src/__tests__/helpers.ts` provides `createTestEmployee()` with `roleId` (not role name)
- [ ] Role tests: create, get all, get by id, get by name, update, delete
- [ ] Warehouse tests: create, get all, get by id, update, delete
- [ ] Employee tests: create with auto-number, get all (active), filter by warehouse, filter by role, deactivate, reactivate, update, get with relations
- [ ] Certification tests: create, create without expiration, get by employee, get by id, delete, include type in result
- [ ] Snoozed alert tests: create, get active, filter expired, delete, cleanup expired
- [ ] All tests use real database (no mocks)
- [ ] All employee tests use `roleId: uuid` (NOT `role: 'Cariste'`)
- [ ] `pnpm test` passes all tests
- [ ] Tests are idempotent (independent order, cleanup in afterEach)

## Related

- [Plan-01: Data Model](../plans/implementation/plan-01-data-model.md)
- [Task 01-09](./task-01-09-create-seed-data.md) — Previous task
- [Plan-02](./plan-02-dashboard.md) — Next plan
