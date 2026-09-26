# Users Screen Specification

> **Update — backend integration:** data is now loaded from and saved to the API/database. Statements below about session-only state, fixtures restored on reload, or the absence of API requests are superseded by `../integracao-api/spec.md`.

## 1. Feature Overview

This specification defines the `Usuários` screen at `/usuarios` in a React and Next.js administrative interface. It demonstrates listing, creating, editing, and deleting users and assigning one of three display roles. The UI language is Brazilian Portuguese; this specification is in English. Requirements with prefix `USR-*` are normative.

Related specifications: `../navigation/spec.md`, `../companies/spec.md`, and `../permissions/spec.md`.

## 2. Scope and Shared Data

Users are fictitious records held in shared client-side state. Edits last during client-side navigation and reset on a full browser reload. The screen does not create credentials, send invitations or email, establish a session, or enforce a role's permissions. A success notification MUST indicate a demonstration change rather than a real account operation.

Each user has exactly one `companyId` referencing a company in the current demo collection. Company deletion follows `COM-006`. Role labels are shared with the Permissions screen, but editing a role changes only the assigned role shown in the UI; it does not grant actual access.

## 3. User Data Contract

| Field | Type | Use |
| --- | --- | --- |
| `id` | string or number | Stable session-local identifier. |
| `name` | nonempty string | Display name. |
| `email` | valid email string | Display and form value. |
| `companyId` | existing company id | Relationship to a demo company. |
| `role` | `Administrador` / `Editor` / `Visualizador` | Display role. |
| `status` | `active` / `pending` / `inactive` | Demo status. |
| `lastAccess` | string or nullable date | Illustrative last access; new users show `Nunca acessou`. |

The initial fixtures contain six users across the six companies and include active, pending, and inactive statuses. Their names and email domains are fictional examples.

## 4. Requirements

### USR-001 — Listing

The screen MUST display the `Usuários` heading, an overall user count, and a `Novo usuário` action. The table MUST show name, email, associated company name, role, localized status, last access, and a detail action. Status values MUST display as `Ativo`, `Pendente`, or `Inativo` with visible text. When a company is deleted, its associated demo users MUST no longer appear.

### USR-002 — Search and Status Filter

The search field MUST match name, email, company name, or role without case sensitivity. The status filter MUST offer all, active, pending, and inactive users. Search and status filtering MUST combine, apply before pagination, and reset the page number to one. No matches MUST show a Portuguese empty result message. A selected filter MUST remain visible in its control until the user changes it or leaves the screen.

### USR-003 — Pagination

At most five users MUST appear per page. The filtered range and total, previous/next controls, and numbered pages MUST follow the same boundary and empty-state rules as `COM-003`.

### USR-004 — User Details

The detail panel MUST display name, email, localized status, company, role, and last access, plus `Editar usuário` and `Excluir usuário` actions. It MUST use an accessible dialog name, labeled close control, focus containment, Escape dismissal, and appropriate focus restoration. It MUST read current shared data rather than a stale copied row.

### USR-005 — Create and Edit Form

`Novo usuário` MUST open a form with `Nome completo`, `E-mail`, `Empresa`, `Perfil de acesso`, and `Situação`. Name, valid email, and an existing company are required. Company choices MUST be derived from current companies. Role choices MUST be exactly `Administrador`, `Editor`, and `Visualizador`. Status choices MUST be active, pending, and inactive with Portuguese labels. Submit MUST update shared demo state; cancel and invalid submit MUST leave it unchanged. Editing MUST preserve the user's id and last-access value. A new user MUST have `Nunca acessou` as its last-access text.

If no companies exist, the creation form MUST not allow an invalid `companyId`; it SHOULD explain in Portuguese that a company must be registered first and offer navigation to `/empresas`.

### USR-006 — Delete Confirmation

Deleting a user MUST require a confirmation naming that user. Cancel MUST preserve the record. Confirm MUST remove only that user, immediately update the list, its company's derived user count, and Overview metrics. This is a demonstration action and does not specify account deletion outside the UI.

### USR-007 — Roles and Permissions Boundary

Changing a user's role MUST update the displayed role in the current session. It MUST NOT hide routes, block controls, or claim that access was enforced. The matrix at `/permissoes` describes demonstration role settings and MUST use the same role labels. Authorization requires a separate future specification and server-side implementation.

### USR-008 — Responsive and Accessible Presentation

The form and detail panel MUST fit narrow viewports. The table MAY scroll inside its container. Inputs and actions MUST have visible labels, keyboard focus indicators, and names that identify the target user where applicable.

## 5. Acceptance Scenarios

| ID | Given | When | Then |
| --- | --- | --- | --- |
| USR-T01 | Six initial users | `/usuarios` renders | Five appear on page one, one on page two, and the total is six. |
| USR-T02 | A user belongs to Aurora Tecnologia | Search matches the company and an active filter is selected | Only active users of matching companies appear. |
| USR-T03 | The form has an invalid email or missing name | Submit is attempted | No user is created or changed. |
| USR-T04 | A valid new user is created | Their detail is opened | Company, role, status, and `Nunca acessou` are shown. |
| USR-T05 | A user's role or company changes | The user navigates to another route and back | The new values remain and company user counts are recalculated. |
| USR-T06 | A user is deleted | The user visits Overview and Companies | The user count and corresponding company count have decreased. |
| USR-T07 | No companies exist | The user tries to create a user | The form prevents submission with an invalid company and explains the next step. |

Tests SHOULD reference requirement IDs and cover the form, filtering, relationships, and dialog keyboard flow.