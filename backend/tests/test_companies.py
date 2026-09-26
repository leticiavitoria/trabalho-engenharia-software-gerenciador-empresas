VALID_COMPANY = {
    "name": "Nova Era",
    "cnpj": "00.000.000/0007-07",
    "sector": "Educação",
    "city": "Natal / RN",
    "email": "contato@novaera.exemplo",
}


def test_lists_seeded_companies_in_insertion_order(client):
    response = client.get("/api/companies")

    assert response.status_code == 200
    names = [company["name"] for company in response.json]
    assert names == [
        "Aurora Tecnologia",
        "Verde Campo",
        "Norte Logística",
        "Studio Forma",
        "Costa & Mar",
        "Ponto Saúde",
    ]
    assert response.json[3]["phone"] is None
    assert response.json[0]["createdAt"] == "2026-01-12"


def test_creates_company_with_active_status_by_default(client):
    response = client.post("/api/companies", json={**VALID_COMPANY, "phone": "  "})

    assert response.status_code == 201
    body = response.json
    assert body["status"] == "active"
    assert body["phone"] is None
    assert client.get(f"/api/companies/{body['id']}").json == body


def test_rejects_invalid_company_with_field_errors(client):
    response = client.post("/api/companies", json={"name": " ", "email": "sem-arroba", "status": "unknown"})

    assert response.status_code == 422
    assert response.json["fields"] == {
        "name": "Informe o nome da empresa.",
        "cnpj": "Informe o CNPJ fictício.",
        "sector": "Informe o segmento.",
        "city": "Informe a cidade e a UF.",
        "status": "Selecione uma situação válida.",
        "email": "Informe um e-mail válido, como nome@empresa.com.",
    }
    assert len(client.get("/api/companies").json) == 6


def test_rejects_non_object_body(client):
    response = client.post("/api/companies", data="texto", content_type="text/plain")

    assert response.status_code == 400


def test_rejects_duplicate_cnpj(client):
    response = client.post("/api/companies", json={**VALID_COMPANY, "cnpj": "00.000.000/0001-01"})

    assert response.status_code == 409
    assert "cnpj" in response.json["fields"]


def test_update_keeps_id_and_registration_date(client):
    original = client.get("/api/companies/1").json

    response = client.put("/api/companies/1", json={**original, "name": "Aurora Digital", "status": "pending"})

    assert response.status_code == 200
    assert response.json == {**original, "name": "Aurora Digital", "status": "pending"}


def test_update_unknown_company_returns_404(client):
    response = client.put("/api/companies/999", json=VALID_COMPANY)

    assert response.status_code == 404


def test_delete_company_cascades_to_its_users(client):
    response = client.delete("/api/companies/1")

    assert response.status_code == 204
    assert client.get("/api/companies/1").status_code == 404
    users = client.get("/api/users").json
    assert len(users) == 5
    assert all(user["companyId"] != 1 for user in users)
    assert client.delete("/api/companies/1").status_code == 404
