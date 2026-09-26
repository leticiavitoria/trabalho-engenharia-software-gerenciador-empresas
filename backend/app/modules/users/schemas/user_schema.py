from app.shared.validation import RECORD_STATUSES, PayloadValidator, require_json_object

INVALID_COMPANY = "Selecione uma empresa."
INVALID_ROLE = "Selecione um perfil de acesso válido."


def validate_user_payload(payload) -> dict:
    validator = PayloadValidator(require_json_object(payload))
    validator.required_text("name", "Informe o nome completo.", 150)
    validator.email("email", "Informe o e-mail.")
    validator.positive_int("companyId", INVALID_COMPANY)
    # A existência do perfil é garantida pela chave estrangeira em users.role_id.
    validator.required_text("role", INVALID_ROLE, 20)
    validator.choice("status", RECORD_STATUSES, "Selecione uma situação válida.", default="active")
    return validator.result()


def serialize_user(row: dict) -> dict:
    last_access = row["last_access_at"]
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "companyId": row["company_id"],
        "role": row["role_id"],
        "status": row["status"],
        "lastAccess": last_access.isoformat() if last_access else None,
    }
