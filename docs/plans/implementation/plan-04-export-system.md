---
name: Plan - RFC-04 Export System
description: Implementation plan for WEMS data export functionality
status: pending
rfc: rfc-04-export-system
priority: p2
created: 2026-05-26
---

# Plan: RFC-04 Export System Implementation

## Overview

This plan defines the implementation of the WEMS export system. It covers XLSX and CSV export for employees and certifications with multiple export scopes.

## Prerequisites

- RFC-01 Data Model must be complete
- RFC-02 Dashboard must be complete (table structure, row selection)

## Implementation Steps

### Step 1: Install XLSX Library

**Command:**
```bash
pnpm add xlsx -w apps/web
```

**Version:** Latest stable (SheetJS)

### Step 2: Create Export Utilities

**File:** `apps/web/src/lib/export.ts`

```typescript
import * as XLSX from 'xlsx'

// Export types
type ExportFormat = 'xlsx' | 'csv'
type ExportScope = 'all' | 'filtered' | 'selection' | 'individual'

// XLSX generation
function generateXLSX(
  employees: Employee[],
  certifications: Certification[],
  format: 'multi-sheet' | 'single-sheet'
): Blob

// CSV generation
function generateCSV(
  employees: Employee[],
  certifications: Certification[]
): Blob

// File download
function downloadFile(blob: Blob, filename: string): void

// Date formatting
function formatDateISO(date: Date): string

// Name sanitization
function sanitizeFilename(name: string): string
```

### Step 3: Create Export Service

**File:** `apps/web/src/lib/exportService.ts`

```typescript
// Map data to export format
function prepareEmployeeExport(employees: Employee[]): EmployeeExportRow[]
function prepareCertificationExport(certs: Certification[]): CertificationExportRow[]

// XLSX structure for multi-sheet export
function createWorkbook(
  employees: Employee[],
  certifications: Certification[]
): XLSX.WorkBook {
  // Sheet 1: Employees
  // - Employee Number, First Name, Last Name, Email, Phone,
  // - Arrival Date, Contract Type, Warehouse, Role, Status

  // Sheet 2: Certifications
  // - Employee Number, Employee Name, Certification Type, Category,
  // - Obtained Date, Expiration Date, Status, Days Until Expiration,
  // - Document Attached
  // - Plus type-specific columns (CACES category, Medical result, etc.)

  return workbook
}

// Single employee export
function createEmployeeExport(
  employee: Employee,
  certifications: Certification[]
): XLSX.WorkBook
```

### Step 4: Create Export Modal

**File:** `apps/web/src/components/export/ExportModal.tsx`

```typescript
interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: ExportScope
  employeesInScope: number
  onExport: (format: ExportFormat) => void
}
```

**UI:**
- Scope selection (radio buttons)
  - All employees (count)
  - Filtered (count) - disabled if no filters
  - Selected (count) - disabled if no selection
- Format selection (radio buttons)
  - XLSX (recommended)
  - CSV
- Export / Cancel buttons

### Step 5: Create Export Button Components

**Directory:** `apps/web/src/components/export/`

1. **ExportButton.tsx**
   - Top bar export button
   - Opens ExportModal with current scope

2. **ExportSelectionButton.tsx**
   - Shows when rows selected: "5 selected [Export]"
   - Opens ExportModal with selection scope

3. **ExportRowAction.tsx**
   - Row action in employee table
   - Opens individual employee export

### Step 6: Add Selection State to Employee Table

**File:** `apps/web/src/components/employee/EmployeeTable.tsx`

```typescript
// Selection state
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

// Checkbox column
{
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllRowsSelected()}
      onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
    />
  ),
}

// Selection count display
{selectedIds.size > 0 && (
  <span>{selectedIds.size} selected</span>
)}
```

### Step 7: Add Progress Indicator

**File:** `apps/web/src/components/export/ExportProgress.tsx`

```typescript
interface ExportProgressProps {
  isExporting: boolean
  progress?: number // 0-100
  message?: string
}

// Shown for large exports (> 1000 rows)
```

### Step 8: Integrate with TanStack Table

**File:** `apps/web/src/routes/employees.tsx`

```typescript
// Get filtered rows for export
const filteredRows = table.getFilteredRowModel().rows

// Get selected rows for export
const selectedRows = table.getSelectedRowModel().rows

// Pass to ExportModal
<ExportModal
  scope="filtered"
  employeesInScope={filteredRows.length}
/>
```

### Step 9: Add Error Handling

**File:** `apps/web/src/lib/exportService.ts`

```typescript
// Large export warning (> 10,000 rows)
function checkExportSize(rows: number): boolean {
  if (rows > 10000) {
    throw new Error('EXPORT_TOO_LARGE')
  }
  return true
}

// Empty export handling
function validateExportData(employees: Employee[]): void {
  if (employees.length === 0) {
    throw new Error('NO_DATA')
  }
}
```

### Step 10: Add Large Export Warning

**File:** `apps/web/src/components/export/ExportModal.tsx`

```typescript
// If employeesInScope > 10000
// Show warning before export
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Large Export Warning</AlertDialogTitle>
      <AlertDialogDescription>
        This export contains {employeesInScope} rows.
        Generation may take a moment.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleExport}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `packages/db/package.json` | Modify | Add xlsx dependency |
| `apps/web/src/lib/export.ts` | Create | Export utility functions |
| `apps/web/src/lib/exportService.ts` | Create | Data transformation |
| `apps/web/src/components/export/ExportModal.tsx` | Create | Export configuration modal |
| `apps/web/src/components/export/ExportButton.tsx` | Create | Top bar export button |
| `apps/web/src/components/export/ExportSelectionButton.tsx` | Create | Selection export button |
| `apps/web/src/components/export/ExportRowAction.tsx` | Create | Row action export |
| `apps/web/src/components/export/ExportProgress.tsx` | Create | Progress indicator |
| `apps/web/src/components/employee/EmployeeTable.tsx` | Modify | Add selection column |
| `apps/web/src/routes/index.tsx` | Modify | Integrate export button |
| `apps/web/src/routes/employees.tsx` | Modify | Add selection + export |

## Dependencies

- RFC-01 Data Model (employee/certification types)
- RFC-02 Dashboard (table structure, filtering)
- xlsx library

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Memory issues with large exports | Stream generation, progress indicator |
| Date formatting in Excel | Store as actual date objects, not strings |
| Special characters in names | Proper escaping via xlsx library |

## Verification

After implementation:
1. Export all employees → XLSX with 2 worksheets
2. Filter by warehouse → Export filtered → Only Paris employees
3. Select 3 rows → Export selection → Only 3 employees
4. Open individual employee → Export → Single employee file
5. Export as CSV → Single worksheet format
6. Large export (> 10000 rows) → Shows warning

## Related

- [RFC-04: Export System](../rfc/rfc-04-export-system.md)
- [Plan - RFC-01: Data Model](./plan-01-data-model.md) (must complete first)
- [Plan - RFC-02: Dashboard](./plan-02-dashboard.md) (must complete first)

## Status

- [ ] Step 1: Install XLSX Library
- [ ] Step 2: Create Export Utilities
- [ ] Step 3: Create Export Service
- [ ] Step 4: Create Export Modal
- [ ] Step 5: Export Button Components
- [ ] Step 6: Add Selection State
- [ ] Step 7: Add Progress Indicator
- [ ] Step 8: Integrate with TanStack Table
- [ ] Step 9: Add Error Handling
- [ ] Step 10: Large Export Warning