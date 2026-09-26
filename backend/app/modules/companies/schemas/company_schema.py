from app.shared.validation import RECORD_STATUSES, PayloadValidator, require_json_object


def validate_company_payload(payload) -> dict:
    validator = PayloadValidator(require_json_object(payload))
    validator.required_text("name", "Informe o nome da empresa.", 150)
    validator.required_text("cnpj", "Informe o CNPJ fictício.", 18)
    validator.required_text("sector", "Informe o segmento.", 100)
    validator.required_text("city", "Informe a cidade e a UF.", 120)
    # Novo cadastro começa como ativo, como no protótipo.
    validator.choice("status", RECORD_STATUSES, "Selecione uma situação válida.", default="active")
    validator.email("email", "Informe o e-mail de contato.")
    validator.optional_text("phone", 30)
    return validator.result()


def serialize_company(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "cnpj": row["cnpj"],
        "sector": row["sector"],
        "city": row["city"],
        "status": row["status"],
        "email": row["email"],
        "phone": row["phone"],
        "createdAt": row["created_at"].isoformat(),
    }
