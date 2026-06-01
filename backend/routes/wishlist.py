import logging
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from storage import read_json, write_json

router = APIRouter()
logger = logging.getLogger("nextech.wishlist")


class WishlistAdd(BaseModel):
    user_id: str
    product_id: str


class WishlistReplace(BaseModel):
    products: List[str]


def _get_entry(wishlists, user_id):
    return next((w for w in wishlists if w["user_id"] == user_id), None)


@router.post("/wishlist", status_code=201)
def add_to_wishlist(body: WishlistAdd):
    # BUG-14: No verifica duplicados → el mismo producto puede agregarse múltiples veces
    # BUG-15: No verifica si el product_id existe en products.json
    # BUG-16: No verifica si el user_id existe en users.json
    data = read_json("wishlist.json")
    entry = _get_entry(data["wishlists"], body.user_id)
    if entry is None:
        data["wishlists"].append({"user_id": body.user_id, "products": [body.product_id]})
    else:
        entry["products"].append(body.product_id)
    write_json("wishlist.json", data)
    logger.info(f"POST /wishlist - user={body.user_id} product={body.product_id}")
    return {"user_id": body.user_id, "product_id": body.product_id}


@router.get("/wishlist/{user_id}")
def get_wishlist(user_id: str):
    data = read_json("wishlist.json")
    entry = _get_entry(data["wishlists"], user_id)
    if entry is None:
        return {"user_id": user_id, "products": []}
    products_data = read_json("products.json")
    products = []
    for pid in entry["products"]:
        product = next((p for p in products_data["products"] if p["id"] == pid), None)
        if product:
            products.append(product)
    logger.info(f"GET /wishlist/{user_id} - {len(products)} productos")
    return {"user_id": user_id, "products": products}


@router.delete("/wishlist/{user_id}/{product_id}", status_code=204)
def remove_from_wishlist(user_id: str, product_id: str):
    data = read_json("wishlist.json")
    entry = _get_entry(data["wishlists"], user_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Wishlist no encontrada")
    original_len = len(entry["products"])
    entry["products"] = [p for p in entry["products"] if p != product_id]
    if len(entry["products"]) == original_len:
        raise HTTPException(status_code=404, detail="Producto no encontrado en la wishlist")
    write_json("wishlist.json", data)
    logger.info(f"DELETE /wishlist/{user_id}/{product_id}")


@router.put("/wishlist/{user_id}")
def replace_wishlist(user_id: str, body: WishlistReplace):
    data = read_json("wishlist.json")
    entry = _get_entry(data["wishlists"], user_id)
    if entry is None:
        data["wishlists"].append({"user_id": user_id, "products": body.products})
    else:
        entry["products"] = body.products
    write_json("wishlist.json", data)
    logger.info(f"PUT /wishlist/{user_id} - {len(body.products)} productos")
    return {"user_id": user_id, "products": body.products}
