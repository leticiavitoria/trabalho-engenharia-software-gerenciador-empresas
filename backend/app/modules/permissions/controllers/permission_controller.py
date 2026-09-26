from flask import jsonify, request

from app.modules.permissions.services import permission_service


def index():
    return jsonify(permission_service.get_permission_matrix())


def update(permission_id: str, role_id: str):
    cell = permission_service.set_role_permission(permission_id, role_id, request.get_json(silent=True))
    return jsonify(cell)
