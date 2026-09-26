import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]

# Variáveis já definidas no ambiente (ex.: pelo Docker Compose) têm prioridade sobre o .env.
load_dotenv(BACKEND_DIR / ".env")


def env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    return value if value not in (None, "") else default
