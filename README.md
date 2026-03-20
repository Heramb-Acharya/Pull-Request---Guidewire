# GigShield — AI-Powered Parametric Income Insurance for Q-Commerce Delivery Partners

> **Guidewire DEVTrails 2026** | Phase 1 Submission

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Our Persona — Arjun, Q-Commerce Delivery Partner](#2-our-persona)
3. [Solution Overview — GigShield](#3-solution-overview)
4. [Persona-Based Scenarios & Application Workflow](#4-scenarios--workflow)
5. [Weekly Premium Model](#5-weekly-premium-model)
6. [Parametric Triggers](#6-parametric-triggers)
7. [AI/ML Integration Plan](#7-aiml-integration-plan)
8. [Fraud Detection System](#8-fraud-detection-system)
9. [Tech Stack & Development Plan](#9-tech-stack--development-plan)
10. [Deliverables Roadmap](#10-deliverables-roadmap)

---

## 1. Problem Statement

India's Q-Commerce delivery partners — riders working for **Zepto** and **Blinkit** — are among the most economically vulnerable workers in the gig economy. Unlike food delivery riders who can roam across a city, Q-Commerce workers are locked to a **hyperlocal zone** (2–3 km radius) around a single dark store. This creates a unique and severe income risk:

- A single flood, cyclone alert, extreme heat event, or civic shutdown can eliminate **100% of a day's earnings** instantly
- Workers earn **₹700–900 on good days** and **₹0 on bad days** — with no way to recover lost hours
- Chennai's geography makes this especially acute: the northeast monsoon (Oct–Dec), Bay of Bengal cyclones, and April–June heat waves routinely disrupt the OMR/Velachery/Sholinganallur corridor — exactly where Q-Commerce dark stores are concentrated
- **Currently, no insurance product exists** that addresses this specific, parametric, income-loss risk for Q-Commerce workers

> We are insuring **lost income only** — not vehicles, not health, not accidents. This is a pure parametric income safety net.

---

## 2. Our Persona — Arjun, Q-Commerce Delivery Partner

| Attribute | Detail |
|---|---|
| **Name** | Arjun, 26 |
| **City** | Chennai |
| **Platforms** | Zepto (primary) + Blinkit (secondary) |
| **Home zone** | Velachery / Sholinganallur |
| **Vehicle** | Electric 2-wheeler |
| **Experience** | 2 years on platform |
| **Daily earnings (good day)** | ₹700–₹900 (18–25 deliveries × ₹30–45) |
| **Daily earnings (disrupted day)** | ₹0–₹150 |
| **Weekly earnings** | ₹4,500–₹6,000 |
| **Savings / safety net** | None |

### Arjun's Daily Schedule

```
08:00 ──── [09:00-11:00 PEAK] ──── [12:00-17:00 LULL] ──── [18:00-21:00 PEAK] ──── 23:00
```

Peak hours generate ~70% of daily income. A disruption during peak hours is catastrophic.

### Why Q-Commerce Is Uniquely Vulnerable

Unlike Zomato/Swiggy riders, Arjun **cannot relocate** to find orders. He is tethered to his dark store zone. If that zone floods, if his dark store loses power, if a cyclone alert grounds platform operations — Arjun earns nothing. There is no workaround.

---

## 3. Solution Overview — GigShield

**GigShield** is an AI-powered parametric income insurance platform for Q-Commerce delivery partners. It provides automated weekly coverage with zero-touch claims — no forms, no manual verification, no waiting.

### Core Principle

> When an external disruption event is verified by objective data, GigShield automatically initiates a payout to the worker's UPI within 15 minutes. Arjun never files a claim. The system does it for him.

### 5-Step Flow

```
[1. Onboard] → [2. Buy Weekly Policy] → [3. System Monitors 24/7] → [4. Auto Claim on Trigger] → [5. UPI Payout in 15 min]
```

1. **Onboard**: Arjun signs up in ~3 minutes. Links Zepto/Blinkit worker ID. Selects home zone. KYC via Aadhaar OTP.
2. **Buy weekly policy**: Every Monday, the AI model calculates his personalised weekly premium (₹49–99). He pays via UPI. Coverage starts immediately.
3. **Monitoring**: GigShield's trigger engine polls weather, AQI, alert, and news APIs every 15 minutes across all active zones.
4. **Auto claim**: When a trigger threshold is breached and cross-validated, a claim is automatically created. Arjun receives an SMS.
5. **Instant payout**: After fraud validation passes, UPI transfer is initiated within 15 minutes.

### Coverage Scope

| Covered ✅ | Not Covered ❌ |
|---|---|
| Income lost due to extreme rainfall / flooding | Vehicle repairs |
| Income lost due to cyclone / storm alerts | Health or accident expenses |
| Income lost due to extreme heat (heat index > 42°C) | Life insurance |
| Income lost due to severe air quality (AQI > 300) | Any non-income loss |
| Income lost due to verified civic shutdowns (bandh/curfew) | Voluntary absence |

---

## 4. Scenarios & Workflow

### Scenario 1 — Northeast Monsoon Flood (October, Velachery)

**Event**: IMD issues red alert. Rainfall exceeds 70mm in 3 hours. Velachery roads submerged.

**Without GigShield**: Arjun cannot reach his dark store. Earns ₹0 for the day. Loses ₹800 — his entire day's income.

**With GigShield**:
- 08:45am — Trigger engine detects rainfall > 65mm threshold via IMD API
- 08:47am — Cross-validates: order volume drop > 60% on Zepto/Blinkit mock API for Velachery zone
- 08:48am — Trigger confirmed. Fraud engine checks Arjun's GPS is in registered zone
- 08:50am — Claim auto-created. ₹400 payout initiated to Arjun's UPI
- 09:03am — Arjun receives ₹400 and SMS: *"GigShield payout credited for rainfall disruption in your zone"*

### Scenario 2 — Cyclone Alert (December, Bay of Bengal)

**Event**: IMD issues orange cyclone warning for Tamil Nadu coast. Zepto suspends operations in Chennai.

**With GigShield**: IMD orange alert detected via NDMA RSS feed → platform suspension cross-validated → ₹600/day payout automatically initiated per affected worker.

### Scenario 3 — Extreme Heat (May, Sholinganallur)

**Event**: Heat index crosses 43°C for 5 consecutive hours.

**With GigShield**: OpenWeatherMap heat index API triggers at sustained > 42°C → ₹300 partial payout → workers also receive proactive SMS warning the evening before.

### Scenario 4 — Political Bandh

**Event**: Unplanned hartal called. Roads blocked. Zero platform orders across zone.

**With GigShield**: News API detects verified bandh keyword cluster for Chennai → order volume drops > 80% → two-source validation confirms shutdown → ₹500 payout automatically initiated.

### Application Workflow

```
WORKER SIDE                            ADMIN / INSURER SIDE
────────────────────────────────────   ────────────────────────────────
Register → Link Platform ID            Monitor loss ratios by zone
        ↓                              View active policies
View AI-generated weekly premium       Predictive disruption alerts
        ↓                              Fraud flagging dashboard
Pay ₹49–99 via UPI                     Claims audit trail
        ↓
Receive active policy confirmation
        ↓
Real-time disruption alerts (SMS)
        ↓
Auto payout on trigger — no action needed
        ↓
Weekly earnings protection summary
```

---

## 5. Weekly Premium Model

### Why Weekly?

Q-Commerce workers earn and spend on a weekly cycle. A ₹49–99 weekly charge is equivalent to skipping one delivery fee — psychologically accessible and aligned with their earnings rhythm.

### Premium Tiers

| Tier | Weekly Premium | Max Coverage | Best For |
|---|---|---|---|
| Basic | ₹49 | ₹1,500/week | Low-risk zone, dry season |
| Plus | ₹74 | ₹2,200/week | Medium-risk zone / monsoon shoulder months |
| Max | ₹99 | ₹3,000/week | High-risk zone (Velachery) / peak monsoon |

### AI Premium Calculation

Every **Monday at 6:00am**, the AI risk model calculates each worker's premium for the upcoming 7-day window.

**Input features:**

| Feature | Example |
|---|---|
| Worker's home zone | Velachery (flood-prone = high risk) |
| Current month / season | October = 2× risk multiplier |
| 7-day weather forecast | 60% rain probability → elevated premium |
| Historical claim frequency | First-time user → neutral baseline |
| Platform activity baseline | Avg 20 deliveries/day → payout calibration |
| Selected coverage tier | Basic / Plus / Max |

**Model**: Gradient Boosting Regressor (scikit-learn), trained on IMD Chennai historical weather records (2018–2024), historical disruption events per zone, and synthetic worker profiles.

**Output**: Personalised weekly premium capped between ₹49–₹99.

### Premium-to-Payout Ratio

On a worst-case week (cyclone + bandh + extreme rain = 3 triggered days), a Max-tier worker paying ₹99 can receive up to ₹1,500 in payouts — a **15× return** on their premium.

---

## 6. Parametric Triggers

All triggers are **objective, verifiable, and API-driven**. Two independent data sources must confirm every trigger before a claim is initiated.

| # | Trigger | Threshold | Primary API | Secondary Validation | Payout |
|---|---|---|---|---|---|
| T1 | Extreme rainfall | > 65mm in 3 hours | IMD / OpenWeatherMap | Order volume drop > 60% | ₹400/day |
| T2 | Extreme heat | Heat index > 42°C for 4+ hours | OpenWeatherMap | Platform advisory (mock) | ₹300/day |
| T3 | Cyclone / storm alert | IMD orange or red alert | NDMA RSS feed | Platform suspension (mock) | ₹600/day |
| T4 | Severe air quality | AQI > 300 (Very Poor) | CPCB / AQI India API | Duration > 3 hours | ₹250/day |
| T5 | Civic shutdown | Verified bandh / curfew | News API (keyword cluster) | Order volume drop > 80% | ₹500/day |

### Trigger Engine Logic (Pseudocode)

```python
# Runs every 15 minutes per active zone
def evaluate_triggers(zone, worker_list):
    for trigger in [T1, T2, T3, T4, T5]:
        primary_signal = fetch_primary_api(trigger, zone)
        if primary_signal.breaches_threshold():
            secondary_signal = fetch_secondary_api(trigger, zone)
            if secondary_signal.confirms():
                for worker in worker_list:
                    if fraud_engine.validate(worker, trigger):
                        initiate_claim(worker, trigger.payout_amount)
```

### Zone-Based Triggering

Triggers are evaluated **per zone**, not city-wide. A flood in Velachery does not trigger payouts for workers in Anna Nagar. This zone-level precision is the core differentiator from generic insurance products.

---

## 7. AI/ML Integration Plan

### 7.1 Dynamic Premium Calculation (Weekly)

- **Model**: Gradient Boosting Regressor
- **Framework**: scikit-learn
- **Training data**: Synthetic dataset built on IMD Chennai weather records (2018–2024), disruption frequency per zone, and modelled worker activity patterns
- **Runs**: Every Monday 6:00am for all active policyholders
- **Output**: Personalised weekly premium between ₹49–₹99

### 7.2 Fraud Detection (Real-Time, Per Claim)

- **Model**: Isolation Forest (unsupervised anomaly detection)
- **Framework**: scikit-learn
- **Runs**: Synchronously on every auto-generated claim before payout release
- **Layered approach**: Rule-based pre-filter → ML anomaly score → risk decision
- *(Full detail in Section 8)*

### 7.3 Predictive Disruption Alerts (Proactive)

- **Approach**: Time-series analysis on IMD 7-day forecast data per zone
- **Output**: Next-day disruption probability per zone
- **Use cases**:
  - Workers receive proactive SMS the evening before a likely disruption day
  - Admin dashboard shows predicted claim volume for the next 7 days
  - Insurer can adjust reserve levels dynamically

---

## 8. Fraud Detection System

### 8.1 Threat Model

Parametric insurance is vulnerable to organised fraud because payouts are automated. Key threats in the Q-Commerce context:

- **GPS spoofing**: Worker simulates zone presence during a disruption while actually elsewhere
- **Coordinated fraud**: Group of workers synchronise fake location data to trigger false claims
- **Context mismatch**: Claiming disruption during normal conditions
- **Static spoofing**: Faking zero movement to simulate a work stoppage

### 8.2 Dataset — Semi-Synthetic Simulation

Since real-world labelled fraud datasets are unavailable, we construct a semi-synthetic dataset modelling realistic Q-Commerce delivery behaviour and adversarial patterns.

**Each data point = a 5-minute time-windowed summary:**

| Feature | Description |
|---|---|
| `avg_speed` | Average speed within window |
| `max_speed` | Maximum observed speed |
| `distance` | Total distance travelled |
| `stationary_time` | Duration with near-zero movement |
| `cluster_density` | Number of nearby users in same zone |
| `weather_mismatch` | Claimed vs actual weather condition |
| `region_id` | Encoded geographic zone |
| `device_risk` | Device integrity indicator ∈ [0,1] |

**Dataset composition:**
- Total samples: ~5,000–10,000
- Normal behaviour: 85–90%
- Fraud patterns: 10–15%
- Simulated users: ~80–120
- Time windows per user: ~80–120

### 8.3 Normal Behaviour Simulation

- Speed: base 20–45 km/h with small random noise for realistic variation
- Movement continuity: lat/long updated in small steps (normal distribution, small variance) — no abrupt jumps
- Context-aware: reduced speed during simulated rain; increased cluster density in high-traffic zones
- Temporal: peak hours → higher cluster density; off-hours → lower activity

### 8.4 Fraud Pattern Injection

| Fraud Type | Behavioural Signature |
|---|---|
| **Teleportation** | Large spatial displacement in short time; implied speed exceeds physical constraints |
| **Static spoofing** | Near-zero movement + high stationary time despite active claim |
| **Coordinated fraud** | Multiple users at identical/near-identical locations; high cluster density in short interval |
| **Context mismatch** | Claim indicates disruption; actual API conditions show normal environment |

### 8.5 Feature Engineering

**Movement features:**
- `avg_speed` = total_distance / total_time
- `max_speed` = max(segment_speeds)
- `distance` = sum of segment distances
- `stationary_time` = duration where speed < threshold

**Context features:**
- `weather_mismatch` = 1 if claimed condition ≠ actual API condition
- `region_id` = categorical zone encoding

**Coordination feature:**
- `cluster_density` = count of users within radius r at same time window

**Device signal:**
- `device_risk` ∈ [0,1] — device integrity score

### 8.6 Model Design — Isolation Forest

| Hyperparameter | Value |
|---|---|
| `n_estimators` | 100 |
| `contamination` | 0.05 |
| `max_samples` | auto |
| `random_state` | fixed |

**Training strategy:**
- Trained primarily on normal behaviour data
- Fraud samples held out for validation only
- No labelled data required — unsupervised detection

**Output:** Continuous anomaly score + binary decision (normal / anomaly)

### 8.7 Rule-Based Validation Layer

Applied as a deterministic pre-filter before the ML model:
- `max_speed` > 80 km/h → instant flag (impossible for city 2-wheeler)
- Displacement > 5km in < 5 minutes → teleportation flag
- `weather_mismatch` = 1 → context flag
- `cluster_density` > 95th percentile → coordination flag

### 8.8 Decision Engine

| Risk Score | Action |
|---|---|
| Low | Approve — payout released |
| Medium | Flag — queued for human review |
| High | Reject — claim denied, worker notified |

### 8.9 Anti-Spoofing Key Insight

> Spoofed GPS can mimic *location* but cannot replicate *realistic motion patterns*, *natural speed distributions*, or *independent behavioural signatures*. GigShield detects the inconsistency between where a device claims to be and how it is actually behaving.

---

## 9. Tech Stack & Development Plan

### Platform Choice: Web (Mobile-First PWA)

A Progressive Web App is accessible without app store installation. Workers in Chennai predominantly use mid-range Android devices. A mobile-first React PWA with offline capability is the optimal delivery mechanism.

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Tailwind CSS (PWA) | Worker app + Admin dashboard |
| Backend | Python FastAPI | REST API, trigger engine, claim processor |
| Database | PostgreSQL | Profiles, policies, claims, audit trail |
| ML / AI | scikit-learn | Premium model + Isolation Forest fraud detection |
| Weather API | OpenWeatherMap (free tier) | Rainfall, heat index, real-time conditions |
| Alert API | NDMA RSS + IMD public feed | Cyclone and disaster alerts |
| AQI API | CPCB / AQI India API | Air quality monitoring |
| News API | NewsAPI.org (free tier) | Bandh / civic shutdown detection |
| Payment | Razorpay test mode | Premium collection + payout simulation |
| Notifications | Twilio SMS (trial) | Claim and payout alerts to workers |
| Hosting | Railway / Render (free tier) | Backend deployment |


