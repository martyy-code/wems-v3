// Driving Procedures - oRPC handlers for driving authorization operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'

const create = os
  .input(z.object({
    certificationId: z.string(),
    authorizationDate: z.string()
  }))
  .handler(async ({ input }) => {
    return queries.driving.create({
      certificationId: input.certificationId,
      authorizationDate: new Date(input.authorizationDate)
    })
  })

const listByCertification = os
  .input(z.object({ certificationId: z.string() }))
  .handler(async ({ input }) => {
    return queries.driving.listByCertification(input.certificationId)
  })

export const drivingProcedures = {
  create,
  listByCertification
}