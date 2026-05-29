---
name: RFC-01 Data Model
description: Core data entities, fields, and relationships for WEMS
status: approved
author: Head of Product
created: 2026-05-26
---

# RFC-01: Data Model

## Summary

This RFC defines the fundamental data structure for WEMS. It establishes how employees, warehouses, certifications, and alert configurations are organized and related. The data model follows an append-only philosophy for certifications to maintain a complete audit history while keeping the employee entity simple and focused on personal/employment information.

---

## Context and Rationale

WEMS serves a single warehouse manager who needs to track employee certifications, primarily for operational safety compliance. The app must answer a simple but critical question: "Can this employee operate this equipment today?"

This question requires:
- Knowing which employees are active
- Knowing which certifications each employee holds
- Knowing the expiration status of each certification
- Knowing whether physical proof (document) exists for each certification

The data model prioritizes clarity and completeness over optimization. Because this is a desktop app with a single user managing a finite number of employees (likely under 500), performance is not the primary concern. Data integrity and ease of understanding are.

---

## Entity: Employee

The Employee entity represents a person working at the company. Each employee has a unique internal identifier, personal information, employment details, and a warehouse assignment.

### Why these fields?

| Field | Rationale |
|-------|-----------|
| `employeeNumber` | Auto-generated because no existing employee ID system exists. Using a UUID ensures uniqueness without relying on manual entry. |
| `firstName` / `lastName` | Basic identification. Separated for proper sorting and display. |
| `email` / `phone` | Optional because the primary user is the manager. These fields exist for future extensibility (e.g., email reminders), but are not required for the core use case. |
| `arrivalDate` | Important for tracking employee tenure and for compliance reporting. |
| `contractType` | Determines employee stability and planning. Interim employees have different patterns (frequent turnover) than CDI employees. |
| `role` | Determines which certifications are relevant. A "Préparateur" may need different certifications than a "Cariste". |
| `warehouseId` | Employees work at specific locations. This enables filtering by warehouse and understanding distribution of staff. |
| `isActive` | Allows soft deletion when employees leave. Historical data is preserved for audit purposes, but inactive employees don't appear in daily operations. |

### Why soft delete (isActive) instead of hard delete?

When an employee leaves the company, we don't want to lose their certification history. Regulatory audits or incident investigations may need to reference past employees. By setting `isActive = false`, we:
- Remove them from daily operational views
- Preserve all their data for historical reference
- Allow potential reactivation if an employee returns

### Role Field

The `role` field references the Role entity (a table, not an enum). This allows users to freely add, modify, or delete roles without code changes.

---

## Entity: Role

The Role entity represents job titles that employees can have. Unlike fixed enums, roles are user-defined to accommodate any organizational structure.

### Why a table?

- Different warehouses may have different roles
- Organization structures change over time
- Users can add roles as needed without code changes
- Historical role assignments are preserved
- Enables filtering employees by role in reports and dashboards

### Default Roles

The system ships with these default roles (seeded on first run):
- Préparateur de commandes
- Cariste

Users can add additional roles via the Settings page or when creating an employee.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | string | Role name (unique) |
| `isActive` | boolean | Soft delete (default: true) |
| `createdAt` | timestamp | When role was created |
| `updatedAt` | timestamp | When role was last modified |

### Soft Delete Pattern

Roles use soft delete (`isActive = false`) instead of hard delete. This preserves historical employee records and allows reactivation if a role is temporarily disabled.

```typescript
// Soft delete (preferred)
await db.update(roles).set({ isActive: false }).where(eq(roles.id, id))

// Hard delete only allowed if:
// 1. No employees reference this role
// 2. User explicitly confirms permanent removal
```

### Why not an enum?

While an enum is simpler to implement initially, a role table provides:
- Flexibility to add roles without code changes
- Ability to track when roles were created
- Potential for additional metadata in future (e.g., department, required certifications)
- Consistency with Warehouse entity (also a table)

---

## Entity: Warehouse with Soft Delete

The Warehouse entity represents physical locations where employees work. It uses soft delete to preserve historical employee assignments.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | string | Warehouse name |
| `isActive` | boolean | Soft delete (default: true) |
| `createdAt` | timestamp | When warehouse was created |
| `updatedAt` | timestamp | When warehouse was last modified |

### Soft Delete Pattern

Warehouses use soft delete. This ensures:
- Historical employee records remain intact
- Warehouse can be reactivated if reopened
- Reporting can still reference all-time data

### Why is Warehouse a separate entity?

Even though WEMS is used by a single manager, warehouses represent distinct operational units with potentially different staff distributions. Separating warehouses into their own entity:
- Allows accurate employee counting per location
- Enables filtering and reporting by warehouse
- Makes it easy to rename or reorganize warehouses without touching employee records
- Prepares for potential multi-site reporting in the future

---

## Entity: CertificationType

A lookup table defining the types of certifications available in the system.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | string | Certification type name (CACES R489, Medical Visit, etc.) |
| `hasCategory` | boolean | Whether this type has sub-categories (e.g., CACES has 1a, 1b, etc.) |
| `isActive` | boolean | Soft delete (default: true) |
| `createdAt` | timestamp | When type was created |
| `updatedAt` | timestamp | When type was last modified |

### Soft Delete Pattern

CertificationTypes use soft delete because they are referenced by AlertSettings. A soft-deleted type can be reactivated or permanently deleted once all references are cleaned up.

---

## Entity: Certification (Base)

The Certification entity is the core of WEMS. It tracks that an employee has completed or obtained something that authorizes them to perform a specific activity.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `employeeId` | UUID | FK to employee |
| `certificationTypeId` | UUID | FK to certification type |
| `obtainedDate` | timestamp | When certification was obtained |
| `expirationDate` | timestamp | When certification expires (nullable) |
| `documentPath` | string | Path to scanned document (nullable) |
| `isActive` | boolean | Soft delete (default: true) |
| `createdAt` | timestamp | When certification was created |
| `updatedAt` | timestamp | When certification was last modified |

### Soft Delete Pattern

Certifications use soft delete to preserve the complete audit trail. Even if a certification is entered in error or needs to be voided, the record is kept with `isActive = false`.

### The History Philosophy

Certifications in WEMS are **append-only**. When a certification expires and is renewed, we create a NEW certification entry rather than updating the existing one.

**Example:**
- Employee #42 has a CACES R489 C3 obtained on 2021-06-15, expiring 2026-06-15
- In 2026, they renew. Instead of updating the date, we create a NEW certification entry:
  - Obtained: 2026-06-15
  - Expires: 2031-06-15

This approach:
- Preserves the complete history of what was valid when
- Enables audit trail without special tracking tables
- Makes it impossible to accidentally lose historical evidence
- Aligns with how compliance officers expect to see data

### Why store document separately?

Physical proof matters for compliance. The app stores a reference to the document file, but not the file content itself in the database. Documents are stored in the app's local file system. This keeps the database light while maintaining the document relationship.

### Document Missing Indicator

A certification without an attached document shows a "Missing document" warning. This reminds the manager that while the certification date exists in the system, the physical proof has not been digitized and attached. This is a compliance reminder, not a blocking issue.

---

## Entity: CACES R489 Certification

CACES (Certificat d'Aptitude à la Conduite En Sécurité) R489 is the French standard for forklift and material handling equipment licenses. It categorizes equipment into different classes based on type and usage.

### Categories Explained

| Code | Description | Example Use |
|------|-------------|-------------|
| 1a | Conduite de chariots tracteurs et à timon | Pallet jacks, tow tractors |
| 1b | Conduite de chariots en porte-à-faux (catégorie 1) | Counterbalance forklifts under 6 tons |
| 2b | Conduite de chariots en porte-à-faux (catégorie 2) | Counterbalance forklifts 6+ tons |
| 3 | Conduite de chariots rétractiques | Reach trucks |
| 4 | Conduite de chariots à mât rétractable multidirectionnel | Multi-directional reach trucks |
| 5 | Conduite de chariots à grand hauteur | Very high reach forklifts |
| 6 | Conduite de grues de montage | Construction cranes |
| 7 | Conduite de chariots de manutention automoteurs gerbeurs | Automated guided vehicles |

Each category represents a distinct type of equipment and requires separate training and certification. An employee may hold multiple CACES categories.

### Why track by category?

An employee certified to drive a standard forklift (category 1b) is NOT authorized to drive a high-reach forklift (category 5). Tracking by category ensures the system can accurately answer "Can this employee operate this specific equipment?"

---

## Entity: Medical Visit

French labor law requires regular medical examinations for employees operating hazardous equipment. These visits have specific types and outcomes.

### Visit Types

| Type | When Required |
|------|---------------|
| Embauche | Before starting work (pre-employment) |
| Périodique | Regular intervals (typically every 2 years) |
| Reprise | After illness, injury, or extended absence |
| Spécifique | For specific hazardous roles or conditions |

### Visit Outcomes

| Result | Meaning |
|--------|---------|
| Apte | Fit for duty, no restrictions |
| Apte avec restrictions | Fit but with limitations (e.g., must wear glasses, cannot work above 2m) |
| Inapte | Not fit for the role |

The system tracks these results because an "Inapte" result means the employee cannot operate equipment until cleared by a follow-up examination.

---

## Entity: Online Training

Online training represents e-learning courses completed by employees. These are typically safety courses, regulatory compliance training, or orientation programs.

### Why so simple (just date and document)?

Online training in this context is primarily a record that "this employee completed this training at this date." The document serves as proof of completion. There's no need for additional metadata because:
- The training content is managed externally (LMS or HR department)
- The app's role is to track that training occurred, not to deliver it
- Future extensions could add training type or course name if needed

---

## Entity: Driving Authorization

Driving authorization is a formal employer authorization for an employee to drive company vehicles. Unlike CACES (which is a government-recognized certification), driving authorization is an internal company document.

### Why separate from CACES?

An employee might have a valid CACES for a forklift but NOT have a signed driving authorization to operate a company car or van. These are distinct requirements managed by different processes.

---

## Entity: Alert Settings

Alert settings allow customization of notification thresholds per certification type. While defaults are set system-wide, individual certification types can have different sensitivity levels.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `certificationTypeId` | UUID | FK to certification type |
| `enabled` | boolean | Enable/disable alerts for this type (default: true) |
| `alertDays` | integer | Days before expiration to trigger alert (default: 30) |
| `warningDays` | integer | Days before expiration to trigger warning (default: 60) |
| `createdAt` | timestamp | When settings were created |
| `updatedAt` | timestamp | When settings were last modified |

### Why configurable?

Different certifications have different renewal lead times. Medical visits might need longer advance notice because scheduling takes time. CACES might have shorter notice because training is readily available. Making this configurable accommodates real-world variability.

### Why enable/disable?

Some certification types may not require alerts in certain environments. The `enabled` field allows users to disable alerts for specific certification types without deleting the configuration.

---

## Certification Status Computation

Statuses are computed at runtime, not stored in the database. This ensures the status is always current and accurate.

### Status Logic

```
IF expirationDate NOT SET:
    status = "Unknown"

ELSE IF expirationDate <= today:
    status = "Expired"

ELSE IF expirationDate <= today + alertDays:
    status = "Alert"

ELSE IF expirationDate <= today + warningDays:
    status = "Warning"

ELSE:
    status = "Valid"
```

The `alertDays` and `warningDays` thresholds come from the Alert Settings entity, with system defaults of 30 and 60 days respectively.

---

## Relationships

### Employee ↔ Warehouse

An employee is assigned to one warehouse at a time. However, because `isActive` employees remain in the database and the assignment can change, historical warehouse assignments can be inferred from the data (though not explicitly tracked in v1).

### Employee ↔ Certification

One employee can have many certifications. A single employee might have:
- 2 CACES R489 certifications (different categories)
- 3 medical visits (different dates)
- 5 training records

### Certification ↔ Certification Type

Every certification belongs to exactly one type (CACES, Medical, Training, or Authorization). This enables:
- Grouping certifications by type in the UI
- Configuring alert thresholds per type
- Filtering the certification list

---

## Why This Schema Supports the Core Use Case

The primary question "Can this employee operate this equipment?" requires:

1. **Employee identification** → `Employee` with `isActive = true`
2. **Relevant certification** → `Certification` linked to employee
3. **Current validity** → Computed `status` based on `expirationDate`
4. **Category match** → For CACES, `category` field must match the equipment
5. **Physical proof** → `document` field (optional but tracked)

All of these elements are present and properly related in the schema.

---

## Future Extensibility Considerations

This schema is designed to accommodate potential future features:

| Future Feature | How Schema Supports It |
|----------------|------------------------|
| Multi-warehouse assignment | Warehouse assignment could become a separate entity linking employees to warehouses with dates |
| Training catalog | `OnlineTraining` could link to a `Training` catalog entity |
| Certification requirements by role | A `RoleCertificationRequirement` entity could define which certifications each role needs |
| Employee photos | `Employee` could have a `photoUrl` field |

---

## Decisions from Technical Review

### Medical Visit "Inapte" → Non-Compliant

When a Medical Visit has result = "Inapte", the employee is automatically flagged as **cannot operate**, regardless of CACES validity.

**Rationale:** "Inapte" means the employee is medically unfit to operate equipment. Even if their CACES is valid, they cannot legally or safely work on equipment requiring certification until cleared by a follow-up examination.

**Impact on status computation:**
```
IF medicalVisit.result = "Inapte":
    employeeStatus = "Inapte" (cannot operate)
    Alert generated: "Medical unfit - cannot operate"
```

---

## Technical Notes (from Tech Lead)

### CACES Categories

Categories should be defined as an enum in the schema to prevent typos:

```typescript
export const cacesCategories = ['1a', '1b', '2b', '3', '4', '5', '6', '7'] as const
export type CacesCategory = typeof cacesCategories[number]
```

### Roles (Table, not Enum)

Roles are stored as a table, not an enum. This allows users to add/manage roles freely:

```typescript
export const roles = sqliteTable('roles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})
```

Employee references role via `roleId` (FK to roles.id), not a string field.

### Document Storage Path

Recommended structure:
```
{appData}/documents/{employeeId}/{certificationId}/{filename}
```

### SnoozedAlert Table

For RFC-03 implementation, a lightweight snooze state table is needed:

```typescript
snoozedAlerts: {
  id: uuid,
  employeeId: uuid,
  certificationId: uuid,
  reason: string | null,  // Optional audit trail for why snoozed
  snoozedUntil: datetime,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `employeeId` | UUID | FK to employee |
| `certificationId` | UUID | FK to certification |
| `reason` | string | Optional: why was this snoozed? (audit trail) |
| `snoozedUntil` | timestamp | When the snooze expires |
| `createdAt` | timestamp | When snooze was created |
| `updatedAt` | timestamp | When snooze was last modified |

**Why the `reason` field?**
Compliance and audit purposes. When an auditor asks "why was this alert snoozed?", the `reason` field provides the answer. This is especially important for safety-related certifications.

---

## API Structure

### Queries API (packages/db/src/queries/)

Modular query functions organized by entity namespace:

```typescript
import { queries } from '@electron-template/db'

// Usage
const role = await queries.role.create({ name: 'Cariste' })
const roles = await queries.role.list()
const roles = await queries.role.list(includeInactive: false)
const warehouse = await queries.warehouse.getById(id)
await queries.warehouse.delete(id)  // Soft delete
await queries.warehouse.reactivate(id)
const certs = await queries.certification.listByEmployee(employeeId)
```

### oRPC Router (packages/api/src/router.ts)

Namespace-based procedures for type-safe API:

```typescript
// Client usage
const roles = await sdk.router.role.list()
await sdk.router.role.create({ name: 'Cariste' })
const employee = await sdk.router.employee.getById(id)
await sdk.router.certification.delete(id)  // Soft delete
```

### Soft Delete Strategy

All major entities use soft delete (`isActive` flag):

| Entity | Soft Delete | Reactivate |
|--------|-------------|------------|
| Role | ✅ | ✅ |
| Warehouse | ✅ | ✅ |
| CertificationType | ✅ | ✅ |
| Certification | ✅ | ✅ |
| Employee | ✅ | ✅ |

**Non-soft-delete entities:**
- SnoozedAlerts (auto-cleanup via `cleanupExpiredSnoozedAlerts`)
- AlertSettings (recreated as needed)

---

## Open Questions

None — all decisions have been made through product discovery.

---

## Related

- [RFC-02: Dashboard & Navigation](./rfc-02-dashboard-navigation.md)
- [RFC-03: Alert System](./rfc-03-alert-system.md)
- [RFC-04: Export System](./rfc-04-export-system.md)
