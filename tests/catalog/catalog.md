### E2E Tests: Faceted Animation Catalog

**Suite ID:** `CATALOG-SUITE`
**Feature:** Unified faceted discovery of official and community animations.

---

## Test Case: `CATALOG-E2E-001` - Search, Filtering and Navigation to Detail

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @catalog

**Description/Objective:** Verify that the catalog page loads, filters animations accurately, and navigates to the universal player.

**Preconditions:**
- Application is running.

### Flow Steps:
1. Navigate to `/animations`.
2. Search for "ARP".
3. Verify filtered results.
4. Click on an animation card.
5. Verify navigation to `/animations/[slug]`.

### Expected Result:
- The animation detail player opens and loads all animation steps.
