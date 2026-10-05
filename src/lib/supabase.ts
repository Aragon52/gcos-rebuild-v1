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

// Fail requests that hang (e.g. a paused or overloaded Supabase project) instead of
// leaving sign-in buttons spinning forever.
const REQUEST_TIMEOUT_MS = 20000;
export const SUPABASE_TIMEOUT_MESSAGE =
  'Failed to fetch: the database did not respond in time. The Supabase project may be paused or overloaded.';

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const callerSignal = init?.signal;
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (timedOut) throw new TypeError(SUPABASE_TIMEOUT_MESSAGE);
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

export const supabase = createClient(finalUrl, supabaseAnonKey || 'dummy-key', {
  global: {
    fetch: fetchWithTimeout,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
