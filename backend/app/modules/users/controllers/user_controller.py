from flask import jsonify, request

from app.modules.users.services import user_service


def index():
    return jsonify(user_service.list_users())


def show(user_id: int):
    return jsonify(user_service.get_user(user_id))


def store():
    user = user_service.create_user(request.get_json(silent=True))
    return jsonify(user), 201


def update(user_id: int):
    return jsonify(user_service.update_user(user_id, request.get_json(silent=True)))


def destroy(user_id: int):
    user_service.delete_user(user_id)
    return "", 204
