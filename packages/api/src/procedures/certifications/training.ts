// Training Procedures - oRPC handlers for online training operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'

const create = os
  .input(z.object({
    certificationId: z.string(),
    trainingDate: z.string()
  }))
  .handler(async ({ input }) => {
    return queries.training.create({
      certificationId: input.certificationId,
      trainingDate: new Date(input.trainingDate)
    })
  })

const listByCertification = os
  .input(z.object({ certificationId: z.string() }))
  .handler(async ({ input }) => {
    return queries.training.listByCertification(input.certificationId)
  })

export const trainingProcedures = {
  create,
  listByCertification
}