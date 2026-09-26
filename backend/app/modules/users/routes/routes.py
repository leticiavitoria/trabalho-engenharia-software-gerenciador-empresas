from flask import Blueprint

from app.modules.users.controllers import user_controller

users_bp = Blueprint("users", __name__, url_prefix="/users")

users_bp.add_url_rule("", view_func=user_controller.index, methods=["GET"])
users_bp.add_url_rule("", view_func=user_controller.store, methods=["POST"])
users_bp.add_url_rule("/<int:user_id>", view_func=user_controller.show, methods=["GET"])
users_bp.add_url_rule("/<int:user_id>", view_func=user_controller.update, methods=["PUT"])
users_bp.add_url_rule("/<int:user_id>", view_func=user_controller.destroy, methods=["DELETE"])
