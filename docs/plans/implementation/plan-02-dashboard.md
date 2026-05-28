---
name: Plan - RFC-02 Dashboard & Navigation
description: Implementation plan for WEMS UI navigation and dashboard
status: pending
rfc: rfc-02-dashboard-navigation
priority: p1
created: 2026-05-26
---

# Plan: RFC-02 Dashboard & Navigation Implementation

## Overview

This plan defines the implementation of the WEMS navigation structure and dashboard. It covers sidebar navigation, employee table, and the main dashboard layout.

## Prerequisites

- RFC-01 Data Model must be complete

## Implementation Steps

### Step 1: Create Layout Components

**Directory:** `apps/web/src/components/layout/`

Create the main application layout:

1. **AppShell.tsx**
   - Main layout wrapper
   - Contains sidebar + content area
   - Handles responsive behavior

2. **Sidebar.tsx**
   - Navigation links (Dashboard, Alerts, Employees, Warehouses, Settings)
   - Active state highlighting
   - Badge support for alerts count
   - Responsive collapse behavior

3. **TopBar.tsx**
   - App title
   - Quick actions (Add, Export buttons)
   - User context (future)

### Step 2: Update Router Configuration

**File:** `apps/web/src/router.tsx`

Add routes following TanStack Start conventions:

```typescript
// Routes structure
/                       → Dashboard (index)
/alerts                 → Alerts page
/employees              → Employee list
/employees/:id          → Employee detail
/warehouses             → Warehouse list
/warehouses/:id         → Warehouse detail
/settings               → Settings page
```

### Step 3: Create Dashboard Page

**File:** `apps/web/src/routes/index.tsx`

Components:
1. **DashboardPage.tsx**
   - Page container with layout
   - Routes to dashboard components

2. **AlertsSummary.tsx**
   - Top 5-10 urgent alerts
   - Priority: Expired > Alert > Warning
   - Click to navigate to Alerts page

3. **EmployeeTable.tsx**
   - TanStack Table integration
   - Columns: Status, Employee Number, Name, Warehouse, Role, Certifications, Actions
   - Filter bar above table
   - Pagination

### Step 4: Create Employee List Page

**File:** `apps/web/src/routes/employees.tsx`

1. **EmployeeListPage.tsx**
   - Full employee table (same component as dashboard)
   - Add Employee button

2. **EmployeeFilters.tsx**
   - Status multi-select
   - Warehouse dropdown
   - Role dropdown
   - Name search input
   - Clear filters button

### Step 5: Create Employee Detail Page

**File:** `apps/web/src/routes/employees.$id.tsx`

1. **EmployeeDetailPage.tsx**
   - Employee header (name, number, status badge)
   - Contact info section
   - Employment details section
   - Certifications section
   - Actions section

2. **CertificationCard.tsx**
   - Shows: type, category, status, dates, document indicator
   - Actions: Edit, Renew, Delete
   - Color-coded status badge

3. **CertificationList.tsx**
   - List of certification cards
   - "Add Certification" button

### Step 6: Create Warehouses Page

**File:** `apps/web/src/routes/warehouses.tsx`

1. **WarehouseListPage.tsx**
   - Simple table: Name, Employee Count, Actions
   - Edit, View Employees actions

2. **WarehouseDetailPage.tsx**
   - Warehouse info
   - List of employees at this warehouse

### Step 7: Create Settings Page

**File:** `apps/web/src/routes/settings.tsx`

1. **SettingsPage.tsx**
   - Alert threshold configuration per certification type
   - Save changes button

2. **AlertThresholdForm.tsx**
   - For each certification type:
     - Alert days input (default 30)
     - Warning days input (default 60)

### Step 8: Create Modals/Dialogs

**Directory:** `apps/web/src/components/dialogs/`

1. **AddDialog.tsx**
   - Choice modal: Employee, Certification, Warehouse
   - Opens appropriate form based on selection

2. **EmployeeForm.tsx**
   - Create/Edit employee form
   - Fields: firstName, lastName, email, phone, arrivalDate, contractType, role, warehouse

3. **WarehouseForm.tsx**
   - Create/Edit warehouse form
   - Field: name

4. **ConfirmationDialog.tsx**
   - Reusable confirmation for destructive actions
   - Deactivate employee, Delete certification

### Step 9: Create Shared Components

**Directory:** `apps/web/src/components/shared/`

1. **StatusBadge.tsx**
   - Props: status (Valid, Warning, Alert, Expired, Inactif, Inapte)
   - Color-coded with icon

2. **CertificationStatusIcon.tsx**
   - Shows certification type status
   - Compact display for table column

3. **FilterBar.tsx**
   - Reusable filter bar component
   - Clear all filters button

4. **EmptyState.tsx**
   - For empty lists
   - Icon, message, optional action button

### Step 10: Add Toast Notifications

**File:** `apps/web/src/main.tsx` (already has Sonner)

Use Sonner for toasts:
- "Employee added successfully"
- "Certification created"
- "Changes saved"
- "Export complete"

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/routes/index.tsx` | Create | Dashboard page |
| `apps/web/src/routes/alerts.tsx` | Create | Alerts page (stub, implemented in RFC-03) |
| `apps/web/src/routes/employees.tsx` | Create | Employee list |
| `apps/web/src/routes/employees.$id.tsx` | Create | Employee detail |
| `apps/web/src/routes/warehouses.tsx` | Create | Warehouse list |
| `apps/web/src/routes/warehouses.$id.tsx` | Create | Warehouse detail |
| `apps/web/src/routes/settings.tsx` | Create | Settings page |
| `apps/web/src/components/layout/AppShell.tsx` | Create | Main layout |
| `apps/web/src/components/layout/Sidebar.tsx` | Create | Navigation sidebar |
| `apps/web/src/components/layout/TopBar.tsx` | Create | Top action bar |
| `apps/web/src/components/shared/StatusBadge.tsx` | Create | Status badge component |
| `apps/web/src/components/dialogs/AddDialog.tsx` | Create | Add choice modal |
| `apps/web/src/components/dialogs/EmployeeForm.tsx` | Create | Employee form |
| `apps/web/src/components/dialogs/WarehouseForm.tsx` | Create | Warehouse form |
| `apps/web/src/router.tsx` | Modify | Add all routes |

## Dependencies

- RFC-01 Data Model (must be complete)
- TanStack Table (already in deps)
- shadcn/ui components (already installed)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| TanStack Table complexity | Use TanStack Query Expert for query patterns |
| Responsive sidebar edge cases | Test at breakpoints 1200px, 900px |
| Form validation | Use Zod schemas from API package |

## Verification

After implementation:
1. Navigate to all pages via sidebar
2. Click employee to see detail page
3. Test filter bar on employee list
4. Test responsive sidebar collapse
5. Verify toasts appear on actions

## Related

- [RFC-02: Dashboard & Navigation](../rfc/rfc-02-dashboard-navigation.md)
- [Plan - RFC-01: Data Model](./plan-01-data-model.md) (must complete first)
- [Plan - RFC-03: Alert System](./plan-03-alert-system.md) (partial dependency - Alerts page)

## Status

- [ ] Step 1: Layout Components
- [ ] Step 2: Router Configuration
- [ ] Step 3: Dashboard Page
- [ ] Step 4: Employee List
- [ ] Step 5: Employee Detail
- [ ] Step 6: Warehouses Page
- [ ] Step 7: Settings Page
- [ ] Step 8: Modals/Dialogs
- [ ] Step 9: Shared Components
- [ ] Step 10: Toast Notifications