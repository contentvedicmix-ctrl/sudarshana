from fastapi import APIRouter, HTTPException, Depends, Header
from passlib.hash import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
from .config import settings
from .database import supabase
from .models import UserSignup, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(days=30)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: str = Header(...)) -> dict:
    """Dependency: extracts user from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    token = authorization.split(" ", 1)[1]
    user_id = verify_token(token)

    # Fetch from Supabase
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]

@router.post("/signup")
async def signup(body: UserSignup):
    # Check existing
    existing = supabase.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = bcrypt.hash(body.password)
    result = supabase.table("users").insert({
        "email": body.email,
        "password_hash": hashed,
        "name": body.name,
    }).execute()

    user = result.data[0]
    token = create_token(user["id"])
    return {"token": token, "user": UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        subscription_tier=user.get("subscription_tier", "free"),
        interviews_this_month=user.get("interviews_this_month", 0),
        free_tier_limit=user.get("free_tier_limit", 3),
    )}

@router.post("/login")
async def login(body: UserLogin):
    result = supabase.table("users").select("*").eq("email", body.email).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user = result.data[0]
    if not bcrypt.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_token(user["id"])
    return {"token": token, "user": UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        subscription_tier=user.get("subscription_tier", "free"),
        interviews_this_month=user.get("interviews_this_month", 0),
        free_tier_limit=user.get("free_tier_limit", 3),
    )}

@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        subscription_tier=user.get("subscription_tier", "free"),
        interviews_this_month=user.get("interviews_this_month", 0),
        free_tier_limit=user.get("free_tier_limit", 3),
    )
