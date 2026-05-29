// CACES Procedures - oRPC handlers for CACES certification operations
import { os } from '@orpc/server'
import { z } from 'zod'
import { queries } from '@electron-template/db'
import { cacesCategoriesList } from '@electron-template/db'

const create = os
  .input(z.object({
    certificationId: z.string(),
    category: z.enum(cacesCategoriesList as [string, ...string[]])
  }))
  .handler(async ({ input }) => {
    return queries.caces.create(input)
  })

const listByCertification = os
  .input(z.object({ certificationId: z.string() }))
  .handler(async ({ input }) => {
    return queries.caces.listByCertification(input.certificationId)
  })

export const cacesProcedures = {
  create,
  listByCertification
}