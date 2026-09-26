import psycopg
import pytest

from app.config.environment import env
from app.config.settings import Settings, build_database_url
from app.infrastructure.database import close_pool
from app.main import create_app
from scripts.database.reset import reset

# Os testes usam um banco separado para não apagar os dados de desenvolvimento.
TEST_DATABASE_URL = env("TEST_DATABASE_URL") or build_database_url(f"{env('POSTGRES_DB', 'gerenciador_empresas')}_test")


@pytest.fixture(scope="session")
def app():
    try:
        psycopg.connect(TEST_DATABASE_URL, connect_timeout=3).close()
    except psycopg.OperationalError as error:
        pytest.skip(f"Banco de testes indisponível ({error}). Crie-o ou defina TEST_DATABASE_URL.")

    app = create_app(Settings(database_url=TEST_DATABASE_URL, cors_origins=["*"]))
    app.config.update(TESTING=True)
    yield app
    close_pool(app)


@pytest.fixture
def client(app):
    # Cada teste começa com o banco recriado e os dados de exemplo.
    reset(TEST_DATABASE_URL)
    return app.test_client()
