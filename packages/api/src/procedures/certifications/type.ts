// CertificationType Procedures - oRPC handlers for certification type operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'

const create = os
  .input(z.object({
    name: z.string(),
    hasCategory: z.boolean().optional()
  }))
  .handler(async ({ input }) => {
    return queries.certificationType.create(input)
  })

const list = os
  .input(z.object({ includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ input }) => {
    return queries.certificationType.list(input?.includeInactive ?? false)
  })

export const certificationTypeProcedures = {
  create,
  list
}