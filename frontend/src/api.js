// API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = {
  async post(path, body) {
    const token = localStorage.getItem('rakshak_token');
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  },

  async get(path, params = {}) {
    const token = localStorage.getItem('rakshak_token');
    const qs = new URLSearchParams(params).toString();
    const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  },
};

export const authApi = {
  sendOtp: (phone, name, language) =>
    api.post('/auth/send-otp', { phone, name, language }),
  verifyOtp: (phone, otp, name, language) =>
    api.post('/auth/verify-otp', { phone, otp, name, language }),
};

export const riskApi = {
  calculate: (lat, lon, zone, working_hours, is_night, trust_score) =>
    api.post('/risk/calculate', { lat, lon, zone, working_hours, is_night, trust_score }),
};

export const premiumApi = {
  calculate: (plan, risk_factor) =>
    api.post('/premium/calculate', { plan, risk_factor }),
};

export const triggerApi = {
  check: (lat, lon, city, trust_score, clean_claims, plan, reward_active) =>
    api.get('/trigger/check', { lat, lon, city, trust_score, clean_claims, plan, reward_active }),
};
