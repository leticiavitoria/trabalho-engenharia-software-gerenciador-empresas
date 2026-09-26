import logging

from flask import Flask, jsonify
from psycopg import OperationalError
from psycopg_pool import PoolTimeout
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)


class ApiError(Exception):
    """Erro de negócio convertido em resposta JSON com o status HTTP correspondente."""

    status_code = 400
    code = "bad_request"

    def __init__(self, message: str, fields: dict[str, str] | None = None):
        super().__init__(message)
        self.message = message
        self.fields = fields or {}

    def to_dict(self) -> dict:
        body = {"error": self.code, "message": self.message}
        if self.fields:
            body["fields"] = self.fields
        return body


class BadRequestError(ApiError):
    status_code = 400
    code = "bad_request"


class NotFoundError(ApiError):
    status_code = 404
    code = "not_found"


class ConflictError(ApiError):
    status_code = 409
    code = "conflict"


class ValidationError(ApiError):
    status_code = 422
    code = "validation_error"

    def __init__(self, fields: dict[str, str], message: str = "Verifique os campos destacados."):
        super().__init__(message, fields)


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_error(error: HTTPException):
        messages = {404: "Recurso não encontrado.", 405: "Método não permitido para este endereço."}
        body = {"error": error.name.lower().replace(" ", "_"), "message": messages.get(error.code, error.description)}
        return jsonify(body), error.code

    @app.errorhandler(PoolTimeout)
    @app.errorhandler(OperationalError)
    def handle_database_unavailable(error: Exception):
        logger.error("Banco de dados indisponível: %s", error)
        body = {"error": "database_unavailable", "message": "Não foi possível conectar ao banco de dados."}
        return jsonify(body), 503

    @app.errorhandler(Exception)
    def handle_unexpected_error(error: Exception):
        logger.exception("Erro inesperado", exc_info=error)
        body = {"error": "internal_error", "message": "Ocorreu um erro inesperado no servidor."}
        return jsonify(body), 500
