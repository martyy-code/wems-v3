// Medical Visit Queries - Modular namespace pattern
import { eq } from 'drizzle-orm'
import { db } from '../../initDb.js'
import { medicalVisits, type MedicalVisit } from '../../schema.js'

export const medical = {
  create: async (data: {
    certificationId: string
    visitType: string
    visitDate: Date
    result: string
  }): Promise<MedicalVisit> => {
    const id = crypto.randomUUID()
    await db.insert(medicalVisits).values({
      id,
      certificationId: data.certificationId,
      visitType: data.visitType,
      visitDate: data.visitDate,
      result: data.result
    })
    return medical.getById(id) as Promise<MedicalVisit>
  },

  listByEmployee: async (employeeId: string): Promise<MedicalVisit[]> => {
    return db.select().from(medicalVisits)
      .orderBy(medicalVisits.visitDate)
  },

  listByCertification: async (certificationId: string): Promise<MedicalVisit[]> => {
    return db.select().from(medicalVisits)
      .where(eq(medicalVisits.certificationId, certificationId))
      .orderBy(medicalVisits.visitDate)
  },

  getById: async (id: string): Promise<MedicalVisit | null> => {
    const result = await db.select().from(medicalVisits).where(eq(medicalVisits.id, id)).limit(1)
    return result[0] || null
  },

  updateResult: async (id: string, result: string): Promise<MedicalVisit | null> => {
    await db.update(medicalVisits)
      .set({ result, updatedAt: new Date() })
      .where(eq(medicalVisits.id, id))
    return medical.getById(id)
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(medicalVisits).where(eq(medicalVisits.id, id))
  }
}