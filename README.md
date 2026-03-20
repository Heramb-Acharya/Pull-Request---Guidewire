# Rakshak, Parametric Income Insurance for Q-Commerce Riders

> Guidewire DEVTrails 2026 | Phase 1 Submission

---

## 1. The Problem

India's Zepto and Blinkit riders are the most income-exposed workers in the gig economy, and nobody talks about it. A Zomato rider can switch zones when it rains. A Q-Commerce rider can't. He's assigned to one dark store, one 2–3 km radius. When that zone floods, overheats, or shuts down, he earns zero. No fallback, no claim process, no safety net.

This isn't a rare edge case. Chennai's northeast monsoon runs October through December. April through June brings heat indexes above 42°C. Unplanned bandhs happen without warning. These aren't freak events, they're structural income risk that hits the same riders, in the same zones, every year.

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
| Good day earnings | Rs.700–900 (18–25 deliveries × Rs.30–45) |
| Disrupted day earnings | Rs.0–150 |
| Weekly earnings | Rs.4,500–6,000 |
| Safety net | None |

```
Daily schedule:
08:00 --[PEAK 9-11am]--[LULL 12-5pm]--[PEAK 6-9pm]-- 23:00
                ↑ 70% of daily income lives here
```

Arjun is our demo persona. The platform is built for any Q-Commerce corridor in India, swapping cities means updating zone boundaries and API coordinates, nothing more.

---

## 3. Solution

**Rakshak** is a zero-touch parametric income insurance platform. When a verified disruption hits Arjun's zone, he gets paid automatically, no claim form, no photo upload, no waiting.

```
Onboard (3 min)
    → Buy weekly policy (every Monday, Rs.49–99)
        → System monitors APIs 24/7
            → Trigger fires + fraud check passes
                → UPI payout in under 15 minutes
```

Arjun never does anything after buying the policy. The system handles everything.

---

## 4. Parametric Triggers

Every trigger requires two independent sources to confirm before a payout fires. One API going wrong never causes a false payout.

**Phase 2 implementation (P1 triggers):**

| Trigger | Threshold | Primary Source | Secondary Validation | Base Payout |
|---|---|---|---|---|
| Extreme rainfall | > 65mm / 3 hrs | IMD / OpenWeatherMap | Order volume drop > 60% | Rs.400/day |
| Cyclone / storm alert | IMD orange or red | NDMA RSS feed | Platform suspension (mock) | Rs.600/day |
| Extreme heat | Heat index > 42°C / 4hrs | OpenWeatherMap | Platform advisory (mock) | Rs.300/day |
| Severe AQI | AQI > 300 for 3+ hrs | CPCB / AQI India API | Duration cross-check | Rs.250/day |
| Bandh / civic shutdown | Verified keyword cluster | NewsAPI | Order volume drop > 80% | Rs.500/day |

**Roadmap triggers (P2/P3):** dense fog, platform app outage, dark store outage, waterlogging without red alert, Section 144 curfew, election day restrictions, major road closures.

Triggers are evaluated per zone every 15 minutes, not city-wide. A flood in Velachery does not pay out workers in Anna Nagar.

---

## 5. Weekly Premium Model

### Why weekly?

Gig workers earn and spend week to week. Rs.49–99 is the cost of skipping one delivery. It fits how Arjun already thinks about money.

### Tiers

| Tier | Premium | Max Weekly Coverage |
|---|---|---|
| Basic | Rs.49 | Rs.1,500 |
| Plus | Rs.74 | Rs.2,200 |
| Max | Rs.99 | Rs.3,000 |

### How the premium is calculated

Every Monday at 6am, a **Gradient Boosting Regressor** calculates each rider's premium for the next 7 days using: home zone flood/heat risk, current season, 7-day weather forecast, historical claim frequency, and K_trust score (explained below). Output is capped between Rs.49–99.

### The K-Factor Payout System

Most parametric platforms pay full or nothing. That's the wrong design, it overpays on weak signals and underpays honest riders when verification is incomplete. Rakshak uses a three-part multiplier:

```
Payout = Base Coverage × K_event × K_severity × K_trust
                                         (hard cap: 0.95 of coverage)
```

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
| 0.75 | 2–5 hours |
| 0.50 | Under 2 hours |
| +0.10 | Bonus if disruption fell during peak hours (9–11am or 6–9pm), capped at 1.0 |

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

Honest riders build trust over time and receive higher payouts for the same premium. Fraud is immediately penalised, the very next claim after a fraud detection inherits the reduced score with no grace window. A 30-day payout freeze accompanies first confirmed fraud. The permanent 0.70 floor means the rider can't escape by staying on the platform, they're economically marked forever without needing to be blacklisted.

**What the rider sees in their SMS:**
```
Disruption verified:    Rs.400  (full trigger amount)
Verification score:     × 0.75  (one source confirmed)
Disruption duration:    × 0.75  (3 hrs, lull period)
Your trust score:       × 1.05  (5 clean claims, thank you)
────────────────────────────────
Your payout:            Rs.236
```

No black box. Arjun always knows exactly why he received what he received.

### Unit Economics

The 15x worst-case payout ratio works because triggers are zone-specific. On a typical disruption day, only 1–2 zones are affected, at most 20–25% of riders claim simultaneously. A 500-rider pool at Plus tier generates Rs.37,000/week. A single-zone flood day costs Rs.24,000–28,000 in payouts. Pool holds.

For genuine citywide events (all zones simultaneously), a per-zone weekly payout cap at 2× that zone's premium contribution protects the liquidity pool. In production, Rakshak would carry reinsurance for claims exceeding 40% of the active pool, standard parametric practice. Break-even sits at approximately 2,000 active riders per city, realistic given combined Zepto/Blinkit rider counts in any tier-1 Indian city exceed 10,000–15,000.

---

## 6. AI/ML Architecture

### Premium model
Gradient Boosting Regressor (scikit-learn) trained on IMD historical weather records, zone-level disruption frequency, and synthetic rider profiles. Runs every Monday at 6am. Output: personalised weekly premium Rs.49–99.

### Fraud detection, phased evolution

**Phase 1: Isolation Forest**
No labelled fraud data exists yet. Isolation Forest is the right starting point, unsupervised, trains on normal behaviour, flags deviations without needing labels. Inference runs in under 50ms per claim, well within our 15-minute payout SLA.

**Phase 2: Autoencoder added alongside**
An autoencoder learns to compress and reconstruct normal rider behaviour. When it sees a fraud pattern, reconstruction error spikes. The key advantage over Isolation Forest: it catches joint behavioural anomalies, patterns that look individually plausible on every feature but are collectively impossible. GPS spoofing and coordinated ring attacks almost always leave this kind of multi-signal fingerprint. If Isolation Forest and Autoencoder scores disagree on a claim, it routes to human review. Implementation is contingent on having sufficient synthetic data volume; if not ready by Phase 2, the ensemble moves to Phase 3.

**Phase 3: XGBoost supervised classifier**
By Phase 3, resolved claim history gives us labelled data (approved / flagged / rejected). XGBoost takes over as the primary model, it handles the class imbalance (fraud is ~10–15% of claims) cleanly via `scale_pos_weight`, and produces feature importance scores so reviewers can audit exactly why a claim was flagged. A new feature is added at this stage: `historical_k_trust`, feeding the rider's trust score back into the model as a fraud signal. Isolation Forest stays running in parallel as an out-of-distribution fallback, new fraud techniques that the supervised model hasn't seen yet will still score high on the anomaly detector. The classifier is retrained monthly on fresh labelled data to stay ahead of evolving fraud patterns.

### Predictive disruption alerts
Time-series analysis on IMD 7-day forecast data per zone outputs a next-day disruption probability. Workers get a proactive SMS the evening before. The admin dashboard shows predicted claim volume for the coming week so the insurer can adjust reserve levels dynamically.

---

## 7. Scenarios

### Scenario 1, Northeast monsoon flood, October, Velachery

IMD red alert. Rainfall exceeds 70mm in 3 hours. Velachery roads submerged by 9am.

- 08:45am: Trigger engine detects > 65mm via IMD API
- 08:47am: Order volume drop > 60% confirmed on Zepto mock API for Velachery zone
- 08:48am: K_event = 1.0 (dual verified). K_severity = 1.0 + peak bonus, capped at 1.0. Arjun's K_trust = 1.05 (6 clean claims)
- 08:50am: Payout = Rs.400 × 1.0 × 1.0 × 1.05 = Rs.420, capped at Rs.380 (0.95 of coverage). Fraud check passes
- 09:03am: Rs.380 hits Arjun's UPI. SMS with full K breakdown sent

### Scenario 2, Extreme heat, May, Sholinganallur

Heat index 43°C from 11am to 4pm, 5 hours, lull period only. Platform advisory unavailable.

K_event = 0.75 (primary only). K_severity = 0.75 (medium duration, no peak bonus). K_trust = 1.0. Payout = Rs.300 × 0.75 × 0.75 × 1.0 = Rs.169. Worker also received a proactive alert the previous evening.

### Scenario 3, Partial verification, honest rider protected

Moderate rain, IMD sub-threshold, secondary API inconclusive. Binary system would reject. Rakshak pays Rs.400 × 0.50 × 0.75 × 1.0 = Rs.150. Arjun gets something. The system's uncertainty never becomes his problem.

### Scenario 4, Coordinated fraud ring detected

Cluster of 60 workers file simultaneously from near-identical GPS coordinates within a 90-second window. Ring detection flags the cluster. Fraud confirmed via device diversity check and motion analysis. K_event forced to 0 for all 60 claims. 30-day freeze applied. K_trust drops to permanent 0.70 floor. Second offence on any account triggers policy termination.

---

## 8. Fraud Detection and Anti-Spoofing

### The core problem

GPS verification checks one thing. A spoofing app fakes exactly one thing. Rakshak requires five independent signals to agree simultaneously:

1. GPS coordinates, necessary, not sufficient
2. Behavioural motion, avg_speed, max_speed, stationary_time patterns. A spoofed actor at home shows unnaturally smooth or static motion lacking real outdoor micro-variation
3. Platform order volume, did the disruption actually suppress dispatches in this zone?
4. Environmental cross-match, two external APIs must independently confirm the event
5. Device signals, accelerometer, gyroscope, WiFi network, battery drain. Home device usage patterns are detectably different from outdoor field conditions

A genuine stranded rider passes all five naturally. A spoofed claim typically fails on signals 2 and 3.

### Coordinated ring detection

Individual fraud is hard to scale. Organised fraud leaves a statistical fingerprint:

- **Cluster density anomaly**: coordinated fraud produces unnaturally tight GPS clusters. Genuine disruptions produce organic distributions matching registered home locations across the zone
- **Synchronisation timing**: genuine claims arrive over a distributed window. A ring fires within seconds of each other across many accounts
- **Claim-to-active-user ratio**: a sudden spike where 90%+ of zone workers file simultaneously is a statistical outlier. Historical zone patterns set the expected baseline
- **Device diversity**: coordinated rings often use similar spoofing software, producing matching device_risk signatures and accelerometer fingerprints across devices

### UX balance, not penalising honest riders

A real rider in a flood zone may have an older device, poor connectivity, or movement patterns that superficially resemble spoofing. Wrongly rejecting his claim is a product failure.

Medium-risk claims go to soft hold, not rejection. The rider gets: *"Your claim is being verified. You'll receive your payout or an update within 2 hours."* The system then checks whether other verified workers in the same sub-zone filed around the same time, and whether platform order volume in the zone dropped, both of these confirm the disruption independently of the individual's GPS data. Clean claim history triggers an automatic trust adjustment. Most genuine cases resolve within 2 hours without the rider doing anything.

We do not ask for photo or video proof. We do not reject on a single anomalous signal. We do not penalise future premiums for a flagged-but-resolved claim.

---

## 9. Tech Stack

**Platform**: Mobile-first Progressive Web App. No app store install required, matters for riders on budget Android devices with limited storage.

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS (PWA) |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| ML / AI | scikit-learn (Phase 1–2), XGBoost (Phase 3) |
| Weather | OpenWeatherMap free tier |
| Disaster alerts | NDMA RSS + IMD public feed |
| AQI | CPCB / AQI India API |
| News / bandh detection | NewsAPI.org free tier |
| Payments | Razorpay test mode |
| Notifications | Twilio SMS trial |
| Hosting | Railway / Render free tier |

---

