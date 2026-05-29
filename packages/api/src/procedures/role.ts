// Role Procedures - oRPC handlers for role operations
import { z } from 'zod'
import { os } from '@orpc/server'
import { queries, schemas } from '@electron-template/db'

const create = os
  .input(schemas.role.insert.pick({ name: true }))
  .handler(async ({ input }) => {
    return queries.role.create(input)
  })

const list = os
  .input(z.object({ includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ input }) => {
    return queries.role.list(input?.includeInactive ?? false)
  })

const getById = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.role.getById(input.id)
  })

const getByName = os
  .input(z.object({ name: z.string() }))
  .handler(async ({ input }) => {
    return queries.role.getByName(input.name)
  })

const update = os
  .input(z.object({ id: z.string(), name: z.string() }))
  .handler(async ({ input }) => {
    return queries.role.update(input.id, { name: input.name })
  })

const remove = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await queries.role.delete(input.id)
    return { success: true }
  })

const reactivate = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return queries.role.reactivate(input.id)
  })

export const roleProcedures = {
  create,
  list,
  getById,
  getByName,
  update,
  delete: remove,
  reactivate
}
