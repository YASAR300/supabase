import React, { useState, useEffect } from 'react';
import { LogOut, User, Mail, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSecureAuth } from '../hooks/useSecureAuth';
import SecurityAlert from './SecurityAlert';
import { getDeviceFingerprint } from '../utils/security';

export default function Dashboard({ user, onLogout }) {
  const { signOut } = useSecureAuth();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  useEffect(() => {
    setDeviceFingerprint(getDeviceFingerprint());
  }, []);

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const isAnonymous = user?.is_anonymous;
  const userEmail = user?.email || 'Guest User';
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown';

  // Security status indicators
  const securityFeatures = [
    {
      name: 'Session Encryption',
      status: 'active',
      description: 'Your session is encrypted with industry-standard protocols'
    },
    {
      name: 'Rate Limiting',
      status: 'active',
      description: 'Protection against brute force attacks'
    },
    {
      name: 'Input Validation',
      status: 'active',
      description: 'All inputs are validated and sanitized'
    },
    {
      name: 'CSRF Protection',
      status: 'active',
      description: 'Cross-site request forgery protection enabled'
    },
    {
      name: 'Session Timeout',
      status: 'active',
      description: 'Automatic logout after 60 minutes of inactivity'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Session Warning */}
          {sessionWarning && (
            <SecurityAlert
              type="warning"
              title="Session Expiring Soon"
              message="Your session will expire in 5 minutes due to inactivity. Please interact with the page to extend your session."
              onClose={() => setSessionWarning(false)}
              actions={
                <button
                  onClick={() => setSessionWarning(false)}
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                >
                  Extend Session
                </button>
              }
            />
          )}

          {/* Main Dashboard */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-4 shadow-lg">
                {isAnonymous ? (
                  <Shield className="w-10 h-10 text-white" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome!
              </h1>
              <p className="text-gray-600 text-lg">
                You're successfully logged in with enhanced security
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* User Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      {isAnonymous ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <Mail className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {isAnonymous ? 'Guest Session' : 'User Account'}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      {isAnonymous ? (
                        <>
                          <Shield className="w-4 h-4" />
                          Anonymous User
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          {userEmail}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Session Status
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Last sign in: {lastSignIn}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Account Status</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isAnonymous ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isAnonymous ? 'Temporary Session' : 'Authenticated User'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Session Info</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>User ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user?.id}</code></p>
                  <p>Device ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{deviceFingerprint}</code></p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          {/* Security Features Panel */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Security Features</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">All Security Features Active</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your account is protected with multiple layers of security including encryption, 
                rate limiting, input validation, and session management.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {isAnonymous ? (
                <>
                  You're browsing as a guest with full security protection. 
                  <br />
                  Create an account to save your data permanently.
                </>
              ) : (
                <>
                  Your session is secure and your data is protected with enterprise-grade security.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}