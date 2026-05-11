import logging
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from storage import read_json, write_json

router = APIRouter()
logger = logging.getLogger("nextech.products")


class ProductCreate(BaseModel):
    nombre: str
    descripcion: str = ""
    precio: float
    stock: int = 0
    categoria: str = ""
    color: str = ""
    marca: str = ""
    imagen_url: str = ""
    imagenes_extra: List[str] = []
    destacado: bool = False
    novedad: bool = False
    con_stock: bool = True


class ProductPatch(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    categoria: Optional[str] = None
    color: Optional[str] = None
    marca: Optional[str] = None
    imagen_url: Optional[str] = None
    imagenes_extra: Optional[List[str]] = None
    destacado: Optional[bool] = None
    novedad: Optional[bool] = None
    con_stock: Optional[bool] = None


@router.get("/products")
def get_products(
    categoria: Optional[str] = None,
    color: Optional[str] = None,
    destacado: Optional[str] = None,
    novedad: Optional[str] = None,
    search: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    page: int = 1,
    limit: int = 12,
    sort: Optional[str] = None,
    order: str = "asc",
):
    data = read_json("products.json")
    products = data["products"]

    if categoria:
        products = [p for p in products if p.get("categoria") == categoria]

    if color:
        products = [p for p in products if p.get("color") == color]

    if destacado is not None:
        val = destacado == "true"
        products = [p for p in products if p.get("destacado") == val]

    if novedad is not None:
        val = novedad == "true"
        products = [p for p in products if p.get("novedad") == val]

    # La busqueda es sensible a mayusculas/minusculas
    if search:
        products = [
            p for p in products
            if search in p.get("nombre", "")
            or search in p.get("descripcion", "")
            or search in p.get("marca", "")
        ]

    if precio_min is not None:
        products = [p for p in products if p.get("precio", 0) >= precio_min]

    if precio_max is not None:
        products = [p for p in products if p.get("precio", 0) <= precio_max]

    if sort:
        reverse = order == "desc"
        if sort == "nombre":
            products = sorted(products, key=lambda p: p.get("nombre", "").lower(), reverse=reverse)
        elif sort == "precio":
            products = sorted(products, key=lambda p: p.get("precio", 0), reverse=reverse)
        elif sort == "fecha":
            products = sorted(products, key=lambda p: p.get("fecha_creacion", ""), reverse=reverse)

    total = len(products)
    total_pages = max(1, (total + limit - 1) // limit)
    start = (page - 1) * limit
    page_data = products[start : start + limit]

    logger.info(f"GET /products - total={total} page={page} limit={limit}")
    return {"data": page_data, "total": total, "page": page, "totalPages": total_pages, "limit": limit}


@router.get("/products/{product_id}")
def get_product(product_id: str):
    data = read_json("products.json")
    product = next((p for p in data["products"] if p["id"] == product_id), None)
    if not product:
        logger.warning(f"GET /products/{product_id} - no encontrado")
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.post("/products", status_code=201)
def create_product(product: ProductCreate):
    if not product.nombre.strip():
        raise HTTPException(status_code=400, detail="El campo nombre es requerido")
    if product.precio <= 0:
        raise HTTPException(status_code=400, detail="El campo precio debe ser mayor a 0")

    data = read_json("products.json")
    now = datetime.utcnow().isoformat()
    new_product = {
        "id": str(uuid.uuid4()),
        **product.dict(),
        "fecha_creacion": now,
        "fecha_actualizacion": now,
    }
    data["products"].append(new_product)
    write_json("products.json", data)
    logger.info(f"POST /products - creado {new_product['id']}: {new_product['nombre']}")
    return new_product


@router.put("/products/{product_id}")
def update_product(product_id: str, product: ProductCreate):
    data = read_json("products.json")
    idx = next((i for i, p in enumerate(data["products"]) if p["id"] == product_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if not product.nombre.strip():
        raise HTTPException(status_code=400, detail="El campo nombre es requerido")
    if product.precio <= 0:
        raise HTTPException(status_code=400, detail="El campo precio debe ser mayor a 0")

    updated = {
        "id": product_id,
        **product.dict(),
        "fecha_creacion": data["products"][idx]["fecha_creacion"],
        "fecha_actualizacion": datetime.utcnow().isoformat(),
    }
    data["products"][idx] = updated
    write_json("products.json", data)
    logger.info(f"PUT /products/{product_id} - actualizado")
    return updated


@router.patch("/products/{product_id}")
def partial_update_product(product_id: str, changes: ProductPatch):
    data = read_json("products.json")
    idx = next((i for i, p in enumerate(data["products"]) if p["id"] == product_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Aplica solo los campos enviados (sin validar precio en PATCH)
    patch_data = {k: v for k, v in changes.dict().items() if v is not None}
    patch_data["fecha_actualizacion"] = datetime.utcnow().isoformat()
    data["products"][idx].update(patch_data)
    write_json("products.json", data)
    logger.info(f"PATCH /products/{product_id} - campos: {list(patch_data.keys())}")
    return data["products"][idx]


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: str):
    data = read_json("products.json")
    original_len = len(data["products"])
    data["products"] = [p for p in data["products"] if p["id"] != product_id]
    if len(data["products"]) == original_len:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    write_json("products.json", data)
    logger.info(f"DELETE /products/{product_id}")
