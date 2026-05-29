---
name: RFC-03 Alert System
description: In-app alert system for certification expirations and missing documents
status: approved
author: Head of Product
created: 2026-05-26
---

# RFC-03: Alert System

## Summary

This RFC defines the in-app alert system for WEMS. Alerts notify the warehouse manager of certification issues requiring attention: expirations approaching, certifications that have expired, and certifications missing physical documentation. The system is designed to be informative without being overwhelming, with a clear prioritization that helps the user focus on what matters most.

---

## Context and Purpose

The core job of WEMS is compliance tracking. The manager needs to know:
- Before a certification expires: "Renew this before it becomes a problem"
- When a certification expires: "This person cannot work until renewed"
- When documentation is missing: "Physical proof exists but isn't in the system"

Alerts bridge the gap between "data in the system" and "action required by the user."

### What This System Is NOT

This is not a notification system for real-time events. The app does not:
- Send emails or push notifications
- Alert employees directly
- Integrate with external calendars
- Provide SMS reminders

This is a local, in-app alert system that surfaces information when the user opens the application.

---

## Alert Types

There are three types of alerts, each with a specific purpose:

### 1. Alert (Critical)

**When triggered:** The certification expires within the next 30 days (configurable).

**What it means:** Immediate attention required. The certification will expire soon, and the employee may become unable to work. Renewal should be scheduled now.

**Visual treatment:**
- Color: Red
- Icon: 🔴
- Badge in sidebar: Red background

**Example message:**
"CACER R489 C3 expires in 23 days for Jean Dupont"

### 2. Warning (Medium)

**When triggered:** The certification expires within the next 60 days (configurable), but more than 30 days out.

**What it means:** Plan ahead. While not urgent, renewal should be planned to avoid hitting the Alert stage.

**Visual treatment:**
- Color: Orange
- Icon: ⚠️
- Badge in sidebar: Orange background

**Example message:**
"Medical Visit expires in 52 days for Marie Martin"

### 3. Missing Document (Informational)

**When triggered:** A certification exists in the system but has no attached document.

**What it means:** Physical proof of the certification hasn't been digitized. For compliance purposes, the manager should attach the document when possible.

**Visual treatment:**
- Color: Yellow
- Icon: 📄
- Badge in sidebar: Yellow background

**Example message:**
"CACER R489 C3 for Pierre Durand has no attached document"

**Why is this informational, not critical?**

While having the document is important for audits, the certification itself may still be valid. The alert serves as a reminder to digitize the document, not as a blocker.

**Important:** There is NO "document not required" scenario. A missing document always triggers the alert. The alert persists until the document is attached.

---

## Why These Three Types?

The alert system prioritizes clarity over comprehensiveness. Having three types allows clear mental categorization:

| Type | Urgency | Action Required |
|------|---------|-----------------|
| Alert | Now | Schedule renewal immediately |
| Warning | Soon | Plan renewal |
| Missing Doc | When convenient | Digitize and attach document |

More types would create decision paralysis. Fewer types would lose important distinctions.

---

## Alert Display Locations

Alerts appear in three places within the application:

### 1. Sidebar Badge

The sidebar always shows the count of active alerts next to the "Alerts" navigation item.

```
┌─────────┐
│ 🔔 Alerts│
│    (12) │
└─────────┘
```

**Why this location?**

The sidebar is always visible. A badge with a number provides constant awareness without requiring the user to check anywhere. It's similar to notification badges on mobile apps.

**What counts as "active"?**
- Alert type (red)
- Warning type (orange)
- Missing document type (yellow)

### 2. Dashboard Alerts Summary

The Dashboard home page shows a condensed view of the most urgent alerts.

**What's shown:**
- Top 5-10 alerts, prioritized:
  1. Expired (past expiration date)
  2. Alert (within alert threshold)
  3. Warning (within warning threshold)
  4. Missing document

**Why a summary, not the full list?**

The dashboard should provide immediate situational awareness. Showing the 5 most urgent items gives the user a quick status check. If they see more than expected, they can click through to the full Alerts page.

**Interaction:**
- Clicking an alert card navigates to the Alerts page
- "View all alerts" link at the bottom if count exceeds the summary limit

### 3. Alerts Page (Full List)

The dedicated Alerts page shows every active alert with full filtering and action capabilities.

This is the destination when the user needs to:
- See the complete picture
- Filter alerts by specific criteria
- Take action on multiple alerts
- Review snoozed alerts

---

## Alerts Page Deep Dive

### Page Layout

```
┌─────────────────────────────────────────────────────┐
│  🔔 Alerts                    [Filter] [Snoozed ▶] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔴 CACER R489 C3 expires in 23 days       │   │
│  │     Jean Dupont | Warehouse Paris           │   │
│  │     [Go to Employee] [Snooze] [Renew]       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔴 Medical Visit expires in 8 days         │   │
│  │     Marie Martin | Warehouse Lyon           │   │
│  │     [Go to Employee] [Snooze] [Renew]       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  ⚠️ CACER R489 C1 expires in 45 days       │   │
│  │     Pierre Durand | Warehouse Paris          │   │
│  │     [Go to Employee] [Snooze] [Renew]       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ... more alerts ...                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Filtering Options

The Alerts page supports filtering to help users find specific alerts:

| Filter | Options |
|--------|---------|
| Alert Type | Alert, Warning, Missing Document |
| Certification Type | CACER R489, Medical, Training, Authorization |
| Employee | Search/select specific employee |
| Warehouse | Dropdown of warehouses |

### Alert Card Actions

Each alert card has three actions:

**Go to Employee**
- Navigates to the Employee Detail page
- Shows the relevant certification
- Allows full context review

**Snooze**
- Temporarily hides the alert
- Shows snooze duration options: 7 days, 30 days, custom
- Alert returns after snooze period expires

**Renew (or Add Certification)**
- Opens the certification creation form
- Pre-fills the employee
- Pre-selects the certification type
- Allows quick renewal without navigation

---

## Alert Actions Deep Dive

### Mark as Resolved

**What it does:**
Removes the alert from the active list.

**When to use:**
- The employee has renewed the certification (manually, outside the app)
- The certification is no longer relevant (employee left the role)
- The user acknowledges the alert and doesn't want to see it

**Behavior:**
- Alert disappears from the Dashboard summary
- Alert disappears from the Alerts page
- Alert does NOT appear in filtered "snoozed" view
- This is a terminal state

### Snooze

**What it does:**
Temporarily hides the alert for a specified duration.

**Duration options:**
| Option | When to Use |
|--------|-------------|
| 7 days | Renewal is scheduled within a week |
| 30 days | Renewal is in progress, follow-up needed later |
| Custom | Specific date (e.g., "until next Monday") |

**Behavior:**
- Alert disappears from Dashboard summary
- Alert disappears from default Alerts view
- Alert APPEARS when "Show snoozed" filter is active
- Alert automatically reappears after snooze period

**Cancelling snooze:**
- User can view snoozed alerts and "Wake" them
- Waking restores the alert to active state

### Go to Employee

**What it does:**
Navigates directly to the Employee Detail page, with the relevant certification highlighted.

**Why this matters:**
Reduces friction. Instead of:
1. Remembering who the alert is about
2. Going to Employees list
3. Finding the employee
4. Scrolling to find the certification

The user can go directly to context.

### Add/Edit Certification

**What it does:**
Opens the certification form with pre-filled values.

**Pre-filled for renewal:**
- Employee (locked)
- Certification type (locked)
- Category (if CACES)

**User fills:**
- Obtained date
- Expiration date
- Document (upload)

**On submit:**
- New certification created
- Old certification remains in history
- Alert automatically resolves

---

## Alert Lifecycle

Alerts have a simple state machine:

```
[Created]
    │
    ├─→ [Active] ──→ [Snoozed] ──→ [Active] (after snooze)
    │       │
    │       └─→ [Resolved]
    │
    └─→ [Never created] (if certification never enters threshold)
```

### States Explained

| State | Dashboard | Alerts Page (default) | Alerts Page (with filter) |
|-------|-----------|----------------------|--------------------------|
| Active | ✓ | ✓ | ✓ |
| Snoozed | ✗ | ✗ | ✓ |
| Resolved | ✗ | ✗ | ✗ |

### State Transitions

**Active → Snoozed:**
- User clicks Snooze and selects duration

**Snoozed → Active:**
- Snooze period expires (automatic)
- User manually wakes the alert

**Active → Resolved:**
- User clicks "Mark as resolved"
- Certification is renewed (automatic)

**Why no "read/unread" distinction?**

This is a single-user application. There's no benefit to tracking whether the user has "seen" an alert. An alert is either something requiring action (Active) or not (Snoozed/Resolved).

---

## Threshold Configuration

Alert and warning thresholds are configurable per certification type.

### Default Values

| Certification Type | Alert Threshold | Warning Threshold |
|-------------------|-----------------|-------------------|
| CACES R489 | 30 days | 60 days |
| Medical Visit | 30 days | 60 days |
| Online Training | 30 days | 60 days |
| Driving Authorization | 30 days | 60 days |

### Why Configurable?

Different certifications have different practical timelines:

**Medical Visits**
- Scheduling can take 2-4 weeks
- Some companies require annual visits
- 30 days might be too short
- Suggested: Alert at 45 days, Warning at 60 days

**CACES Training**
- Often available within days
- Quick certification process
- 30 days is typically sufficient
- Keep defaults

**Online Training**
- Depends on course availability
- Some are self-paced, others scheduled
- 30-60 days is reasonable
- Keep defaults

### How Thresholds Work

Thresholds are applied based on `expirationDate`:

```
daysUntilExpiration = expirationDate - today

IF daysUntilExpiration <= alertDays:
    status = "Alert"
ELSE IF daysUntilExpiration <= warningDays:
    status = "Warning"
ELSE:
    status = "Valid"
```

Thresholds are applied per-certification, using the threshold configured for that certification's type.

---

## Implementation: Computed vs. Stored

**Key decision: Alerts are computed, not stored.**

When the application loads, it:
1. Fetches all employees with active status
2. Fetches all certifications
3. For each certification, computes the status based on expiration date and threshold
4. Generates alert objects from the computed statuses
5. Renders alerts based on computed state

**Why computed?**

| Stored Approach | Computed Approach |
|-----------------|------------------|
| Alert records exist in DB | No alert records in DB |
| Must update on every date change | Automatically current |
| Need background job to update | Computed on load |
| Can track alert history | No historical tracking |
| More complex | Simpler |

**Trade-off:**
Computed alerts don't persist. If the app isn't opened for a week, there's no record of what alerts existed. For a single-user app where the user opens the app daily, this is acceptable.

**When computation happens:**
- On app load
- On any certification create/update/delete
- On threshold configuration change
- Daily check if app is left open (timer-based)

---

## Performance Considerations

**Computing alerts for 500 employees:**

Assuming each employee has an average of 3 certifications:
- 1,500 certification records to evaluate
- Simple date comparison (fast)
- Expected time: < 50ms

**Client-side computation is sufficient.**

No need for:
- Server-side alert generation
- Background workers
- Scheduled jobs
- Alert database tables (except SnoozedAlert)

---

## SnoozedAlert Table

Since alerts are computed but snooze state must persist, a lightweight table stores snooze information:

```typescript
SnoozedAlert {
  id: UUID,           // Primary key
  employeeId: UUID,   // Links to employee
  certificationId: UUID, // Links to certification
  snoozedUntil: DateTime // When snooze expires
}
```

**Behavior:**
- When user snoozes an alert → create SnoozedAlert record
- When alert is renewed or manually resolved → delete SnoozedAlert record
- When snoozedUntil passes → SnoozedAlert is ignored (alert recomputes as active)
- Periodic cleanup job can remove expired SnoozedAlert records

**Why not LocalStorage?**
- LocalStorage doesn't persist across sessions or devices
- Snooze state must survive app restarts
- Database storage is appropriate for this small dataset

---

## Future Enhancement: Notifications

The current system is in-app only. Future versions could add:

### Email Notifications
- Daily digest of alerts
- Weekly summary
- Individual alert emails (for urgent items)

**Implementation would require:**
- Email configuration in Settings
- Email service integration
- Scheduled job to send emails

### Desktop Notifications
- Native OS notifications
- Triggered when app is minimized
- Shows alert count

**Implementation would require:**
- Electron notification API
- Permission request on first use

### Calendar Integration
- Create calendar event for expiration date
- Suggest renewal date based on threshold

**Implementation would require:**
- Calendar service integration (Google Calendar, Outlook)
- User authorization

---

## Edge Cases

### Certification with No Expiration Date

If `expirationDate` is null, status is "Unknown."

**What happens:**
- No alert generated
- Shows "?" in the UI
- Does not count toward "All Valid" status

**User should:**
- Set an expiration date if known
- Leave blank only if expiration is truly indefinite

### Multiple Certifications, Some Expired

If an employee has 5 certifications and 1 is expired:
- Status shows "Expired" (most severe wins)
- Dashboard alert generated for that certification
- Other certifications remain in their own states

### Employee Deactivated

When an employee is deactivated:
- All their certification alerts disappear
- The certifications remain in the database
- Alerts can be regenerated if employee is reactivated

### Certification Renewed

When a new certification is created (renewal):
- Old certification: status remains based on its expiration date
- New certification: computed status based on its expiration date
- Old alert for expired certification resolves automatically

---

## Open Questions

None — all decisions have been made through product discovery.

---

## Related

- [RFC-01: Data Model](./rfc-01-data-model.md)
- [RFC-02: Dashboard & Navigation](./rfc-02-dashboard-navigation.md)
- [RFC-04: Export System](./rfc-04-export-system.md)
