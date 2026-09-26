ifeq ($(OS),Windows_NT)
	PYTHON := python
	VENV_ACTIVATE := .venv\Scripts\activate
	RUN_IN_VENV := .venv\Scripts\python.exe
else
	PYTHON := python3
	VENV_ACTIVATE := . .venv/bin/activate
	RUN_IN_VENV := .venv/bin/python
endif

COMPOSE := docker compose --env-file .env -f docs/docker/docker-compose.yml

# ---------- Backend local (sem Docker) ----------

venv:
	$(PYTHON) -m venv .venv

install:
	$(RUN_IN_VENV) -m pip install -r requirements-dev.txt

run-backend-local:
	$(RUN_IN_VENV) run.py

test-backend:
	$(RUN_IN_VENV) -m pytest

# ---------- Banco de dados (usa as variáveis do .env) ----------

db-migrate:
	$(RUN_IN_VENV) -m scripts.database.migrate

db-seed:
	$(RUN_IN_VENV) -m scripts.database.seed

db-reset:
	$(RUN_IN_VENV) -m scripts.database.reset

# Sobe apenas o PostgreSQL via Docker (útil para rodar o backend localmente).
db-up:
	$(COMPOSE) up -d db

# ---------- Backend via Docker ----------

up:
	$(COMPOSE) up --build

up-d:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

down-v:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f

restart:
	$(COMPOSE) restart

ps:
	$(COMPOSE) ps

# ---------- Frontend (local) ----------

run-frontend:
	cd ../frontend && npm run dev

install-frontend:
	cd ../frontend && npm install

test-frontend:
	cd ../frontend && npm test