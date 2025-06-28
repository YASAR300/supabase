import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid VITE_SUPABASE_URL format. Please provide a valid URL.');
}

// Enhanced Supabase client - DEVELOPMENT MODE (No Email Confirmation Required)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enhanced security settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable URL session detection for simpler flow
    flowType: 'pkce', // Use PKCE flow for enhanced security
    debug: false, // Disable debug to reduce console noise
    // Secure storage options
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
})