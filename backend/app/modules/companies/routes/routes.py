from flask import Blueprint

from app.modules.companies.controllers import company_controller

companies_bp = Blueprint("companies", __name__, url_prefix="/companies")

companies_bp.add_url_rule("", view_func=company_controller.index, methods=["GET"])
companies_bp.add_url_rule("", view_func=company_controller.store, methods=["POST"])
companies_bp.add_url_rule("/<int:company_id>", view_func=company_controller.show, methods=["GET"])
companies_bp.add_url_rule("/<int:company_id>", view_func=company_controller.update, methods=["PUT"])
companies_bp.add_url_rule("/<int:company_id>", view_func=company_controller.destroy, methods=["DELETE"])
