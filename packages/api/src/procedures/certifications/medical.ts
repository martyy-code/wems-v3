// Medical Procedures - oRPC handlers for medical visit operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'
import { medicalVisitTypesList, medicalVisitResultsList } from '@electron-template/db'

const create = os
  .input(z.object({
    certificationId: z.string(),
    visitType: z.enum(medicalVisitTypesList as [string, ...string[]]),
    visitDate: z.string(),
    result: z.enum(medicalVisitResultsList as [string, ...string[]])
  }))
  .handler(async ({ input }) => {
    return queries.medical.create({
      ...input,
      visitDate: new Date(input.visitDate)
    })
  })

const listByCertification = os
  .input(z.object({ certificationId: z.string() }))
  .handler(async ({ input }) => {
    return queries.medical.listByCertification(input.certificationId)
  })

const updateResult = os
  .input(z.object({
    id: z.string(),
    result: z.enum(medicalVisitResultsList as [string, ...string[]])
  }))
  .handler(async ({ input }) => {
    return queries.medical.updateResult(input.id, input.result)
  })

export const medicalProcedures = {
  create,
  listByCertification,
  updateResult
}