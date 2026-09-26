from collections.abc import Iterator
from contextlib import contextmanager

from psycopg import Connection

from app.infrastructure.database.pool import get_pool


@contextmanager
def get_connection() -> Iterator[Connection]:
    """Empresta uma conexão do pool; faz commit ao sair ou rollback em caso de erro."""
    with get_pool().connection() as conn:
        yield conn
