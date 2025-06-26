import { useState, useEffect, useCallback } from 'react';
import { supabase, validateSession, secureLogout } from '../lib/supabaseClient';
import { authRateLimiter, getDeviceFingerprint, SessionManager } from '../utils/security';
import { validateAuthForm } from '../utils/validation';

export const useSecureAuth = () => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: '',
    isRateLimited: false,
    remainingTime: 0,
  });

  const [sessionManager] = useState(() => new SessionManager(
    () => {
      // Auto logout on session timeout
      signOut();
    },
    () => {
      // Show warning before timeout
      console.warn('Session will expire soon');
    }
  ));

  const deviceFingerprint = getDeviceFingerprint();

  // Update rate limit status
  const updateRateLimitStatus = useCallback(() => {
    const isRateLimited = !authRateLimiter.isAllowed(deviceFingerprint);
    const remainingTime = authRateLimiter.getRemainingTime(deviceFingerprint);
    
    setState(prev => ({
      ...prev,
      isRateLimited,
      remainingTime,
    }));
  }, [deviceFingerprint]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await validateSession();
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
        }));

        if (session?.user) {
          sessionManager.start();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          user: null,
          loading: false,
          error: 'Failed to initialize authentication',
        }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
        }));

        if (session?.user) {
          sessionManager.start();
        } else {
          sessionManager.clear();
        }

        // Reset rate limiting on successful auth
        if (event === 'SIGNED_IN') {
          authRateLimiter.reset(deviceFingerprint);
          updateRateLimitStatus();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      sessionManager.clear();
    };
  }, [deviceFingerprint, sessionManager, updateRateLimitStatus]);

  // Activity tracking for session management
  useEffect(() => {
    const handleActivity = () => {
      if (state.user) {
        sessionManager.reset();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [state.user, sessionManager]);

  const signIn = useCallback(async (email, password) => {
    // Check rate limiting
    if (!authRateLimiter.isAllowed(deviceFingerprint)) {
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        error: `Too many login attempts. Please try again in ${authRateLimiter.getRemainingTime(deviceFingerprint)} seconds.`,
      }));
      return false;
    }

    // Validate input
    const validation = validateAuthForm(email, password);
    if (!validation.success) {
      setState(prev => ({
        ...prev,
        error: validation.errors?.[0]?.message || 'Invalid input',
      }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) throw error;

      // Reset rate limiting on successful login
      authRateLimiter.reset(deviceFingerprint);
      updateRateLimitStatus();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Sign in failed',
      }));
      return false;
    }
  }, [deviceFingerprint, updateRateLimitStatus]);

  const signUp = useCallback(async (email, password) => {
    // Check rate limiting
    if (!authRateLimiter.isAllowed(deviceFingerprint)) {
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        error: `Too many signup attempts. Please try again in ${authRateLimiter.getRemainingTime(deviceFingerprint)} seconds.`,
      }));
      return false;
    }

    // Validate input
    const validation = validateAuthForm(email, password);
    if (!validation.success) {
      setState(prev => ({
        ...prev,
        error: validation.errors?.[0]?.message || 'Invalid input',
      }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) throw error;

      // Reset rate limiting on successful signup
      authRateLimiter.reset(deviceFingerprint);
      updateRateLimitStatus();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Sign up failed',
      }));
      return false;
    }
  }, [deviceFingerprint, updateRateLimitStatus]);

  const signInAnonymously = useCallback(async () => {
    // Check rate limiting
    if (!authRateLimiter.isAllowed(deviceFingerprint)) {
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        error: `Too many attempts. Please try again in ${authRateLimiter.getRemainingTime(deviceFingerprint)} seconds.`,
      }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;

      // Reset rate limiting on successful login
      authRateLimiter.reset(deviceFingerprint);
      updateRateLimitStatus();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Anonymous sign in failed',
      }));
      return false;
    }
  }, [deviceFingerprint, updateRateLimitStatus]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await secureLogout();
      sessionManager.clear();
      setState(prev => ({
        ...prev,
        user: null,
        loading: false,
        error: '',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Sign out failed',
      }));
    }
  }, [sessionManager]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: '' }));
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signInAnonymously,
    signOut,
    clearError,
  };
};