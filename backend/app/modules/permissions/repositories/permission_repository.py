from psycopg import Connection


def find_roles(conn: Connection) -> list[dict]:
    return conn.execute("SELECT id, name, description FROM roles ORDER BY position").fetchall()


def find_permissions(conn: Connection) -> list[dict]:
    return conn.execute("SELECT id, label FROM permissions ORDER BY position").fetchall()


def find_role_permissions(conn: Connection) -> list[dict]:
    return conn.execute("SELECT role_id, permission_id, enabled FROM role_permissions").fetchall()


def upsert_role_permission(conn: Connection, permission_id: str, role_id: str, enabled: bool) -> dict:
    return conn.execute(
        """
        INSERT INTO role_permissions (role_id, permission_id, enabled)
        VALUES (%s, %s, %s)
        ON CONFLICT (role_id, permission_id)
        DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()
        RETURNING role_id, permission_id, enabled
        """,
        (role_id, permission_id, enabled),
    ).fetchone()
