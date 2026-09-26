# Frontend — Gerenciador de Empresas

Painel administrativo em React + TypeScript + Vite com quatro telas: **Visão geral** (`/`), **Empresas** (`/empresas`), **Usuários** (`/usuarios`) e **Permissões** (`/permissoes`).

Os dados (empresas, usuários e matriz de permissões) são carregados e salvos pela **API do backend** (Flask + PostgreSQL), então as alterações continuam após recarregar a página. Os registros iniciais são fictícios e vêm do seed do backend. Ainda não há login: os perfis e permissões são apenas exibidos, sem controlar o acesso.

As especificações de cada tela estão em [`claude/`](./claude); a integração com o backend está em [`claude/integracao-api/spec.md`](./claude/integracao-api/spec.md).

## Pré-requisitos

- **Node.js 20.19+** ou **22.12+** (exigência do Vite 8). Verifique com `node -v`.
- **npm** (instalado junto com o Node).
- **Backend em execução** para usar as telas (veja [`../backend/README.md`](../backend/README.md)). Os testes do frontend **não** precisam do backend.

## Instalação

Na pasta `frontend/`, instale as dependências:

```bash
cd frontend
npm install
```

Crie o arquivo de variáveis de ambiente a partir do exemplo, se ele ainda não existir:

```bash
cp .env.example .env
```

A variável `VITE_API_URL` define a URL do backend (padrão: `http://localhost:5000`). Ela é lida pelo cliente HTTP em `src/shared/services/httpClient.ts`; reinicie o `npm run dev` depois de alterá-la.

Se o backend não estiver acessível, as telas mostram “Não foi possível carregar os dados” com o botão **Tentar novamente**.

## Executando o frontend

### Modo de desenvolvimento

```bash
npm run dev
```

Acesse o endereço exibido no terminal (por padrão, <http://localhost:5173>). O Vite recarrega a página automaticamente a cada alteração no código.

Para usar outra porta ou acessar a partir de outro dispositivo da rede:

```bash
npm run dev -- --port 3000   # outra porta
npm run dev -- --host        # expõe na rede local
```

### Build de produção

```bash
npm run build     # verifica os tipos (tsc) e gera os arquivos em dist/
npm run preview   # serve o conteúdo de dist/ localmente
```

## Executando os testes

Os testes usam [Vitest](https://vitest.dev) com [Testing Library](https://testing-library.com) em ambiente jsdom (simulação de navegador), sem precisar abrir um navegador. No lugar do backend, eles usam uma API em memória (`src/test/fakeApi.ts`) com os mesmos dados de exemplo e as mesmas regras (ids novos, exclusão em cascata etc.).

### Rodar todos os testes uma vez

```bash
npm test
```

### Modo observação (roda novamente a cada alteração)

```bash
npx vitest
```

### Rodar apenas parte dos testes

```bash
npx vitest run src/features/companies          # só os testes de uma pasta
npx vitest run -t "COM-T05"                    # só os testes cujo nome contém o texto
```

Os nomes dos testes começam pelo identificador do requisito da especificação (`NAV-*`, `OV-*`, `COM-*`, `USR-*`, `PER-*`, `API-*`), o que facilita relacionar cada teste ao item correspondente em `claude/*/spec.md`.

### Onde ficam os testes

| Arquivo | O que cobre |
| --- | --- |
| `src/app/navigation.test.tsx` | Menu, rota ativa, trilha de navegação e menu móvel |
| `src/features/overview/*.test.ts(x)` | Indicadores e empresas recentes da Visão geral |
| `src/features/companies/CompaniesPage.test.tsx` | Listagem, filtros, paginação, formulário e exclusão de empresas |
| `src/features/users/UsersPage.test.tsx` | Listagem, formulário e exclusão de usuários |
| `src/features/permissions/PermissionsPage.test.tsx` | Matriz de permissões |
| `src/app/apiIntegration.test.tsx` | Carregamento, nova tentativa e falhas da API refletidas na interface |
| `src/shared/services/dataApi.test.ts` | URLs, conversão de dados e mensagens de erro da camada HTTP |
| `src/shared/data/dataReducer.test.ts` | Regras de atualização do estado compartilhado |

A configuração fica em `vite.config.ts` (bloco `test`) e em `src/test/setup.ts`. Utilitários de renderização estão em `src/test/renderApp.tsx` (`await renderApp(rota, api?)` espera o carregamento inicial), os dados de exemplo em `src/test/fixtures.ts` e a API em memória em `src/test/fakeApi.ts`; passe `createFakeApi({ createCompany: ... })` para simular respostas de erro.

## Outros comandos

```bash
npm run lint   # análise estática com ESLint
```

## Estrutura resumida

```
src/
├── app/            # rotas, providers e configuração do menu
├── features/       # telas: overview, companies, users, permissions
├── shared/
│   ├── components/ # componentes reutilizáveis (Modal, Pagination, Sidebar...)
│   ├── data/       # tipos, rótulos e estado compartilhado carregado da API
│   ├── hooks/      # usePagination
│   ├── layouts/    # layout com menu lateral e barra superior
│   ├── services/   # cliente HTTP (axios), chamadas à API e tratamento de erros
│   └── utils/      # formatação, validação e foco
├── styles/         # CSS global
└── test/           # configuração, dados de exemplo, API em memória e utilitários de teste
```
