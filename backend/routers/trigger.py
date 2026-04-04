"""
Trigger Router – API-driven disruption detection
Checks Weather + News + AQI for zone disruptions
Computes K-factor breakdown for parametric payouts
"""
import httpx
import os
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
WAQI_API_KEY = os.getenv("WAQI_API_KEY", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

CACHE_DIR = Path(__file__).parent.parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)
NEWS_CACHE_FILE = CACHE_DIR / "news_cache.json"
AQI_CACHE_FILE = CACHE_DIR / "aqi_cache.json"

CIVIC_KEYWORDS = ["bandh", "strike", "curfew", "shutdown", "riot", "protest", "lockdown"]
PEAK_HOURS = [(9, 11), (18, 21)]  # 9-11am, 6-9pm


class TriggerRequest(BaseModel):
    lat: float
    lon: float
    city: str = "Delhi"
    trust_score: float = 100.0
    clean_claims: int = 0
    plan: str = "basic"


# ─── Cache Helpers ────────────────────────────────────────────────────────────

def load_cache(file: Path, key: str, ttl: int = 900) -> Optional[dict]:
    if file.exists():
        try:
            data = json.loads(file.read_text())
            entry = data.get(key)
            if entry and (time.time() - entry.get("ts", 0)) < ttl:
                return entry["payload"]
        except Exception:
            pass
    return None


def save_cache(file: Path, key: str, payload: dict):
    try:
        data = {}
        if file.exists():
            data = json.loads(file.read_text())
        data[key] = {"ts": time.time(), "payload": payload}
        file.write_text(json.dumps(data))
    except Exception:
        pass


# ─── Weather Fetch ─────────────────────────────────────────────────────────────

async def fetch_weather_trigger(lat: float, lon: float) -> dict:
    key = f"{round(lat,2)}_{round(lon,2)}"
    cached = load_cache(CACHE_DIR / "weather_cache.json", key, 600)
    if cached:
        return {**cached, "source": "OpenWeatherMap (cached)"}

    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_openweather_key_here":
        return {
            "temperature": 37.5, "rainfall": 0.0, "condition": "Clear",
            "heat_index": 43.0, "city": "Demo City",
            "source": "demo", "triggered": False
        }

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
        rain = raw.get("rain", {}).get("1h", 0)
        condition = raw["weather"][0]["main"]
        heat_index = feels_like + (0.33 * humidity / 100 * 6.105) - 4.0
        payload = {
            "temperature": temp, "rainfall": rain, "condition": condition,
            "heat_index": round(heat_index, 1), "city": raw.get("name", "Unknown"),
            "source": "OpenWeatherMap",
        }
        save_cache(CACHE_DIR / "weather_cache.json", key, payload)
        return payload
    except Exception:
        return cached or {
            "temperature": 30, "rainfall": 0, "condition": "Unknown",
            "heat_index": 32, "city": "Unknown", "source": "error_fallback"
        }


# ─── News Fetch ────────────────────────────────────────────────────────────────

async def fetch_news_trigger(city: str) -> dict:
    cached = load_cache(NEWS_CACHE_FILE, city.lower(), 1800)
    if cached:
        return {**cached, "source": "NewsAPI (cached)"}

    if not NEWS_API_KEY or NEWS_API_KEY == "your_newsapi_key_here":
        return {
            "triggered": False, "keywords_found": [],
            "articles": [], "source": "demo"
        }

    query = f"{city} bandh OR strike OR curfew OR shutdown"
    url = (
        f"https://newsapi.org/v2/everything"
        f"?q={query}&language=en&sortBy=publishedAt&pageSize=5"
        f"&apiKey={NEWS_API_KEY}"
    )
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            raw = resp.json()

        articles = raw.get("articles", [])
        keywords_found = []
        matched_articles = []

        for a in articles:
            text = (a.get("title", "") + " " + a.get("description", "")).lower()
            found = [kw for kw in CIVIC_KEYWORDS if kw in text]
            if found:
                keywords_found.extend(found)
                matched_articles.append({
                    "title": a.get("title", ""),
                    "source": a.get("source", {}).get("name", ""),
                    "url": a.get("url", ""),
                    "publishedAt": a.get("publishedAt", ""),
                    "keywords": found,
                })

        payload = {
            "triggered": len(keywords_found) > 0,
            "keywords_found": list(set(keywords_found)),
            "articles": matched_articles[:3],
            "source": "NewsAPI",
        }
        save_cache(NEWS_CACHE_FILE, city.lower(), payload)
        return payload

    except Exception:
        return cached or {"triggered": False, "keywords_found": [], "articles": [], "source": "error_fallback"}


# ─── AQI Fetch ─────────────────────────────────────────────────────────────────

async def fetch_aqi(lat: float, lon: float) -> dict:
    key = f"aqi_{round(lat,2)}_{round(lon,2)}"
    cached = load_cache(AQI_CACHE_FILE, key, 1800)
    if cached:
        return {**cached, "source": "WAQI (cached)"}

    if not WAQI_API_KEY or WAQI_API_KEY == "your_waqi_key_here":
        return {"aqi": 156, "triggered": False, "source": "demo", "status": "Moderate"}

    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_API_KEY}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            raw = resp.json()

        aqi = raw.get("data", {}).get("aqi", 0)
        if isinstance(aqi, str):
            aqi = int(aqi) if aqi.isdigit() else 0

        if aqi >= 401:
            status = "Hazardous"
        elif aqi >= 301:
            status = "Very Unhealthy"
        elif aqi >= 201:
            status = "Unhealthy"
        elif aqi >= 151:
            status = "USG"
        elif aqi >= 101:
            status = "Moderate"
        else:
            status = "Good"

        payload = {"aqi": aqi, "triggered": aqi > 300, "status": status, "source": "WAQI"}
        save_cache(AQI_CACHE_FILE, key, payload)
        return payload

    except Exception:
        return cached or {"aqi": 0, "triggered": False, "status": "Unknown", "source": "error_fallback"}


# ─── K-Factor Computation ─────────────────────────────────────────────────────

def compute_k_event(weather_triggered: bool, news_triggered: bool, aqi_triggered: bool) -> float:
    sources_confirmed = sum([weather_triggered, news_triggered, aqi_triggered])
    if sources_confirmed >= 2:
        return 1.00  # Both primary APIs confirmed
    elif sources_confirmed == 1:
        # Check if primary (weather) confirmed
        return 0.75 if weather_triggered else 0.60
    return 0.50  # Minimum floor


def compute_k_severity(disruption_hours: float) -> float:
    hour = datetime.now().hour
    is_peak = any(s <= hour < e for s, e in PEAK_HOURS)
    base = 1.00 if disruption_hours >= 5 else (0.75 if disruption_hours >= 2 else 0.50)
    bonus = 0.10 if is_peak else 0.0
    return min(base + bonus, 1.0)


def compute_k_trust(clean_claims: int, trust_score: float, reward_active: bool = False) -> float:
    if reward_active:
        return 1.10  # Maximum internal trust multiplier
        
    if trust_score <= 60:
        return 0.70  # Fraud floor
    if trust_score <= 75:
        return 0.85  # Wrong claim
    if trust_score <= 85:
        return 0.90  # Unresponsive
    if trust_score <= 92:
        return 0.95  # Minor flag
    # Clean user
    if clean_claims >= 10:
        return 1.10
    if clean_claims >= 5:
        return 1.05
    return 1.00  # New user


COVERAGE_MAP = {"basic": 2000, "standard": 3500, "pro": 5000}


@router.get("/check")
async def check_trigger(
    lat: float = 28.6139,
    lon: float = 77.2090,
    city: str = "Delhi",
    trust_score: float = 100.0,
    clean_claims: int = 0,
    plan: str = "basic",
    reward_active: bool = False,
):
    """
    Check for active disruption triggers.
    Returns trigger status + K-factor breakdown if triggered.
    """
    # Fetch all data sources in parallel-ish
    weather = await fetch_weather_trigger(lat, lon)
    news = await fetch_news_trigger(city)
    aqi = await fetch_aqi(lat, lon)

    # Determine triggers
    weather_triggered = (
        weather.get("rainfall", 0) > 5 or
        weather.get("heat_index", 0) > 42 or
        weather.get("condition", "").lower() in ["thunderstorm", "tornado", "squall"]
    )
    news_triggered = news.get("triggered", False)
    aqi_triggered = aqi.get("triggered", False)

    any_triggered = weather_triggered or news_triggered or aqi_triggered
    trigger_type = []
    if weather_triggered:
        trigger_type.append("extreme_weather")
    if aqi_triggered:
        trigger_type.append("poor_aqi")
    if news_triggered:
        trigger_type.append("civic_disruption")

    # K-factors (only meaningful if triggered)
    disruption_hours = 3.0 if any_triggered else 0.0  # Estimate based on available data
    k_event = compute_k_event(weather_triggered, news_triggered, aqi_triggered)
    k_severity = compute_k_severity(disruption_hours)
    k_trust = compute_k_trust(clean_claims, trust_score, reward_active)

    # Payout calculation
    base_coverage = COVERAGE_MAP.get(plan.lower(), 2000)
    raw_payout = base_coverage * k_event * k_severity * k_trust
    max_payout = 0.95 * base_coverage
    final_payout = round(min(raw_payout, max_payout), 2) if any_triggered else 0.0

    return {
        "triggered": any_triggered,
        "trigger_types": trigger_type,
        "conditions": {
            "weather": {
                "temperature": weather.get("temperature"),
                "rainfall": weather.get("rainfall"),
                "heat_index": weather.get("heat_index"),
                "condition": weather.get("condition"),
                "triggered": weather_triggered,
                "source": weather.get("source", "OpenWeatherMap"),
            },
            "aqi": {
                "value": aqi.get("aqi"),
                "status": aqi.get("status"),
                "triggered": aqi_triggered,
                "source": aqi.get("source", "WAQI"),
            },
            "news": {
                "keywords_found": news.get("keywords_found", []),
                "articles": news.get("articles", []),
                "triggered": news_triggered,
                "source": news.get("source", "NewsAPI"),
            },
        },
        "k_factors": {
            "k_event": k_event,
            "k_severity": k_severity,
            "k_trust": k_trust,
            "description": {
                "k_event": "1.00=both confirmed, 0.75=primary only, 0.60=partial, 0.50=floor",
                "k_severity": f"Based on ~{disruption_hours}h disruption",
                "k_trust": f"Based on {clean_claims} clean claims, score {trust_score}",
            },
        },
        "payout": {
            "base_coverage": base_coverage,
            "formula": f"₹{base_coverage} × {k_event} × {k_severity} × {k_trust}",
            "raw_payout": round(base_coverage * k_event * k_severity * k_trust, 2),
            "max_cap": round(max_payout, 2),
            "final_payout": final_payout,
            "plan": plan,
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
