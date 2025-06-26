import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from 'lucide-react';
import { useSecureAuth } from '../hooks/useSecureAuth';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import SecurityAlert from './SecurityAlert';
import { setSecurityHeaders, setCSRFToken } from '../utils/security';
import { sanitizeInput } from '../utils/validation';

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  const {
    loading,
    error,
    isRateLimited,
    remainingTime,
    signIn,
    signUp,
    signInAnonymously,
    clearError,
  } = useSecureAuth();

  // Initialize security measures
  useEffect(() => {
    setSecurityHeaders();
    const token = setCSRFToken();
    setCsrfToken(token);
  }, []);

  // Clear error when switching between login/signup
  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    
    let success = false;
    if (isLogin) {
      success = await signIn(sanitizedEmail, sanitizedPassword);
    } else {
      success = await signUp(sanitizedEmail, sanitizedPassword);
    }
    
    if (success) {
      onAuthSuccess();
    }
  };

  const handleGuestLogin = async () => {
    const success = await signInAnonymously();
    if (success) {
      onAuthSuccess();
    }
  };

  const handleEmailChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setEmail(value);
    clearError();
  };

  const handlePasswordChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setPassword(value);
    setShowPasswordStrength(!isLogin && value.length > 0);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Join us today'}
            </p>
          </div>

          {/* Security Alerts */}
          {isRateLimited && (
            <SecurityAlert
              type="error"
              title="Too Many Attempts"
              message="You've exceeded the maximum number of login attempts. Please wait before trying again."
              countdown={remainingTime}
            />
          )}

          {error && !isRateLimited && (
            <SecurityAlert
              type="error"
              title="Authentication Error"
              message={error}
              onClose={clearError}
            />
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  maxLength={254}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                  disabled={loading || isRateLimited}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  maxLength={128}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                  disabled={loading || isRateLimited}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading || isRateLimited}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <PasswordStrengthIndicator 
                password={password} 
                show={showPasswordStrength} 
              />
            </div>

            <button
              type="submit"
              disabled={loading || isRateLimited}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              disabled={loading || isRateLimited}
              className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                disabled={loading || isRateLimited}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Your connection is secure and your data is protected with industry-standard encryption.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}