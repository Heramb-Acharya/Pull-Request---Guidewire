# Rakshak: AI-Powered Parametric Income Insurance for Q-Commerce Delivery Partners

> **Guidewire DEVTrails 2026** | Phase 1 Submission

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Our Persona](#2-our-persona)
3. [Solution Overview](#3-solution-overview)
4. [Persona-Based Scenarios and Application Workflow](#4-scenarios-and-workflow)
5. [Weekly Premium Model](#5-weekly-premium-model)
6. [Parametric Triggers](#6-parametric-triggers)
7. [AI/ML Integration Plan](#7-aiml-integration-plan)
8. [Fraud Detection System](#8-fraud-detection-system)
9. [Adversarial Defense and Anti-Spoofing Strategy](#9-adversarial-defense-and-anti-spoofing-strategy)
10. [Tech Stack and Development Plan](#10-tech-stack-and-development-plan)
11. [Deliverables Roadmap](#11-deliverables-roadmap)

---

## 1. Problem Statement

India's Q-Commerce delivery partners — riders working for Zepto and Blinkit — are among the most economically vulnerable workers in the gig economy. Unlike food delivery riders who can roam across a city, Q-Commerce workers are locked to a hyperlocal zone (2–3 km radius) around a single dark store. This creates a unique and severe income risk:

- A single flood, cyclone alert, extreme heat event, or civic shutdown can eliminate 100% of a day's earnings instantly
- Workers earn Rs.700–900 on good days and Rs.0 on bad days, with no way to recover lost hours
- Seasonal disruptions — monsoons, cyclones, extreme heat waves, and civic shutdowns — routinely eliminate entire workdays for riders locked to a single dark store zone, with no income protection whatsoever
- Currently, no insurance product exists that addresses this specific, parametric, income-loss risk for Q-Commerce workers

We are insuring lost income only — not vehicles, not health, not accidents. This is a pure parametric income safety net.

---

## 2. Our Persona

**Arjun, 26, Q-Commerce Delivery Partner, Chennai**

| Attribute | Detail |
|---|---|
| Platforms | Zepto (primary) + Blinkit (secondary) |
| Home zone | Velachery / Sholinganallur |
| Vehicle | Electric 2-wheeler |
| Experience | 2 years on platform |
| Daily earnings (good day) | Rs.700–900 (18–25 deliveries x Rs.30–45) |
| Daily earnings (disrupted day) | Rs.0–150 |
| Weekly earnings | Rs.4,500–6,000 |
| Savings / safety net | None |
| Primary risk seasons | Oct–Dec (monsoon/cyclone), Apr–Jun (extreme heat) |

### Arjun's Daily Schedule

```
08:00 ---- [09:00-11:00 PEAK] ---- [12:00-17:00 LULL] ---- [18:00-21:00 PEAK] ---- 23:00
```

Peak hours generate roughly 70% of daily income. A disruption during peak hours wipes out most of what he would have earned that day.

### Why Q-Commerce Is Uniquely Vulnerable

Unlike Zomato/Swiggy riders, Arjun cannot relocate to find orders. He is assigned to his dark store zone. If that zone floods, if the dark store loses power, if a cyclone alert grounds platform operations, or if a bandh locks down the city — Arjun earns nothing. There is no workaround available to him.

---

## 3. Solution Overview

**Rakshak** is an AI-powered parametric income insurance platform for Q-Commerce delivery partners. It provides automated weekly coverage with zero-touch claims — no forms, no manual verification, no waiting.

### Core Principle

When an external disruption event is verified by objective data, Rakshak automatically initiates a payout to the worker's UPI within 15 minutes. Arjun never files a claim. The system does it for him.

### 5-Step Flow

```
[1. Onboard] -> [2. Buy Weekly Policy] -> [3. System Monitors 24/7] -> [4. Auto Claim on Trigger] -> [5. UPI Payout in 15 min]
```

1. **Onboard**: Arjun signs up in roughly 3 minutes. Links his Zepto/Blinkit worker ID. Selects home zone. KYC via Aadhaar OTP.
2. **Buy weekly policy**: Every Monday, the AI model calculates his personalised weekly premium (Rs.49–99). He pays via UPI and coverage starts immediately.
3. **Monitoring**: Rakshak's trigger engine polls weather, AQI, alert, and news APIs every 15 minutes across all active zones.
4. **Auto claim**: When a trigger threshold is breached and cross-validated, a claim is automatically created and Arjun receives an SMS.
5. **Instant payout**: After fraud validation passes, UPI transfer is initiated within 15 minutes.

### Coverage Scope

| Covered | Not Covered |
|---|---|
| Income lost due to extreme rainfall / flooding | Vehicle repairs |
| Income lost due to cyclone / storm alerts | Health or accident expenses |
| Income lost due to extreme heat (heat index > 42°C) | Life insurance |
| Income lost due to severe air quality (AQI > 300) | Any non-income loss |
| Income lost due to verified civic shutdowns (bandh/curfew) | Voluntary absence |

### Geographic Scope

Rakshak is built for any Q-Commerce dark store corridor in India. The trigger engine, premium model, and fraud detection pipeline are all parameterised by zone — Arjun's Velachery corridor in Chennai is our development and demo context, but the platform replicates to any city where Zepto or Blinkit operates. Swapping cities requires updating zone boundaries and API coordinates, nothing more.

---

## 4. Scenarios and Workflow

### Scenario 1: Northeast Monsoon Flood (October, Velachery)

**Event**: IMD issues red alert. Rainfall exceeds 70mm in 3 hours. Velachery roads submerged.

**Without Rakshak**: Arjun cannot reach his dark store. Earns Rs.0 for the day, losing Rs.800 in income he was counting on.

**With Rakshak**:
- 08:45am: Trigger engine detects rainfall > 65mm threshold via IMD API
- 08:47am: Cross-validates order volume drop > 60% on Zepto/Blinkit mock API for Velachery zone
- 08:48am: Trigger confirmed. Fraud engine checks Arjun's GPS is within his registered zone
- 08:50am: Claim auto-created. Rs.400 payout initiated to Arjun's UPI
- 09:03am: Arjun receives Rs.400 and SMS: "Rakshak payout credited for rainfall disruption in your zone"

### Scenario 2: Cyclone Alert (December, Bay of Bengal)

**Event**: IMD issues orange cyclone warning for Tamil Nadu coast. Zepto suspends operations in Chennai.

**With Rakshak**: IMD orange alert detected via NDMA RSS feed, platform suspension cross-validated, Rs.600/day payout automatically initiated per affected worker. No action required from Arjun.

### Scenario 3: Extreme Heat (May, Sholinganallur)

**Event**: Heat index crosses 43°C for 5 consecutive hours.

**With Rakshak**: OpenWeatherMap heat index API triggers at sustained > 42°C, Rs.300 partial payout initiated, workers also receive a proactive SMS warning the evening before a predicted heat disruption day.

### Scenario 4: Political Bandh

**Event**: Unplanned hartal called. Roads blocked. Zero platform orders across zone.

**With Rakshak**: News API detects verified bandh keyword cluster for the city, order volume drops > 80%, two-source validation confirms the shutdown, Rs.500 payout automatically initiated.

### Application Workflow

```
WORKER SIDE                            ADMIN / INSURER SIDE
------------------------------------   --------------------------------
Register -> Link Platform ID           Monitor loss ratios by zone
        |                              View active policies
View AI-generated weekly premium       Predictive disruption alerts
        |                              Fraud flagging dashboard
Pay Rs.49-99 via UPI                   Claims audit trail
        |
Receive active policy confirmation
        |
Real-time disruption alerts (SMS)
        |
Auto payout on trigger (no action needed)
        |
Weekly earnings protection summary
```

---

## 5. Weekly Premium Model

### Why Weekly?

Q-Commerce workers earn and spend on a weekly cycle. A Rs.49–99 weekly charge is roughly equivalent to skipping one delivery fee, making it psychologically accessible and aligned with how workers already think about money.

### Premium Tiers

| Tier | Weekly Premium | Max Coverage | Best For |
|---|---|---|---|
| Basic | Rs.49 | Rs.1,500/week | Low-risk zone, dry season |
| Plus | Rs.74 | Rs.2,200/week | Medium-risk zone / monsoon shoulder months |
| Max | Rs.99 | Rs.3,000/week | High-risk zone / peak disruption season |

### AI Premium Calculation

Every Monday at 6:00am, the AI risk model calculates each worker's premium for the upcoming 7-day coverage window.

**Input features:**

| Feature | Example |
|---|---|
| Worker's home zone | Flood-prone zone = high risk multiplier |
| Current month / season | Peak monsoon month = 2x risk multiplier |
| 7-day weather forecast | 60% rain probability leads to elevated premium |
| Historical claim frequency | First-time user gets neutral baseline |
| Platform activity baseline | Avg 20 deliveries/day used for payout calibration |
| Selected coverage tier | Basic / Plus / Max |

**Model**: Gradient Boosting Regressor (scikit-learn), trained on IMD historical weather records, historical disruption events per zone, and synthetic worker profiles.

**Output**: Personalised weekly premium capped between Rs.49 and Rs.99.

### Premium-to-Payout Ratio

On a worst-case week (cyclone + bandh + extreme rain = 3 triggered days), a Max-tier worker paying Rs.99 can receive up to Rs.1,500 in payouts — a 15x return on their premium.

### 5.4 Why the Math Works: Unit Economics

The 15x worst-case payout ratio sounds alarming on paper. It works because of three structural realities of parametric insurance at zone level.

**Not everyone claims simultaneously.** Rakshak's triggers are zone-specific. A flood in one zone does not trigger another. Across a typical city, there are roughly 6–10 active dark-store zones. Historical IMD data shows that city-wide simultaneous red alerts — all zones affected at once — happen only a handful of times per year during peak disruption seasons. On a typical disruption day, 1–2 zones are affected. This means at most 20–25% of active policyholders claim on any given day.

**The premium pool absorbs expected losses.** Assume 500 active workers, all on the Rs.74 Plus tier. Weekly pool = Rs.37,000. On a 1-zone flood day, roughly 60–80 workers claim (Rs.400 each) = Rs.28,000 in payouts. Pool holds. On a worst-case week with 3 disruption days across multiple zones, payouts could reach Rs.65,000–80,000 against a pool of Rs.37,000 — this is the catastrophic scenario we plan for explicitly.

**Catastrophic event handling.** For a genuine citywide disruption (all zones affected simultaneously), we implement two safeguards. First, a per-zone weekly payout cap: maximum total payout per zone per week is capped at 2x that zone's weekly premium contribution, protecting the liquidity pool. Second, in a real deployment, Rakshak would carry reinsurance for events where simultaneous claims exceed 40% of the active pool — standard practice for parametric products. For the hackathon, we simulate this with a reserve buffer of 3x weekly pool size maintained in the payment system.

The model is not designed to be profitable at 500 users. It reaches break-even at approximately 2,000 active workers per city, which is realistic given Zepto and Blinkit's combined rider count in any tier-1 Indian city exceeds 10,000–15,000.

---

## 6. Parametric Triggers

All triggers are objective, verifiable, and API-driven. Two independent data sources must confirm every trigger before a claim is initiated.

| # | Trigger | Threshold | Primary API | Secondary Validation | Payout |
|---|---|---|---|---|---|
| T1 | Extreme rainfall | > 65mm in 3 hours | IMD / OpenWeatherMap | Order volume drop > 60% | Rs.400/day |
| T2 | Extreme heat | Heat index > 42°C for 4+ hours | OpenWeatherMap | Platform advisory (mock) | Rs.300/day |
| T3 | Cyclone / storm alert | IMD orange or red alert | NDMA RSS feed | Platform suspension (mock) | Rs.600/day |
| T4 | Severe air quality | AQI > 300 (Very Poor) | CPCB / AQI India API | Duration > 3 hours | Rs.250/day |
| T5 | Civic shutdown | Verified bandh / curfew | News API (keyword cluster) | Order volume drop > 80% | Rs.500/day |

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

Triggers are evaluated per zone, not city-wide. A flood in one zone does not trigger payouts for workers in a neighbouring zone. This zone-level precision is what separates Rakshak from generic insurance products and is also what keeps the loss ratio manageable — payouts are always proportional to the actual footprint of the disruption.

---

## 7. AI/ML Integration Plan

### 7.1 Dynamic Premium Calculation (Weekly)

- **Model**: Gradient Boosting Regressor
- **Framework**: scikit-learn
- **Training data**: Synthetic dataset built on IMD historical weather records, disruption frequency per zone, and modelled worker activity patterns
- **Runs**: Every Monday at 6:00am for all active policyholders
- **Output**: Personalised weekly premium between Rs.49 and Rs.99

### 7.2 Fraud Detection (Real-Time, Per Claim)

- **Model**: Isolation Forest (unsupervised anomaly detection)
- **Framework**: scikit-learn
- **Runs**: Synchronously on every auto-generated claim before payout release
- **Layered approach**: Rule-based pre-filter, then ML anomaly score, then risk decision
- Full detail in Section 8

### 7.3 Predictive Disruption Alerts (Proactive)

- **Approach**: Time-series analysis on IMD 7-day forecast data per zone
- **Output**: Next-day disruption probability per zone
- **Use cases**: Workers receive a proactive SMS the evening before a likely disruption day. The admin dashboard shows predicted claim volume for the next 7 days. The insurer can adjust reserve levels dynamically based on forecast risk.

### 7.4 ML Evolution Strategy: Phase 1 to Phase 3

**Why Isolation Forest for Phase 1**

We have no labelled fraud data. Rakshak doesn't exist yet, so there are no historical claims to learn from. Isolation Forest is the correct choice here — it's an unsupervised anomaly detector that trains on normal behaviour and flags deviations, no fraud labels required. It's also fast enough to run synchronously on each claim (inference in under 50ms on a standard instance), which matters for our 15-minute payout SLA.

The limitation is that it flags anomalies generically. It will catch a spoofed GPS claim and a genuine worker with a broken accelerometer with the same score. That's acceptable at Phase 1 because our rule-based pre-filter handles the obvious cases, and the medium-risk hold queue gives us a human review fallback.

**The upgrade path: Phase 3 supervised classifier**

By the time we reach Phase 3, we'll have two things we don't have now: a labelled dataset of resolved claims (approved, flagged, rejected) from Phase 2 demos and synthetic runs, and a clearer picture of which features actually discriminated between genuine and fraudulent claims in practice.

At that point we'll train an XGBoost classifier on this labelled history. XGBoost is the right choice for this transition for a few reasons: it handles the class imbalance (fraud is ~10–15% of claims) well with the `scale_pos_weight` parameter, it gives us feature importance scores so we can audit which signals are actually driving rejections (important for the fairness argument), and it consistently outperforms Isolation Forest on tabular fraud detection once labels exist — this is well-documented in the payment fraud literature.

We keep Isolation Forest running in parallel as a secondary signal for out-of-distribution patterns that the supervised model hasn't seen before. New fraud techniques that don't match the training distribution will still score high on the anomaly detector even if the classifier misses them.

Target outcome for Phase 3 model: false positive rate under 2% on genuine claims, with full feature importance output visible on the admin dashboard so reviewers can see exactly why a claim was flagged.

---

## 8. Fraud Detection System

### 8.1 Threat Model

Parametric insurance is vulnerable to organised fraud because payouts are automated. Key threats in the Q-Commerce context:

- **GPS spoofing**: Worker simulates zone presence during a disruption while actually elsewhere
- **Coordinated fraud**: Group of workers synchronise fake location data to trigger false claims
- **Context mismatch**: Claiming disruption during normal conditions
- **Static spoofing**: Faking zero movement to simulate a work stoppage

### 8.2 Dataset: Semi-Synthetic Simulation

Since real-world labelled fraud datasets are unavailable, we construct a semi-synthetic dataset modelling realistic Q-Commerce delivery behaviour and adversarial patterns.

Each data point represents a 5-minute time-windowed summary:

| Feature | Description |
|---|---|
| avg_speed | Average speed within window |
| max_speed | Maximum observed speed |
| distance | Total distance travelled |
| stationary_time | Duration with near-zero movement |
| cluster_density | Number of nearby users in same zone |
| weather_mismatch | Claimed vs actual weather condition |
| region_id | Encoded geographic zone |
| device_risk | Device integrity indicator between 0 and 1 |

**Dataset composition:**
- Total samples: approximately 5,000–10,000
- Normal behaviour: 85–90%
- Fraud patterns: 10–15%
- Simulated users: approximately 80–120
- Time windows per user: approximately 80–120

### 8.3 Normal Behaviour Simulation

Normal delivery behaviour is generated using constrained stochastic processes:

- Speed is generated with a base range of 20–45 km/h with small random noise to simulate natural variation
- Movement continuity is maintained by updating location in small steps. Latitude and longitude changes are sampled from a normal distribution with very small variance, producing smooth movement rather than abrupt jumps
- Context-aware adjustments include reduced speed during simulated rain and increased cluster density in high-traffic zones
- Temporal variation includes higher cluster density during peak hours and lower activity during off-hours

### 8.4 Fraud Pattern Injection

| Fraud Type | Behavioural Signature |
|---|---|
| Teleportation | Large spatial displacement in short time, with implied speed exceeding physical constraints |
| Static spoofing | Near-zero movement and high stationary time despite an active claim |
| Coordinated fraud | Multiple users at identical or near-identical locations with high cluster density in short intervals |
| Context mismatch | Claim indicates disruption while actual API conditions show a normal environment |

### 8.5 Feature Engineering

**Movement features:**
- `avg_speed` = total_distance / total_time
- `max_speed` = max(segment_speeds)
- `distance` = sum of segment distances
- `stationary_time` = duration where speed is below threshold

**Context features:**
- `weather_mismatch` = 1 if claimed condition does not match actual API condition
- `region_id` = categorical zone encoding

**Coordination feature:**
- `cluster_density` = count of users within radius r at the same time window

**Device signal:**
- `device_risk` is a value between 0 and 1 representing the device integrity score

### 8.6 Model Design: Isolation Forest

| Hyperparameter | Value |
|---|---|
| n_estimators | 100 |
| contamination | 0.05 |
| max_samples | auto |
| random_state | fixed |

**Training strategy:**
- Trained primarily on normal behaviour data
- Fraud samples held out for validation only, not used in training
- No labelled data required — true unsupervised detection

**Output**: Continuous anomaly score plus binary decision (normal / anomaly)

### 8.7 Rule-Based Validation Layer

Applied as a deterministic pre-filter before the ML model:
- `max_speed` > 80 km/h flags instantly (not physically possible for a city 2-wheeler)
- Displacement > 5km in under 5 minutes flags as teleportation
- `weather_mismatch` = 1 flags as context mismatch
- `cluster_density` above 95th percentile flags as potential coordination

### 8.8 Decision Engine

| Risk Score | Action |
|---|---|
| Low | Approve, payout released |
| Medium | Flag, queued for 2-hour passive re-validation |
| High | Reject, claim denied and worker notified with appeal option |

---

## 9. Adversarial Defense and Anti-Spoofing Strategy

This section addresses the coordinated GPS spoofing threat scenario: a syndicate of delivery workers using spoofing applications to fake location presence in a disruption zone and trigger mass false payouts.

### 9.1 The Differentiation Problem: Stranded Worker vs. Bad Actor

Simple GPS verification cannot tell apart a genuinely stranded Arjun from someone sitting at home running a spoofing app. Rakshak solves this through behavioural consistency scoring across multiple independent signals, not location data alone.

A real delivery worker stranded in a disrupted zone behaves in a specific, measurable way:

- Their device shows movement patterns consistent with someone waiting near or attempting to navigate their usual zone
- Speed readings fluctuate naturally, including small movements, phone handling, and repositioning
- Their order acceptance rate on the platform drops to zero because no orders are being dispatched to that zone
- Battery drain and network signal patterns are consistent with outdoor device usage in adverse conditions

A spoofing actor sitting at home looks different across these signals:

- GPS coordinates place them in the zone, but motion data shows stationary or unnaturally smooth patterns
- Speed and acceleration readings lack the micro-variation of real outdoor movement
- Device sensor data (accelerometer, gyroscope) does not match claimed outdoor activity
- Network handshake patterns may reflect a home Wi-Fi connection despite a claimed field location

**How Rakshak differentiates:**

Every claim is cross-referenced across four independent signal layers before approval:

1. **GPS coordinates**: necessary but not sufficient on their own
2. **Behavioural motion signals**: avg_speed, max_speed, and stationary_time patterns across the 5-minute window
3. **Platform-side signals**: order dispatch volume in the worker's zone from the mock platform API, confirming whether the disruption actually suppressed platform activity
4. **Environmental cross-match**: the claimed disruption event must be independently confirmed by at least two external APIs (e.g., IMD rainfall data plus platform order volume drop in the same zone)

A genuine stranded worker passes all four layers naturally. A spoofed claim typically fails on layers 2 and 3.

### 9.2 Beyond GPS: Detecting a Coordinated Ring

When a syndicate coordinates, the attack leaves a statistical fingerprint that individual fraud cannot replicate:

**Cluster density anomaly**: In normal disruption events, workers are distributed across a zone proportionally to their registered home locations. Coordinated fraud produces an unnaturally high density of claims originating from the same micro-location or showing near-identical GPS coordinates with only minor offsets.

**Synchronisation timing**: Genuine claims arrive over a distributed time window as different workers encounter the disruption at different moments. A coordinated ring triggers claims within a suspiciously narrow window, often within seconds of each other across many accounts.

**Claim-to-active-user ratio**: On a genuine disruption day, the ratio of claims to registered active workers in a zone follows historical patterns for that zone. A sudden spike where 90%+ of zone workers file simultaneously is a statistical outlier that gets flagged immediately.

**Velocity consistency**: Real workers in a disrupted zone show irregular, low-speed movement consistent with the disruption type. Spoofed actors tend to show perfectly static GPS or movement that lacks the micro-jitter of genuine handheld device use outdoors.

**Device diversity check**: A coordinated ring often uses similar spoofing software, producing recognisable device_risk signatures and similar accelerometer fingerprints across many devices at the same time.

Rakshak's Isolation Forest model is trained on these coordination patterns and flags clusters where multiple workers share anomalous similarity across these features simultaneously.

### 9.3 UX Balance: Handling Flagged Claims Without Penalising Honest Workers

A real worker in a genuine disruption zone may have connectivity issues, an older device, or movement patterns that superficially resemble spoofing. Wrongly rejecting his claim would be a serious failure of the product.

**How Rakshak handles medium-risk flags:**

The payout is not immediately rejected. It moves to a temporary hold state, not a denial. The worker receives an SMS: "Your claim is being verified. You will receive your payout or an update within 2 hours."

A lightweight secondary verification then runs automatically:
- The system checks whether other workers in the same sub-zone also filed claims around the same time. If they are verified, this corroborates that the disruption was real
- The system checks whether platform order volume in that zone dropped significantly, which confirms the disruption independently of any individual GPS data
- If the worker has a clean claim history with no prior fraud flags, the system applies a trust adjustment that reduces the anomaly weight automatically

If the medium-risk claim cannot be auto-resolved within 2 hours, a human reviewer gets a simple dashboard view showing the worker's motion trace, the zone disruption data, and the anomaly score breakdown. Most genuine cases are resolved within the 2-hour window without the worker needing to do anything at all.

**What we do not do:**
- We do not ask workers to upload photos or videos as proof — this burdens legitimate claimants and is easily gamed
- We do not reject based on a single anomalous signal
- We do not penalise a worker's future premiums based on a flagged-but-resolved claim

**False positive target**: Our fraud model targets a maximum 2% false positive rate on genuine claims. A flagged honest worker gets their payout within 2 hours if zone-level corroborating data confirms the disruption. Only claims where both individual signals and zone signals are simultaneously anomalous result in outright rejection.

---

## 10. Tech Stack and Development Plan

### Platform Choice: Web (Mobile-First PWA)

A Progressive Web App is accessible without requiring app store installation, which matters for workers with limited storage on budget Android devices. A mobile-first React PWA with offline capability is the right delivery mechanism for this user group.

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

---
