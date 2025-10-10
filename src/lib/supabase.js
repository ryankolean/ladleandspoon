import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sgpsqlwggwtzmydntvny.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncHNxbHdnZ3d0em15ZG50dm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Njk1OTcsImV4cCI6MjA3NTM0NTU5N30.XPkjbbax9WVpudvK8KlqNCCXFNbZ9iUrU8VicurnZDI';

const SESSION_TIMEOUT_MINUTES = 60;
const REMEMBER_ME_DAYS = 30;

let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false
      },
      global: {
        headers: {
          'X-Client-Info': 'ladle-spoon-app'
        }
      }
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
} else {
  console.error('Supabase configuration missing. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.error('Current values:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
}

export const supabase = supabaseClient;
export { SESSION_TIMEOUT_MINUTES, REMEMBER_ME_DAYS };
