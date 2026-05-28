// AlertSettings Procedures - oRPC handlers for alert settings operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { db, alertSettings, type AlertSetting } from '@electron-template/db'
import { eq } from 'drizzle-orm'

const getSettings = os.handler(async (): Promise<AlertSetting[]> => {
  return db.select().from(alertSettings)
})

const updateSettings = os
  .input(z.object({
    certificationTypeId: z.string(),
    enabled: z.boolean().optional(),
    alertDays: z.number().min(1).max(365),
    warningDays: z.number().min(1).max(365)
  }))
  .handler(async ({ input }): Promise<AlertSetting> => {
    const existing = await db.select().from(alertSettings)
      .where(eq(alertSettings.certificationTypeId, input.certificationTypeId)).limit(1)

    if (existing[0]) {
      await db.update(alertSettings)
        .set({
          enabled: input.enabled ?? existing[0].enabled,
          alertDays: input.alertDays,
          warningDays: input.warningDays,
          updatedAt: new Date()
        })
        .where(eq(alertSettings.certificationTypeId, input.certificationTypeId))
    } else {
      await db.insert(alertSettings).values({
        id: crypto.randomUUID(),
        certificationTypeId: input.certificationTypeId,
        enabled: input.enabled ?? true,
        alertDays: input.alertDays,
        warningDays: input.warningDays
      })
    }

    const result = await db.select().from(alertSettings)
      .where(eq(alertSettings.certificationTypeId, input.certificationTypeId)).limit(1)
    return result[0] as AlertSetting
  })

export const alertSettingsProcedures = {
  getSettings,
  updateSettings
}