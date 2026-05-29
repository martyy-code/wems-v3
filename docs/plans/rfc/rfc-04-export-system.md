---
name: RFC-04 Export System
description: CSV/XLSX export functionality for employee and certification data
status: approved
author: Head of Product
created: 2026-05-26
---

# RFC-04: Export System

## Summary

This RFC defines the data export functionality for WEMS. The export system allows the warehouse manager to extract employee and certification data for sharing with colleagues, regulatory audits, backup purposes, or use in other tools. Exports are generated in standard formats (XLSX and CSV) that work with common software like Microsoft Excel and Google Sheets.

---

## Context and Use Cases

The warehouse manager works in an environment where information sharing is important but technology comfort is limited. They need to:

1. **Share with HR** — Send a list of certifications expiring this month
2. **Prepare for audit** — Provide documentation of employee qualifications
3. **Backup data** — Create periodic backups of the database
4. **Share with external parties** — Give contractors or clients proof of employee qualifications

The export system must be:
- **Simple** — One or two clicks to export
- **Flexible** — Support different scopes (all, filtered, selected)
- **Compatible** — Output formats work in standard software
- **Complete** — Export includes all relevant information

### What This System Is NOT

- A reporting system (no built-in charts or dashboards)
- A PDF generator (PDF support is future enhancement)
- A scheduled automation (manual export only)
- A cloud backup (exports are local files)

---

## Export Formats

### XLSX (Primary Format)

**What it is:** Microsoft Excel format, the standard for business spreadsheets.

**Why primary:**
- Native Excel format maintains formatting
- Multiple worksheets in a single file
- Column widths and formatting preserved
- Familiar to the user
- Compatible with Excel, Google Sheets, LibreOffice

**File extension:** `.xlsx`

### CSV (Secondary Format)

**What it is:** Comma-separated values, a universal text format.

**Why secondary:**
- Opens in any spreadsheet software
- Works with tools that don't support Excel
- Useful for data import/export with other systems
- Smaller file size
- Plain text (no formatting)

**File extension:** `.csv`

**Limitation:**
- Single worksheet only
- No formatting
- Dates may need formatting after import

### Why Both?

The manager may receive requests in different contexts:
- "Can you send me that as an Excel file?" → XLSX
- "I need to import this into our system" → CSV

Having both options covers both scenarios without requiring the user to convert formats.

---

## Export Types

WEMS supports four distinct export scenarios, each serving a different purpose:

### 1. Global Export (All Data)

**What it is:** Complete export of everything in the database.

**When to use:**
- Periodic backup
- Initial setup verification
- Sending complete data to auditors

**What's included:**
- All active employees
- All inactive employees (for audit trail)
- All certifications (current and historical)

**Output structure:**
- Single file with multiple worksheets
- "Employees" worksheet
- "Certifications" worksheet
- Worksheets are linked by employee number

**File name:** `wems-export-2026-05-26.xlsx`

### 2. Filtered Export

**What it is:** Export of data currently visible after applying table filters.

**When to use:**
- "Show me employees at Warehouse Paris" → filter by Paris → export filtered
- "Show me employees with expired certifications" → filter by status → export filtered
- "Send me the list for the audit on Thursday"

**What's included:**
- Only employees matching current filters
- All certifications for those employees

**Output structure:** Same as global (multi-sheet XLSX or single-sheet CSV)

**File name:** `wems-export-filtered-2026-05-26.xlsx`

**How filters interact with export:**
- Text search filters apply
- Dropdown filters apply
- Status filters apply
- Pagination does NOT affect export (all matching records)

### 3. Selection Export

**What it is:** Export of specific rows selected by checkbox.

**When to use:**
- Selecting 3-5 specific employees from a large list
- Creating a targeted report for a specific purpose
- Selecting employees for a specific project

**What's included:**
- Only selected employees
- All certifications for those employees

**Output structure:** Same as global

**File name:** `wems-export-selection-2026-05-26.xlsx`

**How selection works:**
- Checkbox column in employee table
- "Select all" option in header
- Selected count shown: "5 selected"
- Export button becomes available when rows are selected

### 4. Individual Employee Export

**What it is:** Single-employee data export from the employee table or detail page.

**When to use:**
- Sharing one employee's qualification history
- Providing documentation for a specific person
- Creating a personal record backup

**What's included:**
- Single employee record
- All certifications for that employee (current and historical)

**Output structure:**
- Single employee worksheet
- Certifications worksheet
- Clean, focused document

**File name:** `wems-employee-001-jean-dupont-2026-05-26.xlsx`

**Documents in individual export:**
- Document references are NOT included in the export file
- Employees wishing to share physical documents must do so separately
- Export serves as an index; documents remain in the application

---

## Export Modal Flow

### Step 1: User Initiates Export

User clicks the "Export" button in:
- Dashboard header (for global/filtered/selection)
- Employee table row actions (for individual)

### Step 2: Modal Opens

```
┌────────────────────────────────────────────┐
│  Export Data                                │
│                                             │
│  Scope:                                     │
│  ○ All employees                           │
│  ○ Filtered (current view: 47 employees)  │
│  ○ Selected (3 employees selected)         │
│                                             │
│  Format:                                    │
│  ● XLSX (recommended)                     │
│  ○ CSV                                     │
│                                             │
│  [Cancel]              [Export]             │
└────────────────────────────────────────────┘
```

**Dynamic options:**
- If no filters active, "Filtered" option shows 0 employees and is disabled
- If no rows selected, "Selected" option shows 0 and is disabled
- Selected options are only available when they have data

### Step 3: User Configures and Confirms

1. User selects scope (or accepts default "All")
2. User selects format (or accepts default "XLSX")
3. User clicks "Export"

### Step 4: File Generated and Downloaded

1. Application generates file client-side
2. Browser download dialog opens
3. File saves to user's downloads folder
4. Success toast: "Export complete. File saved."

**Why client-side generation?**
- No server round-trip (faster)
- Works offline
- No server-side file storage needed
- Simpler architecture

---

## Employee Worksheet Structure

Both global/filtered and individual exports include an "Employees" worksheet:

| Column | Description | Example |
|--------|-------------|---------|
| Employee Number | Auto-generated unique ID | EMP-001 |
| First Name | Employee first name | Jean |
| Last Name | Employee last name | Dupont |
| Email | Email address (empty if not provided) | jean@example.com |
| Phone | Phone number (empty if not provided) | 06 12 34 56 78 |
| Arrival Date | Date employee joined | 2023-01-15 |
| Contract Type | CDI, CDD, Intérim, Alternance | CDI |
| Warehouse | Current warehouse name | Paris |
| Role | Job title | Cariste |
| Status | Active or Inactive | Active |

### Data Quality Considerations

| Scenario | How handled |
|----------|-------------|
| Missing optional field | Empty cell |
| Missing required field | Should never happen (form validation) |
| Special characters in name | Properly escaped |
| Long text | Wrapped in cell |
| Dates | ISO format (YYYY-MM-DD) for consistency |

---

## Certifications Worksheet Structure

The "Certifications" worksheet provides detail on each certification:

| Column | Description | Example |
|--------|-------------|---------|
| Employee Number | Link to employee | EMP-001 |
| Employee Name | Full name (for readability) | Jean Dupont |
| Certification Type | CACES R489, Medical, Training, Authorization | CACES R489 |
| Category | Subtype (empty if not applicable) | C3 |
| Obtained Date | When certification was earned | 2021-06-15 |
| Expiration Date | When certification expires | 2026-06-15 |
| Status | Computed status at export time | Valid |
| Days Until Expiration | Numeric countdown | 365 |
| Document Attached | Yes or No | Yes |

### Additional Columns by Type

**CACES R489:**
- R489 Category: 1a, 1b, 2b, 3, 4, 5, 6, 7

**Medical Visit:**
- Visit Type: Embauche, Périodique, Reprise, Spécifique
- Result: Apte, Apte avec restrictions, Inapte
- Visit Date: When the visit occurred

**Online Training:**
- Training Date: When training was completed

**Driving Authorization:**
- No additional columns (uses base certification fields)

---

## Linking Between Worksheets

Employees and Certifications worksheets are linked by "Employee Number."

In Excel:
- User can use VLOOKUP/INDEX-MATCH to combine data
- Example: Find all certifications for employee EMP-001

In practice:
- Most users will simply scroll through both sheets
- The employee name is included in the certifications sheet for easier reading

---

## Implementation Details

### Libraries

**For XLSX generation:**
- `xlsx` package (SheetJS) — Industry standard, well-maintained, excellent browser support

**For CSV generation:**
- Native JavaScript — No library needed, simple string building with proper escaping

### Client-Side Generation Process

```
1. User clicks Export
2. Modal opens, user configures options
3. User confirms
4. Application queries data from local state/database
5. Data transformed into worksheet format
6. XLSX/CSV library generates file blob
7. Blob converted to download URL
8. Browser download triggered
9. Success confirmation shown
```

**Typical performance:**
- 500 employees, 2000 certifications → ~2-3 seconds
- Progress indicator shown for large exports

### File Naming Convention

| Export Type | Pattern | Example |
|-------------|---------|---------|
| Global | `wems-export-YYYY-MM-DD.ext` | wems-export-2026-05-26.xlsx |
| Filtered | `wems-export-filtered-YYYY-MM-DD.ext` | wems-export-filtered-2026-05-26.xlsx |
| Selection | `wems-export-selection-YYYY-MM-DD.ext` | wems-export-selection-2026-05-26.xlsx |
| Individual | `wems-employee-{number}-{name}-YYYY-MM-DD.ext` | wems-employee-001-jean-dupont-2026-05-26.xlsx |

**Name sanitization:**
- Spaces converted to hyphens
- Special characters removed
- Lowercase for consistency

---

## Export in Context: Common Workflows

### Workflow: Audit Preparation

1. Manager opens WEMS
2. Applies filter: Status = Expired, Alert, Warning
3. Reviews filtered list
4. Clicks Export → Filtered
5. Opens XLSX in Excel
6. Adds header row formatting for professional appearance
7. Sends to auditor

### Workflow: HR Reporting

1. HR asks: "List of all employees with contract type"
2. Manager opens WEMS
3. No filters needed (all employees)
4. Clicks Export → All
5. Opens XLSX
6. Deletes Certifications worksheet (not needed)
7. Saves as new file for HR
8. Sends to HR

### Workflow: Backup

1. Manager decides to create monthly backup
2. Opens WEMS on the first of the month
3. Clicks Export → All
4. Saves file with date in filename
5. Stores in a designated backup folder
6. Previous month's backup moved to archive

---

## Future Enhancement: PDF Export

While XLSX/CSV covers most needs, future versions could add PDF:

**Use cases for PDF:**
- Formal audit reports
- Employee qualification cards
- Printed documentation

**Implementation would require:**
- PDF generation library (e.g., jsPDF, react-pdf)
- Template design for professional appearance
- Page layout consideration

---

## Future Enhancement: Scheduled Exports

Currently, exports are manual. Future versions could add automation:

**Use cases:**
- Weekly email with expiring certifications
- Monthly backup to cloud storage
- Automated reports to stakeholders

**Implementation would require:**
- Background job scheduling
- Email service integration
- Cloud storage integration (Dropbox, Google Drive)

---

## Error Handling

### Large Export Warning

If export exceeds 10,000 rows, show warning:
"This export contains a large amount of data (X rows). Generation may take a moment."

### Generation Failure

If export fails (unexpected error):
- Show error toast: "Export failed. Please try again."
- Log error for debugging
- User can retry

### Empty Export

If export scope results in 0 records:
- Show warning: "No data matches your current filters."
- Prevent generation of empty file

---

## Security and Privacy

**Data in exports:**
- Contains employee personal information (names, contact details)
- Contains certification status and dates
- Does NOT contain passwords or sensitive authentication data

**Handling recommendations:**
- Exported files should be stored securely
- Don't email exports over unencrypted channels
- Delete export files when no longer needed
- Password-protect sensitive exports (optional feature)

---

## Open Questions

None — all decisions have been made through product discovery.

---

## Related

- [RFC-01: Data Model](./rfc-01-data-model.md)
- [RFC-02: Dashboard & Navigation](./rfc-02-dashboard-navigation.md)
- [RFC-03: Alert System](./rfc-03-alert-system.md)
