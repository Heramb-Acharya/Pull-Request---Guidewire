import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useAlert } from '../AlertContext';
import { riskApi, premiumApi, triggerApi } from '../api';
import {
  Thermometer, Wind, Newspaper, MapPin, Clock, RefreshCw,
  CloudRain, Shield, AlertTriangle, CheckCircle, TrendingUp,
  Zap, ChevronDown, Info, ExternalLink, CreditCard, Hand, ArrowRight, Edit3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ZONES = [
  'bangalore_central', 'delhi_noida', 'mumbai_dharavi',
  'hyderabad_inner', 'chennai_north', 'pune_west',
];

const ZONE_COORDS = {
  bangalore_central: { lat: 12.9716, lon: 77.5946, city: 'Bangalore' },
  delhi_noida: { lat: 28.6139, lon: 77.2090, city: 'Delhi' },
  mumbai_dharavi: { lat: 19.0760, lon: 72.8777, city: 'Mumbai' },
  hyderabad_inner: { lat: 17.3850, lon: 78.4867, city: 'Hyderabad' },
  chennai_north: { lat: 13.0827, lon: 80.2707, city: 'Chennai' },
  pune_west: { lat: 18.5204, lon: 73.8567, city: 'Pune' },
};

function RiskBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted">{label}</span>
        <span className="text-slate-300 font-mono">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function KFactorRow({ label, value, desc, color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <span className={`font-mono font-bold ${color}`}>{label}</span>
        <span className="text-xs text-muted ml-2">{desc}</span>
      </div>
      <span className="font-bold text-slate-200 font-mono">{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user, addManualClaim, setPremiumStatus } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { t } = useTranslation();

  const [riskData, setRiskData] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [triggerData, setTriggerData] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const trustScore = user?.trust_score ?? 50;
    const validClaims = user?.valid_claims ?? 0;
    const rewardActive = (user?.reward_claims_remaining || 0) > 0;

    try {
      let activeCity = 'Delhi';
      let activeHours = 8;

      if (user?.id) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data && !error) {
          setUserRegistration(data);
          activeCity = data.city;
          activeHours = data.working_hours;
        } else {
          // Fallback: check localStorage for registration saved when Supabase was blocked
          const localReg = localStorage.getItem('rakshak_registration');
          if (localReg) {
            try {
              const parsed = JSON.parse(localReg);
              if (parsed.user_id === user.id || parsed.city) {
                setUserRegistration(parsed);
                activeCity = parsed.city || activeCity;
                activeHours = parsed.working_hours || activeHours;
              }
            } catch (e) { /* ignore parse errors */ }
          }
        }
      } else {
        // No user.id — still try localStorage
        const localReg = localStorage.getItem('rakshak_registration');
        if (localReg) {
          try {
            const parsed = JSON.parse(localReg);
            setUserRegistration(parsed);
            activeCity = parsed.city || activeCity;
            activeHours = parsed.working_hours || activeHours;
          } catch (e) { /* ignore parse errors */ }
        }
      }

      // Map city to zone 
      // Using first substring match or default to delhi_noida
      const activeZone = Object.keys(ZONE_COORDS).find(k => ZONE_COORDS[k].city === activeCity) || 'delhi_noida';
      const coords = ZONE_COORDS[activeZone];

      const [risk, trigger] = await Promise.all([
        riskApi.calculate(coords.lat, coords.lon, activeZone, activeHours, false, trustScore),
        triggerApi.check(coords.lat, coords.lon, activeCity, trustScore, validClaims, 'standard', rewardActive),
      ]);
      setRiskData(risk);
      setTriggerData(trigger);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePayPremium = () => {
    showAlert(t('alerts.processing_payment'));
    setTimeout(() => {
      setPremiumStatus();
      showAlert(t('alerts.payment_success'), { showOk: true, okText: t('alerts.btn_ok') });
    }, 2500);
  };

  const handleAutoClaim = () => {
    showAlert(t('alerts.processing_claim'));
    setTimeout(() => {
      addManualClaim(
        userRegistration?.city || 'Delhi',
        payout.final_payout || 0,
        triggerData?.trigger_types || ['alert'],
        'auto_claim',
        'approved'
      );
      showAlert(t('alerts.claim_success'), { showOk: true, okText: t('alerts.btn_ok') });
      fetchAll();
    }, 2000);
  };

  const handleManualClaim = () => {
    showAlert(t('alerts.processing_claim'));
    setTimeout(() => {
      addManualClaim(userRegistration?.city || 'Delhi');
      showAlert(t('alerts.claim_success'), { showOk: true, okText: t('alerts.btn_ok') });
    }, 2000);
  };

  const riskLevel = riskData?.risk_level || 'LOW';
  const riskFactor = riskData?.risk_factor || 1.0;
  const breakdown = riskData?.breakdown || {};
  const weather = riskData?.weather || {};

  const triggered = triggerData?.triggered || false;
  const kf = triggerData?.k_factors || {};
  const payout = triggerData?.payout || {};
  const conditions = triggerData?.conditions || {};

  const riskBadgeClass = riskLevel === 'HIGH' ? 'badge-high' : riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low';
  const riskColor = riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400';

  const tScore = user?.trust_score ?? 50;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {t('dashboard.greeting', {
                time: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
                name: user?.name?.split(' ')[0] || 'Rider'
              })}
            </h1>
            <p className="text-muted text-sm mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="live-dot" />
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Fetching...'}
            </div>
            <button onClick={fetchAll} disabled={loading} className="btn-secondary !px-3 !py-2 text-sm flex items-center gap-1.5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('dashboard.btn_refresh')}
            </button>
          </div>
        </div>


        {/* ── Trigger Alert Banner ── */}
        {triggered && (
          <div className="border border-red-500/50 bg-red-500/10 rounded-2xl p-4 flex items-start gap-4 animate-slide-up shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-300 mb-1">⚡ {t('dashboard.disruption_detected')}</div>
              <div className="text-sm text-slate-400">
                {t('dashboard.disruption_active', { triggers: triggerData.trigger_types.join(', ').replace(/_/g, ' ') })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-400">₹{payout.final_payout?.toLocaleString()}</div>
              <div className="text-xs text-muted">{t('dashboard.estimated_payout')}</div>
            </div>
          </div>
        )}

        {!triggered && !loading && (
          <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm text-emerald-300">{t('dashboard.monitoring_desc')} Your coverage is active.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Live Conditions */}
            <div className="card">
              <p className="section-title">{t('dashboard.live_conditions')}</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Weather */}
                <div className="bg-bg/50 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">{t('dashboard.weather')}</span>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-6 bg-border rounded animate-pulse" />
                      <div className="h-4 bg-border rounded animate-pulse w-3/4" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white">{weather.temperature?.toFixed(1)}°C</div>
                      <div className="text-sm text-slate-400 mt-1">{weather.description || weather.condition || '–'}</div>
                      <div className="mt-2 space-y-1 text-xs text-muted">
                        <div>Heat index: <span className="text-slate-300">{weather.heat_index}°C</span></div>
                        <div>Rain: <span className="text-slate-300">{weather.rainfall || 0} mm/h</span></div>
                        <div className="text-primary/70">Source: {weather.source || 'OpenWeatherMap'}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* AQI */}
                <div className="bg-bg/50 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wind className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">{t('dashboard.aqi')}</span>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-6 bg-border rounded animate-pulse" />
                      <div className="h-4 bg-border rounded animate-pulse w-1/2" />
                    </div>
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${conditions.aqi?.triggered ? 'text-red-400' : 'text-emerald-400'}`}>
                        {conditions.aqi?.value ?? '–'}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">{conditions.aqi?.status || 'Good'}</div>
                      <div className={`mt-2 text-xs px-2 py-0.5 rounded-full inline-block ${conditions.aqi?.triggered ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {conditions.aqi?.triggered ? '⚠ Above threshold' : '✓ Safe'}
                      </div>
                      <div className="mt-1 text-xs text-primary/70">Source: {conditions.aqi?.source || 'WAQI'}</div>
                    </>
                  )}
                </div>

                {/* News */}
                <div className="bg-bg/50 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Newspaper className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">{t('dashboard.news')}</span>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-border rounded animate-pulse" />
                      <div className="h-4 bg-border rounded animate-pulse w-3/4" />
                    </div>
                  ) : conditions.news?.triggered ? (
                    <>
                      <div className="text-sm font-semibold text-red-300 mb-2">Civic disruption detected</div>
                      {conditions.news.keywords_found.map(k => (
                        <span key={k} className="inline-block text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded mr-1 mb-1 capitalize">{k}</span>
                      ))}
                      <div className="mt-1 text-xs text-primary/70">Source: {conditions.news?.source || 'NewsAPI'}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-emerald-400 font-medium">No civic alerts</div>
                      <div className="text-xs text-muted mt-1">Monitoring: bandh, strike, curfew, shutdown</div>
                      <div className="mt-1 text-xs text-primary/70">Source: {conditions.news?.source || 'NewsAPI'}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Factor */}
            {userRegistration && (
              <div className="card border-2 border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between mb-6">
                  <p className="section-title !mb-0 text-primary flex items-center gap-2"><Shield className="w-5 h-5" /> {t('dashboard.my_policy')}</p>
                  <button onClick={() => navigate('/premium-register?edit=true')} className="text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold hover:bg-primary/30 transition">
                    <Edit3 className="w-3.5 h-3.5" /> {t('dashboard.change_plan')}
                  </button>
                </div>

                {/* Plan name + premium hero */}
                <div className="bg-gradient-to-r from-primary/10 via-black/40 to-black/40 rounded-2xl p-5 border border-primary/15 mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-muted text-xs uppercase tracking-widest font-bold mb-1">{t('dashboard.current_plan')}</div>
                      <div className="text-white text-xl font-bold capitalize">
                        {userRegistration.plan_tier === '49' ? 'Basic' : userRegistration.plan_tier === '74' ? 'Standard' : userRegistration.plan_tier === '99' ? 'Pro' : 'Standard'} Plan
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted text-xs uppercase tracking-widest font-bold mb-1">{t('dashboard.premium')}</div>
                      <div className={`text-3xl font-black ${userRegistration.risk_factor > 1.4 ? 'text-red-400' : 'text-emerald-400'}`}>
                        ₹{userRegistration.premium}<span className="text-sm font-medium text-muted">/wk</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-2">{t('dashboard.risk_factor')}</div>
                    <div className={`text-2xl font-black ${userRegistration.risk_factor > 1.4 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {userRegistration.risk_factor}x
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-2">{t('dashboard.coverage')}</div>
                    <div className="text-white text-2xl font-black flex items-center justify-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" /> {userRegistration.city}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-2">Base</div>
                    <div className="text-white text-2xl font-black">
                      ₹{userRegistration.plan_tier || '74'}
                    </div>
                  </div>
                </div>

                {/* Insight */}
                <div className="mt-5 pt-4 border-t border-border flex items-start gap-2 text-xs text-muted">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>
                    {t('dashboard.policy_insight')}
                  </span>
                </div>
              </div>
            )}

            {!userRegistration && (
              <div className="card text-center py-10 border-dashed border-2 border-border bg-transparent">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('dashboard.no_policy')}</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">{t('dashboard.no_policy_desc')}</p>
                <button onClick={() => navigate('/premium-register')} className="btn-primary inline-flex items-center gap-2 shadow-glow">
                  {t('dashboard.register_now')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">

            {/* Claim Status */}
            <div className={`card border-2 ${triggered ? 'border-red-500/40' : 'border-border'}`}>
              <p className="section-title">{t('dashboard.claim_status')}</p>
              <div className="text-center py-4 border-b border-border mb-4 pb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${triggered ? 'bg-red-500/15 border-2 border-red-500/40' : 'bg-emerald-500/10 border-2 border-emerald-500/30'
                  }`}>
                  {triggered
                    ? <Zap className="w-8 h-8 text-red-400" />
                    : <Shield className="w-8 h-8 text-emerald-400" />}
                </div>
                <div className="font-bold text-lg mb-1">
                  {triggered ? t('dashboard.payout_eligible') : t('dashboard.active_monitoring')}
                </div>
                <div className="text-sm text-muted">
                  {t('dashboard.claims_auto_activated')}
                </div>

                {triggered && (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 inline-block mx-auto w-full">
                    <div className="text-xs text-muted mb-1">{t('dashboard.estimated_payout')}</div>
                    <div className="text-2xl font-black text-emerald-400">₹{payout.final_payout?.toLocaleString()}</div>
                    <div className="text-xs text-muted mt-1">{t('dashboard.of_max_cap', { cap: payout.max_cap?.toLocaleString() })}</div>
                  </div>
                )}
              </div>

              <div className="text-center px-2 pb-2">
                {triggered ? (
                  <button onClick={handleAutoClaim} className="btn-primary w-full text-base font-bold flex items-center justify-center gap-2 py-3 shadow-glow mb-4">
                    <CheckCircle className="w-5 h-5" /> Claim ₹{payout.final_payout?.toLocaleString()} Payout Now
                  </button>
                ) : null}

                <div className="text-xs text-slate-400 mb-3 border-t border-white/5 pt-3">
                  {t('dashboard.system_misses_condition')}
                </div>
                <button onClick={handleManualClaim} className="btn-secondary w-full text-sm flex items-center justify-center gap-2 py-2">
                  <Hand className="w-4 h-4" /> {t('dashboard.btn_request_manual')}
                </button>
              </div>
            </div>

            {/* Trust Score */}
            <div className="card">
              <p className="section-title">Trust Score</p>
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#1E293B" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke={tScore >= 95 ? "#F59E0B" : "#10B981"}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - tScore / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-base font-black ${tScore >= 95 ? 'text-amber-400' : 'text-emerald-400'}`}>{tScore}%</span>
                  </div>
                </div>
                <div className="badge bg-slate-800 text-slate-200 border-border mx-auto mb-3">{user?.badgeLevel || 'Loading'}</div>
                <div className="text-sm text-muted">
                  {user?.valid_claims || 0} correct claims recorded
                </div>
                <div className="divider" />
                <div className="text-xs text-muted">
                  Higher trust gives you better payouts.<br />Make correct claims to build trust.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
