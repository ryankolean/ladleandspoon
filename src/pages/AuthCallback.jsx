import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Coffee } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const errorCode = searchParams.get('error_code');

        if (errorParam) {
          let userFriendlyError = 'Authentication failed. Please try again.';

          if (errorParam === 'access_denied') {
            userFriendlyError = 'You cancelled the sign-in process. Please try again.';
          } else if (errorParam === 'server_error') {
            userFriendlyError = 'Server error occurred. Please try again later.';
          } else if (errorDescription) {
            if (errorDescription.includes('not enabled') || errorDescription.includes('disabled')) {
              userFriendlyError = 'This sign-in method is not currently available. Please use email/password instead.';
            } else if (errorDescription.includes('Email not confirmed')) {
              userFriendlyError = 'Please verify your email address before signing in.';
            } else {
              userFriendlyError = errorDescription;
            }
          }

          setError(userFriendlyError);
          setStatus('error');

          setTimeout(() => {
            navigate('/login?error=' + encodeURIComponent(userFriendlyError));
          }, 3000);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to verify authentication. Please try again.');
          setStatus('error');

          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        if (session) {
          setStatus('success');

          const redirectTo = searchParams.get('redirect') || '/';
          setTimeout(() => {
            navigate(redirectTo);
          }, 1000);
        } else {
          setStatus('error');
          setError('No session found. Please try signing in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setStatus('error');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className={`w-12 h-12 text-orange-600 ${status === 'processing' ? 'animate-spin' : ''}`} />
          </div>

          {status === 'processing' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Sign In...</h1>
              <p className="text-gray-600">Please wait while we complete your authentication.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <h1 className="text-2xl font-bold text-green-700 mb-2">Success!</h1>
              <p className="text-gray-600">Redirecting you now...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <h1 className="text-2xl font-bold text-red-700 mb-2">Authentication Error</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">Redirecting you back to sign in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
