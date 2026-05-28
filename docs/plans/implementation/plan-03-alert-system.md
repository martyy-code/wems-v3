---
name: Plan - RFC-03 Alert System
description: Implementation plan for WEMS alert computation and display
status: pending
rfc: rfc-03-alert-system
priority: p1
created: 2026-05-26
---

# Plan: RFC-03 Alert System Implementation

## Overview

This plan defines the implementation of the WEMS alert system. It covers alert computation logic, snooze functionality, and alert display across the application.

## Prerequisites

- RFC-01 Data Model must be complete (SnoozedAlert table)
- RFC-02 Dashboard partially complete (Alerts page structure)

## Implementation Steps

### Step 1: Create Alert Computation Hook

**File:** `apps/web/src/hooks/useAlerts.ts`

```typescript
// Alert computation logic
interface Alert {
  id: string
  type: 'alert' | 'warning' | 'expired' | 'missing_document'
  employeeId: string
  employeeName: string
  warehouseName: string
  certificationId: string
  certificationType: string
  category?: string  // for CACES
  message: string
  daysRemaining?: number
  severity: 'critical' | 'medium' | 'low'
}

// Computed on:
// - App load
// - Certification create/update/delete
// - Threshold configuration change
// - Timer-based daily check (if app left open)
```

### Step 2: Create Alert Status Computation

**File:** `apps/web/src/lib/computeStatus.ts`

```typescript
// Status computation for each certification
function computeCertificationStatus(
  cert: Certification,
  alertSettings: AlertSettings
): 'valid' | 'warning' | 'alert' | 'expired' | 'unknown' {
  // RFC-01 status logic:
  // - No expirationDate → "unknown"
  // - expirationDate <= today → "expired"
  // - expirationDate <= today + alertDays → "alert"
  // - expirationDate <= today + warningDays → "warning"
  // - else → "valid"
}

// Employee status computation
function computeEmployeeStatus(certifications: Certification[]): EmployeeStatus {
  // Most severe wins:
  // Inapte medical → "inapte" (cannot operate)
  // Expired cert → "expired"
  // Alert cert → "alert"
  // Warning cert → "warning"
  // All valid → "all_valid"
  // No certs → "unknown"
}
```

### Step 3: Create Snooze Logic

**File:** `apps/web/src/lib/snoozeLogic.ts`

```typescript
// Snooze duration options
type SnoozeDuration = 7 | 30 | 'custom'

// Snooze functions
createSnooze(employeeId: string, certificationId: string, until: Date)
removeSnooze(employeeId: string, certificationId: string)
isSnoozed(snoozedAlerts: SnoozedAlert[], employeeId: string, certId: string): boolean
getActiveAlerts(alerts: Alert[], snoozedAlerts: SnoozedAlert[]): Alert[]
```

### Step 4: Update Alerts Page

**File:** `apps/web/src/routes/alerts.tsx`

1. **AlertsPage.tsx**
   - Fetch all active alerts
   - Fetch snoozed alerts
   - Display filterable alert list

2. **AlertFilters.tsx**
   - Alert type filter (Alert, Warning, Missing Document)
   - Certification type filter
   - Employee search
   - Warehouse dropdown
   - Show snoozed toggle

3. **AlertCard.tsx**
   - Display alert message
   - Employee + warehouse info
   - Actions: Go to Employee, Snooze, Renew
   - Color-coded by severity

4. **SnoozeDialog.tsx**
   - Duration options: 7 days, 30 days, Custom date
   - Confirm button

### Step 5: Integrate Alerts with TanStack Query

**File:** `apps/web/src/hooks/useAlerts.ts`

```typescript
// Query for alerts
useQuery({
  queryKey: ['alerts', 'active'],
  queryFn: computeActiveAlerts,
  // Refresh on:
  // - Employees change
  // - Certifications change
  // - Alert settings change
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Query for snoozed alerts
useQuery({
  queryKey: ['alerts', 'snoozed'],
  queryFn: () => getSnoozedAlerts(),
})

// Mutation for snooze
useMutation({
  mutationFn: createSnoozedAlert,
  onSuccess: () => {
    // Invalidate alerts query
  }
})

// Mutation for wake (remove snooze)
useMutation({
  mutationFn: deleteSnoozedAlert,
  onSuccess: () => {
    // Invalidate alerts query
  }
})
```

### Step 6: Update Sidebar Badge

**File:** `apps/web/src/components/layout/Sidebar.tsx`

```typescript
// Display alert count in navigation
<NavItem to="/alerts">
  <BellIcon />
  <span>Alerts</span>
  {alertCount > 0 && <Badge>{alertCount}</Badge>}
</NavItem>

// alertCount from useAlerts query
```

### Step 7: Update Dashboard Alerts Summary

**File:** `apps/web/src/components/dashboard/AlertsSummary.tsx`

```typescript
// Show top 5-10 alerts
// Sorted by severity, then days remaining
// Click navigates to full Alerts page
```

### Step 8: Update Employee Table Status

**File:** `apps/web/src/components/shared/StatusBadge.tsx`

```typescript
// Status now includes computed status from certifications
// - All Valid
// - Warning
// - Alert
// - Expired
// - Inactif (employee inactive)
// - Inapte (medical unfit)
```

### Step 9: Create "Renew" Quick Action

**File:** `apps/web/src/routes/employees.$id.tsx`

```typescript
// Renew button on certification card
// Opens form pre-filled with:
// - Employee (locked)
// - Certification type (locked)
// - Category (for CACES, locked)
```

### Step 10: Add Periodic Alert Refresh

**File:** `apps/web/src/main.tsx`

```typescript
// If app is left open, refresh alerts daily
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries(['alerts'])
  }, 24 * 60 * 60 * 1000) // 24 hours

  return () => clearInterval(interval)
}, [])
```

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/lib/computeStatus.ts` | Create | Status computation logic |
| `apps/web/src/lib/snoozeLogic.ts` | Create | Snooze state logic |
| `apps/web/src/hooks/useAlerts.ts` | Create | TanStack Query hooks for alerts |
| `apps/web/src/routes/alerts.tsx` | Modify | Update with alert list + filters |
| `apps/web/src/routes/alerts.tsx` | Create | AlertFilters.tsx |
| `apps/web/src/components/alerts/AlertCard.tsx` | Create | Alert card component |
| `apps/web/src/components/alerts/SnoozeDialog.tsx` | Create | Snooze duration dialog |
| `apps/web/src/components/dashboard/AlertsSummary.tsx` | Modify | Add alert summary |
| `apps/web/src/components/layout/Sidebar.tsx` | Modify | Add alert count badge |
| `apps/web/src/components/shared/StatusBadge.tsx` | Modify | Update with computed status |
| `apps/web/src/hooks/useEmployeeStatus.ts` | Create | Employee status from certifications |

## Dependencies

- RFC-01 Data Model (SnoozedAlert table, computed status)
- RFC-02 Dashboard (Alerts page structure)
- TanStack Query Expert for optimization

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Alert computation performance | Only 1500 certs max, client-side is fine |
| Snooze state sync | DB is source of truth, query on mount |
| Missing document detection | Empty documentPath triggers alert always |

## Verification

After implementation:
1. Create certification expiring in 25 days → Alert appears
2. Create certification expiring in 55 days → Warning appears
3. Create certification without document → Missing Doc alert
4. Snooze an alert → It disappears, appears in "snoozed" filter
5. Sidebar badge shows correct count
6. Dashboard shows top 5-10 alerts

## Related

- [RFC-03: Alert System](../rfc/rfc-03-alert-system.md)
- [Plan - RFC-01: Data Model](./plan-01-data-model.md) (must complete first)
- [Plan - RFC-02: Dashboard](./plan-02-dashboard.md) (partial dependency)

## Status

- [ ] Step 1: Alert Computation Hook
- [ ] Step 2: Status Computation Logic
- [ ] Step 3: Snooze Logic
- [ ] Step 4: Alerts Page
- [ ] Step 5: TanStack Query Integration
- [ ] Step 6: Sidebar Badge
- [ ] Step 7: Dashboard Summary
- [ ] Step 8: Employee Status Update
- [ ] Step 9: Renew Quick Action
- [ ] Step 10: Periodic Refresh