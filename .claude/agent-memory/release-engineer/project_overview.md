---
name: project_overview
description: WEMS - Electron desktop app for tracking warehouse employee licenses
type: project
---

# Project: WEMS - Warehouse Employee Management System

## What is WEMS?
WEMS is a **small Electron desktop application** for tracking employee driving and operating licenses for a warehouse environment.

## Core Purpose
Single depot manager tracks employee certification status and expiration alerts.

## User Profile
- **User count:** 1 person
- **Role:** Depot/warehouse manager
- **Tech comfort:** Low — Excel level
- **Primary goal:** Dashboard showing who can/cannot operate equipment
- **Key need:** Expiration alerts

## Monorepo Structure
```
apps/
├── desktop/     # Electron desktop app
└── web/         # TanStack Start web app (embedded in desktop)

packages/
├── api/         # oRPC server router
├── db/          # Drizzle ORM with better-sqlite3
└── sdk/         # Shared SDK (re-exports API types)
```

## Core Entities
1. **Employees** - Workers with contract types (CDI, CDD, Intérim, Alternance) and roles (Cariste, Préparateur de commandes)
2. **Certifications** - CACES, Medical Visits, Online Training, Driving Authorizations
3. **Warehouses** - Physical locations where employees work

## Build & CI Stack
| Tool | Version |
|------|---------|
| Electron | 35.0.0 |
| electron-vite | 5.0.0 |
| electron-builder | 26.8.1 |
| pnpm | 9 (CI) |
| better-sqlite3 | 12.10.0 |

**Product name:** WEMS
**GitHub repo:** https://github.com/wareflowx/wems-v3

**Project Status:** Pre-release — no releases have been made yet. Project is in early development.

**Why:** Electron 35 + electron-vite 5 + electron-builder 26 is the current stable stack for this template.

**How to apply:** All release-related decisions should consider the build tooling version constraints.

## Native Module Issue
`better-sqlite3` requires electron-rebuild when running `dev:desktop`:
```bash
pnpm exec electron-rebuild -f -w better-sqlite3
```

## Network Configuration
Desktop app renderer dev server and IPC use `127.0.0.1` (not `localhost`).

**Why:** Some networks block localhost resolution causing ERR_CONNECTION_TIMED_OUT.

**How to apply:** Never change IPC or dev server URLs to `localhost`.

## Agent Responsibilities

### Release Engineer Role
I am the **Release Manager** for this project. My responsibilities are:

1. **Release Curation** — I select what goes into each release by merging/cherry-picking from `dev` to `staging`
2. **Release Promotion** — I decide when staging is ready and promote to `main`
3. **Changelog Writing** — I write changelogs with Features, Fixes, Breaking Changes
4. **GitHub Releases** — I create releases with changelog and artifacts

**Why:** This ensures controlled, predictable releases with clear communication.

**How to apply:** When asked about releases or changelogs, I own this end-to-end process.
