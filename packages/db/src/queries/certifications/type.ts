// CertificationType Queries - Modular namespace pattern
import { eq } from 'drizzle-orm'
import { db } from '../../initDb.js'
import { certificationTypes } from '../../schema.js'

export const certificationType = {
  create: async (data: { name: string; hasCategory?: boolean }) => {
    const id = crypto.randomUUID()
    await db.insert(certificationTypes).values({
      id,
      name: data.name,
      hasCategory: data.hasCategory ?? false,
      isActive: true
    })
    return certificationType.getById(id)
  },

  list: async (includeInactive = false) => {
    if (includeInactive) {
      return db.select().from(certificationTypes).orderBy(certificationTypes.name)
    }
    return db.select().from(certificationTypes).where(eq(certificationTypes.isActive, true)).orderBy(certificationTypes.name)
  },

  getById: async (id: string) => {
    const result = await db.select().from(certificationTypes).where(eq(certificationTypes.id, id)).limit(1)
    return result[0] || null
  },

  getByName: async (name: string) => {
    const result = await db.select().from(certificationTypes).where(eq(certificationTypes.name, name)).limit(1)
    return result[0] || null
  },

  update: async (id: string, data: { name: string; hasCategory?: boolean }) => {
    await db.update(certificationTypes)
      .set({ name: data.name, hasCategory: data.hasCategory, updatedAt: new Date() })
      .where(eq(certificationTypes.id, id))
    return certificationType.getById(id)
  },

  delete: async (id: string): Promise<void> => {
    await db.update(certificationTypes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(certificationTypes.id, id))
  },

  reactivate: async (id: string) => {
    await db.update(certificationTypes)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(certificationTypes.id, id))
    return certificationType.getById(id)
  }
}