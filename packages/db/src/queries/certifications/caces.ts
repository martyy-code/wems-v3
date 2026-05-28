// CACES Certification Queries - Modular namespace pattern
import { eq } from 'drizzle-orm'
import { db } from '../../initDb.js'
import { cacesCertifications, type CacesCertification } from '../../schema.js'

export const caces = {
  create: async (data: { certificationId: string; category: string }): Promise<CacesCertification> => {
    const id = crypto.randomUUID()
    await db.insert(cacesCertifications).values({
      id,
      certificationId: data.certificationId,
      category: data.category
    })
    return caces.getById(id) as Promise<CacesCertification>
  },

  listByEmployee: async (employeeId: string): Promise<CacesCertification[]> => {
    const result = await db.select().from(cacesCertifications).orderBy(cacesCertifications.category)
    return result
  },

  listByCertification: async (certificationId: string): Promise<CacesCertification[]> => {
    return db.select().from(cacesCertifications)
      .where(eq(cacesCertifications.certificationId, certificationId))
      .orderBy(cacesCertifications.category)
  },

  getById: async (id: string): Promise<CacesCertification | null> => {
    const result = await db.select().from(cacesCertifications).where(eq(cacesCertifications.id, id)).limit(1)
    return result[0] || null
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(cacesCertifications).where(eq(cacesCertifications.id, id))
  }
}