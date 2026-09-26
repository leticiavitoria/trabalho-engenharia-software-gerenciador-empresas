"""Apaga todas as tabelas e recria o banco com os dados de exemplo.

Uso: python -m scripts.database.reset
"""

import psycopg

from app.config.settings import build_database_url
from scripts.database.migrate import migrate
from scripts.database.seed import seed


def reset(conninfo: str | None = None) -> None:
    conninfo = conninfo or build_database_url()
    with psycopg.connect(conninfo) as conn:
        conn.execute("DROP TABLE IF EXISTS users, companies, role_permissions, permissions, roles CASCADE")
    migrate(conninfo)
    seed(conninfo)


if __name__ == "__main__":
    reset()
    print("Banco recriado com os dados de exemplo.")
