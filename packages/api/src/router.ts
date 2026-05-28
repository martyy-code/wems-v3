// Main Router - oRPC procedure aggregator
import { roleProcedures } from './procedures/role'
import { warehouseProcedures } from './procedures/warehouse'
import { employeeProcedures } from './procedures/employee'
import { certificationProcedures } from './procedures/certification'
import { certificationTypeProcedures } from './procedures/certificationType'
import { cacesProcedures } from './procedures/caces'
import { medicalProcedures } from './procedures/medical'
import { trainingProcedures } from './procedures/training'
import { drivingProcedures } from './procedures/driving'
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