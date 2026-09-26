# Companies Screen Specification

> **Update — backend integration:** data is now loaded from and saved to the API/database. Statements below about session-only state, fixtures restored on reload, or the absence of API requests are superseded by `../integracao-api/spec.md`.

## 1. Feature Overview

This specification defines the `Empresas` screen at `/empresas` in a React and Next.js administrative interface. It provides an interactive demonstration of company listing, creation, editing, deletion, and cadastral details. All displayed content is in Brazilian Portuguese; this document is in English. Requirements with prefix `COM-*` are normative.

Related specifications: `../navigation/spec.md`, `../overview/spec.md`, and `../users/spec.md`.

## 2. Scope and State Boundary

The feature uses fictitious seed records. Company actions mutate shared client-side state for the current browser session; a full reload restores the original fixtures. There is no API request, database write, real CNPJ lookup, invitation, approval workflow, or authorization check. The UI MUST clearly preserve this demonstration context. No success message may imply that a real company was persisted.

State MUST be shared with the Overview and Users routes so derived counts, details, and relationships stay coherent during client-side navigation. Each company has a stable session-local `id` that does not depend on its table position.

## 3. Company Data Contract

| Field | Type | Use |
| --- | --- | --- |
| `id` | string or number | Stable session-local identifier. |
| `name` | nonempty string | Primary display name. |
| `cnpj` | nonempty string | Fictitious display identifier; no real tax validation. |
| `sector` | nonempty string | Segment displayed in table and detail. |
| `city` | nonempty string | City and state displayed as one value. |
| `status` | `active` / `pending` / `inactive` | Demo status. |
| `email` | valid email string | Contact in detail. |
| `phone` | optional string | Contact in detail. |
| `createdAt` | date or display-ready fixture value | Registration date in detail and optional ordering. |

The number of users associated with a company MUST be derived from user records whose `companyId` matches its `id`; it MUST NOT be an independently editable company field. The initial six fictitious companies SHOULD correspond to the prototype examples: Aurora Tecnologia, Verde Campo, Norte Logística, Studio Forma, Costa & Mar, and Ponto Saúde. Their CNPJ values MUST be unmistakably fictitious.

## 4. Requirements

### COM-001 — Listing

The page MUST display `Empresas`, an overall record count, and a `Nova empresa` action. The table MUST show company name, fictitious CNPJ, segment, location, status, associated user count, and a detail action. `active`, `pending`, and `inactive` MUST render as `Ativa`, `Pendente`, and `Inativa`; status meaning MUST not depend on color alone. A company's row action MUST be named for that company for assistive technology.

### COM-002 — Search and Filter

A search field MUST match the company name, CNPJ, segment, or location without case sensitivity. The status control MUST offer all, active, pending, and inactive records. Search and status filters MUST combine with AND semantics. Filtering MUST apply before pagination and reset the current page to the first page. Clearing search or returning to all statuses MUST restore matching records. No matches MUST show a Portuguese empty result message.

### COM-003 — Pagination

The table MUST show at most five records per page. It MUST display the visible range and filtered total, plus previous, next, and numbered page controls. Previous and next MUST be disabled at the corresponding boundary. After deletion or filtering, the active page MUST be clamped to an existing page. An empty result MUST show `0` as its visible range start and total rather than an invalid range.

### COM-004 — Company Details

Opening details MUST display a dismissible panel containing name, CNPJ, status, segment, location, registration date, contact email, phone, and derived user count. The panel MUST expose `Editar dados` and `Excluir empresa`. It MUST be keyboard operable, have a dialog label, keep keyboard focus inside while open, close via Escape and an explicit button, and restore focus to the initiating control when feasible.

### COM-005 — Create and Edit Form

`Nova empresa` MUST open a form. `Editar dados` MUST open the same form populated from the selected record. The form MUST provide `Nome da empresa`, `CNPJ fictício`, `Segmento`, `Cidade / UF`, `Situação`, `E-mail de contato`, and `Telefone`. Name, CNPJ, segment, city, and email are required; email MUST use email-format validation. The form MUST have cancel and submit actions and MUST not mutate state on cancel or invalid submission. Editing MUST retain the record's `id` and registration date. Creating MUST assign a new stable id and default to a documented status (use `active` if following the prototype's selected default). No uniqueness or official CNPJ validity rule is implied by this specification.

### COM-006 — Delete Confirmation and Demo Relationship

Deletion MUST require an explicit confirmation naming the selected company and explaining that its associated demo users will also be removed. Cancel MUST leave all collections unchanged. Confirm MUST remove the company and users linked by `companyId` from the shared session state, then update tables and overview counts. This cascade is demonstration behavior; it does not specify a future database foreign-key policy.

### COM-007 — Feedback and Consistency

Successful create, edit, and delete actions MUST produce brief Portuguese feedback that identifies the change as part of the demonstration. Table rows, detail content, user counts, and Overview metrics MUST reflect the result immediately in the same session. The UI MUST not request a real server operation.

### COM-008 — Responsive and Accessible Presentation

The form MUST fit narrow viewports without clipped controls. A wide table MAY scroll horizontally within its card; the whole page SHOULD not scroll horizontally. Inputs MUST have visible labels, focus styles, and programmatic associations. Destructive actions MUST be distinguishable by text as well as color.

## 5. Acceptance Scenarios

| ID | Given | When | Then |
| --- | --- | --- | --- |
| COM-T01 | Six initial companies | `/empresas` renders | Five appear on page one and one on page two; the total is six. |
| COM-T02 | Name, segment, and status fixtures | Search and status are applied together | Only records matching both criteria appear and pagination restarts at page one. |
| COM-T03 | An invalid required field or email | The form is submitted | Validation blocks the mutation and the form remains available. |
| COM-T04 | A valid company form | The user creates then edits it | Its stable id is preserved on edit and all views show current data. |
| COM-T05 | A company with linked users | Deletion is canceled, then confirmed | Cancel changes nothing; confirm removes the company and linked demo users and updates overview counts. |
| COM-T06 | A filtered result becomes empty | The last matching record is deleted | The empty state and valid `0` range are shown. |

Tests SHOULD reference requirement IDs. Use component-level tests for filtering, validation, and state updates, plus a browser flow for dialogs and keyboard behavior.