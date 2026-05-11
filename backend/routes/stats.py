import logging

from fastapi import APIRouter

from storage import read_json

router = APIRouter()
logger = logging.getLogger("nextech.stats")


@router.get("/stats")
def get_stats():
    data = read_json("products.json")
    products = data["products"]

    total = len(products)
    destacados = sum(1 for p in products if p.get("destacado") is True)
    novedades = sum(1 for p in products if p.get("novedad") is True)
    # Cuenta productos con stock == 0 (no usa el campo con_stock)
    sin_stock = sum(1 for p in products if p.get("stock", 0) == 0)

    logger.info(f"GET /stats - total={total} destacados={destacados} sin_stock={sin_stock}")
    return {
        "total_productos": total,
        "total_destacados": destacados,
        "total_novedades": novedades,
        "total_sin_stock": sin_stock,
    }
