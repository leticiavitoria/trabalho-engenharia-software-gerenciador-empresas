from dataclasses import dataclass

from psycopg.conninfo import make_conninfo

from app.config.environment import env


def build_database_url(database: str | None = None) -> str:
    """Monta a string de conexão a partir de DATABASE_URL ou das variáveis POSTGRES_*."""
    url = env("DATABASE_URL")
    if url and database is None:
        return url
    return make_conninfo(
        host=env("POSTGRES_HOST", "localhost"),
        port=env("POSTGRES_PORT", "5432"),
        dbname=database or env("POSTGRES_DB", "gerenciador_empresas"),
        user=env("POSTGRES_USER", "postgres"),
        password=env("POSTGRES_PASSWORD", "postgres"),
    )


@dataclass(frozen=True)
class Settings:
    database_url: str
    cors_origins: list[str]

    @classmethod
    def from_env(cls) -> "Settings":
        origins = env("CORS_ORIGINS", "*")
        return cls(
            database_url=build_database_url(),
            cors_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
        )
