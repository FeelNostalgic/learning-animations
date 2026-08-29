### E2E Tests: Showcase & Wiki Documentation

**Suite ID:** `SHOWCASE-SUITE`
**Feature:** Infinite loop action previews, component catalog, live interactive sandbox, and KaTeX playground.

---

## Test Case: `SHOWCASE-E2E-001` - Showcase Navigation and Action Previews

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @showcase

**Description/Objective:** Verify that the documentation page loads all 9 action cards running in infinite loops and switches between tabs cleanly.

**Preconditions:**
- Web application is running.

### Flow Steps:
1. Navigate to `/docs/showcase`.
2. Verify visibility of action cards (Highlight, Pulse, Packet, etc.).
3. Filter actions by typing search query "packet".
4. Navigate to "Componentes & Nodos" tab.
5. Navigate to "KaTeX Cheat Sheet & Playground" tab.

### Expected Result:
- All action loop previews and component specifications display with accurate metadata and interactive controls.
