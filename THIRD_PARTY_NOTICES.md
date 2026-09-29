# Third-Party Notices

`learning-animations` is licensed under the MIT License (see [LICENSE](LICENSE)).
This file documents the licenses of third-party code redistributed with — or
installed into — this repository.

The tables below were verified against the installed packages in
`node_modules/*/package.json` and against the upstream repositories via the
GitHub API on 2026-09-29. Where no license could be found upstream, that is
stated plainly rather than guessed.

---

## 1. Runtime dependencies

All permissive OSI licenses, compatible with this project's MIT license.

| Package | License |
| --- | --- |
| `next` | MIT |
| `react`, `react-dom` | MIT |
| `@xyflow/react` | MIT |
| `framer-motion` | MIT |
| `katex` | MIT |
| `react-markdown`, `rehype-katex`, `remark-math` | MIT |
| `@supabase/supabase-js`, `@supabase/ssr` | MIT |
| `sonner` | MIT |
| `next-themes` | MIT |
| `zod` | MIT |
| `tailwindcss`, `@tailwindcss/postcss`, `tailwindcss-animate`, `tailwind-merge` | MIT |
| `postcss` | MIT |
| `clsx` | MIT |
| `lucide-react` | ISC |
| `dompurify` | MPL-2.0 OR Apache-2.0 |
| `@aws-sdk/client-s3` | Apache-2.0 |
| `class-variance-authority` | Apache-2.0 |
| `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | MIT |
| `@radix-ui/*` (10 packages) | MIT |
| `@gsap/react` | See [GSAP](#2-gsap--not-open-source) |

### Dev dependencies

| Package | License |
| --- | --- |
| `typescript` | Apache-2.0 |
| `@playwright/test` | Apache-2.0 |
| `vitest`, `@vitest/coverage-v8` | MIT |
| `jsdom`, `happy-dom` | MIT |
| `eslint`, `@eslint/js`, `@eslint/eslintrc`, `eslint-config-next`, `globals` | MIT |
| `@types/*` | MIT |

---

## 2. GSAP — not open source

> **This project is not a pure open-source project.**
> The MIT license covers *this repository's own code only*. It does not relicense
> any dependency.

`gsap` (3.15.0) and `@gsap/react` are **not** distributed under an OSI-approved
license. They are governed by the **GSAP Standard "No Charge" License**, © 2025
Webflow: <https://gsap.com/standard-license>

The MIT license declared in this repository's `LICENSE` file does not grant
you any rights over GSAP. Use of GSAP is governed solely by the terms above.

### The clause that matters for this project

The GSAP license defines:

> **"Prohibited Uses"** means any implementation and/or use of GSAP Products in
> tools that allow users to build visual animations without code that
> encourages, induces, or materially assists in creating a solution that
> competes with Webflow's visual animation building capabilities.

This repository ships a no-code visual builder at `app/builder/`. As far as the
maintainers can tell, that builder does not fall under this clause:

- It does **not** generate or export GSAP source code. `lib/animations/universal-compiler.ts`
  compiles this project's own animation schema into a `gsap.core.Timeline` at
  runtime.
- It targets a narrow educational domain (network protocol visualisation) and
  does not compete with Webflow's general-purpose animation builder.
- The GSAP FAQ explicitly permits "other niche tool[s] that allow users to
  create GSAP-driven effects through a visual interface".

This is an informed reading, not legal advice. **If you plan to build a product
on this repository, contact Webflow first** — their FAQ invites exactly that
enquiry when you are unsure whether a use counts as a Prohibited Use.

---

## 3. Vendored AI agent skills (`/.agents/`)

The `.agents/` directory contains AI agent skill definitions installed by a
skills manager. They are development-time tooling and are **not** part of the
application bundle — they are not imported, compiled, or shipped to the browser.
Each is documentation and instructions for an AI agent.

The MIT license of this repository **does not** apply to them. Each retains the
license of its upstream source.

### Verified upstream sources

| Upstream | Skills in this repo | Upstream license |
| --- | --- | --- |
| [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | `accessibility`, `seo` | MIT |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `gsap-core`, `gsap-frameworks`, `gsap-performance`, `gsap-plugins`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-utils` | MIT |
| [wshobson/agents](https://github.com/wshobson/agents) | `nodejs-backend-patterns`, `typescript-advanced-types` | MIT |
| [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | `nodejs-best-practices` | MIT |
| [supabase/agent-skills](https://github.com/supabase/agent-skills) | `supabase-postgres-best-practices` | MIT |
| [giuseppe-trisciuoglio/developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit) | `tailwind-css-patterns` | MIT |
| [antfu/skills](https://github.com/antfu/skills) | `vitest` | MIT |
| [anthropics/skills](https://github.com/anthropics/skills) | `frontend-design` | Apache-2.0 (per-skill `LICENSE.txt`, vendored at `.agents/skills/frontend-design/LICENSE.txt`) |

### Upstream sources with no license file found

The following upstream repositories ship **no `LICENSE`, `LICENCE`, `COPYING`, or
`NOTICE` file** anywhere in their git tree. They were verified on 2026-09-29:

| Upstream | Skills in this repo | Status |
| --- | --- | --- |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `react-best-practices`, `composition-patterns` | **No license file.** Its `package.json` declares `"private": true`. |
| [vercel-labs/next-skills](https://github.com/vercel-labs/next-skills) | `next-best-practices`, `next-cache-components`, `next-upgrade` | **No license file.** The repository contains only `AGENTS.md`, `CLAUDE.md`, and `README.md`. |

Without an explicit license, the default is "all rights reserved." These files
are redistributed here at the sole risk of the maintainers. **If you are a
corporate user with an open-source compliance process, do not assume these
skills are cleared for redistribution** — remove them from your fork, or obtain
clarification from Vercel.

### Skills with no recorded upstream source

These exist on disk but are not recorded in `skills-lock.json`, so their origin
could not be determined automatically:

`ci-sync`, `conventional-commits`, `josechifflet-shadcn-ui`, `nextjs-16`,
`playwright`, `react-19`, `skill-creator`, `tailwind-4`, `typescript`,
`web-design-guidelines`, `zod-4`, `zustand-5`,
`vercel-composition-patterns`, `vercel-react-best-practices`

The last two are duplicates of the `vercel-labs` skills above — same upstream
content under a second directory name — and inherit the same unclear status.

---

## 4. Other third-party references

- **GSAP** brand and logo are trademarks of Webflow, Inc. Use in this repository
  is nominative only.
- The GSAP agent skills under `.agents/skills/gsap-*` are documentation about
  GSAP; they are separate from the GSAP runtime license in section 2.
- Educational animation content in `lib/animations/registry.ts` and
  `components/animations/*` is original to this project.
