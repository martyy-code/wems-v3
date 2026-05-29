import { text, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core'

// Base Mixins
const baseId = {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
}

const timestamps = () => ({
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ============================================
// Role Entity (User-managed table with soft delete)
// ============================================
export const roles = sqliteTable('roles', {
  ...baseId,
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  ...timestamps()
})

export const rolesNameIdx = index('idx_roles_name').on(roles.name)
export const rolesActiveIdx = index('idx_roles_active').on(roles.isActive)

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert

// ============================================
// Warehouse Entity (with soft delete)
// ============================================
export const warehouses = sqliteTable('warehouses', {
  ...baseId,
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  ...timestamps()
})

export const warehousesNameIdx = index('idx_warehouses_name').on(warehouses.name)
export const warehousesActiveIdx = index('idx_warehouses_active').on(warehouses.isActive)

export type Warehouse = typeof warehouses.$inferSelect
export type NewWarehouse = typeof warehouses.$inferInsert

// ============================================
// Employee Entity (with soft delete)
// ============================================
export const employees = sqliteTable('employees', {
  ...baseId,
  employeeNumber: text('employee_number').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  arrivalDate: integer('arrival_date', { mode: 'timestamp' }).notNull(),
  contractType: text('contract_type').notNull(),
  roleId: text('role_id').notNull().references(() => roles.id),
  warehouseId: text('warehouse_id').notNull().references(() => warehouses.id),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  ...timestamps()
})

export const employeesWarehouseIdx = index('idx_employees_warehouse').on(employees.warehouseId)
export const employeesRoleIdx = index('idx_employees_role').on(employees.roleId)
export const employeesActiveIdx = index('idx_employees_active').on(employees.isActive)
export const employeesNameIdx = index('idx_employees_name').on(employees.lastName, employees.firstName)

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert

// ============================================
// CertificationType Entity (with soft delete)
// ============================================
export const certificationTypes = sqliteTable('certification_types', {
  ...baseId,
  name: text('name').notNull().unique(),
  hasCategory: integer('has_category', { mode: 'boolean' }).$defaultFn(() => false),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  ...timestamps()
})

export const certificationTypesActiveIdx = index('idx_certification_types_active').on(certificationTypes.isActive)

export type CertificationType = typeof certificationTypes.$inferSelect
export type NewCertificationType = typeof certificationTypes.$inferInsert

// ============================================
// Certification Entity (with soft delete)
// ============================================
export const certifications = sqliteTable('certifications', {
  ...baseId,
  employeeId: text('employee_id').notNull().references(() => employees.id),
  certificationTypeId: text('certification_type_id').notNull().references(() => certificationTypes.id),
  obtainedDate: integer('obtained_date', { mode: 'timestamp' }).notNull(),
  expirationDate: integer('expiration_date', { mode: 'timestamp' }),
  documentPath: text('document_path'),
  isActive: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  ...timestamps()
})

export const certificationsEmployeeIdx = index('idx_certifications_employee').on(certifications.employeeId)
export const certificationsTypeIdx = index('idx_certifications_type').on(certifications.certificationTypeId)
export const certificationsExpirationIdx = index('idx_certifications_expiration').on(certifications.expirationDate)
export const certificationsActiveIdx = index('idx_certifications_active').on(certifications.isActive)

export type Certification = typeof certifications.$inferSelect
export type NewCertification = typeof certifications.$inferInsert

// ============================================
// CACES Certification Entity
// ============================================
export const cacesCertifications = sqliteTable('caces_certifications', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  category: text('category').notNull(),
  ...timestamps()
})

export type CacesCertification = typeof cacesCertifications.$inferSelect
export type NewCacesCertification = typeof cacesCertifications.$inferInsert

// ============================================
// Medical Visit Entity
// ============================================
export const medicalVisits = sqliteTable('medical_visits', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  visitType: text('visit_type').notNull(),
  visitDate: integer('visit_date', { mode: 'timestamp' }).notNull(),
  result: text('result').notNull(),
  ...timestamps()
})

export type MedicalVisit = typeof medicalVisits.$inferSelect
export type NewMedicalVisit = typeof medicalVisits.$inferInsert

// ============================================
// Online Training Entity
// ============================================
export const onlineTrainings = sqliteTable('online_trainings', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  trainingDate: integer('training_date', { mode: 'timestamp' }).notNull(),
  ...timestamps()
})

export type OnlineTraining = typeof onlineTrainings.$inferSelect
export type NewOnlineTraining = typeof onlineTrainings.$inferInsert

// ============================================
// Driving Authorization Entity
// ============================================
export const drivingAuthorizations = sqliteTable('driving_authorizations', {
  ...baseId,
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  authorizationDate: integer('authorization_date', { mode: 'timestamp' }).notNull(),
  ...timestamps()
})

export type DrivingAuthorization = typeof drivingAuthorizations.$inferSelect
export type NewDrivingAuthorization = typeof drivingAuthorizations.$inferInsert

// ============================================
// Alert Settings Entity
// ============================================
export const alertSettings = sqliteTable('alert_settings', {
  ...baseId,
  certificationTypeId: text('certification_type_id').notNull().references(() => certificationTypes.id),
  enabled: integer('enabled', { mode: 'boolean' }).$defaultFn(() => true),
  alertDays: integer('alert_days').notNull().$defaultFn(() => 30),
  warningDays: integer('warning_days').notNull().$defaultFn(() => 60),
  ...timestamps()
})

export const alertSettingsTypeIdx = index('idx_alert_settings_type').on(alertSettings.certificationTypeId)

export type AlertSetting = typeof alertSettings.$inferSelect
export type NewAlertSetting = typeof alertSettings.$inferInsert

// ============================================
// Snoozed Alerts Entity
// ============================================
export const snoozedAlerts = sqliteTable('snoozed_alerts', {
  ...baseId,
  employeeId: text('employee_id').notNull().references(() => employees.id),
  certificationId: text('certification_id').notNull().references(() => certifications.id),
  reason: text('reason'),
  snoozedUntil: integer('snoozed_until', { mode: 'timestamp' }).notNull(),
  ...timestamps()
})

export const snoozedAlertsEmployeeIdx = index('idx_snoozed_alerts_employee').on(snoozedAlerts.employeeId)
export const snoozedAlertsCertificationIdx = index('idx_snoozed_alerts_certification').on(snoozedAlerts.certificationId)
export const snoozedAlertsUntilIdx = index('idx_snoozed_alerts_until').on(snoozedAlerts.snoozedUntil)

export type SnoozedAlert = typeof snoozedAlerts.$inferSelect
export type NewSnoozedAlert = typeof snoozedAlerts.$inferInsert
