import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '@/utils/sessionManager';
import { User } from '@/services';

export default function SessionProvider({ children }) {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAndInitSession = async () => {
      try {
        const user = await User.me();

        if (user) {
          const session = await sessionManager.validateSession();

          if (session) {
            const rememberMe = sessionManager.getRememberMe();
            if (!sessionManager.activityCheckInterval) {
              await sessionManager.initializeSession(rememberMe);
            }
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateAndInitSession();

    return () => {
      sessionManager.stopActivityMonitoring();
    };
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const session = await sessionManager.validateSession();
      if (!session && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        sessionManager.clearSession();
        navigate('/login?error=Session expired. Please sign in again.');
      }
    };

    const intervalId = setInterval(checkSession, 60000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
