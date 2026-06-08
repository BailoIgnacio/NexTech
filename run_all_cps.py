"""
Ejecución automatizada - 52 Casos de Prueba NexTech
Materia: Testing de Aplicaciones - UADE - Grupo TesTeam
Ejecutar desde la raíz del repositorio: python run_all_cps.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from fastapi.testclient import TestClient
from main import app
import storage

client = TestClient(app)

results = []


def cp(cp_id, descripcion, modulo, http_esperado, fn, notas=""):
    try:
        http_obtenido, ok = fn()
        estado = "APROBADO" if ok else "FALLA"
    except Exception as e:
        http_obtenido, ok, estado = f"ERROR", False, "ERROR"
        notas = f"{notas} | exc: {e}"
    results.append({
        "id": cp_id,
        "desc": descripcion,
        "modulo": modulo,
        "esp": str(http_esperado),
        "obt": str(http_obtenido),
        "estado": estado,
        "notas": notas,
    })
    sym = "✓" if ok else ("!" if estado == "ERROR" else "✗")
    print(f"  {sym} {cp_id}: {descripcion[:55]:<56} [{http_obtenido}]")


# ─── Utilidades de limpieza ────────────────────────────────────────────────────

def _cleanup_user_by_email(email):
    try:
        users = client.get("/api/auth/users").json()
        for u in users:
            if u.get("email") == email:
                client.delete(f"/api/auth/users/{u['id']}")
    except Exception:
        pass


def _cleanup_product_by_nombre(nombre):
    try:
        all_p = client.get("/api/products").json().get("data", [])
        for p in all_p:
            if p.get("nombre") == nombre:
                client.delete(f"/api/products/{p['id']}")
    except Exception:
        pass


def _wl_clean(*user_ids):
    try:
        data = storage.read_json("wishlist.json")
        data["wishlists"] = [w for w in data["wishlists"] if w["user_id"] not in user_ids]
        storage.write_json("wishlist.json", data)
    except Exception:
        pass


# ═══════════════════════════════════════════════════════════════════════════════
print("\n▶ MÓDULO: AUTENTICACIÓN (CP-01 a CP-14)")
# ═══════════════════════════════════════════════════════════════════════════════

def fn_cp01():
    _cleanup_user_by_email("cp01@nextech.com")
    r = client.post("/api/auth/register", json={
        "nombre": "CP01 Test", "email": "cp01@nextech.com", "password": "password123"
    })
    _cleanup_user_by_email("cp01@nextech.com")
    return r.status_code, r.status_code == 201

cp("CP-01", "Registro exitoso de nuevo usuario", "Autenticación", 201, fn_cp01)


def fn_cp02():
    # BUG-01: no verifica duplicados de email
    _cleanup_user_by_email("cp02_dup@nextech.com")
    client.post("/api/auth/register", json={
        "nombre": "Original", "email": "cp02_dup@nextech.com", "password": "password123"
    })
    r = client.post("/api/auth/register", json={
        "nombre": "Duplicado", "email": "cp02_dup@nextech.com", "password": "password123"
    })
    _cleanup_user_by_email("cp02_dup@nextech.com")
    return r.status_code, r.status_code == 409

cp("CP-02", "Registro con email ya existente rechazado (409)", "Autenticación", 409, fn_cp02,
   "BUG-01: acepta email duplicado, crea usuario extra")


def fn_cp03():
    r = client.post("/api/auth/register", json={
        "nombre": "", "email": "cp03@test.com", "password": "password123"
    })
    return r.status_code, r.status_code == 400

cp("CP-03", "Registro sin nombre retorna 400", "Autenticación", 400, fn_cp03)


def fn_cp04():
    r = client.post("/api/auth/register", json={
        "nombre": "Test", "email": "", "password": "password123"
    })
    return r.status_code, r.status_code == 400

cp("CP-04", "Registro sin email retorna 400", "Autenticación", 400, fn_cp04)


def fn_cp05():
    r = client.post("/api/auth/register", json={
        "nombre": "Test", "email": "cp05@test.com", "password": ""
    })
    return r.status_code, r.status_code == 400

cp("CP-05", "Registro sin contraseña retorna 400", "Autenticación", 400, fn_cp05)


def fn_cp06():
    # BUG-08: no valida longitud mínima de contraseña (RNF-02: ≥8 chars)
    _cleanup_user_by_email("cp06@test.com")
    r = client.post("/api/auth/register", json={
        "nombre": "Test", "email": "cp06@test.com", "password": "abc"
    })
    _cleanup_user_by_email("cp06@test.com")
    return r.status_code, r.status_code == 400

cp("CP-06", "Contraseña < 8 chars rechazada (400)", "Autenticación", 400, fn_cp06,
   "BUG-08: acepta contraseñas de cualquier longitud")


def fn_cp07():
    r = client.post("/api/auth/login", json={
        "email": "admin@nextech.com", "password": "admin123"
    })
    ok = r.status_code == 200 and r.json().get("usuario", {}).get("rol") == "admin"
    return r.status_code, ok

cp("CP-07", "Login exitoso como admin", "Autenticación", 200, fn_cp07)


def fn_cp08():
    r = client.post("/api/auth/login", json={
        "email": "operador@nextech.com", "password": "nextech2024"
    })
    ok = r.status_code == 200 and r.json().get("usuario", {}).get("rol") == "operador"
    return r.status_code, ok

cp("CP-08", "Login exitoso como operador", "Autenticación", 200, fn_cp08)


def fn_cp09():
    r = client.post("/api/auth/login", json={
        "email": "admin@nextech.com", "password": "contrasenaIncorrecta"
    })
    return r.status_code, r.status_code == 401

cp("CP-09", "Login con contraseña incorrecta retorna 401", "Autenticación", 401, fn_cp09)


def fn_cp10():
    r = client.post("/api/auth/login", json={
        "email": "noexiste@test.com", "password": "123456"
    })
    return r.status_code, r.status_code == 401

cp("CP-10", "Login con usuario inexistente retorna 401", "Autenticación", 401, fn_cp10)


def fn_cp11():
    r = client.post("/api/auth/login", json={
        "email": "admin@nextech.com", "password": "admin123"
    })
    ok = r.status_code == 200 and "password" not in r.json().get("usuario", {})
    return r.status_code, ok

cp("CP-11", "Respuesta de login no expone contraseña", "Autenticación", 200, fn_cp11)


def fn_cp12():
    r = client.get("/api/auth/users")
    ok = r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) > 0
    return r.status_code, ok

cp("CP-12", "Listar todos los usuarios registrados", "Autenticación", 200, fn_cp12)


def fn_cp13():
    nu = client.post("/api/auth/register", json={
        "nombre": "CP13 Eliminar", "email": "cp13_del@test.com", "password": "password123"
    })
    uid = nu.json()["id"]
    r = client.delete(f"/api/auth/users/{uid}")
    return r.status_code, r.status_code == 204

cp("CP-13", "Eliminar usuario existente retorna 204", "Autenticación", 204, fn_cp13)


def fn_cp14():
    r = client.delete("/api/auth/users/id-inexistente-9999")
    return r.status_code, r.status_code == 404

cp("CP-14", "Eliminar usuario inexistente retorna 404", "Autenticación", 404, fn_cp14)


# ═══════════════════════════════════════════════════════════════════════════════
print("\n▶ MÓDULO: PRODUCTOS (CP-15 a CP-35)")
# ═══════════════════════════════════════════════════════════════════════════════

def fn_cp15():
    r = client.get("/api/products")
    body = r.json()
    ok = r.status_code == 200 and "data" in body and "total" in body and isinstance(body["data"], list)
    return r.status_code, ok

cp("CP-15", "Listar todos los productos (estructura válida)", "Productos", 200, fn_cp15)


def fn_cp16():
    r = client.get("/api/products?categoria=Laptops")
    data = r.json().get("data", [])
    ok = r.status_code == 200 and len(data) > 0 and all(p["categoria"] == "Laptops" for p in data)
    return r.status_code, ok

cp("CP-16", "Filtrar productos por categoría (Laptops)", "Productos", 200, fn_cp16)


def fn_cp17():
    # BUG-02: búsqueda es case-sensitive
    # "iPhone 15 Pro" existe → search "iPhone" funciona, search "iphone" no encuentra nada
    r = client.get("/api/products?search=iphone")
    data = r.json().get("data", [])
    found = len(data) > 0
    return r.status_code, found  # FALLA: found = False

cp("CP-17", "Búsqueda case-insensitive ('iphone' = 'iPhone')", "Productos", "200+resultados", fn_cp17,
   "BUG-02: búsqueda distingue may./min. — 'iphone' no encuentra 'iPhone 15 Pro'")


def fn_cp18():
    r = client.get("/api/products?precio_min=500000")
    data = r.json().get("data", [])
    ok = r.status_code == 200 and len(data) > 0 and all(p["precio"] >= 500000 for p in data)
    return r.status_code, ok

cp("CP-18", "Filtrar productos por precio mínimo", "Productos", 200, fn_cp18)


def fn_cp19():
    r = client.get("/api/products?precio_max=300000")
    data = r.json().get("data", [])
    ok = r.status_code == 200 and len(data) > 0 and all(p["precio"] <= 300000 for p in data)
    return r.status_code, ok

cp("CP-19", "Filtrar productos por precio máximo", "Productos", 200, fn_cp19)


def fn_cp20():
    r = client.get("/api/products?destacado=true")
    data = r.json().get("data", [])
    ok = r.status_code == 200 and len(data) > 0 and all(p["destacado"] is True for p in data)
    return r.status_code, ok

cp("CP-20", "Filtrar productos destacados", "Productos", 200, fn_cp20)


def fn_cp21():
    r = client.get("/api/products?novedad=true")
    data = r.json().get("data", [])
    ok = r.status_code == 200 and len(data) > 0 and all(p["novedad"] is True for p in data)
    return r.status_code, ok

cp("CP-21", "Filtrar productos en novedad", "Productos", 200, fn_cp21)


def fn_cp22():
    r = client.get("/api/products?page=1&limit=5")
    body = r.json()
    ok = r.status_code == 200 and len(body.get("data", [])) == 5 and body.get("limit") == 5
    return r.status_code, ok

cp("CP-22", "Paginación: página 1 con límite 5 productos", "Productos", 200, fn_cp22)


def fn_cp23():
    r = client.get("/api/products?sort=precio&order=desc")
    data = r.json().get("data", [])
    precios = [p["precio"] for p in data]
    ok = r.status_code == 200 and precios == sorted(precios, reverse=True)
    return r.status_code, ok

cp("CP-23", "Ordenar productos por precio descendente", "Productos", 200, fn_cp23)


def fn_cp24():
    r = client.get("/api/products/2")
    ok = r.status_code == 200 and r.json().get("id") == "2"
    return r.status_code, ok

cp("CP-24", "Obtener producto por ID existente (ID=2)", "Productos", 200, fn_cp24)


def fn_cp25():
    r = client.get("/api/products/9999")
    return r.status_code, r.status_code == 404

cp("CP-25", "Obtener producto por ID inexistente retorna 404", "Productos", 404, fn_cp25)


def fn_cp26():
    # BUG-06: POST /products no requiere autenticación → debería 401
    r = client.post("/api/products", json={
        "nombre": "CP26 Sin Auth Test", "precio": 1000, "categoria": "Accesorios"
    })
    if r.status_code == 201:
        client.delete(f"/api/products/{r.json()['id']}")
    return r.status_code, r.status_code == 401

cp("CP-26", "Crear producto sin autenticación rechazado (401)", "Productos", 401, fn_cp26,
   "BUG-06: endpoint POST /products no requiere auth")


def fn_cp27():
    _cleanup_product_by_nombre("CP27 Producto Válido")
    r = client.post("/api/products", json={
        "nombre": "CP27 Producto Válido", "precio": 50000, "categoria": "Accesorios"
    })
    _cleanup_product_by_nombre("CP27 Producto Válido")
    return r.status_code, r.status_code == 201

cp("CP-27", "Crear producto con datos válidos retorna 201", "Productos", 201, fn_cp27)


def fn_cp28():
    # sin campo nombre → FastAPI retorna 422 Unprocessable Entity
    r = client.post("/api/products", json={"precio": 50000})
    return r.status_code, r.status_code in (400, 422)

cp("CP-28", "Crear producto sin campo nombre retorna 422", "Productos", 422, fn_cp28)


def fn_cp29():
    r = client.post("/api/products", json={"nombre": "CP29 Test", "precio": -100})
    return r.status_code, r.status_code == 400

cp("CP-29", "Crear producto con precio negativo rechazado (400)", "Productos", 400, fn_cp29)


def fn_cp30():
    _cleanup_product_by_nombre("CP30 Temporal")
    new = client.post("/api/products", json={
        "nombre": "CP30 Temporal", "precio": 1000, "categoria": "Accesorios"
    }).json()
    pid = new["id"]
    r = client.put(f"/api/products/{pid}", json={
        "nombre": "CP30 Actualizado PUT", "precio": 2000, "categoria": "Accesorios",
        "descripcion": "", "stock": 5, "color": "", "marca": "",
        "imagen_url": "", "imagenes_extra": [], "destacado": False, "novedad": False, "con_stock": True
    })
    client.delete(f"/api/products/{pid}")
    return r.status_code, r.status_code == 200

cp("CP-30", "Actualizar producto completo con PUT exitoso", "Productos", 200, fn_cp30)


def fn_cp31():
    r = client.put("/api/products/9999", json={
        "nombre": "No existe", "precio": 1000, "categoria": "Accesorios",
        "descripcion": "", "stock": 0, "color": "", "marca": "",
        "imagen_url": "", "imagenes_extra": [], "destacado": False, "novedad": False, "con_stock": True
    })
    return r.status_code, r.status_code == 404

cp("CP-31", "PUT producto inexistente retorna 404", "Productos", 404, fn_cp31)


def fn_cp32():
    _cleanup_product_by_nombre("CP32 Temporal")
    new = client.post("/api/products", json={
        "nombre": "CP32 Temporal", "precio": 1000, "categoria": "Accesorios"
    }).json()
    pid = new["id"]
    r = client.patch(f"/api/products/{pid}", json={"precio": 1500})
    ok = r.status_code == 200 and r.json().get("precio") == 1500
    client.delete(f"/api/products/{pid}")
    return r.status_code, ok

cp("CP-32", "Actualizar parcialmente producto con PATCH", "Productos", 200, fn_cp32)


def fn_cp33():
    # BUG-03: PATCH no valida precio negativo (POST/PUT sí validan)
    _cleanup_product_by_nombre("CP33 Temporal")
    new = client.post("/api/products", json={
        "nombre": "CP33 Temporal", "precio": 1000, "categoria": "Accesorios"
    }).json()
    pid = new["id"]
    r = client.patch(f"/api/products/{pid}", json={"precio": -500})
    client.delete(f"/api/products/{pid}")
    return r.status_code, r.status_code == 400

cp("CP-33", "PATCH con precio negativo rechazado (400)", "Productos", 400, fn_cp33,
   "BUG-03: PATCH acepta precio negativo, retorna 200")


def fn_cp34():
    _cleanup_product_by_nombre("CP34 Temporal")
    new = client.post("/api/products", json={
        "nombre": "CP34 Temporal", "precio": 1000, "categoria": "Accesorios"
    }).json()
    pid = new["id"]
    r = client.delete(f"/api/products/{pid}")
    return r.status_code, r.status_code == 204

cp("CP-34", "Eliminar producto existente retorna 204", "Productos", 204, fn_cp34)


def fn_cp35():
    r = client.delete("/api/products/9999")
    return r.status_code, r.status_code == 404

cp("CP-35", "Eliminar producto inexistente retorna 404", "Productos", 404, fn_cp35)


# ═══════════════════════════════════════════════════════════════════════════════
print("\n▶ MÓDULO: ESTADÍSTICAS (CP-36 a CP-39)")
# ═══════════════════════════════════════════════════════════════════════════════

def fn_cp36():
    r = client.get("/api/stats")
    body = r.json()
    campos = {"total_productos", "total_destacados", "total_novedades", "total_sin_stock"}
    ok = r.status_code == 200 and campos.issubset(set(body.keys()))
    return r.status_code, ok

cp("CP-36", "Stats retorna los 4 campos requeridos", "Estadísticas", 200, fn_cp36)


def fn_cp37():
    # BUG-04: stats cuenta sin_stock usando campo boolean 'con_stock'
    # en lugar del entero 'stock'. Un producto con stock=0 pero con_stock=True
    # NO se contabiliza como sin_stock, aunque realmente no tenga unidades.
    stats_antes = client.get("/api/stats").json()
    sin_stock_antes = stats_antes["total_sin_stock"]

    # Creamos producto con stock=0 y con_stock=True (inconsistencia intencional)
    _cleanup_product_by_nombre("CP37 BugStats")
    nuevo = client.post("/api/products", json={
        "nombre": "CP37 BugStats", "precio": 1000, "categoria": "Accesorios",
        "stock": 0, "con_stock": True
    }).json()
    pid = nuevo["id"]

    stats_despues = client.get("/api/stats").json()
    sin_stock_despues = stats_despues["total_sin_stock"]
    client.delete(f"/api/products/{pid}")

    # Si sin_stock_despues == sin_stock_antes → el producto con stock=0 NO fue contado → BUG presente
    bug_presente = sin_stock_despues == sin_stock_antes
    resultado = f"{sin_stock_antes}→{sin_stock_despues}"
    return resultado, not bug_presente

cp("CP-37", "Stats total_sin_stock refleja productos con stock=0", "Estadísticas", "conteo+1", fn_cp37,
   "BUG-04: usa campo boolean 'con_stock'; no detecta stock=0 con con_stock=True")


def fn_cp38():
    r = client.get("/api/stats")
    all_p = client.get("/api/products").json().get("data", [])
    count = sum(1 for p in all_p if p.get("destacado") is True)
    ok = r.status_code == 200 and r.json().get("total_destacados") == count
    return r.status_code, ok

cp("CP-38", "Stats total_destacados es correcto", "Estadísticas", 200, fn_cp38)


def fn_cp39():
    r = client.get("/api/stats")
    all_p = client.get("/api/products").json().get("data", [])
    count = sum(1 for p in all_p if p.get("novedad") is True)
    ok = r.status_code == 200 and r.json().get("total_novedades") == count
    return r.status_code, ok

cp("CP-39", "Stats total_novedades es correcto", "Estadísticas", 200, fn_cp39)


# ═══════════════════════════════════════════════════════════════════════════════
print("\n▶ MÓDULO: NO FUNCIONAL (CP-40 a CP-42)")
# ═══════════════════════════════════════════════════════════════════════════════

def fn_cp40():
    # BUG-07: contraseñas almacenadas en texto plano (sin hash)
    _cleanup_user_by_email("cp40_plain@test.com")
    client.post("/api/auth/register", json={
        "nombre": "CP40 Test", "email": "cp40_plain@test.com", "password": "MiPasswordSegura99"
    })
    data = storage.read_json("users.json")
    user = next((u for u in data["users"] if u["email"] == "cp40_plain@test.com"), None)
    en_plano = user is not None and user.get("password") == "MiPasswordSegura99"
    _cleanup_user_by_email("cp40_plain@test.com")
    return "archivo JSON", not en_plano  # FALLA → está en texto plano

cp("CP-40", "Contraseñas almacenadas con hash (RNF-03)", "No Funcional", "hash", fn_cp40,
   "BUG-07: contraseñas guardadas en texto plano en users.json")


def fn_cp41():
    # BUG-06: DELETE /products sin auth debería retornar 401
    _cleanup_product_by_nombre("CP41 Temporal")
    new = client.post("/api/products", json={
        "nombre": "CP41 Temporal", "precio": 1000, "categoria": "Accesorios"
    }).json()
    pid = new["id"]
    r = client.delete(f"/api/products/{pid}")
    return r.status_code, r.status_code == 401

cp("CP-41", "DELETE producto sin autenticación rechazado (401)", "No Funcional", 401, fn_cp41,
   "BUG-06: endpoint DELETE /products no requiere auth")


def fn_cp42():
    # BUG-05: Google Pixel 8 tiene marca="Xiaomi" en lugar de "Google"
    r = client.get("/api/products/8")
    marca_real = r.json().get("marca", "")
    ok = r.status_code == 200 and marca_real == "Google"
    return f"{r.status_code} marca='{marca_real}'", ok

cp("CP-42", "Google Pixel 8 tiene marca correcta ('Google')", "No Funcional", "marca=Google", fn_cp42,
   "BUG-05: producto ID 8 tiene marca='Xiaomi' en lugar de 'Google'")


# ═══════════════════════════════════════════════════════════════════════════════
print("\n▶ MÓDULO: WISHLIST (CP-43 a CP-52)")
# ═══════════════════════════════════════════════════════════════════════════════

WL_USR  = "wl_test_cp"
WL_P1   = "2"     # Dell XPS 15
WL_P2   = "3"     # Lenovo ThinkPad
WL_PBAD = "9999"  # inexistente
WL_UBAD = "9999"  # inexistente


def fn_cp43():
    _wl_clean(WL_USR)
    r = client.post("/api/wishlist", json={"user_id": WL_USR, "product_id": WL_P1})
    _wl_clean(WL_USR)
    return r.status_code, r.status_code == 201

cp("CP-43", "Agregar producto a wishlist exitoso", "Wishlist", 201, fn_cp43)


def fn_cp44():
    _wl_clean(WL_USR)
    client.post("/api/wishlist", json={"user_id": WL_USR, "product_id": WL_P1})
    r = client.get(f"/api/wishlist/{WL_USR}")
    body = r.json()
    prods = body.get("products", [])
    ok = r.status_code == 200 and len(prods) == 1 and prods[0].get("id") == WL_P1
    _wl_clean(WL_USR)
    return r.status_code, ok

cp("CP-44", "Obtener wishlist con productos", "Wishlist", 200, fn_cp44)


def fn_cp45():
    _wl_clean(WL_USR)
    r = client.get(f"/api/wishlist/{WL_USR}")
    ok = r.status_code == 200 and r.json().get("products") == []
    return r.status_code, ok

cp("CP-45", "Obtener wishlist de usuario sin wishlist previa", "Wishlist", 200, fn_cp45)


def fn_cp46():
    _wl_clean(WL_USR)
    client.post("/api/wishlist", json={"user_id": WL_USR, "product_id": WL_P1})
    r = client.delete(f"/api/wishlist/{WL_USR}/{WL_P1}")
    _wl_clean(WL_USR)
    return r.status_code, r.status_code == 204

cp("CP-46", "Eliminar producto de wishlist retorna 204", "Wishlist", 204, fn_cp46)


def fn_cp47():
    _wl_clean(WL_USR)
    r = client.delete(f"/api/wishlist/{WL_USR}/{WL_P1}")  # wishlist inexistente
    _wl_clean(WL_USR)
    return r.status_code, r.status_code == 404

cp("CP-47", "Eliminar producto de wishlist inexistente → 404", "Wishlist", 404, fn_cp47)


def fn_cp48():
    _wl_clean(WL_USR)
    client.post("/api/wishlist", json={"user_id": WL_USR, "product_id": WL_P1})
    r = client.delete(f"/api/wishlist/{WL_USR}/{WL_PBAD}")  # producto no está en wishlist
    _wl_clean(WL_USR)
    return r.status_code, r.status_code == 404

cp("CP-48", "Eliminar producto no incluido en wishlist → 404", "Wishlist", 404, fn_cp48)


def fn_cp49():
    _wl_clean(WL_USR)
    r = client.put(f"/api/wishlist/{WL_USR}", json={"products": [WL_P1, WL_P2]})
    body = r.json()
    ok = r.status_code == 200 and WL_P1 in body["products"] and WL_P2 in body["products"]
    _wl_clean(WL_USR)
    return r.status_code, ok

cp("CP-49", "Reemplazar wishlist completa con PUT", "Wishlist", 200, fn_cp49)


def fn_cp50():
    # BUG-14: no verifica productos duplicados
    _wl_clean(WL_USR)
    client.post("/api/wishlist", json={"user_id": WL_USR, "product_id": WL_P1})
    r = client.post("/api/wishlist", json={"user_id": WL_USR, "product_id": WL_P1})
    _wl_clean(WL_USR)
    return r.status_code, r.status_code == 409

cp("CP-50", "Agregar producto duplicado a wishlist → 409", "Wishlist", 409, fn_cp50,
   "BUG-14: acepta el mismo producto dos veces, retorna 201")


def fn_cp51():
    # BUG-15: no verifica existencia del producto
    _wl_clean(WL_USR)
    r = client.post("/api/wishlist", json={"user_id": WL_USR, "product_id": WL_PBAD})
    _wl_clean(WL_USR)
    return r.status_code, r.status_code == 404

cp("CP-51", "Agregar producto inexistente a wishlist → 404", "Wishlist", 404, fn_cp51,
   "BUG-15: no verifica si el product_id existe en el catálogo")


def fn_cp52():
    # BUG-16: no verifica existencia del usuario
    _wl_clean(WL_UBAD)
    r = client.post("/api/wishlist", json={"user_id": WL_UBAD, "product_id": WL_P1})
    _wl_clean(WL_UBAD)
    return r.status_code, r.status_code == 404

cp("CP-52", "Agregar wishlist para usuario inexistente → 404", "Wishlist", 404, fn_cp52,
   "BUG-16: no verifica si el user_id existe en el sistema")


# ═══════════════════════════════════════════════════════════════════════════════
# TABLA RESUMEN
# ═══════════════════════════════════════════════════════════════════════════════

aprobados = sum(1 for r in results if r["estado"] == "APROBADO")
fallas    = sum(1 for r in results if r["estado"] == "FALLA")
errores   = sum(1 for r in results if r["estado"] == "ERROR")

print("\n")
print("═" * 120)
print(f"{'CP':<8}{'Descripción':<54}{'Módulo':<15}{'Esp.':<14}{'Obt.':<16}{'Estado':<12}Notas")
print("═" * 120)
for r in results:
    sym = "✓" if r["estado"] == "APROBADO" else ("!" if r["estado"] == "ERROR" else "✗")
    print(
        f"{r['id']:<8}{r['desc']:<54}{r['modulo']:<15}"
        f"{r['esp']:<14}{r['obt']:<16}{sym} {r['estado']:<10}{r['notas']}"
    )
print("═" * 120)
print(f"\n  RESULTADO FINAL:  {aprobados} APROBADOS  |  {fallas} FALLAS  |  {errores} ERRORES  (total {len(results)} CPs)")

print("\n  CPs con FALLA (para documentar como defectos):")
for r in results:
    if r["estado"] == "FALLA":
        print(f"    ✗ {r['id']} — {r['desc']} | {r['notas']}")
print()
