// SnoozedAlerts Procedures - oRPC handlers for snoozed alert operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { db, snoozedAlerts, type SnoozedAlert } from '@electron-template/db'
import { eq, gte, and, lt } from 'drizzle-orm'

const create = os
  .input(z.object({
    employeeId: z.string(),
    certificationId: z.string(),
    reason: z.string().optional(),
    snoozedUntil: z.string()
  }))
  .handler(async ({ input }): Promise<SnoozedAlert> => {
    const id = crypto.randomUUID()
    await db.insert(snoozedAlerts).values({
      id,
      employeeId: input.employeeId,
      certificationId: input.certificationId,
      reason: input.reason || null,
      snoozedUntil: new Date(input.snoozedUntil)
    })
    const result = await db.select().from(snoozedAlerts).where(eq(snoozedAlerts.id, id)).limit(1)
    return result[0] as SnoozedAlert
  })

const list = os.handler(async (): Promise<SnoozedAlert[]> => {
  return db.select().from(snoozedAlerts).where(gte(snoozedAlerts.snoozedUntil, new Date()))
})

const deleteAlert = os
  .input(z.object({
    employeeId: z.string(),
    certificationId: z.string()
  }))
  .handler(async ({ input }) => {
    await db.delete(snoozedAlerts).where(and(
      eq(snoozedAlerts.employeeId, input.employeeId),
      eq(snoozedAlerts.certificationId, input.certificationId)
    ))
    return { success: true }
  })

const cleanupExpired = os.handler(async () => {
  await db.delete(snoozedAlerts).where(lt(snoozedAlerts.snoozedUntil, new Date()))
  return { success: true }
})

export const snoozedAlertProcedures = {
  create,
  list,
  delete: deleteAlert,
  cleanupExpired
}