from psycopg import errors

from app.infrastructure.database import get_connection, transaction
from app.modules.permissions.repositories import permission_repository
from app.modules.permissions.schemas.permission_schema import (
    serialize_matrix,
    serialize_role_permission,
    validate_permission_payload,
)
from app.shared.errors import NotFoundError


def get_permission_matrix() -> dict:
    with get_connection() as conn:
        roles = permission_repository.find_roles(conn)
        permissions = permission_repository.find_permissions(conn)
        cells = permission_repository.find_role_permissions(conn)
    return serialize_matrix(roles, permissions, cells)


def set_role_permission(permission_id: str, role_id: str, payload) -> dict:
    data = validate_permission_payload(payload)
    try:
        with transaction() as conn:
            row = permission_repository.upsert_role_permission(conn, permission_id, role_id, data["enabled"])
    except errors.ForeignKeyViolation as error:
        raise NotFoundError("Perfil ou funcionalidade não encontrado.") from error
    return serialize_role_permission(row)
