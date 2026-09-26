# Overview Screen Specification

> **Update — backend integration:** data is now loaded from and saved to the API/database. Statements below about session-only state, fixtures restored on reload, or the absence of API requests are superseded by `../integracao-api/spec.md`.

## 1. Feature Overview

This specification defines the `Visão geral` screen at `/`. The screen summarizes the same fictitious company and user collections used by the `Empresas` and `Usuários` screens. The rendered interface is in Brazilian Portuguese. Requirements with prefix `OV-*` are normative.

Dependencies: `../navigation/spec.md`, `../companies/spec.md`, and `../users/spec.md`.

## 2. Goal and Boundaries

An administrator can understand the current demonstration data at a glance and open a company from the recent list. The screen does not fetch analytics, persist history, or calculate real operational metrics. The activity feed is explicitly sample content and MUST NOT be presented as an audit log.

Implement with React and Next.js. Read shared demo collections from a common source of client state. All figures MUST be derived from the current session's collections, never maintained as independent hard-coded counters.

## 3. Data and Derivations

| Display | Derivation |
| --- | --- |
| `Total de empresas` | Number of company records. |
| `Empresas ativas` | Number of companies with `status === "active"`. |
| `Usuários cadastrados` | Number of user records. |
| `Aguardando aprovação` | Number of companies plus users with `status === "pending"`. |
| `Empresas recentes` | Up to four companies, newest first by insertion order or a defined creation timestamp. |

The initial demonstration fixtures contain six companies, four active companies, six users, and two pending records in total. These counts are fixture expectations, not constants to display after edits.

## 4. Requirements

### OV-001 — Page Header

The screen MUST show the heading `Visão geral` and a short explanatory sentence. The shared breadcrumb and sidebar come from `../navigation/spec.md`; this page MUST NOT implement a second copy.

### OV-002 — Summary Cards

The four summary cards MUST use the labels and derivations in Section 3. A value of zero MUST be displayed as `0`, not as an empty card. Changes to companies or users made elsewhere in the same session MUST be reflected when this page is revisited. The cards MUST be readable on mobile and desktop.

### OV-003 — Recent Companies

The recent companies card MUST display at most four records. Each row MUST show the company name, fictitious CNPJ, segment, and localized status. Selecting a row's detail action MUST show the same company details available from the `Empresas` screen. A `Ver todas` action MUST navigate to `/empresas`.

If there are no companies, the card MUST show a clear Portuguese empty state and retain the `Ver todas` action. It MUST NOT render a broken or misleading table.

### OV-004 — Activity Examples

The activity card MUST display a small set of fictitious examples with an event title, short description, and illustrative time. It MUST identify the content as examples, such as `Movimentações de exemplo`. Actions performed during the session are not required to appear here. The implementation MUST NOT claim that these items are a complete or persistent activity history.

### OV-005 — Status and Formatting

Statuses MUST use the shared mappings: `active` → `Ativa`, `pending` → `Pendente`, and `inactive` → `Inativa` for companies. A status MUST be understandable from text as well as color. Counts MUST be rendered as numbers without invented trend percentages or claims of real growth.

### OV-006 — Navigation and Interaction

`Ver todas` MUST use client-side Next.js navigation. The company detail action MUST be keyboard accessible, have an accessible name including the company name, and close with a labeled control and Escape. Focus SHOULD return to the initiating control after closing.

## 5. Acceptance Scenarios

| ID | Given | When | Then |
| --- | --- | --- | --- |
| OV-T01 | The original fixtures are loaded | `/` renders | The four values are 6, 4, 6, and 2 in the order specified. |
| OV-T02 | A company is created in the session | The user returns to `/` | Total and, when applicable, active/pending counts update; the new company appears among recent records. |
| OV-T03 | A pending user is deleted | The user returns to `/` | User and pending counts each decrease by one. |
| OV-T04 | The company collection is empty | `/` renders | The company card shows its empty state and the total is `0`. |
| OV-T05 | A recent company is present | The user opens its detail action | Its details match the corresponding record on `/empresas`. |

Use focused component tests for derivations and empty states, and a browser flow for navigation and the detail panel. Tests SHOULD reference these IDs.