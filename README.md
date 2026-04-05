# Rakshak, Parametric Income Insurance for Q-Commerce Riders

> Guidewire DEVTrails 2026 | Phase 2 Submission

---

###Try it out here : https://rakshak-production.up.railway.app/

### Full-Stack Application, Shipped

A modular FastAPI backend with domain-driven routers serves a Vite + React PWA frontend. All four Phase 2 deliverables are live: registration, insurance policy management, dynamic premium calculation, and claims management.

### Registration and Onboarding

Three-minute onboarding flow. Phone number, zone, weekly earnings. JWT issued on completion. AuthContext handles token lifecycle across the session. The rider lands directly on their dashboard with their live premium already calculated for the week.

### Insurance Policy Management

Riders can view their active weekly policy, coverage tier, and expiry. Policies are created on purchase and bound to the rider's decoded phone number via JWT sub claim. Policy state is visible on the Dashboard and Profile pages.

### Dynamic Premium Calculation

Each rider's premium is calculated in real time using live API data, not hardcoded values:

```
Final Premium = (Base Price x Risk Factor) 
```

Risk Factor is computed from live OpenWeatherMap and WAQI payloads, zone keyword matching, time-of-day, and seasonal context. The result is capped between Rs.49 and Rs.99 and pushed to the frontend dynamically. The underlying logic mirrors the Gradient Boosting model planned for production.

### Claims Management

The `/claims/create` endpoint executes a zero-touch payout. K_event, K_severity, and K_trust are enforced as strict float constraints in a Pydantic ClaimRecord model. The endpoint generates a uuid4 receipt, stamps approved status, binds triggered conditions, and commits the payout to the in-memory store in sub-milliseconds. Full claim history is accessible per rider via JWT-protected endpoint.

### Five Automated Triggers, Live

All five parametric triggers from the Phase 1 spec are implemented and polling in real time via `risk.py` using httpx.AsyncClient. Extreme rainfall, cyclone alerts, extreme heat, severe AQI, and bandh detection all fire automatically without rider input. A 600-second local cache prevents rate-limit hits during aggressive demo testing.

### Isolation Forest Fraud Model, Trained

The Phase 1 fraud detection architecture specified Isolation Forest as the correct starting point. It is now trained. Full details in Section 6.

### Demo-Hardened Architecture

The backend was prototyped against Supabase/PostgreSQL. That dependency was deliberately rolled back for the hackathon submission. All runtime state lives in an in-memory store (`claims_db: dict = {}`), eliminating every possible network or database connectivity failure during live judging. Zero external DB calls, zero connectivity risk.

### Live API Polling with Graceful Degradation

`risk.py` uses async pipelines to fetch real payloads from OpenWeatherMap and WAQI using the rider's lat/lon. If an API key is missing or invalid, the system degrades cleanly to clearly-labelled synthetic data (`"source": "demo"`) so the UI never breaks under any environment.

---

## 1. The Problem

India's Zepto and Blinkit riders are the most income-exposed workers in the gig economy, and nobody talks about it. A Zomato rider can switch zones when it rains. A Q-Commerce rider can't. He's assigned to one dark store, one 2 to 3 km radius. When that zone floods, overheats, or shuts down, he earns zero. No fallback, no claim process, no safety net.

This isn't a rare edge case. Chennai's northeast monsoon runs October through December. April through June brings heat indexes above 42 degrees Celsius. Unplanned bandhs happen without warning. These aren't freak events, they're structural income risk that hits the same riders, in the same zones, every year.

No insurance product currently addresses income loss for Q-Commerce riders specifically. We're building it.

**What we cover:** lost income due to external disruptions, extreme weather, severe air quality, civic shutdowns. Nothing else. No vehicle repair, no health, no accidents.

---

## 2. Our Persona

**Arjun, 26, Zepto rider, Velachery/Sholinganallur, Chennai**

| | |
|---|---|
| Platforms | Zepto (primary), Blinkit (secondary) |
| Zone | Velachery / Sholinganallur dark store corridor |
| Vehicle | Electric 2-wheeler |
| Good day earnings | Rs.700 to 900 (18 to 25 deliveries x Rs.30 to 45) |
| Disrupted day earnings | Rs.0 to 150 |
| Weekly earnings | Rs.4,500 to 6,000 |
| Safety net | None |

```
Daily schedule:
08:00 --[PEAK 9-11am]--[LULL 12-5pm]--[PEAK 6-9pm]-- 23:00
                ^ 70% of daily income lives here
```

Arjun is our demo persona. The platform is built for any Q-Commerce corridor in India, swapping cities means updating zone boundaries and API coordinates, nothing more.

---

## 3. Solution

**Rakshak** is a zero-touch parametric income insurance platform. When a verified disruption hits Arjun's zone, he gets paid automatically, no claim form, no photo upload, no waiting.

```
Onboard (3 min)
    -> Buy weekly policy (every Monday, Rs.49 to 99)
        -> System monitors APIs 24/7
            -> Trigger fires + fraud check passes
                -> UPI payout in under 15 minutes
```

Arjun never does anything after buying the policy. The system handles everything.

---

## 4. Parametric Triggers

Every trigger requires two independent sources to confirm before a payout fires. One API going wrong never causes a false payout.

**Phase 2 implementation (five live triggers):**

| Trigger | Threshold | Primary Source | Secondary Validation | Base Payout |
|---|---|---|---|---|
| Extreme rainfall | > 65mm / 3 hrs | IMD / OpenWeatherMap | Order volume drop > 60% | Rs.400/day |
| Cyclone / storm alert | IMD orange or red | NDMA RSS feed | Platform suspension (mock) | Rs.600/day |
| Extreme heat | Heat index > 42C / 4hrs | OpenWeatherMap | Platform advisory (mock) | Rs.300/day |
| Severe AQI | AQI > 300 for 3+ hrs | CPCB / AQI India API | Duration cross-check | Rs.250/day |
| Bandh / civic shutdown | Verified keyword cluster | NewsAPI | Order volume drop > 80% | Rs.500/day |

**Roadmap triggers (Phase 3):** dense fog, platform app outage, dark store outage, waterlogging without red alert, Section 144 curfew, election day restrictions, major road closures.

Triggers are evaluated per zone every 15 minutes, not city-wide. A flood in Velachery does not pay out workers in Anna Nagar.

---

## 5. Weekly Premium Model

### Why weekly?

Gig workers earn and spend week to week. Rs.49 to 99 is the cost of skipping one delivery. It fits how Arjun already thinks about money.

### Tiers

| Tier | Premium | Max Weekly Coverage |
|---|---|---|
| Basic | Rs.49 | Rs.1,500 |
| Plus | Rs.74 | Rs.2,200 |
| Max | Rs.99 | Rs.3,000 |

### How the premium is calculated

"The premium engine calculates each rider's premium dynamically in real-time. It executes as a transparent, deterministic algorithm via premium.py, instantly generating personalized pricing by evaluating live environmental APIs, local zone vulnerability, and the rider's historical trust score."

```
Final Premium = (Base Price x Risk Factor)
```

Risk Factor is computed in real time from live OpenWeatherMap and WAQI data, zone keyword matching, time-of-day, and seasonal context. Output is capped between Rs.49 and Rs.99 across all three tiers and pushed dynamically to the frontend. No hardcoded values.

### The K-Factor Payout System

Most parametric platforms pay full or nothing. That's the wrong design. It overpays on weak signals and underpays honest riders when verification is incomplete. Rakshak uses a three-part multiplier:

```
Payout = Base Coverage x K_event x K_severity x K_trust
                                         (hard cap: 0.95 of coverage)
```

These are enforced as strict float constraints in the ClaimRecord Pydantic model and computed server-side on every `/claims/create` call.

**K_event, how well was the disruption verified?**

| Value | Condition |
|---|---|
| 1.00 | Both primary API + secondary platform signal confirmed |
| 0.75 | Primary confirmed, secondary unavailable |
| 0.60 | Primary borderline, secondary partially confirms |
| 0.50 | Single source only, minimum floor |

K_event never goes below 0.50 unless fraud is confirmed. The system's verification gaps are never the rider's problem. If fraud is confirmed, K_event is forced to 0 and the claim is rejected regardless of everything else.

**K_severity, how long did it last, and when?**

| Value | Condition |
|---|---|
| 1.00 | 5+ hours |
| 0.75 | 2 to 5 hours |
| 0.50 | Under 2 hours |
| +0.10 | Bonus if disruption fell during peak hours (9 to 11am or 6 to 9pm), capped at 1.0 |

A 90-minute drizzle during lunchtime pays less than an all-day cyclone during peak hours. Payouts reflect actual income lost, not just trigger confirmation.

**K_trust, what does this rider's history say?**

| Value | Condition |
|---|---|
| 1.10 | 10+ consecutive verified clean claims |
| 1.05 | 5 consecutive verified clean claims |
| 1.00 | New rider / neutral history |
| 0.95 | 1 flag in last 10 claims |
| 0.90 | Unresponsive to verification |
| 0.85 | Honest mistake (e.g. claimed wrong zone) |
| 0.70 | First confirmed fraud, **permanent floor, never recovers** |
| Terminated | Second confirmed fraud |

Honest riders build trust over time and receive higher payouts for the same premium. Fraud is immediately penalised. The very next claim after a fraud detection inherits the reduced score with no grace window. A 30-day payout freeze accompanies first confirmed fraud. The permanent 0.70 floor means the rider can't escape by staying on the platform. They're economically marked forever without needing to be blacklisted.

**What the rider sees in their SMS:**
```
Disruption verified:    Rs.400  (full trigger amount)
Verification score:     x 0.75  (one source confirmed)
Disruption duration:    x 0.75  (3 hrs, lull period)
Your trust score:       x 1.05  (5 clean claims, thank you)
Your payout:            Rs.236
```

### Unit Economics

The 15x worst-case payout ratio works because triggers are zone-specific. On a typical disruption day, only 1 to 2 zones are affected, at most 20 to 25% of riders claim simultaneously. A 500-rider pool at Plus tier generates Rs.37,000/week. A single-zone flood day costs Rs.24,000 to 28,000 in payouts. Pool holds.

For genuine citywide events (all zones simultaneously), a per-zone weekly payout cap at 2x that zone's premium contribution protects the liquidity pool. In production, Rakshak would carry reinsurance for claims exceeding 40% of the active pool, standard parametric practice. Break-even sits at approximately 2,000 active riders per city, realistic given combined Zepto/Blinkit rider counts in any tier-1 Indian city exceed 10,000 to 15,000.

---

## 6. AI/ML Architecture

### Premium model

Gradient Boosting Regressor (scikit-learn) trained on IMD historical weather records, zone-level disruption frequency, and synthetic rider profiles. Runs every Monday at 6am. Output: personalised weekly premium Rs.49 to 99. In the current live build, the equivalent deterministic algorithm runs in `premium.py` with real-time API inputs.

### Fraud detection, phased evolution

**Phase 1: Isolation Forest, trained.**

No labelled fraud data exists yet. Isolation Forest is the right starting point. Unsupervised, trains on normal behaviour, flags deviations without needing labels. Inference runs in under 50ms per claim, well within our 15-minute payout SLA.

The model is trained on the following feature set, each engineered to capture a distinct dimension of rider behaviour:

| Feature | Description |
|---|---|
| `avg_speed` | Average speed (km/h) over a 5-minute window, derived from region, traffic, and weather with temporal continuity |
| `max_speed` | Peak speed (km/h) within the window, always >= avg_speed, captures top-end motion behaviour |
| `total_distance` | Distance (km) in 5 minutes, derived from avg_speed to enforce physical consistency |
| `stationary_time` | Fraction (0 to 1) of time the agent was stationary, strongly influenced by traffic conditions |
| `speed_variance` | Variability in speed during the window, higher under unstable or congested traffic |
| `cluster_density` | Approximate nearby-agent count, modelling crowding via region type and peak-hour effects |
| `weather_mismatch` | Binary (0/1) flag for inconsistency between observed behaviour and expected weather, simulates sensor anomalies |
| `device_risk_score` | Continuous (0 to 1) score indicating device-compromise likelihood, e.g. spoofing, emulator, rooted device |
| `region_id` | Categorical environment type: 0 = residential, 1 = downtown, 2 = highway |
| `hour_of_day` | Time feature (0 to 23) capturing daily traffic patterns and behavioural variation |

The `label` column (0: legitimate, 1: fraudulent) exists in the dataset for evaluation only. The model never sees it during training. This is strictly unsupervised.

**Pipeline:** Raw feature data is normalised first to prevent any bias toward large-magnitude features. Speed and distance values would otherwise dominate anomaly scoring. Normalised vectors are then scored by the Isolation Forest. Claims that score above the anomaly threshold are routed to the fraud review pipeline.

**Most common fraud patterns the model detects:**

- Speed anomalies: Unusually high or inconsistent speeds relative to distance and time window
- Device risk abuse: High `device_risk_score` combined with otherwise plausible-looking behaviour
- Movement inconsistencies: Physical impossibilities, e.g. speed vs. distance mismatch within the 5-minute window
- Behavioural instability: Sudden spikes in `speed_variance` or erratic motion patterns
- Low-density coordination: Suspicious activity in zones with abnormal `cluster_density` relative to historical baseline

The model is designed to handle 1M+ row datasets and detects subtle, realistic fraud patterns without requiring a single labelled fraud example.

**Phase 2: Autoencoder added alongside**

An autoencoder learns to compress and reconstruct normal rider behaviour. When it sees a fraud pattern, reconstruction error spikes. The key advantage over Isolation Forest: it catches joint behavioural anomalies, patterns that look individually plausible on every feature but are collectively impossible. GPS spoofing and coordinated ring attacks almost always leave this kind of multi-signal fingerprint. If Isolation Forest and Autoencoder scores disagree on a claim, it routes to human review. Implementation is contingent on having sufficient synthetic data volume. If not ready by Phase 2, the ensemble moves to Phase 3.

**Phase 3: XGBoost supervised classifier**

By Phase 3, resolved claim history gives us labelled data (approved / flagged / rejected). XGBoost takes over as the primary model. It handles the class imbalance (fraud is roughly 10 to 15% of claims) cleanly via `scale_pos_weight`, and produces feature importance scores so reviewers can audit exactly why a claim was flagged. A new feature is added at this stage: `historical_k_trust`, feeding the rider's trust score back into the model as a fraud signal. Isolation Forest stays running in parallel as an out-of-distribution fallback. New fraud techniques that the supervised model hasn't seen yet will still score high on the anomaly detector. The classifier is retrained monthly on fresh labelled data to stay ahead of evolving fraud patterns.

### Predictive disruption alerts

Time-series analysis on IMD 7-day forecast data per zone outputs a next-day disruption probability. Workers get a proactive SMS the evening before. The admin dashboard shows predicted claim volume for the coming week so the insurer can adjust reserve levels dynamically.

---

## 7. Scenarios

### Scenario 1, Northeast monsoon flood, October, Velachery

IMD red alert. Rainfall exceeds 70mm in 3 hours. Velachery roads submerged by 9am.

- 08:45am: Trigger engine detects > 65mm via IMD API
- 08:47am: Order volume drop > 60% confirmed on Zepto mock API for Velachery zone
- 08:48am: K_event = 1.0 (dual verified). K_severity = 1.0 + peak bonus, capped at 1.0. Arjun's K_trust = 1.05 (6 clean claims)
- 08:50am: Payout = Rs.400 x 1.0 x 1.0 x 1.05 = Rs.420, capped at Rs.380 (0.95 of coverage). Fraud check passes
- 09:03am: Rs.380 hits Arjun's UPI. SMS with full K breakdown sent

### Scenario 2, Extreme heat, May, Sholinganallur

Heat index 43 degrees from 11am to 4pm, 5 hours, lull period only. Platform advisory unavailable.

K_event = 0.75 (primary only). K_severity = 0.75 (medium duration, no peak bonus). K_trust = 1.0. Payout = Rs.300 x 0.75 x 0.75 x 1.0 = Rs.169. Worker also received a proactive alert the previous evening.

### Scenario 3, Partial verification, honest rider protected

Moderate rain, IMD sub-threshold, secondary API inconclusive. Binary system would reject. Rakshak pays Rs.400 x 0.50 x 0.75 x 1.0 = Rs.150. Arjun gets something. The system's uncertainty never becomes his problem.

### Scenario 4, Coordinated fraud ring detected

Cluster of 60 workers file simultaneously from near-identical GPS coordinates within a 90-second window. Ring detection flags the cluster. The Isolation Forest model scores all 60 claims as high-anomaly: `cluster_density` is statistically impossible for a genuine disruption distribution, `speed_variance` across the group is abnormally uniform, and `device_risk_score` signatures are suspiciously correlated across accounts. Fraud confirmed via device diversity check and motion analysis. K_event forced to 0 for all 60 claims. 30-day freeze applied. K_trust drops to permanent 0.70 floor. Second offence on any account triggers policy termination.

---

## 8. Fraud Detection and Anti-Spoofing

### The core problem

GPS verification checks one thing. A spoofing app fakes exactly one thing. Rakshak requires five independent signals to agree simultaneously:

1. GPS coordinates, necessary, not sufficient
2. Behavioural motion, `avg_speed`, `max_speed`, `stationary_time` patterns. A spoofed actor at home shows unnaturally smooth or static motion lacking real outdoor micro-variation
3. Platform order volume, did the disruption actually suppress dispatches in this zone?
4. Environmental cross-match, two external APIs must independently confirm the event
5. Device signals, accelerometer, gyroscope, WiFi network, battery drain. Home device usage patterns are detectably different from outdoor field conditions, captured in `device_risk_score` and `weather_mismatch` features fed directly into the Isolation Forest

A genuine stranded rider passes all five naturally. A spoofed claim typically fails on signals 2 and 3.

### Coordinated ring detection

Individual fraud is hard to scale. Organised fraud leaves a statistical fingerprint:

- **Cluster density anomaly**: coordinated fraud produces unnaturally tight GPS clusters and an impossibly uniform `cluster_density` distribution. Genuine disruptions produce organic distributions matching registered home locations across the zone
- **Synchronisation timing**: genuine claims arrive over a distributed window. A ring fires within seconds of each other across many accounts
- **Claim-to-active-user ratio**: a sudden spike where 90%+ of zone workers file simultaneously is a statistical outlier. Historical zone patterns set the expected baseline
- **Device diversity**: coordinated rings often use similar spoofing software, producing matching `device_risk_score` signatures and accelerometer fingerprints across devices. The Isolation Forest scores correlated device risk clusters as high-anomaly even when individual values look plausible in isolation

### UX balance, not penalising honest riders

A real rider in a flood zone may have an older device, poor connectivity, or movement patterns that superficially resemble spoofing. Wrongly rejecting his claim is a product failure.

Medium-risk claims go to soft hold, not rejection. The rider gets: "Your claim is being verified. You'll receive your payout or an update within 2 hours." The system then checks whether other verified workers in the same sub-zone filed around the same time, and whether platform order volume in the zone dropped. Both of these confirm the disruption independently of the individual's GPS data. Clean claim history triggers an automatic trust adjustment. Most genuine cases resolve within 2 hours without the rider doing anything.

We do not ask for photo or video proof. We do not reject on a single anomalous signal. We do not penalise future premiums for a flagged-but-resolved claim.

---

## 9. Tech Stack

**Platform**: Mobile-first Progressive Web App. No app store install required. Matters for riders on budget Android devices with limited storage.

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS (PWA, Vite) |
| Backend | Python FastAPI (modular domain routers) |
| Auth | JWT via jose library |
| Runtime state | In-memory store (demo-hardened, zero external DB dependency) |
| ML / AI | scikit-learn Isolation Forest (Phase 1, trained), Autoencoder (Phase 2), XGBoost (Phase 3) |
| Weather | OpenWeatherMap (async via httpx, 600s cache TTL) |
| AQI | WAQI / CPCB / AQI India API (async, cached) |
| Disaster alerts | NDMA RSS + IMD public feed |
| News / bandh detection | NewsAPI.org free tier |
| Payments | Razorpay test mode |
| Notifications | Twilio SMS trial (currently limited to verified numbers on the free trial, mock login used for demo environment) |
| Hosting | Railway / Render free tier |
