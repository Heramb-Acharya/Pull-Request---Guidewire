-- SQL for setting up initial Rakshak Tables in Supabase

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    total_claims INTEGER DEFAULT 0,
    valid_claims INTEGER DEFAULT 0,
    plan TEXT DEFAULT 'basic',
    language TEXT DEFAULT 'English',
    gold_badge_unlocked BOOLEAN DEFAULT false,
    reward_claims_remaining INTEGER DEFAULT 0,
    is_premium_active BOOLEAN DEFAULT false,
    zone TEXT DEFAULT 'Delhi Noida',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Claims Table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trigger_type TEXT[] NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'under_review')),
    final_payout INTEGER DEFAULT 0,
    city TEXT DEFAULT 'Unknown',
    plan TEXT DEFAULT 'basic',
    conditions JSONB,
    k_event NUMERIC(4,2),
    k_severity NUMERIC(4,2),
    k_trust NUMERIC(4,2),
    base_coverage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Handle 'demo' data in AuthContext by inserting if doesn't exist.
-- You can also optionally add Row Level Security (RLS) policies here.
