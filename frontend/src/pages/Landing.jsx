import { Link } from 'react-router-dom';
import { Shield, Zap, TrendingUp, AlertTriangle, ChevronRight, CloudRain, Wind, Newspaper, Star } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

const plans = [
  { name: 'Basic', price: 49, coverage: 2000, color: 'border-slate-600', badge: 'Starter' },
  { name: 'Standard', price: 79, coverage: 3500, color: 'border-primary/50', badge: 'Popular', highlight: true },
  { name: 'Pro', price: 99, coverage: 5000, color: 'border-accent/50', badge: 'Max Cover' },
];

const triggers = [
  { icon: CloudRain, label: 'Extreme Weather', desc: 'Heavy rain, thunderstorm, heat index > 42°C', color: 'text-blue-400' },
  { icon: Wind, label: 'Poor Air Quality', desc: 'AQI exceeds 300 – hazardous to ride', color: 'text-orange-400' },
  { icon: Newspaper, label: 'Civic Disruptions', desc: 'Bandh, curfew, strike, shutdown detected', color: 'text-red-400' },
];

const steps = [
  { num: '01', title: 'Register & Choose Plan', desc: 'OTP-based signup, pick Basic / Standard / Pro' },
  { num: '02', title: 'System Monitors Your Zone', desc: 'Live weather, AQI, and news APIs track disruptions 24/7' },
  { num: '03', title: 'Trigger Detected', desc: 'When your zone is disrupted, the system validates automatically' },
  { num: '04', title: 'Payout in Minutes', desc: 'K-factor based payout computed and logged instantly' },
];

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg grid-bg relative overflow-hidden">
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-primary/10 top-0 right-0 translate-x-1/2 -translate-y-1/2" />
      <div className="orb w-80 h-80 bg-accent/8 bottom-1/3 left-0 -translate-x-1/2" />

      {/* ── HERO ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary mb-6">
          <div className="live-dot" />
          Live API Monitoring · Auto Payouts
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          {t('landing.title_main')}<br />
          <span className="gradient-text">{t('landing.title_highlight')}</span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          <Trans i18nKey="landing.subtitle" components={{ 1: <strong className="text-slate-300" />, 2: <strong className="text-slate-300" /> }} />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
            {t('landing.btn_get_covered')} <ChevronRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-4">
            {t('landing.btn_have_account')}
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
          {[t('landing.feature_1'), t('landing.feature_2'), t('landing.feature_3'), t('landing.feature_4')].map(text => (
            <span key={text} className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" /> {text}
            </span>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="section-title">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">
              Zone disruptions = <span className="text-red-400">zero income</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Q-Commerce riders are assigned to fixed delivery zones. When that zone gets hit 
              by a storm, a bandh, or hazardous air — orders dry up completely.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Traditional insurance won't cover this. There's no accident. No theft. Just 
              <strong className="text-slate-300"> external disruption</strong> outside your control.
            </p>
          </div>

          <div className="space-y-3">
            {triggers.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="card flex items-start gap-4 !p-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 mb-0.5">{label}</div>
                  <div className="text-sm text-muted">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="section-title">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Fully automatic. Zero friction.</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="card relative overflow-hidden group hover:border-primary/40 transition-colors">
              <div className="text-5xl font-black text-white/5 absolute top-4 right-4 leading-none group-hover:text-primary/10 transition-colors">{num}</div>
              <div className="text-primary font-mono text-sm font-bold mb-3">{num}</div>
              <div className="font-semibold text-slate-200 mb-2">{title}</div>
              <div className="text-sm text-muted leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RISK FORMULA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="card-glow">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="section-title">Risk-Based Pricing</p>
              <h2 className="text-3xl font-bold mb-4">Premium = Base × Risk Factor</h2>
              <p className="text-slate-400 mb-6">Your premium is calculated based on real conditions — not flat rates. Higher risk zone or harsh weather? Your factor is higher, and so is your protection.</p>
              <div className="bg-bg/60 border border-border rounded-xl p-4 font-mono text-sm">
                <div className="text-accent mb-2">Risk Factor Formula:</div>
                <div className="text-slate-300">
                  RF = 1 + <span className="text-primary">0.45×E</span> + <span className="text-amber-400">0.25×L</span> + <span className="text-emerald-400">0.15×U</span> + <span className="text-blue-400">0.10×T</span> + <span className="text-pink-400">0.05×B</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted">
                  <div><span className="text-primary">E</span> = Environment (weather severity)</div>
                  <div><span className="text-amber-400">L</span> = Location risk</div>
                  <div><span className="text-emerald-400">U</span> = Usage (working hours)</div>
                  <div><span className="text-blue-400">T</span> = Time (day / night)</div>
                  <div><span className="text-pink-400">B</span> = Behavior (inverse of trust)</div>
                </div>
              </div>
            </div>
            <div>
              <p className="section-title">Example Calculation</p>
              <div className="space-y-3">
                <div className="bg-bg/40 border border-border rounded-xl p-4">
                  <div className="text-xs text-muted mb-2">If Risk Factor = 1.5</div>
                  {plans.map(p => (
                    <div key={p.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-slate-400 text-sm">{p.name} (₹{p.price}/wk)</span>
                      <span className="font-bold text-slate-200"> ₹{(p.price * 1.5).toFixed(0)}/wk</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted text-center">Risk Factor adjusts dynamically based on live API data</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="section-title">Coverage Plans</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Pick your protection level</h2>
          <p className="text-muted mt-2">All plans include automatic detection and parametric payouts</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map(({ name, price, coverage, color, badge, highlight }) => (
            <div key={name} className={`relative bg-card border-2 ${color} rounded-2xl p-6 ${highlight ? 'shadow-glow' : ''}`}>
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="badge badge-medium mb-4">{badge}</div>
              <div className="text-3xl font-black text-white mb-1">₹{price}<span className="text-base font-normal text-muted">/week</span></div>
              <div className="text-sm text-muted mb-6">Up to ₹{coverage.toLocaleString()} coverage</div>
              <Link to="/register" className={highlight ? 'btn-primary w-full block text-center' : 'btn-secondary w-full block text-center'}>
                Get {name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── K-FACTOR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="card">
          <div className="text-center mb-8">
            <p className="section-title">Payout Transparency</p>
            <h2 className="text-3xl font-bold">K-Factor Payout System</h2>
            <p className="text-muted mt-2">Every rupee is traceable. No black boxes.</p>
          </div>
          <div className="bg-bg/40 border border-border rounded-xl p-5 font-mono text-sm max-w-2xl mx-auto">
            <div className="text-accent mb-3">Payout Formula:</div>
            <div className="text-slate-300 text-base">
              Payout = Coverage × <span className="text-blue-400">K_event</span> × <span className="text-amber-400">K_severity</span> × <span className="text-emerald-400">K_trust</span>
            </div>
            <div className="divider" />
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-blue-400 font-semibold mb-1">K_event (API verification)</div>
                <div className="text-muted">1.00 → Both APIs confirmed</div>
                <div className="text-muted">0.75 → Primary only</div>
                <div className="text-muted">0.60 → Partial</div>
                <div className="text-muted">0.50 → Minimum floor</div>
              </div>
              <div>
                <div className="text-amber-400 font-semibold mb-1">K_severity (duration)</div>
                <div className="text-muted">1.00 → 5+ hours</div>
                <div className="text-muted">0.75 → 2–5 hours</div>
                <div className="text-muted">0.50 → &lt;2 hours</div>
                <div className="text-muted">+0.10 peak hours bonus</div>
              </div>
              <div>
                <div className="text-emerald-400 font-semibold mb-1">K_trust (your history)</div>
                <div className="text-muted">1.10 → 10+ clean claims</div>
                <div className="text-muted">1.05 → 5 clean claims</div>
                <div className="text-muted">1.00 → New user</div>
                <div className="text-muted">0.70 → Fraud floor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="card-glow max-w-2xl mx-auto">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Start protecting your income today</h2>
          <p className="text-muted mb-8">Takes 60 seconds. Just your phone number.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
            Register with OTP <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border text-center py-8 text-sm text-muted">
        © 2024 Rakshak · Parametric income protection for gig workers · Not traditional insurance
      </footer>
    </div>
  );
}
