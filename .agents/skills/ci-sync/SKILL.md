---
name: ci-sync
description: >
  Complete Git Ship & CI Sync: stages, commits, pushes, actively monitors GitHub Actions, and auto-pulls on green success.
  Trigger: When asked to ship changes, check CI status, sync after CI, or automate git workflow.
license: MIT
metadata:
  version: "1.2"
---

# Git Ship & CI Auto-Sync Skill

## Purpose
Automates the full developer release lifecycle:
1. `git add .`
2. `git commit -m "<conventional-commit-message>"`
3. `git push origin <branch>`
4. Live CI monitoring with active waiting/polling
5. Automatic `git pull` when CI passes in green (bringing back the automated SemVer version bump and merge tags).

## Commands

### 1. Complete End-to-End Automation
```bash
npm run ship -- "feat(scope): descripción del cambio"
```

### 2. Standalone CI Check & Pull
```bash
npm run ci:sync
```
