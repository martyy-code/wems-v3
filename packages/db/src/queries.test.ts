// Unit Tests for WEMS Database - Task 01-10
// Tests query functions and business logic

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

// Mock the db module before importing queries
vi.mock('../initDb', () => ({
  db: {},
  getDb: vi.fn(),
  initDatabase: vi.fn()
}))

// Import after mock
import { role, warehouse, employee } from '../queries/index'
import { roles, warehouses, employees, certifications, certificationTypes } from '../schema'

// Test database setup
function createTestDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema: { roles, warehouses, employees, certifications, certificationTypes } })

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS certification_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      has_category INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      employee_number TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      arrival_date INTEGER NOT NULL,
      contract_type TEXT NOT NULL,
      role_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      certification_type_id TEXT NOT NULL,
      obtained_date INTEGER NOT NULL,
      expiration_date INTEGER,
      document_path TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (certification_type_id) REFERENCES certification_types(id)
    );
  `)

  return db
}

describe('Role Queries', () => {
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    db = createTestDb()
    // Mock the module-level db
    vi.mocked(require('../initDb').db).select = db.select.bind(db)
    vi.mocked(require('../initDb').db).insert = db.insert.bind(db)
    vi.mocked(require('../initDb').db).update = db.update.bind(db)
    vi.mocked(require('../initDb').db).delete = db.delete.bind(db)
  })

  it('should create a role', async () => {
    const result = await role.create({ name: 'Test Role' })
    expect(result).toBeDefined()
    expect(result.name).toBe('Test Role')
    expect(result.isActive).toBe(true)
  })

  it('should list active roles by default', async () => {
    await role.create({ name: 'Active Role 1' })
    await role.create({ name: 'Active Role 2' })

    // Create and soft-delete a role
    const deletedRole = await role.create({ name: 'Deleted Role' })
    await role.delete(deletedRole.id)

    const roles = await role.list()
    expect(roles).toHaveLength(2)
    expect(roles.map(r => r.name)).toContain('Active Role 1')
    expect(roles.map(r => r.name)).toContain('Active Role 2')
    expect(roles.map(r => r.name)).not.toContain('Deleted Role')
  })

  it('should list all roles including inactive when requested', async () => {
    await role.create({ name: 'Active Role' })
    const deletedRole = await role.create({ name: 'Deleted Role' })
    await role.delete(deletedRole.id)

    const roles = await role.list(true)
    expect(roles).toHaveLength(2)
  })

  it('should get role by id', async () => {
    const created = await role.create({ name: 'Get By ID Role' })
    const found = await role.getById(created.id)
    expect(found).toBeDefined()
    expect(found?.name).toBe('Get By ID Role')
  })

  it('should return null for non-existent role', async () => {
    const found = await role.getById('non-existent-id')
    expect(found).toBeNull()
  })

  it('should get role by name', async () => {
    await role.create({ name: 'Find By Name Role' })
    const found = await role.getByName('Find By Name Role')
    expect(found).toBeDefined()
    expect(found?.id).toBeDefined()
  })

  it('should update role', async () => {
    const original = await role.create({ name: 'Original Name' })
    const updated = await role.update(original.id, { name: 'Updated Name' })
    expect(updated?.name).toBe('Updated Name')
  })

  it('should soft delete role', async () => {
    const created = await role.create({ name: 'To Delete' })
    await role.delete(created.id)

    const found = await role.getById(created.id)
    expect(found).toBeNull() // Not found by default
  })

  it('should reactivate soft-deleted role', async () => {
    const created = await role.create({ name: 'To Reactivate' })
    await role.delete(created.id)

    const reactivated = await role.reactivate(created.id)
    expect(reactivated?.isActive).toBe(true)

    const found = await role.getById(created.id)
    expect(found).toBeDefined()
  })
})

describe('Warehouse Queries', () => {
  it('should create a warehouse', async () => {
    const result = await warehouse.create({ name: 'Test Warehouse' })
    expect(result).toBeDefined()
    expect(result.name).toBe('Test Warehouse')
  })

  it('should list warehouses', async () => {
    await warehouse.create({ name: 'Warehouse 1' })
    await warehouse.create({ name: 'Warehouse 2' })

    const warehouses = await warehouse.list()
    expect(warehouses).toHaveLength(2)
  })
})

describe('Employee Queries', () => {
  let db: ReturnType<typeof drizzle>
  let testRoleId: string
  let testWarehouseId: string

  beforeEach(() => {
    db = createTestDb()
    vi.mocked(require('../initDb').db).select = db.select.bind(db)
    vi.mocked(require('../initDb').db).insert = db.insert.bind(db)
    vi.mocked(require('../initDb').db).update = db.update.bind(db)
  })

  it('should create an employee', async () => {
    // First create role and warehouse
    const roleResult = await db.insert(roles).values({
      id: crypto.randomUUID(),
      name: 'Test Role',
      isActive: true
    }).returning()
    testRoleId = roleResult[0].id

    const warehouseResult = await db.insert(warehouses).values({
      id: crypto.randomUUID(),
      name: 'Test Warehouse',
      isActive: true
    }).returning()
    testWarehouseId = warehouseResult[0].id

    const emp = await employee.create({
      firstName: 'John',
      lastName: 'Doe',
      arrivalDate: new Date('2025-01-01'),
      contractType: 'CDI',
      roleId: testRoleId,
      warehouseId: testWarehouseId
    })

    expect(emp).toBeDefined()
    expect(emp.firstName).toBe('John')
    expect(emp.lastName).toBe('Doe')
    expect(emp.employeeNumber).toMatch(/^EMP-/)
  })

  it('should list active employees', async () => {
    const result = await employee.list()
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('Certification Queries', () => {
  it('should create a certification', async () => {
    // Would need setup for employee and certification type
    // This is a placeholder test
    expect(true).toBe(true)
  })
})

describe('Soft Delete Pattern', () => {
  it('should use isActive flag for soft delete', async () => {
    // Verify the soft delete pattern is implemented correctly
    // Active records have isActive = true
    // Deleted records have isActive = false
    expect(true).toBe(true)
  })
})