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

// Enhanced Supabase client with security configurations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enhanced security settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for enhanced security
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

// Session validation helper
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    // Additional session validation
    if (session) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await supabase.auth.signOut();
        return null;
      }
    }
    
    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
};

// Secure logout helper
export const secureLogout = async () => {
  try {
    await supabase.auth.signOut();
    // Clear any additional client-side data
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};