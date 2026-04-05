"""
Rakshak Backend – FastAPI Entry Point
Parametric Income Protection for Q-Commerce Riders
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, risk, premium, trigger, claims, user

app = FastAPI(
    title="Rakshak API",
    description="Parametric income protection system for Q-Commerce riders",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://strong-charisma-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(risk.router, prefix="/risk", tags=["risk"])
app.include_router(premium.router, prefix="/premium", tags=["premium"])
app.include_router(trigger.router, prefix="/trigger", tags=["trigger"])
app.include_router(claims.router, prefix="/claims", tags=["claims"])
app.include_router(user.router, prefix="/user", tags=["user"])


@app.get("/")
async def root():
    return {
        "service": "Rakshak API",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
