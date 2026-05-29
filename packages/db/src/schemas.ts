// Schema exports with Zod validation schemas generated from Drizzle
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import {
  roles,
  warehouses,
  employees,
  certificationTypes,
  certifications,
  cacesCertifications,
  medicalVisits,
  onlineTrainings,
  drivingAuthorizations,
  alertSettings as alertSettingsTable,
  snoozedAlerts
} from './schema.js'

// ============================================
// Role Schemas
// ============================================
export const role = {
  insert: createInsertSchema(roles),
  select: createSelectSchema(roles)
}

// ============================================
// Warehouse Schemas
// ============================================
export const warehouse = {
  insert: createInsertSchema(warehouses),
  select: createSelectSchema(warehouses)
}

// ============================================
// Employee Schemas
// ============================================
export const employee = {
  insert: createInsertSchema(employees),
  select: createSelectSchema(employees)
}

// ============================================
// CertificationType Schemas
// ============================================
export const certificationType = {
  insert: createInsertSchema(certificationTypes),
  select: createSelectSchema(certificationTypes)
}

// ============================================
// Certification Schemas
// ============================================
export const certification = {
  insert: createInsertSchema(certifications),
  select: createSelectSchema(certifications)
}

// ============================================
// CACES Certification Schemas
// ============================================
export const caces = {
  insert: createInsertSchema(cacesCertifications),
  select: createSelectSchema(cacesCertifications)
}

// ============================================
// Medical Visit Schemas
// ============================================
export const medical = {
  insert: createInsertSchema(medicalVisits),
  select: createSelectSchema(medicalVisits)
}

// ============================================
// Online Training Schemas
// ============================================
export const training = {
  insert: createInsertSchema(onlineTrainings),
  select: createSelectSchema(onlineTrainings)
}

// ============================================
// Driving Authorization Schemas
// ============================================
export const driving = {
  insert: createInsertSchema(drivingAuthorizations),
  select: createSelectSchema(drivingAuthorizations)
}

// ============================================
// Alert Settings Schemas
// ============================================
export const alertSettings = {
  insert: createInsertSchema(alertSettingsTable),
  select: createSelectSchema(alertSettingsTable)
}

// ============================================
// Snoozed Alert Schemas
// ============================================
export const snoozedAlert = {
  insert: createInsertSchema(snoozedAlerts),
  select: createSelectSchema(snoozedAlerts)
}