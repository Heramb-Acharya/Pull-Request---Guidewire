# Rakshak – Rider Income Shield

A parametric income protection system for Zepto/Blinkit Q-Commerce riders. Automatic payouts triggered by real API data — no manual claims, no paperwork.

---

## 🚀 Quick Start

### 1. Backend (FastAPI)

```bash
cd rakshak/backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
# Add your API keys to .env (optional — works in demo mode without them)
venv/bin/uvicorn main:app --reload --port 8000
```

### 2. Frontend (React + Vite)

```bash
cd rakshak/frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 🔑 API Keys (Optional)

Edit `backend/.env`:

| Key | Source | Used For |
|-----|--------|---------|
| `OPENWEATHER_API_KEY` | [openweathermap.org](https://openweathermap.org/api) | Weather, heat index, rain triggers |
| `NEWS_API_KEY` | [newsapi.org](https://newsapi.org) | Civic disruption detection (bandh/strike/curfew) |
| `WAQI_API_KEY` | [aqicn.org/api](https://aqicn.org/api/) | AQI threshold triggers |

> **Without API keys:** system runs in demo mode with realistic static data. OTP is always shown on screen for testing.

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/send-otp` | Send OTP to phone (returns demo_otp in dev) |
| POST | `/auth/verify-otp` | Verify OTP, returns JWT token |
| POST | `/risk/calculate` | Compute Risk Factor from live weather |
| POST | `/premium/calculate` | Final Premium = Base × Risk Factor |
| GET | `/trigger/check` | Check disruption + K-factor breakdown |
| GET | `/claims/history` | Past payouts for authenticated user |
| GET | `/user/profile` | Trust score, badge, stats |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧮 Core Formulas

### Risk Factor (Premium Pricing)
```
RF = 1 + (0.45×E) + (0.25×L) + (0.15×U) + (0.10×T) + (0.05×B)
Final Premium = Base Plan × RF
```

### K-Factor (Payout Calculation — separate from Risk)
```
Payout = Coverage × K_event × K_severity × K_trust
Max cap = 0.95 × Coverage
```

---

## 🏗️ Architecture

```
rakshak/
├── backend/              # Python FastAPI
│   ├── main.py           # App entry + CORS
│   ├── .env              # API keys
│   ├── cache/            # API response cache (failsafe)
│   └── routers/
│       ├── auth.py       # OTP + JWT
│       ├── risk.py       # Risk Factor (OpenWeatherMap)
│       ├── premium.py    # Premium calculation
│       ├── trigger.py    # Disruption detection + K-factors
│       ├── claims.py     # Claim history
│       └── user.py       # Profile + trust score
└── frontend/             # React + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Register.jsx  # OTP flow + language selector
        │   ├── Login.jsx
        │   ├── Dashboard.jsx # Main system view
        │   ├── ClaimHistory.jsx
        │   └── Profile.jsx
        ├── AuthContext.jsx   # JWT auth state
        └── api.js            # API client
```
