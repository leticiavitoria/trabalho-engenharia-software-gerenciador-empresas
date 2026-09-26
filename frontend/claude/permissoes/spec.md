# Permissions Screen Specification

> **Update — backend integration:** data is now loaded from and saved to the API/database. Statements below about session-only state, fixtures restored on reload, or the absence of API requests are superseded by `../integracao-api/spec.md`.

## 1. Feature Overview

This specification defines the `Permissões` screen at `/permissoes` in a React and Next.js administrative demonstration. It displays three role summaries and an editable permission matrix. Visible UI labels are in Brazilian Portuguese; this specification is in English. Requirements with prefix `PER-*` are normative.

Related specifications: `../navigation/spec.md` and `../users/spec.md`.

## 2. Goal and Boundary

An administrator can inspect and experiment with which actions each role appears to have. The matrix is a UI demonstration only. It MUST NOT be treated as real authorization or sent to a server. Toggling a cell changes session-local presentation state; reloading restores the seed matrix. It MUST NOT change route availability, disable CRUD controls, or grant a user real access. Actual authentication and server-side authorization are outside the scope of these five specifications.

Role names MUST match the choices on the Users screen exactly: `Administrador`, `Editor`, and `Visualizador`.

## 3. Seed Matrix

`✓` means enabled and `—` means disabled in the initial demonstration state.

| Functionality | Administrador | Editor | Visualizador |
| --- | :---: | :---: | :---: |
| `Visualizar empresas` | ✓ | ✓ | ✓ |
| `Cadastrar empresas` | ✓ | ✓ | — |
| `Editar empresas` | ✓ | ✓ | — |
| `Excluir empresas` | ✓ | — | — |
| `Visualizar usuários` | ✓ | ✓ | ✓ |
| `Gerenciar usuários` | ✓ | — | — |
| `Alterar permissões` | ✓ | — | — |

The matrix MUST be modeled as data keyed by stable role and permission identifiers. The Portuguese labels are presentation strings, not identifiers. The implementation MUST NOT rely on row indices as permanent domain identifiers.

## 4. Requirements

### PER-001 — Page Structure

The screen MUST show the heading `Permissões`, brief explanatory text, three role summary cards, and a matrix with functionality rows and role columns. The cards MUST use the role names above. Descriptions MAY summarize the seed state; after a cell changes, they MUST remain truthful (by updating or by clearly describing the default role rather than the current edited configuration).

### PER-002 — Initial State

On a fresh load, the seven functionalities and 21 role-permission values MUST match Section 3. Each cell MUST expose its enabled/disabled meaning through text or an accessible label; color or a bare checkmark alone is insufficient. `aria-pressed` MUST correspond to the boolean value if toggle buttons are used.

### PER-003 — Toggle Behavior

Activating a matrix cell MUST invert only that role and functionality's boolean value, update its visible mark and accessible state, and show brief Portuguese feedback. A second activation MUST restore the previous value. The change MUST remain visible when navigating away and back within the same client session. A full reload MAY restore the original matrix.

### PER-004 — Distinct Role Assignments

The Users screen's `role` value identifies a role by name. Changing a user's assigned role MUST NOT edit the matrix. Changing the matrix MUST NOT silently rewrite any user's assigned role. No effective-permissions calculation is required for this demonstration.

### PER-005 — Explicit Demonstration Notice

The page MUST explain in Portuguese that matrix changes are for exploring the interface and are not enforced against real users. It MUST NOT promise that changes are saved permanently or present this page as an actual security control.

### PER-006 — Keyboard and Responsive Access

Every toggle MUST be keyboard operable with a visible focus indicator. Its accessible name MUST state the action (`Ativar` or `Desativar`), functionality, and role. Column headers MUST identify roles and row headers MUST identify functionalities semantically. On narrow screens, the matrix MAY scroll horizontally within its card; the page itself MUST not be clipped or acquire unintended horizontal scrolling.

## 5. Acceptance Scenarios

| ID | Given | When | Then |
| --- | --- | --- | --- |
| PER-T01 | A fresh load | `/permissoes` renders | All 21 values match the seed matrix. |
| PER-T02 | `Editor` cannot initially `Excluir empresas` | The cell is activated | Only that cell becomes enabled, `aria-pressed` becomes true, and feedback appears. |
| PER-T03 | A cell was toggled | The user navigates away and returns without reloading | The changed value remains visible. |
| PER-T04 | A matrix cell is changed | The user visits Companies and Users | Their controls and assigned role labels are unchanged. |
| PER-T05 | A keyboard user focuses a cell | They activate it with Enter or Space | Its visible and accessible states both update. |
| PER-T06 | The page is viewed on a narrow screen | The user inspects every role column | All cells remain reachable within the matrix container. |

Tests SHOULD reference requirement IDs. Test initial data and toggle isolation at component level, and verify keyboard access and responsive scrolling in a browser flow.