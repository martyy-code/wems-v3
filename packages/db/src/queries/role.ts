// Role Queries - Modular namespace pattern
import { eq } from 'drizzle-orm'
import { db } from '../initDb.js'
import { roles, type Role, type NewRole } from '../schema.js'

export const role = {
  create: async (data: { name: string }): Promise<Role> => {
    const id = crypto.randomUUID()
    await db.insert(roles).values({
      id,
      name: data.name,
      isActive: true
    })
    return role.getById(id) as Promise<Role>
  },

  list: async (includeInactive = false): Promise<Role[]> => {
    if (includeInactive) {
      return db.select().from(roles).orderBy(roles.name)
    }
    return db.select().from(roles).where(eq(roles.isActive, true)).orderBy(roles.name)
  },

  getById: async (id: string): Promise<Role | null> => {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1)
    return result[0] || null
  },

  getByName: async (name: string): Promise<Role | null> => {
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1)
    return result[0] || null
  },

  update: async (id: string, data: { name: string }): Promise<Role | null> => {
    await db.update(roles)
      .set({ name: data.name, updatedAt: new Date() })
      .where(eq(roles.id, id))
    return role.getById(id)
  },

  delete: async (id: string): Promise<void> => {
    await db.update(roles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(roles.id, id))
  },

  reactivate: async (id: string): Promise<Role | null> => {
    await db.update(roles)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(roles.id, id))
    return role.getById(id)
  }
}