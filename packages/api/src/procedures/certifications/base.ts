// Certification Procedures - oRPC handlers for base certification operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'

const create = os
  .input(z.object({
    employeeId: z.string(),
    certificationTypeId: z.string(),
    obtainedDate: z.string(),
    expirationDate: z.string().optional(),
    documentPath: z.string().optional()
  }))
  .handler(async ({ input }) => {
    return queries.certification.create({
      ...input,
      obtainedDate: new Date(input.obtainedDate),
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined
    })
  })

const listByEmployee = os
  .input(z.object({
    employeeId: z.string(),
    includeInactive: z.boolean().optional()
  }))
  .handler(async ({ input }) => {
    return queries.certification.listByEmployee(input.employeeId, input.includeInactive ?? false)
  })

const getById = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.certification.getById(input.id)
  })

const getByIdWithDetails = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.certification.getByIdWithDetails(input.id)
  })

const remove = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await queries.certification.delete(input.id)
    return { success: true }
  })

const reactivate = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.certification.reactivate(input.id)
  })

export const certificationProcedures = {
  create,
  listByEmployee,
  getById,
  getByIdWithDetails,
  delete: remove,
  reactivate
}