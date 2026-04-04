"""
User Router – Profile, trust score, and stats
"""
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "rakshak_secret_key_2024_demo")
JWT_ALGORITHM = "HS256"


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub", "")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def compute_trust_badge(trust_score: float, clean_claims: int, total_claims: int = 0) -> dict:
    if total_claims == 0:
        return {"badge": "Getting Started", "color": "#38BDF8", "icon": "👋"}
    elif trust_score >= 95 and clean_claims >= 10:
        return {"badge": "Platinum Shield", "color": "#8B5CF6", "icon": "🛡️"}
    elif trust_score >= 85 and clean_claims >= 5:
        return {"badge": "Gold Rider", "color": "#F59E0B", "icon": "⭐"}
    elif trust_score >= 70:
        return {"badge": "Silver Guard", "color": "#94A3B8", "icon": "✅"}
    elif trust_score >= 50:
        return {"badge": "New Rider", "color": "#38BDF8", "icon": "🆕"}
    else:
        return {"badge": "Under Review", "color": "#EF4444", "icon": "⚠️"}


@router.get("/profile")
async def get_profile(authorization: Optional[str] = Header(None)):
    """Return user profile with trust score and stats"""
    # Import users_db lazily to avoid circular imports
    from routers.auth import get_users_db
    users_db = get_users_db()

    phone = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            phone = decode_token(token)
        except Exception:
            pass

    if phone and phone in users_db:
        user = users_db[phone]
    else:
        # Demo profile
        user = {
            "phone": "**********",
            "name": "Demo Rider",
            "language": "English",
            "trust_score": 92.5,
            "clean_claims": 7,
            "claims_count": 8,
            "partner": None,
            "zone": "Delhi North",
        }

    clean_claims = user.get("clean_claims", 0)
    claims_count = user.get("claims_count", 0)

    if claims_count > 0:
        trust_score = round((clean_claims / claims_count) * 100, 2)
    else:
        trust_score = 50.0

    badge = compute_trust_badge(trust_score, clean_claims, claims_count)

    return {
        "name": user.get("name"),
        "phone": user.get("phone", "**")[-4:].rjust(10, "*") if user.get("phone") else "**",
        "language": user.get("language", "English"),
        "partner": user.get("partner"),
        "zone": user.get("zone", "Unknown"),
        "trust": {
            "score": trust_score,
            "level": "HIGH" if trust_score >= 85 else "MEDIUM" if trust_score >= 60 else "LOW",
            "badge": badge,
            "clean_claims": clean_claims,
            "total_claims": user.get("claims_count", 0),
            "k_trust_multiplier": (
                1.10 if clean_claims >= 10 else
                1.05 if clean_claims >= 5 else
                1.00
            ),
        },
        "stats": {
            "member_since": user.get("created_at", "2024-01-01"),
            "total_payouts": 0,
            "total_payout_amount": 0,
        },
    }
