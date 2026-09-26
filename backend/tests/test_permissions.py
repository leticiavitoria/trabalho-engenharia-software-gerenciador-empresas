SEED_MATRIX = {
    "companies.view": {"admin": True, "editor": True, "viewer": True},
    "companies.create": {"admin": True, "editor": True, "viewer": False},
    "companies.edit": {"admin": True, "editor": True, "viewer": False},
    "companies.delete": {"admin": True, "editor": False, "viewer": False},
    "users.view": {"admin": True, "editor": True, "viewer": True},
    "users.manage": {"admin": True, "editor": False, "viewer": False},
    "permissions.manage": {"admin": True, "editor": False, "viewer": False},
}


def test_returns_seed_matrix(client):
    response = client.get("/api/permissions")

    assert response.status_code == 200
    assert response.json["matrix"] == SEED_MATRIX
    assert [role["name"] for role in response.json["roles"]] == ["Administrador", "Editor", "Visualizador"]
    assert len(response.json["permissions"]) == 7


def test_updates_only_the_selected_cell(client):
    response = client.put("/api/permissions/companies.delete/roles/editor", json={"enabled": True})

    assert response.status_code == 200
    assert response.json == {"permissionId": "companies.delete", "roleId": "editor", "enabled": True}
    matrix = client.get("/api/permissions").json["matrix"]
    expected = {**SEED_MATRIX, "companies.delete": {"admin": True, "editor": True, "viewer": False}}
    assert matrix == expected


def test_changing_the_matrix_does_not_touch_user_roles(client):
    roles_before = [user["role"] for user in client.get("/api/users").json]

    client.put("/api/permissions/users.manage/roles/viewer", json={"enabled": True})

    assert [user["role"] for user in client.get("/api/users").json] == roles_before


def test_rejects_non_boolean_value(client):
    response = client.put("/api/permissions/companies.delete/roles/editor", json={"enabled": "sim"})

    assert response.status_code == 422


def test_unknown_permission_or_role_returns_404(client):
    assert client.put("/api/permissions/nope/roles/editor", json={"enabled": True}).status_code == 404
    assert client.put("/api/permissions/companies.view/roles/nope", json={"enabled": True}).status_code == 404
