"""Insere empresas e usuários fictícios de exemplo.

Uso: python -m scripts.database.seed
Só insere quando ainda não existe nenhuma empresa, para não duplicar dados.
"""

import psycopg

from app.config.settings import build_database_url

# Todos os registros abaixo são fictícios. Os CNPJs usam o prefixo 00.000.000,
# que não corresponde a nenhuma empresa real.
COMPANIES = [
    ("Aurora Tecnologia", "00.000.000/0001-01", "Tecnologia", "São Paulo / SP", "active",
     "contato@aurora.exemplo", "(11) 0000-0001", "2026-01-12"),
    ("Verde Campo", "00.000.000/0002-02", "Agronegócio", "Goiânia / GO", "active",
     "contato@verdecampo.exemplo", "(62) 0000-0002", "2026-02-03"),
    ("Norte Logística", "00.000.000/0003-03", "Logística", "Manaus / AM", "pending",
     "contato@nortelogistica.exemplo", "(92) 0000-0003", "2026-03-18"),
    ("Studio Forma", "00.000.000/0004-04", "Design", "Curitiba / PR", "active",
     "contato@studioforma.exemplo", None, "2026-05-07"),
    ("Costa & Mar", "00.000.000/0005-05", "Turismo", "Florianópolis / SC", "inactive",
     "contato@costaemar.exemplo", "(48) 0000-0005", "2026-06-22"),
    ("Ponto Saúde", "00.000.000/0006-06", "Saúde", "Recife / PE", "active",
     "contato@pontosaude.exemplo", "(81) 0000-0006", "2026-08-30"),
]

# (nome, e-mail, CNPJ da empresa, perfil, situação, último acesso)
USERS = [
    ("Mariana Alves", "mariana.alves@aurora.exemplo", "00.000.000/0001-01", "admin", "active",
     "2026-09-25 09:42:00-03"),
    ("Rafael Lima", "rafael.lima@verdecampo.exemplo", "00.000.000/0002-02", "editor", "active",
     "2026-09-24 17:15:00-03"),
    ("Beatriz Souza", "beatriz.souza@nortelogistica.exemplo", "00.000.000/0003-03", "viewer", "pending", None),
    ("Carlos Mendes", "carlos.mendes@studioforma.exemplo", "00.000.000/0004-04", "editor", "active",
     "2026-09-22 14:03:00-03"),
    ("Fernanda Rocha", "fernanda.rocha@costaemar.exemplo", "00.000.000/0005-05", "viewer", "inactive",
     "2026-08-10 11:20:00-03"),
    ("Lucas Pereira", "lucas.pereira@pontosaude.exemplo", "00.000.000/0006-06", "admin", "active",
     "2026-09-25 08:10:00-03"),
]


def seed(conninfo: str | None = None) -> bool:
    """Retorna True se os dados de exemplo foram inseridos."""
    with psycopg.connect(conninfo or build_database_url()) as conn:
        if conn.execute("SELECT EXISTS (SELECT 1 FROM companies)").fetchone()[0]:
            return False
        with conn.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO companies (name, cnpj, sector, city, status, email, phone, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                COMPANIES,
            )
            cursor.executemany(
                """
                INSERT INTO users (name, email, company_id, role_id, status, last_access_at)
                SELECT %s, %s, id, %s, %s, %s FROM companies WHERE cnpj = %s
                """,
                [(name, email, role, status, last_access, cnpj)
                 for name, email, cnpj, role, status, last_access in USERS],
            )
        return True


if __name__ == "__main__":
    print("Dados de exemplo inseridos." if seed() else "O banco já possui empresas; nada foi inserido.")
