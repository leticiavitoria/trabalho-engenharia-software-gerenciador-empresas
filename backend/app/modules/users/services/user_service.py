from contextlib import contextmanager

from psycopg import errors

from app.infrastructure.database import get_connection, transaction
from app.modules.users.repositories import user_repository
from app.modules.users.schemas.user_schema import (
    INVALID_COMPANY,
    INVALID_ROLE,
    serialize_user,
    validate_user_payload,
)
from app.shared.errors import ConflictError, NotFoundError, ValidationError

NOT_FOUND_MESSAGE = "Usuário não encontrado."


@contextmanager
def _translate_integrity_errors():
    """Converte violações de restrições do banco em erros por campo."""
    try:
        yield
    except errors.UniqueViolation as error:
        raise ConflictError("E-mail já cadastrado.", {"email": "Já existe um usuário com este e-mail."}) from error
    except errors.ForeignKeyViolation as error:
        if error.diag.constraint_name == "users_role_id_fkey":
            raise ValidationError({"role": INVALID_ROLE}) from error
        raise ValidationError({"companyId": INVALID_COMPANY}) from error


def list_users() -> list[dict]:
    with get_connection() as conn:
        return [serialize_user(row) for row in user_repository.find_all(conn)]


def get_user(user_id: int) -> dict:
    with get_connection() as conn:
        row = user_repository.find_by_id(conn, user_id)
    if row is None:
        raise NotFoundError(NOT_FOUND_MESSAGE)
    return serialize_user(row)


def create_user(payload) -> dict:
    data = validate_user_payload(payload)
    with _translate_integrity_errors(), transaction() as conn:
        row = user_repository.insert(conn, data)
    return serialize_user(row)


def update_user(user_id: int, payload) -> dict:
    data = validate_user_payload(payload)
    with _translate_integrity_errors(), transaction() as conn:
        row = user_repository.update(conn, user_id, data)
    if row is None:
        raise NotFoundError(NOT_FOUND_MESSAGE)
    return serialize_user(row)


def delete_user(user_id: int) -> None:
    with transaction() as conn:
        deleted = user_repository.delete(conn, user_id)
    if not deleted:
        raise NotFoundError(NOT_FOUND_MESSAGE)
