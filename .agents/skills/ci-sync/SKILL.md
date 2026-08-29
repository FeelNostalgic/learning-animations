---
name: ci-sync
description: >
  Monitor GitHub Actions CI status, actively wait for in-progress runs, auto-pull on green build success, and diagnose failures on red.
  Trigger: When asked to check CI status, sync after CI, or monitor GitHub Actions.
license: MIT
metadata:
  version: "1.1"
---

# CI Monitor & Auto-Sync Skill

## Purpose
Monitors the latest GitHub Actions workflow run for this repository using the official GitHub CLI (`gh`). If the workflow is in progress, it actively waits and polls until completion. If it finishes successfully in green, it automatically executes `git pull`. If it fails in red, it extracts and diagnoses the failed logs without pulling broken code.

## Usage

### 1. Direct NPM Script
```bash
npm run ci:sync
```

### 2. GitHub CLI Commands
```bash
# List recent runs and their conclusion
gh run list --limit 3

# Watch a run live in the terminal
gh run watch

# Inspect failed job logs
gh run view <run-id> --log-failed
```

### 3. Agent Decision Protocol
1. Query the latest workflow run for the active branch (`dev` / `main`).
2. If `status === "in_progress"` or `"queued"`:
   - Actively poll every 5s with progress reporting until completion.
3. If `conclusion === "success"`:
   - Check `git status`. If working tree is clean, execute `git pull origin <branch>`.
   - Report the updated version and commit log.
4. If `conclusion === "failure"`:
   - Run `gh run view <run-id> --log-failed`.
   - Extract the failing step, job name, and error snippet.
   - Report the root cause clearly without pulling broken code.
