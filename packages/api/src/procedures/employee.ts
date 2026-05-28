// Employee Procedures - oRPC handlers for employee operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries, contractTypesList } from '@electron-template/db'

const create = os
  .input(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    arrivalDate: z.string(),
    contractType: z.enum(contractTypesList as [string, ...string[]]),
    roleId: z.string(),
    warehouseId: z.string()
  }))
  .handler(async ({ input }) => {
    return queries.employee.create({
      ...input,
      arrivalDate: new Date(input.arrivalDate)
    })
  })

const list = os
  .input(z.object({
    isActive: z.boolean().optional(),
    warehouseId: z.string().optional(),
    roleId: z.string().optional(),
    search: z.string().optional()
  }).optional())
  .handler(async ({ input }) => {
    return queries.employee.list(input || {})
  })

const getById = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.employee.getById(input.id)
  })

const update = os
  .input(z.object({
    id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    arrivalDate: z.string().optional(),
    contractType: z.string().optional(),
    roleId: z.string().optional(),
    warehouseId: z.string().optional()
  }))
  .handler(async ({ input }) => {
    const { id, ...data } = input
    return queries.employee.update(id, {
      ...data,
      arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : undefined
    })
  })

const deactivate = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.employee.deactivate(input.id)
  })

const reactivate = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.employee.reactivate(input.id)
  })

export const employeeProcedures = {
  create,
  list,
  getById,
  update,
  deactivate,
  reactivate
}