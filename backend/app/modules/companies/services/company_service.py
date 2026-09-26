from psycopg import errors

from app.infrastructure.database import get_connection, transaction
from app.modules.companies.repositories import company_repository
from app.modules.companies.schemas.company_schema import serialize_company, validate_company_payload
from app.shared.errors import ConflictError, NotFoundError

NOT_FOUND_MESSAGE = "Empresa não encontrada."
DUPLICATE_CNPJ = {"cnpj": "Já existe uma empresa com este CNPJ."}


def list_companies() -> list[dict]:
    with get_connection() as conn:
        return [serialize_company(row) for row in company_repository.find_all(conn)]


def get_company(company_id: int) -> dict:
    with get_connection() as conn:
        row = company_repository.find_by_id(conn, company_id)
    if row is None:
        raise NotFoundError(NOT_FOUND_MESSAGE)
    return serialize_company(row)


def create_company(payload) -> dict:
    data = validate_company_payload(payload)
    try:
        with transaction() as conn:
            row = company_repository.insert(conn, data)
    except errors.UniqueViolation as error:
        raise ConflictError("CNPJ já cadastrado.", DUPLICATE_CNPJ) from error
    return serialize_company(row)


def update_company(company_id: int, payload) -> dict:
    data = validate_company_payload(payload)
    try:
        with transaction() as conn:
            row = company_repository.update(conn, company_id, data)
    except errors.UniqueViolation as error:
        raise ConflictError("CNPJ já cadastrado.", DUPLICATE_CNPJ) from error
    if row is None:
        raise NotFoundError(NOT_FOUND_MESSAGE)
    return serialize_company(row)


def delete_company(company_id: int) -> None:
    with transaction() as conn:
        deleted = company_repository.delete(conn, company_id)
    if not deleted:
        raise NotFoundError(NOT_FOUND_MESSAGE)
