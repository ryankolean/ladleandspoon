import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Mail, Lock, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateEmail, validateFullName, validatePassword, checkEmailExists } from "@/utils/validation";
import FieldError from "@/components/form/FieldError";
import PasswordStrength from "@/components/form/PasswordStrength";
import { sessionManager } from "@/utils/sessionManager";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FormAlert from "@/components/feedback/FormAlert";
import SuccessAnimation from "@/components/feedback/SuccessAnimation";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    checkExistingSession();

    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const checkExistingSession = async () => {
    try {
      const user = await User.me();
      if (user) {
        navigate(redirectTo);
      }
    } catch (err) {
      console.log("No existing session");
    }
  };

  const handleEmailBlur = async () => {
    setFieldTouched({ ...fieldTouched, email: true });

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setFieldErrors({ ...fieldErrors, email: validation.errors[0] });
      return;
    }

    const tabElement = document.querySelector('[data-state="active"]');
    const isSignUpTab = tabElement?.textContent?.includes('Sign Up');

    if (isSignUpTab) {
      setIsCheckingEmail(true);
      const emailCheck = await checkEmailExists(validation.sanitized);
      setIsCheckingEmail(false);

      if (emailCheck.exists) {
        setFieldErrors({ ...fieldErrors, email: 'This email is already registered. Please sign in instead.' });
      } else {
        setFieldErrors({ ...fieldErrors, email: null });
      }
    } else {
      setFieldErrors({ ...fieldErrors, email: null });
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (fieldTouched.email) {
      const validation = validateEmail(newEmail);
      if (!validation.isValid) {
        setFieldErrors({ ...fieldErrors, email: validation.errors[0] });
      } else {
        setFieldErrors({ ...fieldErrors, email: null });
      }
    }
  };

  const handleFullNameBlur = () => {
    setFieldTouched({ ...fieldTouched, fullName: true });

    const validation = validateFullName(fullName);
    if (!validation.isValid) {
      setFieldErrors({ ...fieldErrors, fullName: validation.errors[0] });
    } else {
      setFieldErrors({ ...fieldErrors, fullName: null });
    }
  };

  const handleFullNameChange = (e) => {
    const newName = e.target.value;
    setFullName(newName);

    if (fieldTouched.fullName) {
      const validation = validateFullName(newName);
      if (!validation.isValid) {
        setFieldErrors({ ...fieldErrors, fullName: validation.errors[0] });
      } else {
        setFieldErrors({ ...fieldErrors, fullName: null });
      }
    }
  };

  const handlePasswordBlur = () => {
    setFieldTouched({ ...fieldTouched, password: true });

    const validation = validatePassword(password);
    setPasswordStrength(validation.strength);

    if (!validation.isValid) {
      setFieldErrors({ ...fieldErrors, password: validation.errors[0] });
    } else {
      setFieldErrors({ ...fieldErrors, password: null });
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const validation = validatePassword(newPassword);
    setPasswordStrength(validation.strength);

    if (fieldTouched.password) {
      if (!validation.isValid) {
        setFieldErrors({ ...fieldErrors, password: validation.errors[0] });
      } else {
        setFieldErrors({ ...fieldErrors, password: null });
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError("");

    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const redirectParams = new URLSearchParams();
      if (redirectTo && redirectTo !== '/') {
        redirectParams.set('redirect', redirectTo);
      }
      const finalRedirect = redirectParams.toString()
        ? `${callbackUrl}?${redirectParams.toString()}`
        : callbackUrl;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: finalRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile'
        }
      });

      if (error) {
        if (error.message.includes('Provider') || error.message.includes('not enabled') || error.message.includes('disabled')) {
          throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not yet configured. Please contact support or use email/password instead.`);
        }
        throw error;
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      let errorMessage = err.message;

      if (errorMessage && (errorMessage.includes('not enabled') || errorMessage.includes('disabled') || errorMessage.includes('Provider'))) {
        errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not configured yet. Please sign in with email/password instead.`;
      }

      setError(errorMessage || `Failed to sign in with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setFieldErrors({ email: emailValidation.errors[0] });
      setError("Please fix the errors below");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setFieldErrors({ password: "Password is required" });
      setError("Please fix the errors below");
      setIsLoading(false);
      return;
    }

    try {
      await User.signIn(emailValidation.sanitized, password);

      await sessionManager.initializeSession(rememberMe);

      navigate(redirectTo);
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    setFieldErrors({});

    const nameValidation = validateFullName(fullName);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const errors = {};

    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.errors[0];
    }

    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors[0];
    } else {
      setIsCheckingEmail(true);
      const emailCheck = await checkEmailExists(emailValidation.sanitized);
      setIsCheckingEmail(false);

      if (emailCheck.exists) {
        errors.email = 'This email is already registered. Please sign in instead.';
      }
    }

    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailValidation.sanitized,
        password,
        options: {
          data: {
            full_name: nameValidation.sanitized
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccessMessage("Account created successfully! Signing you in...");

        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBackToOrder = () => {
    navigate('/');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const emailValidation = validateEmail(resetEmail);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      setIsLoading(false);
      return;
    }

    try {
      await User.resetPasswordForEmail(emailValidation.sanitized);
      setResetSent(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to send password reset email. Please try again.");
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coffee className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">Ladle & Spoon</h1>
            </div>
            <p className="text-gray-600">Forgot Your Password?</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{resetSent ? "Check Your Email" : "Reset Password"}</CardTitle>
              <CardDescription>
                {resetSent
                  ? "We've sent a password reset link to your email address."
                  : "Enter your email address and we'll send you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSent ? (
                <div className="space-y-4">
                  <SuccessAnimation
                    message="Email sent successfully!"
                    subMessage="Check your inbox for a password reset link. The link will expire in 1 hour."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                      setResetEmail("");
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <FormAlert variant="error" message={error} />
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setError("");
                      }}
                      className="text-sm text-orange-600 hover:text-orange-700"
                      disabled={isLoading}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
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
          <p className="text-gray-600">Sign in for faster checkout</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full gap-2 h-12"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={handleEmailBlur}
                          className={`pl-10 ${fieldErrors.email ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      <FieldError error={fieldErrors.email} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={handlePasswordChange}
                          onBlur={handlePasswordBlur}
                          className={`pl-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      <FieldError error={fieldErrors.password} />
                    </div>

                    {error && (
                      <FormAlert variant="error" message={error} />
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Remember me for 30 days
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setError("");
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700"
                        disabled={isLoading}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={handleFullNameChange}
                        onBlur={handleFullNameBlur}
                        className={fieldErrors.fullName ? 'border-red-500' : ''}
                        disabled={isLoading}
                      />
                      <FieldError error={fieldErrors.fullName} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={handleEmailBlur}
                          className={`pl-10 ${fieldErrors.email ? 'border-red-500' : ''}`}
                          disabled={isLoading || isCheckingEmail}
                        />
                      </div>
                      {isCheckingEmail && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <span className="animate-spin">⏳</span> Checking email...
                        </p>
                      )}
                      <FieldError error={fieldErrors.email} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={handlePasswordChange}
                          onBlur={handlePasswordBlur}
                          className={`pl-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
                          disabled={isLoading}
                        />
                      </div>
                      <PasswordStrength strength={passwordStrength} password={password} />
                      <FieldError error={fieldErrors.password} />
                      <p className="text-xs text-gray-500">Password must be at least 8 characters with uppercase, lowercase, and numbers</p>
                    </div>

                    {error && (
                      <FormAlert variant="error" message={error} />
                    )}

                    {successMessage && (
                      <FormAlert variant="success" message={successMessage} />
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-6">
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={handleBackToOrder}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Order
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
