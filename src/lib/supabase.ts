import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
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
