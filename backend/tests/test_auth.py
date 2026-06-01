import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))
from main import app

client = TestClient(app)


def test_login_admin_success():
    response = client.post("/api/auth/login", json={
        "email": "admin@nextech.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    body = response.json()
    assert body["usuario"]["rol"] == "admin"
    assert body["usuario"]["email"] == "admin@nextech.com"


def test_login_wrong_password():
    response = client.post("/api/auth/login", json={
        "email": "admin@nextech.com",
        "password": "contrasena_incorrecta"
    })
    assert response.status_code == 401


def test_login_nonexistent_user():
    response = client.post("/api/auth/login", json={
        "email": "noexiste@test.com",
        "password": "123456"
    })
    assert response.status_code == 401


def test_login_operador_success():
    response = client.post("/api/auth/login", json={
        "email": "operador@nextech.com",
        "password": "nextech2024"
    })
    assert response.status_code == 200
    body = response.json()
    assert body["usuario"]["rol"] == "operador"


def test_register_missing_nombre():
    response = client.post("/api/auth/register", json={
        "nombre": "",
        "email": "test@test.com",
        "password": "password123"
    })
    assert response.status_code == 400


def test_register_missing_email():
    response = client.post("/api/auth/register", json={
        "nombre": "Usuario Test",
        "email": "",
        "password": "password123"
    })
    assert response.status_code == 400


def test_register_success():
    response = client.post("/api/auth/register", json={
        "nombre": "Usuario Prueba",
        "email": "prueba_test_unico@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    body = response.json()
    assert body["rol"] == "usuario"
    assert "password" not in body
    client.delete(f"/api/auth/users/{body['id']}")


def test_login_response_no_expone_password():
    response = client.post("/api/auth/login", json={
        "email": "admin@nextech.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    body = response.json()
    assert "password" not in body["usuario"]


def test_delete_user_success():
    nuevo = client.post("/api/auth/register", json={
        "nombre": "Usuario a Eliminar",
        "email": "eliminar@test.com",
        "password": "password123"
    })
    assert nuevo.status_code == 201
    user_id = nuevo.json()["id"]

    response = client.delete(f"/api/auth/users/{user_id}")
    assert response.status_code == 204


def test_delete_user_not_found():
    response = client.delete("/api/auth/users/id-inexistente")
    assert response.status_code == 404


def test_get_users_returns_id():
    response = client.get("/api/auth/users")
    assert response.status_code == 200
    users = response.json()
    assert len(users) > 0
    assert "id" in users[0]
