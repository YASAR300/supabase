import React, { useState, useEffect } from 'react';
import { validateSession } from './lib/supabaseClient';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { setSecurityHeaders } from './utils/security';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set security headers
    setSecurityHeaders();

    // Initialize session validation
    const initializeSession = async () => {
      try {
        const session = await validateSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Session initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    if (authenticatedUser) {
      setUser(authenticatedUser);
    }
    // The useSecureAuth hook will handle the user state update
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}

export default App;