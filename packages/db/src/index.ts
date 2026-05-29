// Main Database Package Export
export { initDatabase, getDb, db } from './initDb.js'

// Schema types
export type {
  Role,
  NewRole,
  Warehouse,
  NewWarehouse,
  Employee,
  NewEmployee,
  Certification,
  NewCertification,
  CertificationType,
  NewCertificationType,
  CacesCertification,
  NewCacesCertification,
  MedicalVisit,
  NewMedicalVisit,
  OnlineTraining,
  NewOnlineTraining,
  DrivingAuthorization,
  NewDrivingAuthorization,
  AlertSetting,
  NewAlertSetting,
  SnoozedAlert,
  NewSnoozedAlert
} from './schema.js'

// Schema tables (for advanced usage)
export {
  roles,
  warehouses,
  employees,
  certifications,
  certificationTypes,
  cacesCertifications,
  medicalVisits,
  onlineTrainings,
  drivingAuthorizations,
  alertSettings,
  snoozedAlerts
} from './schema.js'

// Constants
export {
  CONTRACT_TYPES,
  type ContractType,
  contractTypesList,
  CACES_CATEGORIES,
  type CacesCategory,
  cacesCategoriesList,
  MEDICAL_VISIT_TYPES,
  type MedicalVisitType,
  medicalVisitTypesList,
  MEDICAL_VISIT_RESULTS,
  type MedicalVisitResult,
  medicalVisitResultsList
} from './constants.js'

// Query functions (modular namespace pattern)
export { queries } from './queries/index.js'

// Re-export individual query modules for convenience
export { role, warehouse, employee, certification, certificationType, caces, medical, training, driving } from './queries/index.js'

// Zod schemas generated from Drizzle schema
export * as schemas from './schemas.js'