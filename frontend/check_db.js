import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.com';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('registrations').select('*').limit(1);
  console.log("Registrations:", data, error);
  
  const { data: d2, error: e2 } = await supabase.from('claims').select('*').limit(1);
  console.log("Claims:", d2, e2);
}

check();
