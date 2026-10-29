import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { authService } from '../../services/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard steps: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Resend OTP countdown
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (currentStep === 2 && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, resendTimer]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setSubmitting(true);
    try {
      await authService.requestOtp(email.trim(), 'PASSWORD_RESET');
      setSuccessMessage('An OTP has been dispatched to your email address.');
      setResendTimer(30);
      setCanResend(false);
      setCurrentStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to request OTP. Please check your email.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!otpCode.trim()) {
      setErrors({ otpCode: 'Please enter the 6-digit OTP' });
      return;
    }
    if (otpCode.trim().length < 4) {
      setErrors({ otpCode: 'OTP must be valid' });
      return;
    }

    setSubmitting(true);
    try {
      await authService.verifyOtp(email.trim(), otpCode.trim(), 'PASSWORD_RESET');
      setSuccessMessage('OTP verified successfully. Set your new password.');
      setCurrentStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend || submitting) return;
    setApiError('');
    setSubmitting(true);
    try {
      await authService.requestOtp(email.trim(), 'PASSWORD_RESET');
      setSuccessMessage('A fresh OTP has been sent.');
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otpCode: otpCode.trim(),
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      setCurrentStep(4);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Password reset failed. Please retry.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Verify Email' },
    { number: 2, title: 'Enter OTP' },
    { number: 3, title: 'New Password' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Branding */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-900 tracking-tight block">SDRRMS</span>
              <span className="text-xs text-slate-500 font-medium block -mt-1">Disaster Relief Portal</span>
            </div>
          </Link>
        </div>

        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Remember your credentials?{' '}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl">
          {/* Progress Indicator */}
          {currentStep <= 3 && (
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                {/* Connecting lines */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-0.5 bg-teal-700 transition-all duration-300 -z-0"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                  }}
                />

                {steps.map((s) => {
                  const isDone = currentStep > s.number;
                  const isActive = currentStep === s.number;
                  return (
                    <div key={s.number} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-teal-700 text-white'
                            : isActive
                            ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                      </div>
                      <span
                        className={`mt-1.5 text-[11px] font-semibold whitespace-nowrap ${
                          isActive ? 'text-teal-800' : isDone ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dev Mode OTP Hint Banner */}
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Dev Environment Notice: </span>
              <span>In test mode, OTP is </span>
              <code className="px-1.5 py-0.5 bg-amber-200/80 rounded font-mono font-bold text-amber-900">123456</code>.
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  className="ml-2 underline font-bold text-amber-800 hover:text-amber-950"
                >
                  Autofill 123456
                </button>
              )}
            </div>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800">Error</p>
                <p className="mt-0.5 text-xs text-rose-700">{apiError}</p>
              </div>
            </div>
          )}

          {/* Success Flash */}
          {successMessage && currentStep < 4 && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: Request OTP */}
          {currentStep === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                    placeholder="name@example.org"
                    className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-xl border ${
                      errors.email ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-teal-700 focus:border-teal-700'
                    } placeholder-slate-400 focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Enter the email address registered with your account. We will send you an OTP to verify your identity.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:opacity-60 transition-all hover:shadow"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="otpCode" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    One-Time Passcode (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-teal-700 hover:underline font-medium"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-5 h-5" />
                  </div>
                  <input
                    id="otpCode"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value);
                      if (errors.otpCode) setErrors({});
                    }}
                    placeholder="Enter 6-digit code"
                    className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm tracking-widest text-center font-mono text-lg rounded-xl border ${
                      errors.otpCode ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-teal-700 focus:border-teal-700'
                    } placeholder-slate-400 focus:outline-none focus:ring-2`}
                  />
                </div>
                {errors.otpCode && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.otpCode}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Code sent to <span className="font-semibold text-slate-700">{email}</span></span>
                  <button
                    type="button"
                    disabled={!canResend || submitting}
                    onClick={handleResendOtp}
                    className="text-teal-700 hover:text-teal-800 disabled:text-slate-400 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${submitting ? 'animate-spin' : ''}`} />
                    {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:opacity-60 transition-all hover:shadow"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {currentStep === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 h-5" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                    }}
                    placeholder="Min. 6 characters"
                    className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm rounded-xl border ${
                      errors.newPassword ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-teal-700 focus:border-teal-700'
                    } placeholder-slate-400 focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 h-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder="Repeat new password"
                    className={`block w-full pl-10 pr-10 py-2.5 sm:text-sm rounded-xl border ${
                      errors.confirmPassword ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-teal-700 focus:border-teal-700'
                    } placeholder-slate-400 focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:opacity-60 transition-all hover:shadow"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success State */}
          {currentStep === 4 && (
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successful!</h3>
              <p className="text-sm text-slate-600 mb-6">
                Your password has been changed. You can now use your new credentials to sign in.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
