import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))
from main import app
import storage

client = TestClient(app)

# IDs de prueba aislados para no afectar datos reales
TEST_USER_ID = "test_999"
TEST_PRODUCT_ID = "2"       # Dell XPS 15 — producto válido
PRODUCT_ID_2 = "3"          # segundo producto válido para PUT
NONEXISTENT_PRODUCT_ID = "9999"
NONEXISTENT_USER_ID = "9999"


@pytest.fixture(autouse=True)
def limpiar_wishlist_test():
    """Elimina la entrada de prueba antes y después de cada test."""
    _eliminar_entrada(TEST_USER_ID)
    yield
    _eliminar_entrada(TEST_USER_ID)


def _eliminar_entrada(user_id: str):
    data = storage.read_json("wishlist.json")
    data["wishlists"] = [w for w in data["wishlists"] if w["user_id"] != user_id]
    storage.write_json("wishlist.json", data)


# ─── CP-43 ──────────────────────────────────────────────────────────────────
def test_agregar_producto_a_wishlist_exitoso():
    response = client.post("/api/wishlist", json={
        "user_id": TEST_USER_ID,
        "product_id": TEST_PRODUCT_ID
    })
    assert response.status_code == 201
    body = response.json()
    assert body["user_id"] == TEST_USER_ID
    assert body["product_id"] == TEST_PRODUCT_ID


# ─── CP-44 ──────────────────────────────────────────────────────────────────
def test_obtener_wishlist_con_productos():
    client.post("/api/wishlist", json={
        "user_id": TEST_USER_ID,
        "product_id": TEST_PRODUCT_ID
    })
    response = client.get(f"/api/wishlist/{TEST_USER_ID}")
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == TEST_USER_ID
    assert isinstance(body["products"], list)
    assert len(body["products"]) == 1
    assert body["products"][0]["id"] == TEST_PRODUCT_ID


# ─── CP-45 ──────────────────────────────────────────────────────────────────
def test_obtener_wishlist_usuario_sin_wishlist_previa():
    response = client.get(f"/api/wishlist/{TEST_USER_ID}")
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == TEST_USER_ID
    assert body["products"] == []


# ─── CP-46 ──────────────────────────────────────────────────────────────────
def test_eliminar_producto_de_wishlist_exitoso():
    client.post("/api/wishlist", json={
        "user_id": TEST_USER_ID,
        "product_id": TEST_PRODUCT_ID
    })
    response = client.delete(f"/api/wishlist/{TEST_USER_ID}/{TEST_PRODUCT_ID}")
    assert response.status_code == 204

    get_response = client.get(f"/api/wishlist/{TEST_USER_ID}")
    assert get_response.json()["products"] == []


# ─── CP-47 ──────────────────────────────────────────────────────────────────
def test_eliminar_producto_wishlist_inexistente():
    response = client.delete(f"/api/wishlist/{TEST_USER_ID}/{TEST_PRODUCT_ID}")
    assert response.status_code == 404


# ─── CP-48 ──────────────────────────────────────────────────────────────────
def test_eliminar_producto_que_no_esta_en_wishlist():
    client.post("/api/wishlist", json={
        "user_id": TEST_USER_ID,
        "product_id": TEST_PRODUCT_ID
    })
    response = client.delete(f"/api/wishlist/{TEST_USER_ID}/{NONEXISTENT_PRODUCT_ID}")
    assert response.status_code == 404


# ─── CP-49 ──────────────────────────────────────────────────────────────────
def test_reemplazar_wishlist_completa():
    response = client.put(f"/api/wishlist/{TEST_USER_ID}", json={
        "products": [TEST_PRODUCT_ID, PRODUCT_ID_2]
    })
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == TEST_USER_ID
    assert TEST_PRODUCT_ID in body["products"]
    assert PRODUCT_ID_2 in body["products"]
    assert len(body["products"]) == 2


# ─── CP-50 — BUG-14: no verifica duplicados ─────────────────────────────────
def test_agregar_producto_duplicado_a_wishlist():
    """
    BUG-14: el sistema acepta el mismo producto dos veces en la wishlist.
    Resultado esperado: HTTP 409 Conflict.
    Resultado actual:   HTTP 201, producto duplicado en la lista.
    Este test FALLA para evidenciar el bug.
    """
    client.post("/api/wishlist", json={
        "user_id": TEST_USER_ID,
        "product_id": TEST_PRODUCT_ID
    })
    response = client.post("/api/wishlist", json={
        "user_id": TEST_USER_ID,
        "product_id": TEST_PRODUCT_ID
    })
    assert response.status_code == 409


# ─── CP-51 — BUG-15: no verifica existencia del producto ────────────────────
def test_agregar_producto_inexistente_a_wishlist():
    """
    BUG-15: el sistema agrega un product_id que no existe en products.json.
    Resultado esperado: HTTP 404 Not Found.
    Resultado actual:   HTTP 201, ID inexistente guardado en wishlist.
    Este test FALLA para evidenciar el bug.
    """
    response = client.post("/api/wishlist", json={
        "user_id": TEST_USER_ID,
        "product_id": NONEXISTENT_PRODUCT_ID
    })
    assert response.status_code == 404


# ─── CP-52 — BUG-16: no verifica existencia del usuario ─────────────────────
def test_agregar_producto_a_wishlist_usuario_inexistente():
    """
    BUG-16: el sistema crea una wishlist para un user_id que no existe en users.json.
    Resultado esperado: HTTP 404 Not Found.
    Resultado actual:   HTTP 201, wishlist creada para usuario inexistente.
    Este test FALLA para evidenciar el bug.
    """
    response = client.post("/api/wishlist", json={
        "user_id": NONEXISTENT_USER_ID,
        "product_id": TEST_PRODUCT_ID
    })
    _eliminar_entrada(NONEXISTENT_USER_ID)
    assert response.status_code == 404
