import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Phone, Globe, MapPin, ChevronDown, ChevronUp, CheckCircle, TrendingUp, Star, Gift, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { user: authUser, loading } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [registration, setRegistration] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!authUser?.id || authUser.id === 'demo-user-123') return;
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setRegistration(data);
      } else {
        // Fallback: check localStorage
        const localReg = localStorage.getItem('rakshak_registration');
        if (localReg) {
          try { setRegistration(JSON.parse(localReg)); } catch (e) { /* ignore */ }
        }
      }
    };
    fetchRegistration();
  }, [authUser]);

  const totalClaims = authUser?.total_claims ?? 0;
  const cleanClaims = authUser?.valid_claims ?? 0;
  const score = authUser?.trust_score ?? 50;
  
  // Base off context badges
  let badgeData = { badge: 'Getting Started', color: '#38BDF8', icon: '👋' };
  if (score >= 95) { badgeData = { badge: 'Gold Badge', color: '#F59E0B', icon: '⭐' }; }
  else if (score >= 80) { badgeData = { badge: 'Verified Rider', color: '#10B981', icon: '🛡️' }; }
  else if (score >= 60) { badgeData = { badge: 'Growing Trust', color: '#8B5CF6', icon: '🚀' }; }

  // Determine border/bg color
  let uiColorText = 'text-sky-400';
  let uiColorBorder = 'border-sky-500/30';
  let uiColorBg = 'bg-sky-500/10';

  if (badgeData.color === '#8B5CF6') { uiColorText = 'text-violet-400'; uiColorBorder = 'border-violet-500/30'; uiColorBg = 'bg-violet-500/10'; }
  else if (badgeData.color === '#F59E0B') { uiColorText = 'text-amber-400'; uiColorBorder = 'border-amber-500/30'; uiColorBg = 'bg-amber-500/10'; }
  else if (badgeData.color === '#10B981') { uiColorText = 'text-emerald-400'; uiColorBorder = 'border-emerald-500/30'; uiColorBg = 'bg-emerald-500/10'; }

  // Next milestone logic
  let nextMilestone = null;
  let progressPercent = 0;
  let remaining = 0;
  if (score < 60) {
    nextMilestone = 60;
    progressPercent = (score / 60) * 100;
  } else if (score < 80) {
    nextMilestone = 80;
    progressPercent = ((score - 60) / 20) * 100;
  } else if (score < 95) {
    nextMilestone = 95;
    progressPercent = ((score - 80) / 15) * 100;
  }
  
  // Benefit Insight dynamic text
  let benefitTitle = "";
  let benefitText = "";
  let benefitIcon = null;
  let benefitColor = "";

  if (totalClaims === 0) {
    benefitTitle = t('profile.insight_getting_started');
    benefitText = t('profile.insight_new_desc');
    benefitIcon = <Shield className="w-5 h-5 text-sky-400" />;
    benefitColor = "border-sky-500/30 bg-sky-500/10";
  } else if (score >= 95) {
    benefitTitle = t('profile.insight_max_title', { defaultValue: "Gold Status Achieved" });
    benefitText = t('profile.insight_max_desc', { defaultValue: "You have reached the maximum trust tier! Benefit from maximum payouts on eligible claims." });
    benefitIcon = <TrendingUp className="w-5 h-5 text-amber-400" />;
    benefitColor = "border-amber-500/30 bg-amber-500/10";
  } else if (score >= 80) {
    benefitTitle = t('profile.insight_high_title');
    benefitText = t('profile.insight_high_desc');
    benefitIcon = <TrendingUp className="w-5 h-5 text-emerald-400" />;
    benefitColor = "border-emerald-500/30 bg-emerald-500/10";
  } else if (score >= 60) {
    benefitTitle = t('profile.insight_med_title');
    benefitText = t('profile.insight_med_desc');
    benefitIcon = <CheckCircle className="w-5 h-5 text-sky-400" />;
    benefitColor = "border-sky-500/30 bg-sky-500/10";
  } else {
    benefitTitle = t('profile.insight_low_title');
    benefitText = t('profile.insight_low_desc');
    benefitIcon = <Shield className="w-5 h-5 text-red-400" />;
    benefitColor = "border-red-500/30 bg-red-500/10";
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg grid-bg pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">{t('profile.title')}</h1>
        <p className="text-muted text-sm mb-6">{t('profile.subtitle')}</p>

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Trust Summary Card (Left) ── */}
          <div className="md:col-span-1 space-y-4">
            
            {/* Gamified Reward Banner (if active) */}
            {authUser?.reward_claims_remaining > 0 && (
              <div className="card bg-amber-500/15 border-amber-500/40 p-4 text-center animate-slide-up shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Gift className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <div className="font-bold text-amber-400 mb-1">{t('profile.gold_reward_active')}</div>
                <div className="text-xs text-amber-200/80 mb-2 leading-relaxed">
                  {t('profile.gold_reward_desc', { count: authUser.reward_claims_remaining })}
                </div>
                <div className="inline-block bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full text-xs border border-amber-500/20">
                  {t('profile.remaining_boosts', { count: authUser.reward_claims_remaining })}
                </div>
              </div>
            )}

            <div className={`card border-2 ${uiColorBorder} ${uiColorBg} text-center`}>
              <div className="text-4xl mb-2">{badgeData.icon}</div>
              <div className={`text-lg font-bold ${uiColorText} mb-1`}>{badgeData.badge}</div>
              
              {/* Circular score */}
              <div className="relative w-32 h-32 mx-auto my-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1E293B" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={score >= 95 ? '#F59E0B' : score >= 80 ? '#10B981' : score >= 60 ? '#8B5CF6' : '#38BDF8'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{score.toFixed(0)}%</span>
                </div>
              </div>

              <div className="text-sm font-medium text-slate-300">
                {t('profile.trust_score')}
              </div>
              <div className="text-xs text-muted mt-2 px-2">
                {t('profile.trust_explanation')}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center p-4">
                <div className="text-2xl font-black text-white">{totalClaims}</div>
                <div className="text-xs text-muted mt-1">{t('profile.total_claims')}</div>
              </div>
              <div className="card text-center p-4">
                <div className="text-2xl font-black text-emerald-400">{cleanClaims}</div>
                <div className="text-xs text-muted mt-1">{t('profile.clean_claims')}</div>
              </div>
            </div>
          </div>

          {/* ── Main Content (Right) ── */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Benefit Insight Card */}
            <div className={`border-l-4 rounded-r-xl p-5 ${benefitColor} border-l-[color:inherit] bg-white/5 backdrop-blur-sm`}>
              <div className="flex items-start gap-4">
                <div className="mt-0.5">{benefitIcon}</div>
                <div>
                  <h3 className={`text-base font-bold mb-1 ${score >= 95 ? 'text-amber-400' : score >= 80 || totalClaims === 0 ? 'text-emerald-400' : score >= 60 ? 'text-sky-400' : 'text-red-400'}`}>
                    {benefitTitle}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{benefitText}</p>
                </div>
              </div>
            </div>

            {/* Progress Motivation */}
            <div className="card border border-border/50">
              <h3 className="font-bold text-white mb-4">{t('profile.progress_title')}</h3>
              {nextMilestone ? (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">{t('profile.progress_label')}</span>
                    <span className="text-emerald-400 font-bold">Goal: {nextMilestone}%</span>
                  </div>
                  <div className="w-full bg-bg rounded-full h-3 mb-3 border border-border overflow-hidden">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${progressPercent}%`, transition: 'width 1s ease' }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted">
                    {totalClaims === 0 ? t('profile.progress_hint_first') : t('profile.submit_valid_reach_tier')}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-amber-400 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                  <Star className="w-6 h-6" />
                  <div>
                    <div className="font-bold">{t('profile.max_trust_achieved')}</div>
                    <div className="text-xs text-amber-400/80 mt-1">{t('profile.max_trust_desc')}</div>
                  </div>
                </div>
              )}

              {/* Educational Gold Badge Info */}
              {score < 95 && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="text-2xl pt-1">🏆</div>
                  <div>
                    <div className="font-bold text-amber-400 mb-1">
                      {score > 80 ? "You're close to unlocking Gold Badge!" : "Reach 95%+ trust to unlock Gold Badge"}
                    </div>
                    <div className="text-xs text-amber-200/80 leading-relaxed">
                      With Gold Badge, your next 3 claims will receive maximum payout benefit.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="card">
              <p className="font-bold text-white mb-4">{t('profile.account_details')}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2 border-b border-border/50">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-muted text-sm w-24">{t('profile.name')}</span>
                  <span className="text-slate-200 font-medium">{authUser?.name || 'Rider'}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-border/50">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-muted text-sm w-24">{t('profile.phone')}</span>
                  <span className="text-slate-200 font-medium font-mono">{authUser?.phone || '**********'}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-border/50">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-muted text-sm w-24">{t('profile.language')}</span>
                  <span className="text-slate-200 font-medium">{authUser?.language || 'English'}</span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-muted text-sm w-24">{t('profile.zone')}</span>
                  <span className="text-slate-200 font-medium">{registration?.city || authUser?.zone || 'Delhi Noida'}</span>
                </div>
              </div>
            </div>

            {/* Active Plan Card */}
            {registration && (
              <div className="card border-2 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <p className="font-bold text-white">{t('profile.active_plan', { defaultValue: 'Active Plan' })}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-1">Plan</div>
                    <div className="text-white text-lg font-bold capitalize">
                      {registration.plan_tier === '49' ? 'Basic' : registration.plan_tier === '74' ? 'Standard' : registration.plan_tier === '99' ? 'Pro' : 'Standard'}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-1">Premium</div>
                    <div className="text-emerald-400 text-lg font-bold">₹{registration.premium}/wk</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-1">Risk Factor</div>
                    <div className="text-amber-400 text-lg font-bold">{registration.risk_factor}x</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="text-muted text-xs uppercase tracking-widest font-bold mb-1">City</div>
                    <div className="text-white text-lg font-bold">{registration.city}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Advanced Details */}
            <div className="mt-8">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mx-auto"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {t('profile.btn_advanced')}
              </button>
              
              {showAdvanced && (
               <div className="mt-4 card bg-bg/50 border border-border/50 text-xs">
                  <div className="font-mono text-slate-300 mb-2">{t('profile.sys_k_trust_logic')}</div>
                  <p className="text-muted mb-3">{t('profile.internal_multipliers')}</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <span className="text-muted block">{score >= 95 ? t('profile.status') : t('profile.next_multiplier')}</span>
                       <span className="font-bold text-emerald-400">1.10× (Max)</span>
                     </div>
                     <div>
                       <span className="text-muted block">{t('profile.internal_trust')}</span>
                       <span className="font-bold text-white">{score.toFixed(2)}%</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
