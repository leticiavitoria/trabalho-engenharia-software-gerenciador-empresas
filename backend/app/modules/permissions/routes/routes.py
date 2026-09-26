from flask import Blueprint

from app.modules.permissions.controllers import permission_controller

permissions_bp = Blueprint("permissions", __name__, url_prefix="/permissions")

permissions_bp.add_url_rule("", view_func=permission_controller.index, methods=["GET"])
permissions_bp.add_url_rule(
    "/<permission_id>/roles/<role_id>", view_func=permission_controller.update, methods=["PUT"]
)
