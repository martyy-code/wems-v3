// Certification Queries - Modular namespace pattern
import { eq, and } from 'drizzle-orm'
import { db } from '../../initDb.js'
import { certifications, certificationTypes, employees, type Certification } from '../../schema.js'

export const certification = {
  create: async (data: {
    employeeId: string
    certificationTypeId: string
    obtainedDate: Date
    expirationDate?: Date | null
    documentPath?: string | null
  }): Promise<Certification> => {
    const id = crypto.randomUUID()
    await db.insert(certifications).values({
      id,
      employeeId: data.employeeId,
      certificationTypeId: data.certificationTypeId,
      obtainedDate: data.obtainedDate,
      expirationDate: data.expirationDate || null,
      documentPath: data.documentPath || null,
      isActive: true
    })
    return certification.getById(id) as Promise<Certification>
  },

  listByEmployee: async (employeeId: string, includeInactive = false): Promise<Certification[]> => {
    if (includeInactive) {
      return db.select().from(certifications)
        .where(eq(certifications.employeeId, employeeId))
        .orderBy(certifications.obtainedDate)
    }
    return db.select().from(certifications)
      .where(and(eq(certifications.employeeId, employeeId), eq(certifications.isActive, true)))
      .orderBy(certifications.obtainedDate)
  },

  getById: async (id: string): Promise<Certification | null> => {
    const result = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1)
    return result[0] || null
  },

  getByIdWithDetails: async (id: string) => {
    const certResult = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1)
    const cert = certResult[0]
    if (!cert) return null

    const [employeeResult, typeResult] = await Promise.all([
      db.select().from(employees).where(eq(employees.id, cert.employeeId)).limit(1),
      db.select().from(certificationTypes).where(eq(certificationTypes.id, cert.certificationTypeId)).limit(1)
    ])

    return {
      ...cert,
      employee: employeeResult[0] || null,
      certificationType: typeResult[0] || null
    }
  },

  delete: async (id: string): Promise<void> => {
    await db.update(certifications)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(certifications.id, id))
  },

  reactivate: async (id: string): Promise<Certification | null> => {
    await db.update(certifications)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(certifications.id, id))
    return certification.getById(id)
  }
}