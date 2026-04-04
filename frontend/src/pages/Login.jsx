import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authApi } from '../api';
import { Shield, Phone, KeyRound, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (phone.length < 10) return setError('Enter a valid 10-digit phone number');
    setLoading(true);
    try {
      const res = await authApi.sendOtp(phone);
      setDemoOtp(res.demo_otp || '');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, otp);
      await login(res.token, { phone });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg grid-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="orb w-72 h-72 bg-primary/10 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-sm">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{t('auth.login_title')}</h1>
          <p className="text-muted text-sm">{t('auth.login_subtitle')}</p>
        </div>

        <div className="card">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.phone_label')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">+91</span>
                  <input
                    id="login-phone"
                    className="input-field !pl-12"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    type="tel"
                    autoFocus
                  />
                </div>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

              <button id="login-send-otp" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
                  <Phone className="w-4 h-4" /> {t('auth.btn_send_otp')} <ChevronRight className="w-4 h-4" />
                </>}
              </button>

              <div className="divider" />

              <div className="space-y-2">
                <p className="text-xs text-muted text-center mb-2">Or login as partner rider</p>
                <button id="zepto-login-btn" type="button" className="btn-secondary w-full flex items-center justify-center gap-2 !text-sm">
                  <span className="w-5 h-5 bg-purple-500 rounded-md text-xs flex items-center justify-center font-bold text-white">Z</span>
                  {t('auth.btn_login_zepto')}
                </button>
                <button id="blinkit-login-btn" type="button" className="btn-secondary w-full flex items-center justify-center gap-2 !text-sm">
                  <span className="w-5 h-5 bg-yellow-400 rounded-md text-xs flex items-center justify-center font-bold text-black">B</span>
                  {t('auth.btn_login_blinkit')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-slate-300 font-medium">OTP sent to +91 {phone}</p>
                {demoOtp && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded-full">
                    Demo OTP: <span className="font-bold font-mono">{demoOtp}</span>
                  </div>
                )}
              </div>

              <input
                id="login-otp-input"
                className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="••••••"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                type="tel"
                maxLength={6}
                autoFocus
              />

              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

              <button id="login-verify-btn" type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
                  {t('auth.btn_verify_login')} <ChevronRight className="w-4 h-4" />
                </>}
              </button>

              <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="text-sm text-muted hover:text-slate-300 w-full text-center">
                ← Change number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          <Link to="/register" className="text-primary hover:text-primary-light font-bold">{t('auth.no_account')}</Link>
        </p>
      </div>
    </div>
  );
}
