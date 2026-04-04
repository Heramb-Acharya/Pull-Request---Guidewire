"""
Auth Router – OTP-based phone authentication
"""
import random
import time
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "rakshak_secret_key_2024_demo")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

# In-memory OTP store: {phone: {"otp": "123456", "expires_at": timestamp}}
otp_store: dict = {}

# In-memory user store (demo – replace with DB in production)
users_db: dict = {}


class SendOTPRequest(BaseModel):
    phone: str
    name: Optional[str] = None
    language: Optional[str] = "English"


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None
    language: Optional[str] = "English"


def create_token(phone: str) -> str:
    payload = {
        "sub": phone,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    """Send OTP to phone number (mock – logs to console)"""
    phone = req.phone.strip()
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    otp = generate_otp()
    otp_store[phone] = {
        "otp": otp,
        "expires_at": time.time() + 300,  # 5 minutes
        "name": req.name,
        "language": req.language,
    }

    # In production: integrate FastAuth / Firebase / Twilio
    print(f"[RAKSHAK OTP] Phone: {phone} | OTP: {otp}")  # noqa

    return {
        "success": True,
        "message": f"OTP sent to {phone[-4:].rjust(len(phone), '*')}",
        "demo_otp": otp,  # Remove in production
    }


@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    """Verify OTP and return JWT token"""
    phone = req.phone.strip()
    record = otp_store.get(phone)

    if not record:
        raise HTTPException(status_code=400, detail="No OTP requested for this number")

    if time.time() > record["expires_at"]:
        del otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP expired")

    if record["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Clear OTP after use
    del otp_store[phone]

    # Create user if not exists
    if phone not in users_db:
        users_db[phone] = {
            "phone": phone,
            "name": req.name or record.get("name") or f"Rider_{phone[-4:]}",
            "language": req.language or record.get("language") or "English",
            "trust_score": 50.0,
            "trust_level": "NEW",
            "claims_count": 0,
            "clean_claims": 0,
            "created_at": datetime.utcnow().isoformat(),
            "partner": None,
        }

    token = create_token(phone)
    user = users_db[phone]

    return {
        "success": True,
        "token": token,
        "user": {
            "phone": user["phone"],
            "name": user["name"],
            "language": user["language"],
            "trust_score": user["trust_score"],
        },
    }


def get_users_db():
    return users_db
