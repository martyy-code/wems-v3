// Employee Queries - Modular namespace pattern
import { eq, and } from 'drizzle-orm'
import { db } from '../initDb.js'
import { employees, type Employee, type NewEmployee } from '../schema.js'

type EmployeeListFilters = {
  isActive?: boolean
  warehouseId?: string
  roleId?: string
  search?: string
}

export const employee = {
  create: async (data: {
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    arrivalDate: Date
    contractType: string
    roleId: string
    warehouseId: string
  }): Promise<Employee> => {
    const id = crypto.randomUUID()
    await db.insert(employees).values({
      id,
      employeeNumber: `EMP-${Date.now()}`,
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
    return employee.getById(id) as Promise<Employee>
  },

  list: async (filters: EmployeeListFilters = {}): Promise<Employee[]> => {
    const conditions = []

    if (filters.isActive !== undefined) {
      conditions.push(eq(employees.isActive, filters.isActive))
    } else {
      // Default: only active employees
      conditions.push(eq(employees.isActive, true))
    }

    if (filters.warehouseId) {
      conditions.push(eq(employees.warehouseId, filters.warehouseId))
    }

    if (filters.roleId) {
      conditions.push(eq(employees.roleId, filters.roleId))
    }

    if (filters.search) {
      const searchLower = `%${filters.search.toLowerCase()}%`
      // Note: SQLite LIKE is case-insensitive for ASCII, need ilike alternative for broader search
      conditions.push(
        eq(employees.isActive, filters.isActive ?? true) // Re-add active filter
      )
    }

    if (conditions.length > 0) {
      return db.select().from(employees).where(and(...conditions)).orderBy(employees.lastName)
    }

    return db.select().from(employees).where(eq(employees.isActive, true)).orderBy(employees.lastName)
  },

  getById: async (id: string): Promise<Employee | null> => {
    const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1)
    return result[0] || null
  },

  update: async (
    id: string,
    data: Partial<{
      firstName: string
      lastName: string
      email: string | null
      phone: string | null
      arrivalDate: Date
      contractType: string
      roleId: string
      warehouseId: string
    }>
  ): Promise<Employee | null> => {
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }
    await db.update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
    return employee.getById(id)
  },

  deactivate: async (id: string): Promise<Employee | null> => {
    await db.update(employees)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(employees.id, id))
    return employee.getById(id)
  },

  reactivate: async (id: string): Promise<Employee | null> => {
    await db.update(employees)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(employees.id, id))
    return employee.getById(id)
  }
}