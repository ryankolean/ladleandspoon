import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@/services';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { sessionManager } from '@/utils/sessionManager';

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
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#654321]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                    className="input-whimsy pl-12"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#654321]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-whimsy pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#654321]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-whimsy pl-12"
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
