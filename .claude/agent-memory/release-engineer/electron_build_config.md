---
name: electron_build_config
description: electron-builder configuration and packaging details
type: project
---

# Electron Build Configuration

## electron-builder.json Key Settings
```json
{
  "appId": "com.electron-template.app",
  "productName": "WEMS",
  "electronVersion": "35.0.0",
  "npmRebuild": false,
  "directories": {
    "output": "release",
    "buildResources": "build"
  },
  "files": ["out/**/*"],
  "win": {
    "target": [{ "target": "dir", "arch": ["x64"] }]
  },
  "publish": {
    "provider": "github",
    "owner": "wareflowx",
    "repo": "wems-v3"
  }
}
```

## Important Notes

### npmRebuild: false
Native modules (better-sqlite3) are **NOT** rebuilt during packaging.

**Why:** Native modules are pre-built and bundled. Setting to true would cause issues.

**How to apply:** If adding new native modules, ensure they are pre-built for Electron 35.

### Target: "dir"
Builds unpacked directory output (not installer).

**How to apply:** Artifacts are in `apps/desktop/release/` as a directory, not `.exe` installer.

### Publishing Config
Configured for GitHub Releases via `softprops/action-gh-release@v2`.

## Desktop App Architecture
```
apps/desktop/
├── src/
│   ├── main/index.ts       # Main process (creates BrowserWindow)
│   └── preload/index.ts    # Preload script (IPC bridge)
├── out/                    # Build output
│   ├── main/              # Main process JS
│   ├── preload/           # Preload script JS
│   └── renderer/          # Web app (copied from apps/web/dist)
├── electron.vite.config.ts
├── electron-builder.json
└── release/               # Packaged artifacts
```

## Build Process (apps/desktop/package.json)
```bash
"build": "electron-vite build && node -e \"require('fs').cpSync('../web/dist', 'out/renderer', {recursive: true})\""
```

Steps:
1. `electron-vite build` - Builds main + preload + renderer
2. Copy web/dist to out/renderer - Embeds the web app

## Current Limitations
- **Windows only** - No macOS (.dmg) or Linux (.AppImage/.deb) builds
- **No code signing** - App is unsigned
- **No notarization** - macOS Gatekeeper would reject this

**How to apply:** When adding macOS/Linux builds, will need signing certificates and notarization setup.
