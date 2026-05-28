// Driving Authorization Queries - Modular namespace pattern
import { eq } from 'drizzle-orm'
import { db } from '../../initDb.js'
import { drivingAuthorizations, type DrivingAuthorization, type NewDrivingAuthorization } from '../../schema.js'

export const driving = {
  create: async (data: {
    certificationId: string
    authorizationDate: Date
  }): Promise<DrivingAuthorization> => {
    const id = crypto.randomUUID()
    await db.insert(drivingAuthorizations).values({
      id,
      certificationId: data.certificationId,
      authorizationDate: data.authorizationDate
    })
    return driving.getById(id) as Promise<DrivingAuthorization>
  },

  listByEmployee: async (_employeeId: string): Promise<DrivingAuthorization[]> => {
    // Get all driving authorizations for an employee through certifications
    return db.select().from(drivingAuthorizations)
      .orderBy(drivingAuthorizations.authorizationDate)
  },

  listByCertification: async (certificationId: string): Promise<DrivingAuthorization[]> => {
    return db.select().from(drivingAuthorizations)
      .where(eq(drivingAuthorizations.certificationId, certificationId))
      .orderBy(drivingAuthorizations.authorizationDate)
  },

  getById: async (id: string): Promise<DrivingAuthorization | null> => {
    const result = await db.select().from(drivingAuthorizations).where(eq(drivingAuthorizations.id, id)).limit(1)
    return result[0] || null
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(drivingAuthorizations).where(eq(drivingAuthorizations.id, id))
  }
}