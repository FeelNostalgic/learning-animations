### E2E Tests: Studio Animation Builder

**Suite ID:** `BUILDER-SUITE`
**Feature:** Route protection and authentication barrier for the Studio builder.

---

## Test Case: `BUILDER-E2E-001` - Protected Route Redirection

**Priority:** `critical`

**Tags:**
- type → @e2e
- feature → @builder

**Description/Objective:** Verify that accessing `/builder` without an active session automatically redirects to `/login` with the appropriate return redirect query param.

**Preconditions:**
- User is unauthenticated.

### Flow Steps:
1. Navigate directly to `/builder`.
2. Observe Next.js middleware interception.
3. Verify redirected URL matches `/login?redirect=%2Fbuilder`.
4. Verify login card and "Entrar" action button are displayed.

### Expected Result:
- User is safely prompted to authenticate before accessing editor creation tools.
