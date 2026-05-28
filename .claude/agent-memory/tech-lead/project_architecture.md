---
name: WEMS Project Architecture
description: Tech architecture decisions, patterns, and conventions for WEMS
type: project
---

# WEMS Project Architecture

## Overview

WEMS (Warehouse Employee Management System) is an Electron desktop application for tracking employee certifications. It follows a local-first, single-user architecture with future multi-user support in mind.

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Desktop Shell | Electron 35 | Cross-platform desktop |
| Frontend | TanStack Start + React 19 | UI renderer |
| API Layer | oRPC | Type-safe RPC |
| Database | Drizzle + better-sqlite3 | Local SQLite |
| State | TanStack Query | Data fetching/caching |
| UI Components | Radix UI + shadcn | Accessible components |
| Tables | TanStack Table | Filterable/sortable tables |

## Architecture Pattern

```
┌─────────────────────────────────────────────┐
│  Desktop Main Process                       │
│  - owns database access                      │
│  - handles file storage                      │
│  - exposes oRPC server                       │
└─────────────────────────────────────────────┘
                    │ IPC
┌─────────────────────────────────────────────┐
│  Desktop Renderer (TanStack Start)          │
│  - React UI                                 │
│  - oRPC client                              │
│  - TanStack Query for state                 │
└─────────────────────────────────────────────┘
```

## Key Patterns

### oRPC over REST
All data operations go through oRPC procedures. No direct database access from frontend.
- Input validation via Zod
- Type-safe contracts
- Procedures: ping, createUser, getUsers, getUserById, deleteUser

### Append-Only Certifications
Certifications are NEVER updated — always create a new entry.
- Preserves audit trail
- Historical data intact
- Renewal creates new certification with new expiration

### Soft Delete (isActive)
Employees use `isActive` flag instead of hard delete.
- Inactive employees hidden from daily views
- Historical data preserved for audits
- Reactivation possible

### Client-Side Alert Computation
Alerts computed in-browser, not stored in DB.
- Computed on app load
- Re-computed on certification changes
- Re-computed on threshold changes
- Sufficient for < 500 employees

## Database Conventions

- UUIDs for primary keys
- Always include `createdAt` and `updatedAt` timestamps
- Soft delete pattern for employees
- Document storage: files in app data dir, references in DB

## Project Structure

```
apps/
├── desktop/           # Electron main process
│   └── src/
│       ├── main/      # Main process entry
│       └── preload/   # Preload scripts for IPC
└── web/               # TanStack Start frontend
    └── src/
        ├── components/
        ├── routes/
        ├── hooks/
        └── lib/

packages/
├── api/               # oRPC router and procedures
├── db/                # Drizzle schema, queries, migrations
└── sdk/               # Shared types (re-exports from api)
```

## Why This Architecture

**User Experience First**: Simple, obvious, forgiving interface for a single non-technical manager.

**Local-First**: All data stays on user's machine. No cloud dependencies for v1.

**Single Source of Truth**: Database schemas, Zod validation, and oRPC types are synchronized.

**Performance for Scale**: Architecture supports future multi-user without rework.

**Maintainability**: Clean code, comprehensive tests, clear documentation.

## Current State (2026-05-26)

- Template complete, ready for feature development
- Current DB schema is template schema (users/posts), needs update for WEMS entities
- 4 RFCs in draft status awaiting implementation
- No releases made yet

## Related
- [rfc_review.md](rfc_review.md) — RFC status and review notes