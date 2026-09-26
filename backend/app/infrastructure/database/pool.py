from flask import Flask, current_app
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

EXTENSION_KEY = "db_pool"


def init_pool(app: Flask, conninfo: str) -> ConnectionPool:
    pool = ConnectionPool(
        conninfo=conninfo,
        min_size=1,
        max_size=10,
        timeout=5,
        # Cada linha retornada vira um dicionário {coluna: valor}.
        kwargs={"row_factory": dict_row},
        open=True,
    )
    app.extensions[EXTENSION_KEY] = pool
    return pool


def get_pool() -> ConnectionPool:
    return current_app.extensions[EXTENSION_KEY]


def close_pool(app: Flask) -> None:
    pool = app.extensions.pop(EXTENSION_KEY, None)
    if pool is not None:
        pool.close()
