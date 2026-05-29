---
name: RFC-02 Dashboard Navigation
description: Navigation structure and dashboard design for WEMS
status: approved
author: Head of Product
created: 2026-05-26
---

# RFC-02: Dashboard & Navigation

## Summary

This RFC defines how users navigate through WEMS and interact with the main dashboard. The design prioritizes a focused, distraction-free interface for a single non-technical user who needs immediate visibility into certification status and quick access to common actions.

---

## Context and Design Philosophy

The primary user of WEMS is a warehouse manager with mid-level Excel skills. They are not a power user and may feel overwhelmed by complex software interfaces. They need answers to specific questions quickly:

- "Who can drive a forklift today?"
- "Which certifications expire soon?"
- "Do we have any compliance issues?"

The interface must be:
- **Obvious** — Clear labels, recognizable patterns
- **Focused** — Show what matters, hide what doesn't
- **Action-oriented** — Make common tasks fast
- **Forgiving** — Easy to undo, clear confirmations

---

## Navigation Structure Overview

WEMS is organized into six main areas, accessible via a persistent sidebar navigation:

| Page | Purpose | Entry Point |
|------|---------|-------------|
| **Dashboard** | Home — alerts summary + employee overview | Always first |
| **Alerts** | Complete list of all active alerts | Primary navigation |
| **Employees** | Full employee list | Primary navigation |
| **Warehouses** | Warehouse management | Primary navigation |
| **Employee Detail** | Individual employee + all certifications | From employee list |
| **Settings** | Alert thresholds, app configuration | Primary navigation |

### Why this structure?

The structure follows the natural workflow of the user:

1. **Start at Dashboard** — See urgent alerts and overall status
2. **Go to Employees** — Find specific employee or browse list
3. **Open Employee Detail** — See full certification history
4. **Check Alerts** — When notified of something specific
5. **Visit Settings** — Rarely, when adjusting thresholds

The most frequent actions (viewing employees, checking alerts) are one click away. Less frequent actions (settings) are also accessible but don't clutter the primary view.

---

## Dashboard: The Command Center

The Dashboard is the landing page and primary workspace. It combines the most critical information into a single view so the user doesn't need to navigate elsewhere for routine checks.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  WEMS                              [Add] [Export]   │
├─────────┬───────────────────────────────────────────┤
│         │                                           │
│  📊 Dashboard                                      │
│  🔔 Alerts (12)                                    │
│  👥 Employees                                       │
│  🏭 Warehouses                                     │
│  ⚙️ Settings                                       │
│         │                                           │
│         │  ┌─────────────────────────────────────┐  │
│         │  │  ⚠️  Alerts Summary                 │  │
│         │  │  [Alert cards - top 5-10]           │  │
│         │  └─────────────────────────────────────┘  │
│         │                                           │
│         │  ┌─────────────────────────────────────┐  │
│         │  │  👥  Employees                      │  │
│         │  │  [Filter bar]                       │  │
│         │  │  [Employee table]                   │  │
│         │  └─────────────────────────────────────┘  │
│         │                                           │
└─────────┴───────────────────────────────────────────┘
```

### Section 1: Quick Actions Bar

The top-right area always shows two primary actions:

**Add Button**
- Opens a choice dialog first
- Options: "Employee", "Certification", "Warehouse"
- Selecting one opens the appropriate creation form
- This two-step flow prevents confusion (user chooses what they're creating before seeing the form)

**Export Button**
- Opens export configuration modal
- Allows selection of scope (all, filtered, selection)
- Allows selection of format (XLSX, CSV)

### Section 2: Alerts Summary

Immediately visible below the actions, this section shows the most urgent alerts requiring attention.

**Why show alerts here?**

The primary job of this app is to prevent compliance failures. By showing alerts prominently on the home page, the user sees immediately what needs attention without actively thinking "I should check for expiring certifications."

**What's shown?**
- Top 5-10 most urgent alerts (prioritized: Expired > Alert > Warning)
- Each alert shows: employee name, certification type, days remaining
- Click anywhere on the alert to go to the full Alerts page
- Color-coded by severity (red for expired, orange for alert, yellow for warning)

**Why only 5-10?**

Showing too many alerts overwhelms. If there are more than 10 urgent items, the user should visit the full Alerts page for a comprehensive view. The summary is a "headline" view, not a replacement for the full list.

### Section 3: Employee Table

The main content area displays all employees in a filterable, sortable table.

**Why a table?**

The user is familiar with Excel. A table is immediately understandable, easy to scan, and matches their mental model of "employee list." Using TanStack Table provides built-in sorting, filtering, and pagination without custom development.

**Columns explained:**

| Column | Why Included |
|--------|--------------|
| Status | Primary compliance indicator — green/red tells user at a glance |
| Employee Number | Unique identifier for reference |
| Full Name | Primary identification |
| Warehouse | Context for where employee works |
| Role | Additional context |
| Certifications | Quick overview of compliance status |
| Actions | Quick access to common tasks |

---

## Employee Table Deep Dive

### Status Badge

The status column shows a color-coded badge for each employee:

| Badge | Meaning |
|-------|---------|
| 🟢 All Valid | All certifications are current and valid |
| 🟡 Warning | At least one certification is in warning period |
| 🟠 Alert | At least one certification needs immediate attention |
| 🔴 Expired | At least one certification has expired |
| ⚪ Inactif | Employee is deactivated |

This gives immediate situational awareness. The user can scan down the status column and immediately spot problems.

### Certifications Column

This column provides a quick overview of the employee's certification portfolio:

- Shows each certification type with its status icon
- Example: "CACES 🟢, Medical 🟡, Training 🟢"
- Helps user understand the overall picture without clicking through

### Actions Column

Quick action buttons for common tasks:

| Action | Icon | Behavior |
|--------|------|----------|
| View | 👁️ | Opens Employee Detail page |
| Edit | ✏️ | Opens quick edit for the most recent certification |
| Deactivate | ⏸️ | Confirmation dialog, then soft-deletes |
| Export | 📥 | Downloads individual employee XLSX |

---

## Filtering System

Every column in the employee table is filterable. Filters appear in a filter bar above the table.

### Filter Types

| Column | Filter Type | Behavior |
|--------|-------------|----------|
| Status | Multi-select dropdown | Check boxes for each status to show |
| Employee Number | Text input | Partial match search |
| Full Name | Text input | Partial match search |
| Warehouse | Single-select dropdown | Choose one warehouse |
| Role | Single-select dropdown | Choose one role |

### Global Search

A prominent search bar allows searching across all text fields simultaneously. Typing "John" finds employees with "John" in their name, role, or warehouse.

### Filter Persistence

Filters persist during the session (while the app is open) but reset when the app closes. This prevents accidental stale filters from hiding employees.

### Clear Filters

A "Clear filters" button resets all filters to show the complete list.

---

## Add Flow: Adding New Records

The Add button initiates a two-step creation process:

### Step 1: Choice Dialog

A modal dialog presents three options:

```
┌────────────────────────────────────┐
│  What would you like to add?        │
│                                    │
│  [👤 Employee]                     │
│  [📋 Certification]                │
│  [🏭 Warehouse]                    │
│                                    │
│            [Cancel]                │
└────────────────────────────────────┘
```

**Why this step?**

Without this, users might click "Add" expecting to create an employee but land on a certification form, or vice versa. This choice prevents errors and reduces cognitive load.

### Step 2: Creation Form

Based on the choice in Step 1, the appropriate form opens:

**Employee Form**
- First Name (required)
- Last Name (required)
- Email (optional)
- Phone (optional)
- Arrival Date (required)
- Contract Type (required, dropdown)
- Role (required)
- Warehouse (required, dropdown)
- Submit: Creates employee, returns to previous view

**Certification Form**
- First: Select Employee (searchable dropdown)
- Then: Certification type (dropdown: CACES, Medical, Training, Authorization)
- Based on type: Additional fields appear
- Submit: Creates certification, returns to previous view

**Warehouse Form**
- Name (required)
- Submit: Creates warehouse, returns to previous view

### Success Feedback

After successful creation, a toast notification confirms the action:
"Employee added successfully" or "Certification created"

---

## Employee Detail Page

This page shows comprehensive information about a single employee and all their certifications.

### URL Structure

`/employees/:employeeId`

### Page Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Employees                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👤 Jean Dupont          #EMP-001                  │
│  🟢 Active                                          │
│                                                     │
│  📍 Warehouse Paris    💼 Cariste                   │
│  📅 Joined: 2023-01-15   📄 CDI                    │
│  📧 jean@company.com    📱 06 12 34 56 78          │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  📋 Certifications                           │   │
│  │                                              │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │  CACES R489 - C3                       │ │   │
│  │  │  🟢 Valid until 2027-06-15             │ │   │
│  │  │  [📄 Document attached]                │ │   │
│  │  │  [Edit] [Renew] [Delete]               │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  │                                              │   │
│  │  ┌─────────────────────────────────────────┐ │   │
│  │  │  Medical Visit - Périodique             │ │   │
│  │  │  🟡 Expires in 45 days                  │ │   │
│  │  │  Result: Apte                           │ │   │
│  │  │  [📄 Document attached]                │ │   │
│  │  │  [Edit] [Renew] [Delete]                │ │   │
│  │  └─────────────────────────────────────────┘ │   │
│  │                                              │   │
│  │  [+ Add Certification]                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Actions                                    │   │
│  │  [Edit Employee]  [Assign to Warehouse]     │   │
│  │  [Deactivate Employee]                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Sections Explained

**Header**
- Full name prominently displayed
- Employee number for reference
- Status badge (active/inactive)

**Contact Information**
- Email and phone if provided
- "Not provided" shown if empty (not hidden)

**Employment Details**
- Warehouse assignment
- Role
- Contract type
- Arrival date

**Certifications Section**
- List of all certifications (past and present)
- Each certification is a card showing:
  - Type and subtype (e.g., "CACES R489 - C3")
  - Current status with color coding
  - Key dates (obtained, expires)
  - Document attachment indicator
  - Action buttons

**Certification Card Actions**

| Action | Behavior |
|--------|----------|
| Edit | Opens edit form for this specific certification |
| Renew | Creates a new certification as a renewal, links to this one |
| Delete | Confirmation required, removes certification |

**Why "Renew" instead of just "Edit"?**

The Renew action creates a NEW certification entry while keeping the old one in history. This maintains the append-only philosophy. Edit modifies the existing entry (for correcting mistakes, not for renewals).

**Actions Section**
- Edit Employee: Opens form to modify employee details
- Assign to Warehouse: Change employee's warehouse assignment
- Deactivate: Soft-delete with confirmation

---

## Warehouses Page

Simple management page for warehouse locations.

### Table

| Column | Description |
|--------|-------------|
| Name | Warehouse name |
| Employees | Count of active employees assigned |
| Actions | Edit, View Employees |

### Why a separate Warehouses page?

Even though warehouse management is infrequent, it needs to be accessible:
- When setting up the app initially
- When opening or closing a location
- When reorganizing employee assignments

---

## Settings Page

Configuration page for alert behavior.

### Alert Threshold Configuration

For each certification type:

```
┌─────────────────────────────────────────────────────┐
│  Alert Settings                                     │
│                                                     │
│  CACES R489                                         │
│  ├─ Alert at: [30] days before expiration          │
│  └─ Warning at: [60] days before expiration        │
│                                                     │
│  Medical Visit                                      │
│  ├─ Alert at: [30] days before expiration          │
│  └─ Warning at: [60] days before expiration        │
│                                                     │
│  Online Training                                    │
│  ├─ Alert at: [30] days before expiration          │
│  └─ Warning at: [60] days before expiration        │
│                                                     │
│  Driving Authorization                              │
│  ├─ Alert at: [30] days before expiration          │
│  └─ Warning at: [60] days before expiration        │
│                                                     │
│           [Save Changes]                            │
└─────────────────────────────────────────────────────┘
```

### Why configurable per type?

In practice, different certifications may require different lead times:
- Medical visits require scheduling appointments (may need 60-day alert)
- CACES training is more readily available (30-day alert sufficient)
- Training courses might need even longer (90 days)

Making this configurable accommodates real operational needs.

---

## Responsive Behavior

WEMS is a desktop application, but the interface adapts to window resizing:

| Window Width | Behavior |
|-------------|----------|
| > 1200px | Full sidebar + content |
| 900-1200px | Collapsed sidebar (icons only) |
| < 900px | Sidebar becomes hamburger menu |

---

## Accessibility Considerations

- All interactive elements have visible focus states
- Color is not the only indicator (icons and text accompany colors)
- Keyboard navigation is supported (Tab, Enter, Escape)
- Form fields have associated labels
- Error messages are clear and actionable

---

## Why TanStack Table?

TanStack Table is chosen for several reasons:

1. **Headless** — No pre-built UI, just logic. We control the visual design.
2. **React-native** — Works seamlessly with our React frontend.
3. **Feature-rich** — Built-in sorting, filtering, pagination, column visibility.
4. **Lightweight** — No heavy dependencies.
5. **Well-maintained** — Active community, regular updates.

---

## Future Navigation Extensions

Potential additions for future versions:

| Feature | Description |
|---------|-------------|
| Breadcrumbs | Show navigation path on detail pages |
| Quick search | Cmd/Ctrl+K to search across everything |
| Favorites | Star frequently accessed employees |
| Recent | Show recently viewed employees on dashboard |

---

## Open Questions

None — all decisions have been made through product discovery.

---

## Related

- [RFC-01: Data Model](./rfc-01-data-model.md)
- [RFC-03: Alert System](./rfc-03-alert-system.md)
- [RFC-04: Export System](./rfc-04-export-system.md)
