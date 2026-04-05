import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, MapPin, Clock, Cloud, Activity, CheckCircle, ChevronRight, AlertTriangle, Info, ArrowLeft, Zap, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTranslation } from 'react-i18next';

const PLAN_TIER_MAP = { '49': 'basic', '74': 'standard', '99': 'pro' };

const CITY_COORDS = {
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Noida': { lat: 28.5355, lon: 77.3910 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Chennai': { lat: 13.0827, lon: 80.2707 }
};

const CITY_LOCATION_FACTOR = {
  'Delhi': 0.6,
  'Noida': 0.6,
  'Mumbai': 0.5,
  'Bangalore': 0.3,
  'Chennai': 0.4
};

const TIME_FACTOR = {
  'Morning': 0.0,
  'Afternoon': 0.1,
  'Evening': 0.1,
  'Night': 0.2
};

const PLANS = [
    { id: '49', nameKey: 'basic_plan',  price: 49, icon: Shield, descKey: 'basic_desc' },
    { id: '74', nameKey: 'standard_plan', price: 74, icon: Zap, descKey: 'standard_desc' },
    { id: '99', nameKey: 'pro_plan', price: 99, icon: Star, descKey: 'pro_desc' }
];

const OPENWEATHER_KEY = 'YOUR_API_KEY_HERE';
const WAQI_KEY = 'YOUR_API_KEY_HERE';

export default function PremiumRegister() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user, setPremiumStatus } = useAuth();
  const { t } = useTranslation();
  
  // Checking if we are in "Edit Plan" mode from Dashboard
  const isEditing = new URLSearchParams(search).get('edit') === 'true';

  const [step, setStep] = useState(1); 
  const [selectedPlan, setSelectedPlan] = useState('74');
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    avgDailyIncome: '',
    avgDailyOrders: '',
    workingHours: '',
    workingTimeStart: 'Morning',
    workingDays: '',
    city: ''
  });

  const [weatherData, setWeatherData] = useState(null);
  const [result, setResult] = useState(null);
  
  // Re-fetch weather if city changes directly on form
  useEffect(() => {
    if (formData.city) {
      fetchWeatherAndAQI(formData.city);
    }
  }, [formData.city]);

  const fetchWeatherAndAQI = async (city) => {
    const coords = CITY_COORDS[city];
    if (!coords) return null;
    
    setLoadingWeather(true);
    setWeatherData(null);
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_KEY}&units=metric`);
      const wData = await weatherRes.json();
      
      const aqiRes = await fetch(`https://api.waqi.info/feed/geo:${coords.lat};${coords.lon}/?token=${WAQI_KEY}`);
      const aqiData = await aqiRes.json();
      
      const temp = wData.main.temp;
      const condition = wData.weather[0].main; 
      const description = wData.weather[0].description;
      const aqi = aqiData.data?.aqi || 50;
      
      setWeatherData({ temp, condition, description, aqi });
      setError('');
    } catch(err) {
        setWeatherData({ temp: 32, condition: 'Clear', description: 'clear sky', aqi: 150 }); 
    } finally {
      setLoadingWeather(false);
    }
  };

  const getWeatherScore = (condition, description) => {
    const desc = description.toLowerCase();
    const cond = condition.toLowerCase();
    
    if (cond === 'tornado' || cond === 'squall' || desc.includes('extreme') || desc.includes('storm')) return 0.7;
    if (desc.includes('heavy') || cond === 'snow') return 0.5;
    if (cond === 'rain' || cond === 'drizzle' || cond === 'thunderstorm') return 0.3;
    return 0.0;
  };

  const getTempScore = (temp) => {
    if (temp > 40) return 0.6;
    if (temp >= 35) return 0.4;
    if (temp >= 30) return 0.2;
    return 0.0; 
  };

  const getAqiScore = (aqi) => {
    if (aqi > 300) return 0.6;
    if (aqi >= 200) return 0.4;
    if (aqi >= 100) return 0.2;
    return 0.0; 
  };

  const handlePlanSelection = async () => {
    if (isEditing && user) {
        try {
            setSubmitting(true);
            const { data, error: fetchErr } = await supabase
                .from('registrations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (data && !fetchErr) {
               const payloadForm = {
                    avgDailyIncome: data.avg_daily_income,
                    avgDailyOrders: data.avg_daily_orders,
                    workingHours: data.working_hours,
                    workingTimeStart: data.working_time_start,
                    workingDays: data.working_days,
                    city: data.city
               };
               setFormData(payloadForm);
               await fetchWeatherAndAQI(data.city); 
               
               _calculateCore(payloadForm, data.city, Number(selectedPlan));
               setStep(3);
               setSubmitting(false);
               return;
            }
        } catch (e) {
            console.error("No previous data found for edit", e);
        }
        setSubmitting(false);
    }

    setStep(2);
  };

  const _calculateCore = (dataToUse, activeCity, baseAmount) => {
        const wData = weatherData || { temp: 32, condition: 'Clear', description: 'clear sky', aqi: 150 };

        const wScore = getWeatherScore(wData.condition, wData.description);
        const tScore = getTempScore(wData.temp);
        const aScore = getAqiScore(wData.aqi);
        let E = wScore + tScore + aScore;
        if (E > 1) E = 1;

        const L = CITY_LOCATION_FACTOR[activeCity] || 0.0;

        const weeklyOrders = Number(dataToUse.avgDailyOrders) * Number(dataToUse.workingDays);
        let U = 0.0;
        if (weeklyOrders > 50) U = 0.4;
        else if (weeklyOrders >= 20) U = 0.2;
        
        const T = TIME_FACTOR[dataToUse.workingTimeStart] || 0.0;
        const B = 0.0;

        const RF = 1 + (0.45 * E) + (0.25 * L) + (0.15 * U) + (0.10 * T) + (0.05 * B);
        const premium = baseAmount * RF;

        setResult({
            RF: RF.toFixed(2),
            premium: premium.toFixed(2),
            breakdown: {
                E: (E * 0.45).toFixed(3),
                L: (L * 0.25).toFixed(3),
                U: (U * 0.15).toFixed(3),
                T: (T * 0.10).toFixed(3),
                B: (B * 0.05).toFixed(3)
            }
        });
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!formData.avgDailyIncome || !formData.avgDailyOrders || !formData.workingHours || !formData.workingDays || !formData.city) {
      setError(t('premium_reg.fill_all'));
      return;
    }
    if (!weatherData) {
      setError(t('premium_reg.weather_loading'));
      return;
    }
    
    setError('');
    _calculateCore(formData, formData.city, Number(selectedPlan));
    setStep(3);
  };

  const handleRegister = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      if (!user) throw new Error(t('premium_reg.must_login'));

      const planKey = PLAN_TIER_MAP[selectedPlan] || 'standard';

      const payload = {
        user_id: user.id,
        plan_tier: String(selectedPlan),
        avg_daily_income: Number(formData.avgDailyIncome),
        avg_daily_orders: Number(formData.avgDailyOrders),
        working_hours: Number(formData.workingHours),
        working_time_start: formData.workingTimeStart,
        working_days: Number(formData.workingDays),
        city: formData.city,
        risk_factor: Number(result.RF),
        premium: Number(result.premium)
      };

      let dbSuccess = false;
      if (isEditing) {
         const { error: dbError } = await supabase
            .from('registrations')
            .update(payload)
            .eq('user_id', user.id);
         if (dbError) console.error('Supabase update error (non-blocking):', dbError);
         else dbSuccess = true;
      } else {
         const { error: dbError } = await supabase
            .from('registrations')
            .insert([payload]);
         if (dbError) console.error('Supabase insert error (non-blocking):', dbError);
         else dbSuccess = true;
      }

      // Always save to localStorage as fallback so Dashboard can read it
      localStorage.setItem('rakshak_registration', JSON.stringify({
        ...payload,
        created_at: new Date().toISOString()
      }));

      // Persist plan selection to the users table so it reflects everywhere
      await setPremiumStatus(planKey);
      
      setStep(4);
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Ensure RLS is updated and you are logged in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg grid-bg py-12 px-4 relative flex items-center justify-center overflow-x-hidden">
      <div className="orb w-96 h-96 bg-primary/10 top-0 right-0 translate-x-1/3 -translate-y-1/3" />
      <div className="orb w-80 h-80 bg-accent/10 bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* STEP 1: PLAN SELECTION */}
        {step === 1 && (
            <div className="animate-slide-up">
               <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-sm">
                     <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{isEditing ? t('premium_reg.change_your_plan') : t('premium_reg.select_plan')}</h1>
                  <p className="text-muted">{t('premium_reg.select_plan_desc')}</p>
               </div>

               <div className="space-y-4">
                  {PLANS.map((plan) => (
                      <button 
                         key={plan.id}
                         onClick={() => setSelectedPlan(plan.id)}
                         className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 group ${
                             selectedPlan === plan.id 
                             ? 'bg-primary/10 border-primary shadow-glow-sm' 
                             : 'bg-card border-white/5 hover:border-white/20'
                         }`}
                      >
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                             selectedPlan === plan.id ? 'bg-primary text-black' : 'bg-white/5 text-slate-400 group-hover:text-white'
                         }`}>
                             <plan.icon className="w-6 h-6" />
                         </div>
                         <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                                <h3 className={`font-bold text-lg ${selectedPlan === plan.id ? 'text-primary' : 'text-slate-200'}`}>{t(`premium_reg.${plan.nameKey}`)}</h3>
                                <span className={`font-black text-xl ${selectedPlan === plan.id ? 'text-white' : 'text-slate-300'}`}>₹{plan.price}<span className="text-sm font-medium text-muted">/wk</span></span>
                             </div>
                             <p className="text-sm text-slate-400">{t(`premium_reg.${plan.descKey}`)}</p>
                         </div>
                      </button>
                  ))}
               </div>

               <button 
                  onClick={handlePlanSelection}
                  className="btn-primary w-full mt-8 py-3.5 flex items-center justify-center gap-2 text-base shadow-glow"
                  disabled={submitting}
               >
                  {submitting ? t('premium_reg.analyzing') : t('premium_reg.continue')} <ChevronRight className="w-5 h-5" />
               </button>
            </div>
        )}

        {/* STEP 2: REGISTRATION FORM */}
        {step === 2 && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setStep(1)} className="text-muted hover:text-white flex items-center gap-1 text-sm bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                    <ArrowLeft className="w-4 h-4" /> {t('premium_reg.change_your_plan')}
                </button>
                <div className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {t('premium_reg.gig_profile')}
                </div>
            </div>

            <div className="card space-y-6">
              <form onSubmit={handleCalculate} className="space-y-4 relative">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                       {t('premium_reg.avg_income')}
                    </label>
                    <input
                      required
                      type="number"
                      className="input-field"
                      placeholder="e.g. 800"
                      value={formData.avgDailyIncome}
                      onChange={e => setFormData({...formData, avgDailyIncome: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('premium_reg.avg_orders')}</label>
                    <input
                      required
                      type="number"
                      className="input-field"
                      placeholder="e.g. 15"
                      value={formData.avgDailyOrders}
                      onChange={e => setFormData({...formData, avgDailyOrders: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> {t('premium_reg.hours_day')}
                    </label>
                    <input
                      required
                      type="number"
                      className="input-field"
                      placeholder="e.g. 8"
                      value={formData.workingHours}
                      onChange={e => setFormData({...formData, workingHours: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('premium_reg.days_week')}</label>
                    <input
                      required
                      type="number"
                      min="1" max="7"
                      className="input-field"
                      placeholder="e.g. 6"
                      value={formData.workingDays}
                      onChange={e => setFormData({...formData, workingDays: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('premium_reg.shift_starts')}</label>
                    <select
                      className="input-field"
                      value={formData.workingTimeStart}
                      onChange={e => setFormData({...formData, workingTimeStart: e.target.value})}
                    >
                      <option value="Morning">{t('premium_reg.morning')}</option>
                      <option value="Afternoon">{t('premium_reg.afternoon')}</option>
                      <option value="Evening">{t('premium_reg.evening')}</option>
                      <option value="Night">{t('premium_reg.night')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-primary" /> {t('premium_reg.city_base')}
                    </label>
                    <select
                      required
                      className="input-field"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    >
                      <option value="" disabled>{t('premium_reg.select_city')}</option>
                      {Object.keys(CITY_COORDS).map(city => (
                        <option value={city} key={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.city && (
                  <div className={`mt-4 rounded-xl p-4 border transition-all duration-300 ${weatherData ? 'bg-black/30 border-primary/20 shadow-glow-sm' : 'bg-slate-900 border-slate-800'}`}>
                    {loadingWeather ? (
                      <div className="flex items-center gap-3 text-muted justify-center">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">{t('premium_reg.fetching_data')}</span>
                      </div>
                    ) : weatherData ? (
                      <div className="animate-fade-in flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Cloud className="w-8 h-8 text-sky-400" />
                            <div>
                               <p className="text-xs text-muted font-medium tracking-wider uppercase">{t('premium_reg.live_in', { city: formData.city })}</p>
                               <p className="text-white font-medium capitalize">{weatherData.description}</p>
                            </div>
                         </div>
                         <div className="flex gap-4 text-right">
                           <div>
                              <p className="text-xs text-muted uppercase">Temp</p>
                              <p className={`font-bold ${weatherData.temp > 35 ? 'text-amber-400' : 'text-white'}`}>{weatherData.temp}°C</p>
                           </div>
                           <div>
                              <p className="text-xs text-muted uppercase">AQI</p>
                              <p className={`font-bold ${weatherData.aqi > 200 ? 'text-red-400' : weatherData.aqi > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>{weatherData.aqi}</p>
                           </div>
                         </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

                <button 
                  type="submit" 
                  disabled={loadingWeather}
                  className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2 text-base shadow-glow"
                >
                  {t('premium_reg.generate_quote')} <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT AND BREAKDOWN */}
        {step === 3 && result && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setStep(isEditing ? 1 : 2)} className="text-muted hover:text-white flex items-center gap-1 text-sm bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                    <ArrowLeft className="w-4 h-4" /> {isEditing ? t('premium_reg.change_your_plan') : t('premium_reg.edit_details')}
                </button>
                <div className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {t('premium_reg.calc_finalized')}
                </div>
            </div>

            <div className="card overflow-hidden !p-0">
               <div className="bg-gradient-to-br from-primary/20 via-black to-black p-8 border-b border-white/5 text-center relative">
                   <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
                   
                   <p className="text-muted font-medium mb-2 relative z-10">{t('premium_reg.your_dynamic_premium', { plan: t(`premium_reg.${PLANS.find(p => p.id === selectedPlan)?.nameKey}`) })}</p>
                   <h2 className="text-6xl font-black text-white tracking-tight flex items-center justify-center gap-1 mb-3 relative z-10">
                      <span className="text-4xl text-primary font-light">₹</span>{result.premium}
                   </h2>
                   
                   <div className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-full bg-black/50 border border-white/10 backdrop-blur-md relative z-10">
                      <Activity className={`w-4 h-4 ${Number(result.RF) > 1.4 ? 'text-red-400' : 'text-emerald-400'}`} />
                      <span className="text-sm font-medium">{t('premium_reg.risk_factor_is', { rf: result.RF })}</span>
                   </div>
               </div>

               <div className="p-6">
                 <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-emerald-500" /> {t('premium_reg.factor_breakdown')}
                 </h3>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-300">{t('premium_reg.environment')}</span>
                        <span className="font-mono font-bold text-sky-400">{result.breakdown.E}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-300">{t('premium_reg.location')}</span>
                        <span className="font-mono font-bold text-emerald-400">{result.breakdown.L}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-300">{t('premium_reg.usage')}</span>
                        <span className="font-mono font-bold text-amber-400">{result.breakdown.U}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-300">{t('premium_reg.time')}</span>
                        <span className="font-mono font-bold text-purple-400">{result.breakdown.T}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                        <span className="text-slate-300">{t('premium_reg.behavior')}</span>
                        <span className="font-mono font-bold text-slate-400">{result.breakdown.B}</span>
                    </div>
                 </div>

                 <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 flex-1">
                        {t('premium_reg.premium_insight', { amount: selectedPlan })}
                    </p>
                 </div>

                 {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

                 {user ? (
                   <button 
                     onClick={handleRegister}
                     disabled={submitting}
                     className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2 shadow-glow"
                   >
                     {submitting ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>{isEditing ? t('premium_reg.confirm_update') : t('premium_reg.proceed', { amount: result.premium })} <CheckCircle className="w-5 h-5" /></>
                     )}
                   </button>
                 ) : (
                   <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                      <p className="mb-2">{t('premium_reg.must_login')}</p>
                      <button onClick={() => navigate('/login')} className="btn-secondary w-full py-2">{t('premium_reg.go_to_login')}</button>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
            <div className="animate-slide-up text-center">
                <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-white">{isEditing ? t('premium_reg.plan_updated') : t('premium_reg.coverage_activated')}</h2>
                <p className="text-slate-300 max-w-sm mx-auto mb-8">
                    {t('premium_reg.success_desc', { amount: result?.premium, planName: t(`premium_reg.${PLANS.find(p=>p.id===selectedPlan)?.nameKey}`) })}
                </p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => navigate('/dashboard')} className="btn-primary px-8">
                        {t('premium_reg.go_dashboard')}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
