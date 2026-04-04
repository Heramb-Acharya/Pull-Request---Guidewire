import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const AuthContext = createContext(null);

// PART 1: DEMO DATA (DUMMY ACCOUNT)
const DEMO_USER = {
  id: 'demo-user-123',
  name: 'Demo User',
  phone: '9999999999',
  total_claims: 5,
  valid_claims: 3,
  plan: 'standard',
  language: 'English',
  gold_badge_unlocked: false,
  reward_claims_remaining: 0,
  is_premium_active: true
};

const DEMO_CLAIMS = [
  { id: 'd1', trigger_type: ['extreme_weather'], type: ['extreme_weather'], status: 'approved', final_payout: 3128, amount: 3128, city: 'Delhi', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'd2', trigger_type: ['civic_disruption'], type: ['civic_disruption'], status: 'approved', final_payout: 1968, amount: 1968, city: 'Mumbai', created_at: new Date(Date.now() - 86400000*2).toISOString() },
  { id: 'd3', trigger_type: ['poor_aqi'], type: ['poor_aqi'], status: 'approved', final_payout: 1050, amount: 1050, city: 'Bangalore', created_at: new Date(Date.now() - 86400000*3).toISOString() },
  { id: 'd4', trigger_type: ['heat_condition'], type: ['heat_condition'], status: 'rejected', final_payout: 0, amount: 0, city: 'Delhi', created_at: new Date(Date.now() - 86400000*4).toISOString() },
  { id: 'd5', trigger_type: ['heavy_rainfall'], type: ['heavy_rainfall'], status: 'under_review', final_payout: 0, amount: 0, city: 'Chennai', created_at: new Date(Date.now() - 86400000*5).toISOString() },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trust score and milestone logic derived from global state
  const totalClaimsCount = user?.total_claims || 0;
  const validClaimsCount = user?.valid_claims || 0;
  const rawTrustScore = totalClaimsCount === 0 ? 50 : Math.round((validClaimsCount / totalClaimsCount) * 100);
  
  // Badge derivation
  const badgeLevel = rawTrustScore >= 95 ? 'Gold Badge' 
                   : rawTrustScore >= 80 ? 'Verified Rider' 
                   : rawTrustScore >= 60 ? 'Growing Trust' 
                   : 'Getting Started';

  const derivedUser = user ? {
    ...user,
    trust_score: rawTrustScore,
    badgeLevel,
  } : null;

  // Gold Badge auto-unlock logic
  useEffect(() => {
    const syncGoldBadge = async () => {
      if (user && user.id !== 'demo-user-123' && rawTrustScore >= 95 && !user.gold_badge_unlocked) {
        console.log('Unlocking Gold Badge for user:', user.id);
        const { data, error } = await supabase.from('users')
          .update({ 
            gold_badge_unlocked: true, 
            reward_claims_remaining: 3 
          })
          .eq('id', user.id)
          .select().single();
        
        if (error) console.error('Error unlocking gold badge:', error);
        if (data) setUser(data);
      }
    };
    syncGoldBadge();
  }, [rawTrustScore, user]);

  useEffect(() => {
    const savedToken = localStorage.getItem('rakshak_token');
    const savedPhone = localStorage.getItem('rakshak_phone');
    if (savedToken && savedPhone) {
      loadUserData(savedPhone, savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async (phoneStr, tokenVal) => {
    console.log('--- Login Triggered ---');
    console.log('Phone:', phoneStr);

    // PART 1: DEMO USER CHECK (9999999999)
    if (phoneStr === '9999999999') {
      console.log('Demo user detected. Loading pre-defined data.');
      setUser(DEMO_USER);
      setClaims(DEMO_CLAIMS);
      setToken(tokenVal || 'demo-token');
      setLoading(false);
      return;
    }

    try {
      // PART 2: SUPABASE FETCH/INSERT FIX
      console.log('Fetching user from Supabase...');
      let { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneStr)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Supabase fetch error:', fetchError);
      }

      if (userData) {
        console.log('User found in database:', userData.id);
      } else {
        // If user doesn't exist, INSERT new user
        console.log('User not found. Inserting new user into Supabase...');
        const newUser = {
          name: `Rider_${phoneStr.slice(-4)}`,
          phone: phoneStr,
          language: 'English',
          total_claims: 0,
          valid_claims: 0,
          plan: 'basic',
          gold_badge_unlocked: false,
          reward_claims_remaining: 0,
          is_premium_active: false
        };

        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (insertError) {
          console.error('CRITICAL: Supabase insert failed:', insertError);
          userData = newUser; // Fallback to local object so app doesn't crash
        } else {
          console.log('New user successfully inserted:', insertedUser.id);
          userData = insertedUser;
        }
      }
      
      setUser(userData);
      setToken(tokenVal);
      
      // Fetch claims for real users
      if (userData?.id) {
        console.log('Fetching claims for user:', userData.id);
        const { data: claimsData, error: claimsError } = await supabase
          .from('claims')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });
        
        if (claimsError) {
          console.error('Error fetching claims:', claimsError);
        } else {
          console.log('Claims fetched:', claimsData?.length || 0);
          setClaims(claimsData || []);
        }
      }
    } catch (err) {
      console.error('Unexpected Auth Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (tokenVal, userData) => {
    localStorage.setItem('rakshak_token', tokenVal);
    localStorage.setItem('rakshak_phone', userData.phone);
    await loadUserData(userData.phone, tokenVal);
  };

  const logout = () => {
    console.log('Logging out...');
    setToken(null);
    setUser(null);
    setClaims([]);
    localStorage.removeItem('rakshak_token');
    localStorage.removeItem('rakshak_phone');
  };

  const addManualClaim = async (city = 'Unknown', amount = 0, triggers = ['manual_request'], claimType = 'manual_request', initStatus = 'under_review') => {
    if (!user) return;
    
    // PART 1: Demo User Block (No DB persistence for demo)
    if (user.id === 'demo-user-123') {
        console.log('Demo user: Simulated claim addition.');
        const fakeClaim = {
            id: 'fake-' + Date.now(),
            user_id: user.id,
            type: [claimType],
            trigger_type: triggers,
            status: initStatus,
            amount: amount,
            final_payout: amount,
            city: city,
            created_at: new Date().toISOString()
        };
        setClaims(prev => [fakeClaim, ...prev]);
        return;
    }

    // PART 4: CLAIM INSERT FIX (Real Users)
    console.log('Submitting claim to Supabase...');
    const newClaim = {
      user_id: user.id,
      type: [claimType],
      trigger_type: triggers, // Keep both for safety
      status: initStatus,
      amount: amount,
      final_payout: amount, 
      city: city,
      plan: user.plan,
      created_at: new Date().toISOString()
    };

    const { data: inserted, error: claimErr } = await supabase
        .from('claims')
        .insert([newClaim])
        .select()
        .single();
    
    if (claimErr) {
        console.error('Error inserting claim:', claimErr);
        return;
    }

    console.log('Claim successfully inserted:', inserted.id);
    setClaims(prev => [inserted, ...prev]);

    // Update user stats in DB
    let rewardUpdate = {};
    if (user.reward_claims_remaining > 0) {
      rewardUpdate = { reward_claims_remaining: user.reward_claims_remaining - 1 };
    }

    const { data: updatedUser, error: userUpdateErr } = await supabase.from('users')
      .update({ 
        total_claims: (user.total_claims || 0) + 1,
        ...rewardUpdate
      })
      .eq('id', user.id)
      .select().single();
      
    if (userUpdateErr) console.error('Error updating user stats:', userUpdateErr);
    if (updatedUser) {
        console.log('User stats updated in DB.');
        setUser(updatedUser);
    }
  };

  const setPremiumStatus = async (planKey = 'standard') => {
    if (!user || user.id === 'demo-user-123') return;
    console.log('Updating premium status to:', planKey);
    const { data, error } = await supabase.from('users')
      .update({ plan: planKey, is_premium_active: true })
      .eq('id', user.id)
      .select().single();
    
    if (error) console.error('Error updating premium:', error);
    if (data) setUser(data);
  };

  const updateLanguage = async (lng) => {
    if (!user || user.id === 'demo-user-123') return;
    console.log('Updating language to:', lng);
    const { data, error } = await supabase.from('users')
      .update({ language: lng })
      .eq('id', user.id)
      .select().single();
    
    if (error) console.error('Error updating language:', error);
    if (data) setUser(data);
  };

  return (
    <AuthContext.Provider value={{ 
        user: derivedUser, 
        claims, 
        token, 
        loading, 
        login, 
        logout, 
        isAuthenticated: !!token, 
        addManualClaim,
        setPremiumStatus,
        updateLanguage
      }}>
    {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
