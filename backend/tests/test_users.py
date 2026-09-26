VALID_USER = {
    "name": "Paula Nunes",
    "email": "paula@aurora.exemplo",
    "companyId": 1,
    "role": "editor",
    "status": "pending",
}


def test_lists_seeded_users(client):
    response = client.get("/api/users")

    assert response.status_code == 200
    assert len(response.json) == 6
    beatriz = next(user for user in response.json if user["name"] == "Beatriz Souza")
    assert beatriz == {
        "id": beatriz["id"],
        "name": "Beatriz Souza",
        "email": "beatriz.souza@nortelogistica.exemplo",
        "companyId": 3,
        "role": "viewer",
        "status": "pending",
        "lastAccess": None,
    }


def test_creates_user_that_never_accessed(client):
    response = client.post("/api/users", json=VALID_USER)

    assert response.status_code == 201
    assert response.json["lastAccess"] is None
    assert response.json["companyId"] == 1
    assert client.get(f"/api/users/{response.json['id']}").json == response.json


def test_accepts_company_id_as_numeric_string(client):
    response = client.post("/api/users", json={**VALID_USER, "companyId": "2"})

    assert response.status_code == 201
    assert response.json["companyId"] == 2


def test_rejects_invalid_user(client):
    response = client.post("/api/users", json={"email": "sem-arroba", "companyId": "abc", "role": ""})

    assert response.status_code == 422
    assert set(response.json["fields"]) == {"name", "email", "companyId", "role"}


def test_rejects_unknown_company(client):
    response = client.post("/api/users", json={**VALID_USER, "companyId": 999})

    assert response.status_code == 422
    assert response.json["fields"] == {"companyId": "Selecione uma empresa."}


def test_rejects_unknown_role(client):
    response = client.post("/api/users", json={**VALID_USER, "role": "root"})

    assert response.status_code == 422
    assert response.json["fields"] == {"role": "Selecione um perfil de acesso válido."}


def test_rejects_duplicate_email_ignoring_case(client):
    response = client.post("/api/users", json={**VALID_USER, "email": "MARIANA.ALVES@aurora.exemplo"})

    assert response.status_code == 409
    assert "email" in response.json["fields"]


def test_update_keeps_id_and_last_access(client):
    original = client.get("/api/users/1").json

    response = client.put(
        "/api/users/1",
        json={**original, "companyId": 2, "role": "viewer", "status": "inactive"},
    )

    assert response.status_code == 200
    assert response.json == {**original, "companyId": 2, "role": "viewer", "status": "inactive"}


def test_delete_user_removes_only_that_user(client):
    assert client.delete("/api/users/3").status_code == 204

    users = client.get("/api/users").json
    assert len(users) == 5
    assert all(user["id"] != 3 for user in users)
    assert len(client.get("/api/companies").json) == 6
    assert client.delete("/api/users/3").status_code == 404
