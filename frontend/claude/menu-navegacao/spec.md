# Navigation Menu Specification

> **Update — backend integration:** data is now loaded from and saved to the API/database. Statements below about session-only state, fixtures restored on reload, or the absence of API requests are superseded by `../integracao-api/spec.md`.

## 1. Feature Overview

This specification defines the shared administrative shell and navigation menu for a React and Next.js application. The rendered interface is in Brazilian Portuguese; this specification is in English. Requirements with the prefix `NAV-*` are normative and stable references for implementation and verification.

The page specifications are located at `../overview/spec.md`, `../companies/spec.md`, `../users/spec.md`, and `../permissions/spec.md`.

## 2. Scope and Boundaries

The shell contains a desktop sidebar, a top bar, and the current page's main content. It displays the fictitious workspace `Acme Gestão`, the fictitious profile `João Sampaio`, and an explicit demonstration indicator. It does not implement sign-in, workspace switching, notifications, profile settings, or authorization.

Implement the shell with Next.js App Router layouts and client components only where interaction is required. The menu MUST use Next.js navigation (`Link` and the current pathname); it MUST NOT depend on a full-page reload. Suggested routes are canonical for these specifications:

| Label shown to the user | Route | Page specification |
| --- | --- | --- |
| `Visão geral` | `/` | `../overview/spec.md` |
| `Empresas` | `/empresas` | `../companies/spec.md` |
| `Usuários` | `/usuarios` | `../users/spec.md` |
| `Permissões` | `/permissoes` | `../permissions/spec.md` |

The application MAY use a route group such as `app/(admin)/` without changing these URLs.

## 3. Requirements

### NAV-001 — Shared Layout

The same shell MUST wrap all four pages. The sidebar MUST contain the product mark, workspace summary, four navigation entries, demonstration notice, and profile summary. The top bar MUST contain the section breadcrumb and demonstration indicator. Main content MUST be inside a semantic `<main>` landmark, and navigation inside a labeled `<nav>` landmark.

### NAV-002 — Route Navigation and Active State

Selecting an entry MUST navigate to its route. Exactly one entry MUST have a visible active state and `aria-current="page"`, determined by the current route. The breadcrumb MUST show `Painel administrativo / <current section>` using the Portuguese label from the table above. Browser back and forward actions MUST update both content and active state. Direct loading of any of the four URLs MUST render the corresponding page.

### NAV-003 — Responsive Navigation

At narrow viewport widths, the sidebar MUST be hidden initially and a labeled menu button MUST expose it. The button MUST reflect its state with `aria-expanded`. An overlay MUST dismiss the open menu, and selecting an entry MUST close it. The menu MUST remain usable without horizontal clipping or content obstruction. The desktop sidebar MUST remain visible without the mobile toggle.

### NAV-004 — Keyboard and Focus

Every navigation entry and the mobile menu button MUST be keyboard reachable and show a visible focus indicator. Opening the mobile menu MUST make its entries reachable; closing it MUST restore focus to the menu button when appropriate. The Escape key SHOULD dismiss the mobile menu. Route changes SHOULD move focus to the new page heading or main region so keyboard and screen reader users can identify the new content.

### NAV-005 — Demonstration Context

The shell MUST visibly communicate that the environment uses fictitious data and that edits are session-only. Workspace and profile labels are illustrative content, not evidence of an authenticated session. No menu entry or profile affordance MAY suggest a working account action unless that action is implemented in a later specification.

### NAV-006 — Visual Consistency

The active entry, typography, spacing, icon treatment, and top bar MUST remain consistent across all four routes. The main content MUST adapt to desktop and mobile viewport widths without unintended page-wide horizontal scrolling; data tables MAY scroll within their own containers.

## 4. Implementation Contract

The route table SHOULD be a single typed configuration used by the sidebar and breadcrumb. The shared shell SHOULD be a Server Component where possible; the menu toggle and pathname-dependent state MAY be Client Components. Navigation MUST NOT reset the underlying demonstration data during ordinary client-side route changes (see each page's shared mock-state requirements).

The demo state provider, if used, MUST be placed above the routed pages in the layout. This requirement concerns continuity during client navigation; a full browser reload is allowed to restore the original fixtures.

## 5. Acceptance Scenarios

| ID | Given | When | Then |
| --- | --- | --- | --- |
| NAV-T01 | Any of the four routes is loaded directly | The page renders | The correct entry and breadcrumb are active. |
| NAV-T02 | The user is on `/empresas` | They choose `Usuários` and then use Back | `/usuarios` and then `/empresas` render with matching active states. |
| NAV-T03 | The viewport is narrow | The user opens, dismisses, and reopens the menu | The menu and `aria-expanded` remain synchronized. |
| NAV-T04 | An edit was made in a demo page | The user navigates away and returns without reloading | The edited session data remains visible. |
| NAV-T05 | The user navigates by keyboard | They tab through entries | Focus is visible and every route is reachable. |

Tests MAY use React Testing Library for shell behavior and Playwright for route, history, responsive, and focus flows. Tests SHOULD reference the requirement IDs in their names or descriptions.