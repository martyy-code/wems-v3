# WEMS - Feature Analysis & Prioritization

> **Date:** 2026-05-22
> **Status:** Draft

## Executive Summary

WEMS is a desktop application for tracking warehouse employee driving and operating licenses. The primary user is a single depot manager with mid-Excel skills who needs visibility on employee certification status and proactive expiration alerts.

---

## User Profile

| Attribute | Value |
|-----------|-------|
| **User count** | 1 person |
| **Role** | Depot/warehouse manager |
| **Tech comfort** | Low — Excel level |
| **Primary goal** | Dashboard showing who can/n cannot operate equipment |
| **Key need** | Expiration alerts |

---

## Core Entities

### 1. Employees
- Global to the company (not per warehouse)
- Can change warehouses (manual update)
- Contract types: CDI, CDD, Intérim, Alternance
- Roles: Préparateur de commandes, Cariste, extensible

### 2. Certifications
| Type | Description |
|------|-------------|
| **CACES** | Technical operating licenses (forklift, lifting equipment) |
| **Medical Visits** | Health checkups/examinations |
| **Online Training** | E-learning courses completed |
| **Driving Authorizations** | Signed authorization documents |

### 3. Warehouses (Entrepots)
- Physical locations
- Employees are assigned to warehouses (can be reassigned manually)

---

## Feature Priority Matrix

| Priority | Feature | Rationale |
|----------|---------|-----------|
| **P0** | Employee CRUD with certifications | Core of the product |
| **P0** | Dashboard "can/cannot operate" | Primary use case |
| **P0** | In-app expiration alerts | Explicit business need |
| **P1** | CSV export for sharing | Important, secondary |
| **P2** | Multi-certification support per employee | Realistic management |
| **P2** | Warehouse assignment history | Traceability |
| **P3** | Statistics/Charts | Nice-to-have |
| **P3** | Email/push notifications | Additional complexity |

---

## Underconsidered Sub-Aspects

### 1. Employee Fields
| Field | Required | Type |
|-------|----------|------|
| First name | Yes | Text |
| Last name | Yes | Text |
| Arrival date | Yes | Date |
| Contract type | Yes | Enum (CDI, CDD, Intérim, Alternance) |
| Assigned warehouse | Yes | Relation |
| Role | Yes | Text/Enum |
| Email | Optional | Email |
| Phone | Optional | Tel |
| Employee number | Auto-generated | UUID |

### 2. Document Storage
- **Decision:** Yes, store document copies (PDFs, images) locally
- Each certification can have attached documents
- Documents can be downloaded/viewed from the app
- Storage location: local file system within app data directory

### 3. Employee Status Display
- **Decision:** Inactive employees visible with "Inactif" badge
- Not hidden from dashboard
- Clearly distinguished with badge

### 4. CACES R489 Categories
Valid categories:
| Code | Description |
|------|-------------|
| 1a | Conduite de chariots tracteurs et à timon |
| 1b | Conduite de chariots en porte-à-faux (catégorie 1) |
| 2b | Conduite de chariots en porte-à-faux (catégorie 2) |
| 3 | Conduite de chariots rétractiques |
| 4 | Conduite de chariots à mât rétractable multidirectionnel |
| 5 | Conduite de chariots à grand hauteur |
| 6 | Conduite de grues de montage |
| 7 | Conduite de chariots de manutention automoteurs gerbeurs |

### 5. Document Attachments
- **Decision:** Documents are optional but trigger an alert if missing
- When a certification has no attached document, show warning indicator
- User can still save certification without document
- Alert/warning helps ensure physical proof is maintained

### 7. Medical Visit Fields
| Field | Type | Notes |
|-------|------|-------|
| Visit type | Enum | Embauche, Périodique, Reprise, Spécifique |
| Start date | Date | When the visit was done |
| Result | Enum | Apte, Apte avec restrictions, Inapte |
| Document | Optional | Certificate attachment |

### 8. Online Training Fields
| Field | Type | Notes |
|-------|------|-------|
| Training date | Date | When training was completed |
| Document | Optional | Certificate/completion proof |

### 9. Driving Authorization Fields
- Same as other certifications: date obtained, expiration, document

### 10. Certification Renewal & History
- **Decision:** App follows a "history notion"
- When a certification expires and is renewed: create a NEW entry
- Old entries remain in history (never deleted)
- Each certification instance is independent
- Full audit trail preserved

### 6. Temporary Employees (Intérimaires)
- **Issue:** High turnover — they come and go frequently
- **Questions:**
  - Archive inactive employees or delete?
  - If an interim returns after 3 months: reactivate old record or create new one?
- **Recommendation:** Soft-delete/archive with reactivation capability

### 2. Multi-Certification Status Logic
- **Issue:** One employee can have multiple certifications (e.g., forklift + platform)
- **Questions:**
  - Each certification has its own expiration date
  - Is status "OK" only if ALL certifications are valid?
  - Or display per-certification status?
- **Recommendation:** Per-certification status with overall "can operate" computed field

### 3. Status Levels
| Status | Meaning |
|--------|---------|
| ✓ Valid | Certification is within validity period |
| ✗ Expired | Past expiration date |
| ⏳ Pending Renewal | Deadline passed but renewal scheduled |
| ? Unknown | Expiration date not yet recorded |

### 4. Alert Thresholds
| Level | Days Before Expiration | Meaning |
|-------|------------------------|---------|
| **Alert** | 30 days | Critical — action needed soon |
| **Warning** | 60 days | Notice — plan ahead |

- Thresholds are configurable per certification type
- Default: Alert at 30 days, Warning at 60 days

### 5. History & Audit Trail
- **Needed for:**
  - Tracking warehouse reassignments (when, where)
  - Who modified what and when
- **Recommendation:** Maintain change history log

### 6. Update Frequency & Workflow
- **Questions:**
  - Who updates certifications? (Manager only or employees self-report?)
  - How often? (Weekly check? On expiration?)
  - Any approval workflow?
- **Recommendation:** Manager-driven, manual updates

### 7. Notification Delivery
| Option | Pros | Cons |
|--------|------|------|
| In-app only | Simple, works offline | Must open app |
| Email | Immediate, remote | Requires email setup |
| Push/SMS | Urgent alerts | Overkill for single user |

- **Recommendation:** In-app first, email as secondary option

### 8. Export Scope
- **Use cases:**
  - Share with HR
  - Audit compliance
  - Backup
- **Formats:** CSV (primary), PDF (for formal reports)
- **Recommendation:** CSV first, PDF later

---

## Decisions

### Interim Reactivation
> **Decision:** Reactivate old archived record when an interim returns
- Preserves historical data and continuity
- Clearer tracking of employee lifecycle

### Certification Status
> **Decision:** Per-certification status, each CACES is individual
- Each certification tracked independently with its own expiration date
- Employee may have multiple CACES of the same type with different dates
- Dashboard shows detail per certification type

### Alert Thresholds
> **Decision:** 30 days = Alert (critical), 60 days = Warning (notice)
- Configurable per certification type
- Default: Alert at 30 days, Warning at 60 days

---

## Feature #2: Dashboard

### Design Principles
- **Focused view:** Dashboard home is concentrated, not cluttered
- **Quick actions prominent:** Navigation, data export, create actions easily accessible
- **Smart filtering:** Automatic filtering system for all fields
- **Tech:** TanStack Table for table implementation

### Dashboard Home Actions
1. **Navigation** — TBD (to be defined based on navigation structure)
2. **Data export** — CSV/XLSX export with choice: all, selection, or filtered
3. **Create** — "Add" button opens choice dialog, then creation dialog
4. **Filtering** — All fields filterable automatically

### Alerts Section
- **Decision:** Dedicated alerts section on dashboard home AND full alerts page
- Dashboard: summary alerts (most urgent)
- Alerts page: complete list with filtering

### Create Flow
1. Click "Add" button → Choice dialog opens
2. User selects: Employee / Certification / Warehouse
3. Appropriate creation dialog opens
4. After creation, user returns to previous view

### Export Options
- **All:** Export complete database
- **Selection:** Export only selected rows (checkbox selection)
- **Filtered:** Export only visible filtered data
- User chooses before export

### Employee Table Columns
| Column | Display | Notes |
|--------|---------|-------|
| Status badge | Yes | Color-coded status |
| Employee number | Yes | Auto-generated ID |
| Full name | Yes | First + Last |
| Warehouse | Yes | Current assignment |
| Role | Yes | Job title |
| Certifications | Yes | Status overview |
| Actions | Yes | View, edit, deactivate |

### Navigation Structure
| Page | Content |
|------|---------|
| Dashboard | Focused view, alerts summary, employee table |
| Alerts | Complete alert list with filtering |
| Employees | Full employee list (complete view) |
| Warehouses | Warehouse management |
| Employee Detail | Employee profile + all certifications |
| Settings | Alert thresholds configuration |

### Alert Settings
- **Decision:** Dedicated Settings page
- Configure alert/warning thresholds per certification type
- 30-day Alert, 60-day Warning as defaults

## Feature #4: Export (CSV/XLSX)

### Export Format
- **Default:** XLSX (native Excel format, better formatting)
- **Option:** CSV available as alternative
- User chooses before export

### Export Content
- **Global export:** Employees + Certifications in single file
- **Tabs:** "Employees" + "Certifications" linked by employee number
- **Individual export:** One XLSX per employee, documents not included

### Export Columns
- All columns exported (no column selection)
- Simplifies UX and maintenance

## Feature #3: Alert System (In-App)

### Alert Types
| Type | Trigger | Severity | Color |
|------|---------|----------|-------|
| **Alert** | ≤ 30 days before expiration | Critical | Red |
| **Warning** | ≤ 60 days before expiration | Medium | Orange |
| **Missing document** | Certification without attached document | Info | Yellow |

Keep to 3 types maximum to avoid alert fatigue.

### Alert Display Locations
| Location | Recommendation |
|----------|----------------|
| Sidebar badge | Yes — permanent signal with count |
| Dashboard section | Yes — top 5-10 urgent alerts only |
| Alerts page | Yes — complete list |
| Toast notifications | No — redundant with dashboard |

### Alert Actions
| Action | Description |
|--------|-------------|
| Mark as read | Keep view clean |
| Snooze | Hide for X days (7d, 30d, custom) |
| Go to employee | Direct navigation |
| Add certification | Shortcut to renew |

All 4 actions are useful — keep all.

### Alert Persistence
- **Decision:** Simple lifecycle
- Resolved (renewed or expired + marked) → disappears
- Snoozed → hidden for selected duration
- No complex "read/unread" system
- Only states: active, snoozed, resolved
- All table columns are filterable
- Auto-complete or dropdown based on field type
- Global search (text across multiple fields)
- Filters persist in session

### Quick Actions from Table
- View employee detail
- Edit certification
- Deactivate employee
- Export individual employee data

---

## Next Steps

1. [x] Validate feature priorities with stakeholder
2. [x] Resolve open questions above
3. [ ] Draft technical schema based on decisions
4. [ ] Define MVP scope (P0 features only)
