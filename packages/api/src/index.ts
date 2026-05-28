export { router } from './router.js'
export type { RouterRouter as AppRouter } from './router.js'

// Re-export types from db package
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
} from '@electron-template/db'