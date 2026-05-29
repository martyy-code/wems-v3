# Implementation Plans

## Overview

Plans translate RFCs into actionable implementation steps.

## Plan Index

| Plan | RFC | Status | Priority | Dependencies |
|------|-----|--------|----------|--------------|
| [Plan-01: Data Model](./plan-01-data-model.md) | RFC-01 | in_progress | P0 | None (first) |
| [Plan-02: Dashboard](./plan-02-dashboard.md) | RFC-02 | pending | P1 | Plan-01 |
| [Plan-03: Alert System](./plan-03-alert-system.md) | RFC-03 | pending | P1 | Plan-01, Plan-02 |
| [Plan-04: Export System](./plan-04-export-system.md) | RFC-04 | pending | P2 | Plan-01, Plan-02 |

## Workflow

```
RFCs (What & Why)
    ↓
Plans (How)
    ↓
Tasks (Do)
```

## Plan Dependencies

```
Plan-01 (Data Model) ──┬──→ Plan-02 (Dashboard)
                      │
                      └──→ Plan-03 (Alert System) ──→ [End]
                      │
                      └──→ Plan-04 (Export System) ──→ [End]
```

## Current Status

- **Plan-01:** In progress (started 2026-05-26)
- **Plan-02, 03, 04:** Pending (waiting for Plan-01)

## Related

- [RFC Overview](../rfc/) - All RFCs
- [Task Board](../../.claude/tasks/) - Implementation tasks