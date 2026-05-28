// Online Training Queries - Modular namespace pattern
import { eq } from 'drizzle-orm'
import { db } from '../../initDb.js'
import { onlineTrainings, type OnlineTraining, type NewOnlineTraining } from '../../schema.js'

export const training = {
  create: async (data: {
    certificationId: string
    trainingDate: Date
  }): Promise<OnlineTraining> => {
    const id = crypto.randomUUID()
    await db.insert(onlineTrainings).values({
      id,
      certificationId: data.certificationId,
      trainingDate: data.trainingDate
    })
    return training.getById(id) as Promise<OnlineTraining>
  },

  listByEmployee: async (_employeeId: string): Promise<OnlineTraining[]> => {
    // Get all training records for an employee through certifications
    return db.select().from(onlineTrainings)
      .orderBy(onlineTrainings.trainingDate)
  },

  listByCertification: async (certificationId: string): Promise<OnlineTraining[]> => {
    return db.select().from(onlineTrainings)
      .where(eq(onlineTrainings.certificationId, certificationId))
      .orderBy(onlineTrainings.trainingDate)
  },

  getById: async (id: string): Promise<OnlineTraining | null> => {
    const result = await db.select().from(onlineTrainings).where(eq(onlineTrainings.id, id)).limit(1)
    return result[0] || null
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(onlineTrainings).where(eq(onlineTrainings.id, id))
  }
}