// Queries Index - Re-export all query modules for modular namespace pattern
export { role } from './role.js'
export { warehouse } from './warehouse.js'
export { employee } from './employee.js'

// Certifications (includes certificationType, caces, medical, training, driving)
export { certification, certificationType, caces, medical, training, driving } from './certifications/index.js'

// Re-export schema types and constants
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
} from '../schema.js'

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
} from '../constants.js'

// Modular namespace export for queries
import { role } from './role.js'
import { warehouse } from './warehouse.js'
import { employee } from './employee.js'
import { certification, certificationType, caces, medical, training, driving } from './certifications/index.js'

export const queries = {
  role,
  warehouse,
  employee,
  certification,
  certificationType,
  caces,
  medical,
  training,
  driving
}