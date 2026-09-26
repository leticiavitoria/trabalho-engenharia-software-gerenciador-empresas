# Gerenciador de Empresas

## 1. Explicação do Projeto

O **Gerenciador de Empresas** é um sistema desenvolvido como trabalho prático da disciplina de Engenharia de Software, com o diferencial de ter seu frontend e backend construídos inteiramente com o auxílio de Inteligências Artificiais.

O sistema tem como objetivo permitir o gerenciamento de empresas, oferecendo funcionalidades como:

- Cadastro, edição e exclusão de empresas
- Cadastro e gerenciamento de usuários
- Controle de permissões de acesso
- Visualização de informações cadastrais em painel administrativo

## 2. Participantes do Grupo

| Membro                           | Matrícula | Turma | Papel      |
| -------------------------------- | --------- | ----- | ---------- |
| Evandro Araujo Furlaneto Delgado | 000000    | TN    | Full Stack |
| Italo Nunes Pereira Vieira       | 000000    | TN    | Full Stack |
| Leticia Vitoria Martins do Carmo | 000000    | TN    | Full Stack |

## 3. Tecnologias Usadas

- **Flask** — framework backend em Python
- **Python** — linguagem de programação do backend
- **PostgreSQL** — banco de dados relacional
- **Docker** — containerização da aplicação
- **React (com Vite)** — biblioteca frontend

## 4. Agentes de IA Usados

- **ChatGPT**
- **Claude**
- **Gemini**
- **GitHub Copilot**


## 5. Como Executar

O sistema tem duas partes: o **backend** (API Flask + PostgreSQL) e o **frontend** (React + Vite), que consome a API.

1. **Backend** — na pasta `backend/`, siga o [README do backend](./backend/README.md). O jeito mais rápido é `make up` (Docker), que sobe o banco e a API em <http://localhost:5000> já com dados de exemplo.
2. **Frontend** — na pasta `frontend/`, rode `npm install`, confirme `VITE_API_URL=http://localhost:5000` no `.env` e rode `npm run dev`. Detalhes no [README do frontend](./frontend/README.md).

Testes: `npm test` no frontend (não precisa do backend) e `make test-backend` no backend (precisa de um PostgreSQL com o banco de testes).
