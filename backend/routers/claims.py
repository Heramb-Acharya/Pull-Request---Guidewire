"""
Claims Router – Claim history and auto-claim storage
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "rakshak_secret_key_2024_demo")
JWT_ALGORITHM = "HS256"

# In-memory claims store (keyed by phone)
claims_db: dict = {}


class ClaimRecord(BaseModel):
    phone: str
    trigger_type: list[str]
    k_event: float
    k_severity: float
    k_trust: float
    base_coverage: float
    final_payout: float
    plan: str
    city: str
    conditions: dict


def decode_token(token: str) -> str:
    """Return phone from JWT"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub", "")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/create")
async def create_claim(claim: ClaimRecord):
    """Auto-create a claim record when a trigger fires"""
    claim_id = str(uuid.uuid4())[:8].upper()
    record = {
        "id": claim_id,
        "phone": claim.phone,
        "trigger_type": claim.trigger_type,
        "k_event": claim.k_event,
        "k_severity": claim.k_severity,
        "k_trust": claim.k_trust,
        "base_coverage": claim.base_coverage,
        "final_payout": claim.final_payout,
        "plan": claim.plan,
        "city": claim.city,
        "conditions": claim.conditions,
        "status": "approved",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    phone = claim.phone
    if phone not in claims_db:
        claims_db[phone] = []
    claims_db[phone].insert(0, record)

    return {"success": True, "claim_id": claim_id, "payout": claim.final_payout}


@router.get("/history")
async def get_claim_history(authorization: Optional[str] = Header(None)):
    """Return claim history for authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        # Return demo data if no auth
        return {"claims": _demo_claims(), "total": 3}

    token = authorization.split(" ")[1]
    phone = decode_token(token)

    user_claims = claims_db.get(phone, [])
    if not user_claims:
        user_claims = _demo_claims()

    return {"claims": user_claims, "total": len(user_claims)}


def _demo_claims() -> list:
    return [
        {
            "id": "RKS001A",
            "trigger_type": ["extreme_weather"],
            "k_event": 1.00,
            "k_severity": 0.85,
            "k_trust": 1.05,
            "base_coverage": 3500,
            "final_payout": 3128.75,
            "plan": "standard",
            "city": "Delhi",
            "conditions": {"weather": {"condition": "Thunderstorm", "rainfall": 18.2}},
            "status": "approved",
            "created_at": "2024-06-12T14:22:00Z",
        },
        {
            "id": "RKS002B",
            "trigger_type": ["civic_disruption"],
            "k_event": 0.75,
            "k_severity": 0.75,
            "k_trust": 1.00,
            "base_coverage": 3500,
            "final_payout": 1968.75,
            "plan": "standard",
            "city": "Delhi",
            "conditions": {"news": {"keywords_found": ["bandh"], "articles": []}},
            "status": "approved",
            "created_at": "2024-05-28T09:15:00Z",
        },
        {
            "id": "RKS003C",
            "trigger_type": ["poor_aqi"],
            "k_event": 0.60,
            "k_severity": 0.50,
            "k_trust": 1.00,
            "base_coverage": 3500,
            "final_payout": 1050.00,
            "plan": "standard",
            "city": "Delhi",
            "conditions": {"aqi": {"value": 342, "status": "Very Unhealthy"}},
            "status": "approved",
            "created_at": "2024-05-01T11:00:00Z",
        },
    ]
