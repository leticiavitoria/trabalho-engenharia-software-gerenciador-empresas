from psycopg import Connection

COLUMNS = "id, name, cnpj, sector, city, status, email, phone, created_at"


def find_all(conn: Connection) -> list[dict]:
    # Ordem de inserção: a Visão geral usa os últimos como "empresas recentes".
    return conn.execute(f"SELECT {COLUMNS} FROM companies ORDER BY id").fetchall()


def find_by_id(conn: Connection, company_id: int) -> dict | None:
    return conn.execute(f"SELECT {COLUMNS} FROM companies WHERE id = %s", (company_id,)).fetchone()


def insert(conn: Connection, data: dict) -> dict:
    return conn.execute(
        f"""
        INSERT INTO companies (name, cnpj, sector, city, status, email, phone)
        VALUES (%(name)s, %(cnpj)s, %(sector)s, %(city)s, %(status)s, %(email)s, %(phone)s)
        RETURNING {COLUMNS}
        """,
        data,
    ).fetchone()


def update(conn: Connection, company_id: int, data: dict) -> dict | None:
    return conn.execute(
        f"""
        UPDATE companies
           SET name = %(name)s, cnpj = %(cnpj)s, sector = %(sector)s, city = %(city)s,
               status = %(status)s, email = %(email)s, phone = %(phone)s, updated_at = now()
         WHERE id = %(id)s
        RETURNING {COLUMNS}
        """,
        {**data, "id": company_id},
    ).fetchone()


def delete(conn: Connection, company_id: int) -> bool:
    # Os usuários vinculados são removidos pelo ON DELETE CASCADE.
    return conn.execute("DELETE FROM companies WHERE id = %s", (company_id,)).rowcount > 0
