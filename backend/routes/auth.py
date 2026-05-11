import logging
import uuid
from datetime import datetime

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
    new_user = {
        "id": str(uuid.uuid4()),
        "nombre": req.nombre,
        "email": req.email,
        "password": req.password,
        "rol": "usuario",
        "fecha_registro": datetime.utcnow().isoformat(),
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
