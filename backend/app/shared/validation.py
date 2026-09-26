import re
from typing import Any

from app.shared.errors import BadRequestError, ValidationError

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
RECORD_STATUSES = ("active", "pending", "inactive")


def require_json_object(payload: Any) -> dict:
    if not isinstance(payload, dict):
        raise BadRequestError("Envie um objeto JSON no corpo da requisição.")
    return payload


class PayloadValidator:
    """Valida os campos de um payload e acumula as mensagens de erro por campo."""

    def __init__(self, payload: dict):
        self.payload = payload
        self.data: dict[str, Any] = {}
        self.errors: dict[str, str] = {}

    def _text(self, field: str) -> str:
        value = self.payload.get(field)
        return value.strip() if isinstance(value, str) else ""

    def required_text(self, field: str, message: str, max_length: int) -> None:
        value = self._text(field)
        if not value:
            self.errors[field] = message
        elif len(value) > max_length:
            self.errors[field] = f"Use no máximo {max_length} caracteres."
        else:
            self.data[field] = value

    def optional_text(self, field: str, max_length: int) -> None:
        value = self._text(field)
        if len(value) > max_length:
            self.errors[field] = f"Use no máximo {max_length} caracteres."
        else:
            self.data[field] = value or None

    def email(self, field: str, required_message: str) -> None:
        value = self._text(field)
        if not value:
            self.errors[field] = required_message
        elif not EMAIL_PATTERN.match(value) or len(value) > 254:
            self.errors[field] = "Informe um e-mail válido, como nome@empresa.com."
        else:
            self.data[field] = value

    def choice(self, field: str, choices: tuple[str, ...], message: str, default: str | None = None) -> None:
        value = self.payload.get(field, default)
        if value not in choices:
            self.errors[field] = message
        else:
            self.data[field] = value

    def positive_int(self, field: str, message: str) -> None:
        value = self.payload.get(field)
        if isinstance(value, str) and value.strip().isdigit():
            value = int(value)
        if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
            self.errors[field] = message
        else:
            self.data[field] = value

    def boolean(self, field: str, message: str) -> None:
        value = self.payload.get(field)
        if not isinstance(value, bool):
            self.errors[field] = message
        else:
            self.data[field] = value

    def result(self) -> dict[str, Any]:
        if self.errors:
            raise ValidationError(self.errors)
        return self.data
