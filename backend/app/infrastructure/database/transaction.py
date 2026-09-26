from collections.abc import Iterator
from contextlib import contextmanager

from psycopg import Connection

from app.infrastructure.database.connection import get_connection


@contextmanager
def transaction() -> Iterator[Connection]:
    """Executa o bloco em uma única transação: tudo é gravado ou nada é."""
    with get_connection() as conn:
        with conn.transaction():
            yield conn
