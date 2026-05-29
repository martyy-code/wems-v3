// Seed Data - Initial data for WEMS database
// Run: pnpm --filter @electron-template/db seed

import { eq } from 'drizzle-orm'
import { initDatabase } from './initDb.js'
import { db, queries, warehouses } from './index.js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Initialize database - use same path as drizzle.config.ts
// seed.js is at packages/db/dist/seed.js
// We need apps/desktop/data which is at project root level
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const config = {
  dataPath: resolve(__dirname, '../../../apps/desktop/data')
}
initDatabase(config)

async function seed() {
  console.log('Seeding database...')

  // Create Roles
  console.log('Creating roles...')
  const roles = [
    { name: 'Cariste' },
    { name: 'Magasinier' },
    { name: 'Responsable de zone' },
    { name: 'Chef d\'équipe' },
    { name: 'Préparateur de commandes' }
  ]

  const createdRoles: { id: string; name: string }[] = []
  for (const roleData of roles) {
    const existing = await queries.role.getByName(roleData.name)
    if (!existing) {
      const role = await queries.role.create(roleData)
      createdRoles.push(role)
      console.log(`  Created role: ${role.name}`)
    } else {
      createdRoles.push(existing)
      console.log(`  Role already exists: ${existing.name}`)
    }
  }

  // Create Warehouses
  console.log('Creating warehouses...')
  const warehouseNames = [
    { name: 'Entrepôt Principal' },
    { name: 'Zone Expédition' },
    { name: 'Stockage Frigo' }
  ]

  const createdWarehouses: { id: string; name: string }[] = []
  for (const warehouseData of warehouseNames) {
    const existingResult = await db.select().from(warehouses).where(eq(warehouses.name, warehouseData.name)).limit(1)
    if (!existingResult[0]) {
      const warehouse = await queries.warehouse.create(warehouseData)
      createdWarehouses.push(warehouse)
      console.log(`  Created warehouse: ${warehouse.name}`)
    } else {
      createdWarehouses.push(existingResult[0])
      console.log(`  Warehouse already exists: ${existingResult[0].name}`)
    }
  }

  // Create CertificationTypes
  console.log('Creating certification types...')
  const certTypes = [
    { name: 'CACES R489 - Chariots élévateurs', hasCategory: true },
    { name: 'CACES R486 - Nacelles', hasCategory: true },
    { name: 'CACES R490 - Grues de chargement', hasCategory: true },
    { name: 'Attestation de conduite en sécurité', hasCategory: false },
    { name: 'Formation sécurité - CACES', hasCategory: false },
    { name: 'Visite médicale', hasCategory: false },
    { name: 'Formation échafaudages', hasCategory: false },
    { name: 'Habilitation électrique', hasCategory: false }
  ]

  const createdCertTypes: { id: string; name: string }[] = []
  for (const certTypeData of certTypes) {
    const existing = await queries.certificationType.getByName(certTypeData.name)
    if (!existing) {
      const certType = await queries.certificationType.create(certTypeData)
      createdCertTypes.push(certType)
      console.log(`  Created certification type: ${certType.name}`)
    } else {
      createdCertTypes.push(existing)
      console.log(`  Certification type already exists: ${existing.name}`)
    }
  }

  // Create sample Employees
  console.log('Creating employees...')
  const caristeRole = createdRoles.find(r => r.name === 'Cariste')
  const warehouse = createdWarehouses[0]
  const cacesCertType = createdCertTypes.find(c => c.name === 'CACES R489 - Chariots élévateurs')

  if (caristeRole && warehouse) {
    const employees = [
      { firstName: 'Jean', lastName: 'Dupont', contractType: 'CDI' },
      { firstName: 'Marie', lastName: 'Martin', contractType: 'CDI' },
      { firstName: 'Pierre', lastName: 'Bernard', contractType: 'CDD' },
      { firstName: 'Sophie', lastName: 'Petit', contractType: 'Alternance' }
    ]

    for (const empData of employees) {
      const employee = await queries.employee.create({
        ...empData,
        arrivalDate: new Date('2025-01-15'),
        roleId: caristeRole.id,
        warehouseId: warehouse.id
      })
      console.log(`  Created employee: ${employee.firstName} ${employee.lastName}`)

      // Add CACES certification if the cert type exists
      if (cacesCertType) {
        await queries.certification.create({
          employeeId: employee.id,
          certificationTypeId: cacesCertType.id,
          obtainedDate: new Date('2025-01-20'),
          expirationDate: new Date('2027-01-20')
        })
        console.log(`    Added CACES certification`)
      }
    }
  }

  console.log('Seed completed!')
}

// Run seed
seed().catch(console.error)