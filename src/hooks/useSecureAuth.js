import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authRateLimiter, getDeviceFingerprint, SessionManager } from '../utils/security';
import { validateAuthForm } from '../utils/validation';

export const useSecureAuth = () => {
  const [state, setState] = useState({
    user: null,
    loading: false,
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

  // Initialize rate limiting check
  useEffect(() => {
    updateRateLimitStatus();
  }, [updateRateLimitStatus]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) throw error;

      if (data.user) {
        // Reset rate limiting on successful login
        authRateLimiter.reset(deviceFingerprint);
        updateRateLimitStatus();
        sessionManager.start();
        
        setState(prev => ({ 
          ...prev, 
          loading: false,
          user: data.user,
          error: ''
        }));
        return true;
      }
      
      throw new Error('Login failed');
    } catch (error) {
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Sign in failed',
      }));
      return false;
    }
  }, [deviceFingerprint, updateRateLimitStatus, sessionManager]);

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
      console.log('Creating account for:', validation.data.email);
      
      // Sign up WITHOUT email confirmation (for development)
      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: undefined, // No email confirmation needed
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup successful:', data);

      // Reset rate limiting on successful signup
      authRateLimiter.reset(deviceFingerprint);
      updateRateLimitStatus();
      
      setState(prev => ({ ...prev, loading: false, error: '' }));
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
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
      // Create anonymous session
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Anonymous sign in error:', error);
        throw error;
      }

      if (data.user) {
        // Reset rate limiting on successful login
        authRateLimiter.reset(deviceFingerprint);
        updateRateLimitStatus();
        sessionManager.start();
        
        setState(prev => ({ 
          ...prev, 
          loading: false,
          user: data.user,
          error: ''
        }));
        return true;
      } else {
        throw new Error('Failed to create anonymous session');
      }
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      updateRateLimitStatus();
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Guest sign in failed. Please try again.',
      }));
      return false;
    }
  }, [deviceFingerprint, updateRateLimitStatus, sessionManager]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await supabase.auth.signOut();
      sessionManager.clear();
      
      // Clear any additional client-side data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token');
        window.sessionStorage.clear();
      }
      
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