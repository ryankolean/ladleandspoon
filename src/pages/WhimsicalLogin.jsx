import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@/services';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { sessionManager } from '@/utils/sessionManager';
import { supabase } from '@/lib/supabase';

export default function WhimsicalLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const user = await User.me();
      if (user) {
        navigate(redirectTo);
      }
    } catch (err) {
      console.log('No existing session');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await User.signIn(email, password);
      await sessionManager.initializeSession(rememberMe);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await User.signUp(email, password, {
        data: { full_name: fullName }
      });
      await User.signIn(email, password);
      await sessionManager.initializeSession(rememberMe);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block text-8xl mb-4 animate-float steam-effect">
            🥄
          </div>
          <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
            Welcome to <span className="gradient-text">Ladle & Spoon</span>
          </h1>
          <p className="text-[#654321] text-lg">
            Sign in to order delicious soups &amp; baked goods
          </p>
        </div>

        <div className="modal-content p-8">
          {error && (
            <div className="mb-6 p-4 bg-[#F56949]/10 border-2 border-[#F56949] rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#F56949] flex-shrink-0 mt-0.5" />
              <p className="text-[#F56949] text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                !isSignUp
                  ? 'bg-gradient-to-r from-[#F56949] to-[#BC5B22] text-white shadow-lg'
                  : 'bg-[#F5E6D3] text-[#8B4513] hover:bg-[#E6B85C]/30'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                isSignUp
                  ? 'bg-gradient-to-r from-[#F56949] to-[#BC5B22] text-white shadow-lg'
                  : 'bg-[#F5E6D3] text-[#8B4513] hover:bg-[#E6B85C]/30'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-[#8B4513] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#654321] pointer-events-none z-10" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                    className="input-whimsy !pl-16 pr-4"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#8B4513] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#654321] pointer-events-none z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-whimsy !pl-16 pr-4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#8B4513] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#654321] pointer-events-none z-10" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-whimsy !pl-16 pr-4"
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DEB887] text-[#F56949] focus:ring-[#F56949]"
                />
                <label htmlFor="remember" className="text-sm text-[#654321] font-medium">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#DEB887]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#F8F3F0] text-[#654321] font-medium">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 rounded-2xl border-2 border-[#DEB887] bg-white hover:bg-[#F5E6D3]/30 transition-all flex items-center justify-center gap-3 font-semibold text-[#8B4513] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F56949]" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/reset-password')}
                className="text-[#F56949] hover:text-[#BC5B22] font-medium text-sm transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-[#654321]">
            <button
              onClick={() => navigate('/')}
              className="hover:text-[#8B4513] font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
