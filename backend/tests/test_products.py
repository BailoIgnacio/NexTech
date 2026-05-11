import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))
from main import app

client = TestClient(app)


def test_get_products_returns_paginated_list():
    response = client.get("/api/products")
    assert response.status_code == 200
    body = response.json()
    assert "data" in body
    assert "total" in body
    assert "page" in body
    assert isinstance(body["data"], list)


def test_get_products_filter_by_categoria():
    response = client.get("/api/products?categoria=Laptops")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0
    assert all(p["categoria"] == "Laptops" for p in data)


def test_get_products_filter_by_destacado():
    response = client.get("/api/products?destacado=true")
    assert response.status_code == 200
    data = response.json()["data"]
    assert all(p["destacado"] is True for p in data)


def test_get_products_pagination():
    response = client.get("/api/products?page=1&limit=4")
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) <= 4


def test_get_product_by_id_success():
    response = client.get("/api/products/a0b1c001-0000-4000-8000-000000000000")
    assert response.status_code == 200
    product = response.json()
    assert product["nombre"] == "MacBook Air M2"


def test_get_product_not_found():
    response = client.get("/api/products/id-que-no-existe")
    assert response.status_code == 404


def test_create_product_missing_nombre():
    response = client.post("/api/products", json={"precio": 100})
    assert response.status_code == 422


def test_create_product_invalid_precio():
    response = client.post("/api/products", json={"nombre": "Test", "precio": -50})
    assert response.status_code == 400


def test_create_product_success():
    payload = {"nombre": "Producto Test", "precio": 50000, "categoria": "Accesorios"}
    response = client.post("/api/products", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["nombre"] == "Producto Test"
    assert "id" in body
    # Limpieza: elimina el producto creado
    client.delete(f"/api/products/{body['id']}")


def test_delete_product_not_found():
    response = client.delete("/api/products/id-inexistente")
    assert response.status_code == 404
