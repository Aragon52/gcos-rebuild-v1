import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  let val = "";
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      val = import.meta.env[key] || "";
    }
  } catch (e) {
    // ignore
  }
  if (!val && typeof process !== "undefined" && process.env) {
    val = process.env[key] || "";
  }
  return val;
};

const supabaseUrl = (getEnv("VITE_SUPABASE_URL") || getEnv("SUPABASE_URL")).trim();
const supabaseAnonKey = (
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
).trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing.');
}

// Ensure the URL is valid, fallback to localhost to prevent crash but allow clear fetch errors
const finalUrl = supabaseUrl.startsWith('http') ? supabaseUrl : 'http://localhost:54321';

export const supabase = createClient(finalUrl, supabaseAnonKey || 'dummy-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
