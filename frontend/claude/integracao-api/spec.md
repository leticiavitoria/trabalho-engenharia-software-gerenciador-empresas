# Backend Integration Specification

## 1. Feature Overview

This specification defines how the administrative interface reads and writes its data through the Flask backend and the PostgreSQL database. It applies to every screen described in `../menu-navegacao/spec.md`, `../visao-geral/spec.md`, `../empresas/spec.md`, `../usuarios/spec.md`, and `../permissoes/spec.md`. Visible UI text is in Brazilian Portuguese; this document is in English. Requirements with prefix `API-*` are normative.

## 2. Superseded Boundaries

The other specifications were written for a session-only demonstration. From this specification on:

- Companies, users, and the permission matrix are **persisted in the database**. A full browser reload shows the saved data instead of restoring fixtures.
- Statements such as "there is no API request", "reload restores the original fixtures", and "the change is session-only" no longer apply. UI copy MUST NOT claim that changes are lost on reload.
- The seed records (six companies, six users, and the default matrix) are inserted by the backend (`backend/scripts/database/seed.py`) and remain fictitious.
- Still unchanged: there is no sign-in, no password or invitation, and roles/permissions are **not enforced**. The UI MUST keep saying that roles do not control access yet.

All other requirements (layout, filters, pagination, dialogs, accessibility, derived counts) remain in force.

## 3. API Contract

Base URL: `VITE_API_URL` (default `http://localhost:5000`). All bodies are JSON. Ids are integers in the API and strings in the UI.

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | `200 {status, database}` |
| `GET` | `/api/companies` | — | `200 Company[]`, insertion order |
| `POST` | `/api/companies` | `CompanyInput` | `201 Company` |
| `GET` / `PUT` / `DELETE` | `/api/companies/{id}` | `CompanyInput` on `PUT` | `200 Company` / `204` |
| `GET` | `/api/users` | — | `200 User[]` |
| `POST` | `/api/users` | `UserInput` | `201 User` |
| `GET` / `PUT` / `DELETE` | `/api/users/{id}` | `UserInput` on `PUT` | `200 User` / `204` |
| `GET` | `/api/permissions` | — | `200 {roles, permissions, matrix}` |
| `PUT` | `/api/permissions/{permissionId}/roles/{roleId}` | `{enabled: boolean}` | `200 {permissionId, roleId, enabled}` |

- `Company`: `id, name, cnpj, sector, city, status, email, phone (nullable), createdAt (YYYY-MM-DD)`.
- `User`: `id, name, email, companyId, role (admin|editor|viewer), status, lastAccess (ISO 8601 or null)`.
- Errors: `{error, message, fields?}` with `400` (malformed body), `404`, `409` (duplicate CNPJ or user e-mail), `422` (field validation), `503` (database unavailable). `fields` maps input names to Portuguese messages.
- Deleting a company deletes its users (`ON DELETE CASCADE`), as `COM-006` describes.

## 4. Requirements

### API-001 — Initial Load

On start, the UI MUST load companies, users, and the permission matrix before rendering page content, showing `Carregando dados…` meanwhile. If any request fails, the main region MUST show `Não foi possível carregar os dados`, the error message, and a `Tentar novamente` action that repeats the load. The shell and menu stay available.

### API-002 — Request Mapping

The HTTP layer (`src/shared/services/dataApi.ts`) MUST be the only code that knows URLs and DTO formats. It converts numeric ids to strings, `null` phones to an absent field, and sends `companyId` as a number.

### API-003 — Confirmed Mutations

Create, edit, and delete MUST update the shared state only with the record returned by the server, after it confirms the operation. Submit and confirm buttons MUST be disabled while the request is pending. Permission toggles MAY update optimistically, but MUST revert the cell if the request fails.

### API-004 — Server Validation

When the server answers with `fields`, the form MUST stay open, show each message next to its field with `aria-invalid`, and move focus to the first invalid field. Client-side validation from `COM-005`/`USR-005` still runs first.

### API-005 — Failure Feedback

Failures without field errors MUST show the server message in Portuguese: inside the open form (`role="alert"`) for create/edit, and as an error toast for deletions and permission changes. A failed operation MUST leave the displayed data unchanged. An unreachable server MUST produce a message asking to check whether the backend is running.

## 5. Acceptance Scenarios

| ID | Given | When | Then |
| --- | --- | --- | --- |
| API-T01 | The first load fails | The user selects `Tentar novamente` | The data loads and the page renders normally. |
| API-T02 | The server rejects a duplicate CNPJ | The company form is submitted | The CNPJ field shows the server message and the list is unchanged. |
| API-T03 | The server is unreachable | A user edit is saved | The form stays open with an alert and the row keeps its old values. |
| API-T04 | A deletion fails | The confirmation is accepted | An error toast appears and the record and its users remain. |
| API-T05 | A permission update fails | A matrix cell is activated | The cell returns to its previous value and an error toast appears. |
| API-T06 | The server is available | A matrix cell is activated | The change is sent to the API and success feedback appears. |

Frontend tests replace the HTTP layer with the in-memory implementation in `src/test/fakeApi.ts`; backend behavior is covered by `backend/tests`.
