// Main Router - oRPC procedure aggregator
import { roleProcedures } from './procedures/role'
import { warehouseProcedures } from './procedures/warehouse'
import { employeeProcedures } from './procedures/employee'
import { certificationProcedures } from './procedures/certifications/base'
import { certificationTypeProcedures } from './procedures/certifications/type'
import { cacesProcedures } from './procedures/certifications/caces'
import { medicalProcedures } from './procedures/certifications/medical'
import { trainingProcedures } from './procedures/certifications/training'
import { drivingProcedures } from './procedures/certifications/driving'
import { alertSettingsProcedures } from './procedures/alerts/settings'
import { snoozedAlertProcedures } from './procedures/alerts/snoozed'

export const router = {
  role: roleProcedures,
  warehouse: warehouseProcedures,
  employee: employeeProcedures,
  certification: certificationProcedures,
  certificationType: certificationTypeProcedures,
  caces: cacesProcedures,
  medical: medicalProcedures,
  training: trainingProcedures,
  driving: drivingProcedures,
  alertSettings: alertSettingsProcedures,
  snoozedAlerts: snoozedAlertProcedures
}

export type RouterRouter = typeof router