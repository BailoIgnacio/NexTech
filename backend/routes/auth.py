import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from storage import read_json, write_json

router = APIRouter()
logger = logging.getLogger("nextech.auth")


class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/auth/register", status_code=201)
def register(req: RegisterRequest):
    if not req.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre es requerido")
    if not req.email.strip():
        raise HTTPException(status_code=400, detail="El email es requerido")
    if not req.password:
        raise HTTPException(status_code=400, detail="La contrasena es requerida")

    # Registra el usuario sin verificar si el email ya existe
    data = read_json("users.json")
    new_id = str(max((int(u["id"]) for u in data["users"]), default=0) + 1)
    new_user = {
        "id": new_id,
        "nombre": req.nombre,
        "email": req.email,
        "password": req.password,
        "rol": "usuario",
        "fecha_registro": datetime.now(timezone.utc).isoformat(),
    }
    data["users"].append(new_user)
    write_json("users.json", data)
    logger.info(f"POST /auth/register - nuevo usuario: {req.email}")

    return {
        "id": new_user["id"],
        "nombre": new_user["nombre"],
        "email": new_user["email"],
        "rol": new_user["rol"],
    }


@router.get("/auth/users")
def get_users():
    data = read_json("users.json")
    return [{"id": u["id"], "nombre": u["nombre"], "email": u["email"]} for u in data["users"]]


@router.delete("/auth/users/{user_id}", status_code=204)
def delete_user(user_id: str):
    data = read_json("users.json")
    original_len = len(data["users"])
    data["users"] = [u for u in data["users"] if u["id"] != user_id]
    if len(data["users"]) == original_len:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    write_json("users.json", data)
    logger.info(f"DELETE /auth/users/{user_id}")


@router.post("/auth/login")
def login(req: LoginRequest):
    data = read_json("users.json")
    user = next(
        (u for u in data["users"] if u["email"] == req.email and u["password"] == req.password),
        None,
    )
    if not user:
        logger.warning(f"POST /auth/login - fallo para: {req.email}")
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    logger.info(f"POST /auth/login - exitoso: {req.email} (rol: {user['rol']})")
    return {
        "mensaje": "Login exitoso",
        "usuario": {
            "id": user["id"],
            "nombre": user["nombre"],
            "email": user["email"],
            "rol": user["rol"],
        },
    }
