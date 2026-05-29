---
name: release_pipeline
description: CI/CD pipeline architecture and release workflow details
type: project
---

# Release Pipeline Architecture

## CI/CD Philosophy
Each workflow file performs **exactly one action** (lint, typecheck, build, etc.).

**Why:** When CI fails, agents immediately know which workflow failed without parsing combined output.

**How to apply:** New workflows should follow this atomic pattern. Never combine multiple actions in one workflow.

## Workflow Inventory (17 total)
```
.github/workflows/
├── build-*.yml      # Build workflows (5: api, db, desktop, sdk, web)
├── lint-*.yml       # Lint workflows (5: api, db, desktop, sdk, shared lint.yml)
├── typecheck-*.yml  # Typecheck workflows (5: api, db, desktop, sdk, shared typecheck.yml)
├── release-desktop.yml   # Desktop release on git tags
└── test-web.yml          # Web tests
```

## Build Order (Dependency Chain)
1. **SDK** (`@electron-template/sdk`) - Must build first
2. **Web** (`web`) - Depends on SDK (builds the embedded UI)
3. **Desktop** (`desktop`) - Embeds web build into Electron

## Branch Flow (Release Direction)
```
dev → staging → main → git tag → GitHub Release
```

**Flow explanation:**
1. **dev** — Developers merge PRs here. This is the main development branch where all work happens.
2. **staging** — I select what goes into the next release. I cherry-pick or merge features from dev to staging for pre-release testing.
3. **main** — I promote staging to main when it's ready for production. Only releases merge here.
4. **git tag** — Tagging `v*` triggers the release workflow.

**Why:** Immutable artifacts — the same binary built in CI is what gets released.

**How to apply:** Never rebuild between staging and production. Promote the exact same artifacts.

## My Responsibilities

### 1. Release Management
- I pick tasks from `dev` and decide which future release they go into
- I curate the release scope by merging/cherry-picking from dev to staging
- I decide when staging is ready to promote to main

### 2. Changelog Writing
- I write changelogs categorizing changes as: Features, Fixes, Breaking Changes
- Changelogs are based on conventional commits or PR descriptions
- I ensure changelogs are clear and meaningful for end users

### 3. GitHub Releases
- I create GitHub releases when promoting to main
- Releases include: changelog, artifact downloads, release notes
- I use `softprops/action-gh-release@v2` for automated release creation

## Desktop Release Workflow
**Trigger:** Git tags matching `v*` (e.g., `v1.0.0`)

**Current implementation:**
- Runs on: `windows-latest`
- Builds: Windows x64 only
- Output: `apps/desktop/release/**`
- Creates GitHub Release with artifacts

**Missing:** No macOS or Linux builds, no code signing, no notarization.

## Current Release State
- **No releases have been made yet**
- Project is in pre-release development phase
- First release will be v0.1.0

## Versioning Strategy

**Light semver** — simplified semver without ceremony.

**Why:** Better tracking than pure sequential. Still simple enough for an internal tool.

### Version Components

| Component | When to bump | Example |
|-----------|--------------|---------|
| **PATCH** (z) | Bug fixes, small improvements | v0.1.0 → v0.1.1 |
| **MINOR** (y) | New features, non-breaking additions | v0.1.0 → v0.2.0 |
| **MAJOR** (x) | Breaking changes, major refactors | v0.1.0 → v1.0.0 |

### Rules

1. **Start:** v0.1.0 (meaning "still in development")
2. **PATCH:** Bug fix → bump last number (v0.1.0 → v0.1.1)
3. **MINOR:** New feature (no breaking changes) → bump middle (v0.1.0 → v0.2.0)
4. **MAJOR:** Breaking changes or major milestone → bump first (v0.1.0 → v1.0.0)
5. **After v1.0.0:** Follow normal semver rules

### Release Tag Format
```
v0.1.0     # Tag format: v{major}.{minor}.{patch}
```

**How to apply:** When deciding version bump, I ask: "Is this a fix, a feature, or a breaking change?"

## Build Scripts
```bash
# Desktop build (local)
cd apps/desktop
pnpm run build

# Release build
pnpm run release  # electron-builder --win
```