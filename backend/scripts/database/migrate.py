"""Cria as tabelas e os dados de referência (perfis e permissões).

Uso: python -m scripts.database.migrate
"""

from pathlib import Path

import psycopg

from app.config.settings import build_database_url

SCHEMA_FILE = Path(__file__).resolve().parents[2] / "database" / "schema.sql"


def migrate(conninfo: str | None = None) -> None:
    with psycopg.connect(conninfo or build_database_url()) as conn:
        conn.execute(SCHEMA_FILE.read_text(encoding="utf-8"))


if __name__ == "__main__":
    migrate()
    print("Esquema do banco aplicado.")
