"""
Risk Router – Risk Factor calculation for premium pricing
Risk Factor = 1 + (0.45×E) + (0.25×L) + (0.15×U) + (0.10×T) + (0.05×B)
"""
import httpx
import os
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
CACHE_DIR = Path(__file__).parent.parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)
WEATHER_CACHE_FILE = CACHE_DIR / "weather_cache.json"
CACHE_TTL = 600  # 10 minutes


class RiskRequest(BaseModel):
    lat: float
    lon: float
    working_hours: float = 8.0      # hours worked today
    is_night: bool = False          # night shift flag
    trust_score: float = 100.0     # from user profile
    zone: str = "Unknown"


def load_weather_cache(lat: float, lon: float) -> Optional[dict]:
    """Load last cached weather data for failsafe"""
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
    if WEATHER_CACHE_FILE.exists():
        try:
            data = json.loads(WEATHER_CACHE_FILE.read_text())
            entry = data.get(cache_key)
            if entry and (time.time() - entry.get("timestamp", 0)) < CACHE_TTL:
                return entry["payload"]
        except Exception:
            pass
    return None


def save_weather_cache(lat: float, lon: float, payload: dict):
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
    try:
        data = {}
        if WEATHER_CACHE_FILE.exists():
            data = json.loads(WEATHER_CACHE_FILE.read_text())
        data[cache_key] = {"timestamp": time.time(), "payload": payload}
        WEATHER_CACHE_FILE.write_text(json.dumps(data))
    except Exception:
        pass


async def fetch_weather(lat: float, lon: float) -> dict:
    """Fetch live weather from OpenWeatherMap; fall back to cache"""
    cached = load_weather_cache(lat, lon)
    if cached:
        cached["source"] = "cache"
        return cached

    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_openweather_key_here":
        return _demo_weather_data(lat, lon)

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    )
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            raw = resp.json()

        temp = raw["main"]["temp"]
        feels_like = raw["main"]["feels_like"]
        humidity = raw["main"]["humidity"]
        wind_speed = raw.get("wind", {}).get("speed", 0)
        rain_1h = raw.get("rain", {}).get("1h", 0)
        condition = raw["weather"][0]["main"]
        description = raw["weather"][0]["description"]
        # Heat index approximation
        heat_index = feels_like + (0.33 * humidity / 100 * 6.105) - 4.0

        payload = {
            "temperature": temp,
            "feels_like": feels_like,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "rainfall": rain_1h,
            "condition": condition,
            "description": description,
            "heat_index": round(heat_index, 1),
            "city": raw.get("name", "Unknown"),
            "source": "OpenWeatherMap",
        }
        save_weather_cache(lat, lon, payload)
        return payload

    except Exception:
        if cached:
            cached["source"] = "cache_fallback"
            return cached
        return _demo_weather_data(lat, lon)


def _demo_weather_data(lat: float, lon: float) -> dict:
    """Demo data when API key is not configured"""
    return {
        "temperature": 36.2,
        "feels_like": 41.0,
        "humidity": 72,
        "wind_speed": 3.5,
        "rainfall": 0.0,
        "condition": "Clear",
        "description": "clear sky",
        "heat_index": 43.1,
        "city": "Demo City",
        "source": "demo",
    }


def compute_environment_factor(weather: dict) -> float:
    """E factor: 0–1 based on weather severity"""
    score = 0.0
    temp = weather.get("temperature", 28)
    rain = weather.get("rainfall", 0)
    heat_index = weather.get("heat_index", temp)
    condition = weather.get("condition", "Clear").lower()

    # Heat contribution
    if heat_index >= 45:
        score += 0.5
    elif heat_index >= 40:
        score += 0.35
    elif heat_index >= 35:
        score += 0.2

    # Rain contribution
    if rain >= 10:
        score += 0.4
    elif rain >= 5:
        score += 0.25
    elif rain > 0:
        score += 0.1

    # Condition contribution
    severe = ["thunderstorm", "tornado", "squall", "sand", "ash"]
    if any(s in condition for s in severe):
        score += 0.3
    elif condition in ["rain", "drizzle", "snow"]:
        score += 0.15

    return min(score, 1.0)


def compute_location_factor(zone: str) -> float:
    """L factor: predefined zone risk map"""
    zone_risk = {
        "mumbai_dharavi": 0.85,
        "delhi_noida": 0.75,
        "bangalore_central": 0.5,
        "hyderabad_inner": 0.55,
        "chennai_north": 0.6,
        "pune_west": 0.45,
        "unknown": 0.5,
    }
    key = zone.lower().replace(" ", "_")
    return zone_risk.get(key, 0.5)


def compute_usage_factor(working_hours: float) -> float:
    """U factor: 0–1 based on daily working hours"""
    if working_hours >= 12:
        return 1.0
    elif working_hours >= 8:
        return 0.7
    elif working_hours >= 6:
        return 0.5
    elif working_hours >= 4:
        return 0.35
    return 0.2


def compute_time_factor(is_night: bool) -> float:
    """T factor: night shift = higher risk"""
    hour = datetime.now().hour
    if is_night or (hour >= 22 or hour < 6):
        return 0.85
    elif hour >= 18 or hour < 9:
        return 0.5
    return 0.25


def compute_behavior_factor(trust_score: float) -> float:
    """B factor: inverse of trust (lower trust = higher risk)"""
    normalized = max(0.0, min(100.0, trust_score))
    return round(1.0 - (normalized / 100.0), 3)


@router.post("/calculate")
async def calculate_risk(req: RiskRequest):
    """
    Compute risk factor for premium calculation.
    Risk Factor = 1 + (0.45×E) + (0.25×L) + (0.15×U) + (0.10×T) + (0.05×B)
    """
    weather = await fetch_weather(req.lat, req.lon)

    E = compute_environment_factor(weather)
    L = compute_location_factor(req.zone)
    U = compute_usage_factor(req.working_hours)
    T = compute_time_factor(req.is_night)
    B = compute_behavior_factor(req.trust_score)

    risk_factor = 1.0 + (0.45 * E) + (0.25 * L) + (0.15 * U) + (0.10 * T) + (0.05 * B)
    risk_factor = round(min(risk_factor, 2.0), 3)

    if risk_factor >= 1.65:
        risk_level = "HIGH"
    elif risk_factor >= 1.30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_factor": risk_factor,
        "risk_level": risk_level,
        "breakdown": {
            "E_environment": round(E, 3),
            "L_location": round(L, 3),
            "U_usage": round(U, 3),
            "T_time": round(T, 3),
            "B_behavior": round(B, 3),
            "weights": {
                "E": 0.45,
                "L": 0.25,
                "U": 0.15,
                "T": 0.10,
                "B": 0.05,
            },
        },
        "weather": weather,
    }
