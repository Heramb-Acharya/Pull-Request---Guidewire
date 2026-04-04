"""
Premium Router – Final premium calculation
Final Premium = Base Plan × Risk Factor
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

PLANS = {
    "basic":    {"name": "Basic",    "base_price": 49,  "coverage": 2000},
    "standard": {"name": "Standard", "base_price": 79,  "coverage": 3500},
    "pro":      {"name": "Pro",      "base_price": 99,  "coverage": 5000},
}


class PremiumRequest(BaseModel):
    plan: str           # "basic" | "standard" | "pro"
    risk_factor: float  # from /risk/calculate


@router.post("/calculate")
async def calculate_premium(req: PremiumRequest):
    """
    Compute final weekly premium.
    Final Premium = Base Price × Risk Factor
    """
    plan_key = req.plan.lower()
    if plan_key not in PLANS:
        plan_key = "basic"

    plan = PLANS[plan_key]
    base_price = plan["base_price"]
    risk_factor = round(max(1.0, min(2.0, req.risk_factor)), 3)
    final_premium = round(base_price * risk_factor, 2)

    return {
        "plan": plan["name"],
        "base_price": base_price,
        "risk_factor": risk_factor,
        "final_premium": final_premium,
        "coverage": plan["coverage"],
        "formula": f"₹{base_price} × {risk_factor} = ₹{final_premium}/week",
        "all_plans": [
            {
                "key": k,
                "name": v["name"],
                "base_price": v["base_price"],
                "coverage": v["coverage"],
                "final_premium": round(v["base_price"] * risk_factor, 2),
            }
            for k, v in PLANS.items()
        ],
    }
