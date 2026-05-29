// Warehouse Procedures - oRPC handlers for warehouse operations
import { z } from 'zod'
import { os } from '@orpc/server'
import { queries, schemas } from '@electron-template/db'

const create = os
  .input(schemas.warehouse.insert.pick({ name: true }))
  .handler(async ({ input }) => {
    return queries.warehouse.create(input)
  })

const list = os
  .input(z.object({ includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ input }) => {
    return queries.warehouse.list(input?.includeInactive ?? false)
  })

const getById = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.warehouse.getById(input.id)
  })

const update = os
  .input(z.object({ id: z.string(), name: z.string() }))
  .handler(async ({ input }) => {
    return queries.warehouse.update(input.id, { name: input.name })
  })

const remove = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await queries.warehouse.delete(input.id)
    return { success: true }
  })

const reactivate = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.warehouse.reactivate(input.id)
  })

export const warehouseProcedures = {
  create,
  list,
  getById,
  update,
  delete: remove,
  reactivate
}