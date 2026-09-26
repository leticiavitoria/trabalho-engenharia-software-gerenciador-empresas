from flask import jsonify, request

from app.modules.companies.services import company_service


def index():
    return jsonify(company_service.list_companies())


def show(company_id: int):
    return jsonify(company_service.get_company(company_id))


def store():
    company = company_service.create_company(request.get_json(silent=True))
    return jsonify(company), 201


def update(company_id: int):
    return jsonify(company_service.update_company(company_id, request.get_json(silent=True)))


def destroy(company_id: int):
    company_service.delete_company(company_id)
    return "", 204
