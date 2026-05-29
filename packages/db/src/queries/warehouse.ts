// Warehouse Queries - Modular namespace pattern
import { eq } from 'drizzle-orm'
import { db } from '../initDb.js'
import { warehouses, type Warehouse } from '../schema.js'

export const warehouse = {
  create: async (data: { name: string }): Promise<Warehouse> => {
    const id = crypto.randomUUID()
    await db.insert(warehouses).values({
      id,
      name: data.name,
      isActive: true
    })
    return warehouse.getById(id) as Promise<Warehouse>
  },

  list: async (includeInactive = false): Promise<Warehouse[]> => {
    if (includeInactive) {
      return db.select().from(warehouses).orderBy(warehouses.name)
    }
    return db.select().from(warehouses).where(eq(warehouses.isActive, true)).orderBy(warehouses.name)
  },

  getById: async (id: string): Promise<Warehouse | null> => {
    const result = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1)
    return result[0] || null
  },

  update: async (id: string, data: { name: string }): Promise<Warehouse | null> => {
    await db.update(warehouses)
      .set({ name: data.name, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
    return warehouse.getById(id)
  },

  delete: async (id: string): Promise<void> => {
    await db.update(warehouses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
  },

  reactivate: async (id: string): Promise<Warehouse | null> => {
    await db.update(warehouses)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
    return warehouse.getById(id)
  }
}