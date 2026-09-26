from psycopg import Connection

COLUMNS = "id, name, email, company_id, role_id, status, last_access_at"


def find_all(conn: Connection) -> list[dict]:
    return conn.execute(f"SELECT {COLUMNS} FROM users ORDER BY id").fetchall()


def find_by_id(conn: Connection, user_id: int) -> dict | None:
    return conn.execute(f"SELECT {COLUMNS} FROM users WHERE id = %s", (user_id,)).fetchone()


def insert(conn: Connection, data: dict) -> dict:
    return conn.execute(
        f"""
        INSERT INTO users (name, email, company_id, role_id, status)
        VALUES (%(name)s, %(email)s, %(companyId)s, %(role)s, %(status)s)
        RETURNING {COLUMNS}
        """,
        data,
    ).fetchone()


def update(conn: Connection, user_id: int, data: dict) -> dict | None:
    # O último acesso não é alterado pela edição do cadastro.
    return conn.execute(
        f"""
        UPDATE users
           SET name = %(name)s, email = %(email)s, company_id = %(companyId)s,
               role_id = %(role)s, status = %(status)s, updated_at = now()
         WHERE id = %(id)s
        RETURNING {COLUMNS}
        """,
        {**data, "id": user_id},
    ).fetchone()


def delete(conn: Connection, user_id: int) -> bool:
    return conn.execute("DELETE FROM users WHERE id = %s", (user_id,)).rowcount > 0
