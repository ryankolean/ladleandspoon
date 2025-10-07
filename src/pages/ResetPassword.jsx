import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coffee, Lock, CheckCircle2 } from 'lucide-react';
import { validatePassword } from '@/utils/validation';
import FieldError from '@/components/form/FieldError';
import PasswordStrength from '@/components/form/PasswordStrength';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await User.getSession();
        if (!session) {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (err) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };
    checkSession();
  }, []);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const validation = validatePassword(newPassword);
    setPasswordStrength(validation.strength);

    if (newPassword) {
      if (!validation.isValid) {
        setFieldErrors({ ...fieldErrors, password: validation.errors[0] });
      } else {
        setFieldErrors({ ...fieldErrors, password: null });
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirm = e.target.value;
    setConfirmPassword(newConfirm);

    if (newConfirm && newConfirm !== password) {
      setFieldErrors({ ...fieldErrors, confirmPassword: 'Passwords do not match' });
    } else {
      setFieldErrors({ ...fieldErrors, confirmPassword: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    const passwordValidation = validatePassword(password);
    const errors = {};

    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below');
      setIsLoading(false);
      return;
    }

    try {
      await User.updatePassword(password);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-4">Your password has been updated.</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Ladle & Spoon</h1>
          </div>
          <p className="text-gray-600">Reset Your Password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Choose a strong password to secure your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`pl-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                <PasswordStrength strength={passwordStrength} password={password} />
                <FieldError error={fieldErrors.password} />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`pl-10 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                <FieldError error={fieldErrors.confirmPassword} />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
