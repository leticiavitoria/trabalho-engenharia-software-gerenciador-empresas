from app.shared.validation import PayloadValidator, require_json_object


def validate_permission_payload(payload) -> dict:
    validator = PayloadValidator(require_json_object(payload))
    validator.boolean("enabled", "Informe verdadeiro ou falso.")
    return validator.result()


def serialize_matrix(roles: list[dict], permissions: list[dict], cells: list[dict]) -> dict:
    # Toda combinação começa desativada; as linhas gravadas sobrescrevem o padrão.
    matrix = {permission["id"]: {role["id"]: False for role in roles} for permission in permissions}
    for cell in cells:
        matrix[cell["permission_id"]][cell["role_id"]] = cell["enabled"]
    return {
        "roles": [{"id": role["id"], "name": role["name"], "description": role["description"]} for role in roles],
        "permissions": [{"id": permission["id"], "label": permission["label"]} for permission in permissions],
        "matrix": matrix,
    }


def serialize_role_permission(row: dict) -> dict:
    return {"permissionId": row["permission_id"], "roleId": row["role_id"], "enabled": row["enabled"]}
