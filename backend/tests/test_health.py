def test_health_checks_the_database(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json == {"status": "ok", "database": "ok"}


def test_unknown_route_returns_json_404(client):
    response = client.get("/api/nao-existe")

    assert response.status_code == 404
    assert response.json["error"] == "not_found"
