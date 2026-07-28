import React, { useState } from 'react';
import {
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { z } from 'zod';

// --- ZOD LIVE VALIDATION SCHEMAS ---

const firstNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'First name is required and cannot be empty.' });

const lastNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Last name is required and cannot be empty.' });

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Work email is required.' })
  .email({ message: 'Please enter a valid work email address (e.g., user@company.com).' });

const usernameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Username is required.' })
  .refine((val) => !/\s/.test(val), {
    message: 'Username cannot contain any spaces.'
  })
  .refine((val) => !/[A-Z]/.test(val), {
    message: 'Username must be in small lowercase letters only.'
  })
  .refine((val) => /^[a-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(val), {
    message: 'Only lowercase letters, numbers, and special symbols are allowed.'
  });

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .max(16, { message: 'Password cannot exceed 16 characters.' })
  .refine((val) => !/\s/.test(val), {
    message: 'Password cannot contain any whitespace.'
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Must include at least one lowercase letter (a-z).'
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Must include at least one uppercase letter (A-Z).'
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Must include at least one number (0-9).'
  })
  .refine((val) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(val), {
    message: 'Must include at least one special symbol (!@#$% etc.).'
  });

const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || /^[6789]\d{9}$/.test(val),
    {
      message: 'Phone number must be exactly 10 digits starting with 6, 7, 8, or 9.'
    }
  );

const AuthModal = ({ isOpen, onClose, initialSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(null);

  const [formData, setFormData] = useState({
    loginIdentifier: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Engineering Manager (Project owner)'
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateSingleField = (field, val, currentData, signUpMode) => {
    if (!signUpMode) {
      if (field === 'loginIdentifier') {
        const res = z.string().trim().min(1, { message: 'Username or work email is required.' }).safeParse(val);
        return res.success ? null : res.error.issues[0].message;
      }
      if (field === 'password') {
        const res = z.string().min(1, { message: 'Password is required.' }).safeParse(val);
        return res.success ? null : res.error.issues[0].message;
      }
      return null;
    }

    if (field === 'firstName') {
      const res = firstNameSchema.safeParse(val);
      return res.success ? null : res.error.issues[0].message;
    }
    if (field === 'lastName') {
      const res = lastNameSchema.safeParse(val);
      return res.success ? null : res.error.issues[0].message;
    }
    if (field === 'email') {
      const res = emailSchema.safeParse(val);
      return res.success ? null : res.error.issues[0].message;
    }
    if (field === 'username') {
      const res = usernameSchema.safeParse(val);
      return res.success ? null : res.error.issues[0].message;
    }
    if (field === 'phone') {
      const res = phoneSchema.safeParse(val);
      return res.success ? null : res.error.issues[0].message;
    }
    if (field === 'password') {
      const res = passwordSchema.safeParse(val);
      return res.success ? null : res.error.issues[0].message;
    }
    if (field === 'confirmPassword') {
      if (!val) return 'Please confirm your password.';
      if (val !== currentData.password) return 'Passwords do not match.';
      return null;
    }
    return null;
  };

  const handleChange = (field, rawValue) => {
    let value = rawValue;

    if (field === 'firstName' || field === 'lastName') {
      value = value.replace(/^\s+/, '');
    } else if (field === 'username') {
      value = value.replace(/\s+/g, '');
    } else if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    const nextData = { ...formData, [field]: value };
    setFormData(nextData);

    const errorMsg = validateSingleField(field, value, nextData, isSignUp);
    setErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[field] = errorMsg;
      } else {
        delete next[field];
      }

      if (isSignUp && field === 'password' && nextData.confirmPassword) {
        if (nextData.confirmPassword !== value) {
          next.confirmPassword = 'Passwords do not match.';
        } else {
          delete next.confirmPassword;
        }
      }
      return next;
    });
  };

  const handleBlur = (field) => {
    if (typeof formData[field] === 'string') {
      const trimmed = formData[field].trim();
      if (trimmed !== formData[field]) {
        handleChange(field, trimmed);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isSignUp) {
      const idRes = z.string().trim().min(1, { message: 'Username or work email is required.' }).safeParse(formData.loginIdentifier);
      if (!idRes.success) newErrors.loginIdentifier = idRes.error.issues[0].message;

      const pwdRes = z.string().min(1, { message: 'Password is required.' }).safeParse(formData.password);
      if (!pwdRes.success) newErrors.password = pwdRes.error.issues[0].message;
    } else {
      const fnRes = firstNameSchema.safeParse(formData.firstName);
      if (!fnRes.success) newErrors.firstName = fnRes.error.issues[0].message;

      const lnRes = lastNameSchema.safeParse(formData.lastName);
      if (!lnRes.success) newErrors.lastName = lnRes.error.issues[0].message;

      const emRes = emailSchema.safeParse(formData.email);
      if (!emRes.success) newErrors.email = emRes.error.issues[0].message;

      const unRes = usernameSchema.safeParse(formData.username);
      if (!unRes.success) newErrors.username = unRes.error.issues[0].message;

      const phRes = phoneSchema.safeParse(formData.phone);
      if (!phRes.success) newErrors.phone = phRes.error.issues[0].message;

      const pwdRes = passwordSchema.safeParse(formData.password);
      if (!pwdRes.success) newErrors.password = pwdRes.error.issues[0].message;

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthSuccess(null);

    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(
        isSignUp
          ? 'Account created successfully! Establishing workspace...'
          : 'Authenticated successfully! Redirecting to dashboard...'
      );
      setTimeout(() => {
        setAuthSuccess(null);
        onClose();
      }, 1500);
    }, 1200);
  };

  const switchMode = (targetSignUp) => {
    setIsSignUp(targetSignUp);
    setErrors({});
    setAuthSuccess(null);
  };

  const renderError = (field) => {
    if (!errors[field]) return null;
    return (
      <p className="mt-1 text-[#ffb4ab] text-[14px] flex items-center gap-1.5 font-medium">
        {errors[field]}
      </p>
    );
  };

  const renderValidationIcon = (field) => {
    if (errors[field]) {
      return (
        <AlertCircle className="w-5 h-5 text-[#ffb4ab] shrink-0 pointer-events-none" />
      );
    }
    if (formData[field] && !errors[field]) {
      return (
        <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] shrink-0 pointer-events-none" />
      );
    }
    return null;
  };

  const getInputClass = (field, prClass = 'pr-11') => {
    const base = `w-full h-12 px-4 ${prClass} rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] focus:outline-none transition-colors`;
    if (errors[field]) {
      return `${base} border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab]`;
    }
    return `${base} border-[#262626] focus:border-accent`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className={`relative w-full ${
          isSignUp ? 'max-w-[720px]' : 'max-w-[540px]'
        } bg-[#171717] rounded-[16px] border border-[#262626] shadow-2xl overflow-hidden p-6 md:p-8 my-auto text-[#EDEDED] transition-all duration-300`}
      >
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 h-12 w-12 flex items-center justify-center text-[#A0A0A0] hover:text-[#EDEDED] rounded-[8px] hover:bg-[#1F1F1F] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <h2 className="font-headline-md text-[24px] font-bold text-[#EDEDED]">
            {isSignUp ? 'Create your Sentinel Account' : 'Sign in to Sentinel'}
          </h2>
          <p className="text-[16px] text-[#A0A0A0] max-w-[420px] mx-auto leading-relaxed">
            {isSignUp
              ? 'Establish your team workspace and role permissions.'
              : 'Access your localized engineering intelligence dashboard.'}
          </p>
        </div>

        {authSuccess && (
          <div className="mb-6 p-4 rounded-[8px] bg-[#0D2D29] border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center gap-3 text-[16px]">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            className="h-12 px-4 rounded-[8px] bg-[#1F1F1F] border border-[#262626] hover:border-[#333333] hover:bg-[#262626] text-[#EDEDED] font-medium text-[16px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0 fill-current text-[#EDEDED]" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>
          <button
            type="button"
            className="h-12 px-4 rounded-[8px] bg-[#1F1F1F] border border-[#262626] hover:border-[#333333] hover:bg-[#262626] text-[#EDEDED] font-medium text-[16px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0 fill-current text-[#EDEDED]" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>{isSignUp ? 'Sign up with GitHub' : 'Continue with GitHub'}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-[#262626]"></div>
          <span className="text-[14px] font-semibold tracking-wider text-[#A0A0A0] uppercase">
            {isSignUp ? 'OR WITH EMAIL' : 'OR'}
          </span>
          <div className="flex-1 border-t border-[#262626]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isSignUp ? (
            <>
              <div>
                <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                  Username or Work Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.loginIdentifier}
                    onChange={(e) => handleChange('loginIdentifier', e.target.value)}
                    onBlur={() => handleBlur('loginIdentifier')}
                    className={getInputClass('loginIdentifier')}
                  />
                  <div className="absolute right-3 flex items-center">
                    {renderValidationIcon('loginIdentifier')}
                  </div>
                </div>
                {renderError('loginIdentifier')}
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={getInputClass('password', 'pr-20')}
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {renderValidationIcon('password')}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-10 w-10 flex items-center justify-center text-[#A0A0A0] hover:text-[#EDEDED] rounded-[8px] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {renderError('password')}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    First Name <span className="text-accent">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      onBlur={() => handleBlur('firstName')}
                      className={getInputClass('firstName')}
                    />
                    <div className="absolute right-3 flex items-center">
                      {renderValidationIcon('firstName')}
                    </div>
                  </div>
                  {renderError('firstName')}
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    Last Name <span className="text-accent">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      onBlur={() => handleBlur('lastName')}
                      className={getInputClass('lastName')}
                    />
                    <div className="absolute right-3 flex items-center">
                      {renderValidationIcon('lastName')}
                    </div>
                  </div>
                  {renderError('lastName')}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    Work Email <span className="text-accent">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={getInputClass('email')}
                    />
                    <div className="absolute right-3 flex items-center">
                      {renderValidationIcon('email')}
                    </div>
                  </div>
                  {renderError('email')}
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    Username <span className="text-accent">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className={getInputClass('username')}
                    />
                    <div className="absolute right-3 flex items-center">
                      {renderValidationIcon('username')}
                    </div>
                  </div>
                  {renderError('username')}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    Password <span className="text-accent">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={getInputClass('password', 'pr-20')}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      {renderValidationIcon('password')}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-10 w-10 flex items-center justify-center text-[#A0A0A0] hover:text-[#EDEDED] rounded-[8px] transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {renderError('password')}
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    Confirm Password <span className="text-accent">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={getInputClass('confirmPassword', 'pr-20')}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      {renderValidationIcon('confirmPassword')}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="h-10 w-10 flex items-center justify-center text-[#A0A0A0] hover:text-[#EDEDED] rounded-[8px] transition-colors"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {renderError('confirmPassword')}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="block text-[16px] font-medium text-[#EDEDED]">
                      Access Role
                    </label>
                    <div
                      className="group relative flex items-center cursor-help"
                      title="Strictly enforced to protect against metric distortion under Goodhart's Law."
                    >
                      <HelpCircle className="w-4 h-4 text-[#A0A0A0] hover:text-accent transition-colors" />
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block w-64 p-2 bg-[#1F1F1F] border border-[#333333] rounded-[6px] text-[13px] text-[#EDEDED] shadow-xl z-50 pointer-events-none leading-snug">
                        Strictly enforced to protect against metric distortion under Goodhart&apos;s Law.
                      </div>
                    </div>
                  </div>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full h-12 px-4 rounded-[8px] bg-[#111111] border border-[#262626] text-[16px] text-[#EDEDED] focus:outline-none focus:border-accent transition-colors cursor-pointer"
                  >
                    <option value="Engineering Manager (Project owner)">
                      Engineering Manager (Project owner)
                    </option>
                    <option value="Software Engineer (Developer)">
                      Software Engineer (Developer)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    Phone Number <span className="text-xs text-[#A0A0A0] font-normal">(Optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={getInputClass('phone')}
                    />
                    <div className="absolute right-3 flex items-center">
                      {renderValidationIcon('phone')}
                    </div>
                  </div>
                  {renderError('phone')}
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 px-4 rounded-[8px] bg-[#EDEDED] text-[#0A0A0A] font-semibold text-[16px] hover:bg-white active:scale-[0.98] transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{isSignUp ? 'Create Account' : 'Authenticate'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-[#262626] pt-4">
          <button
            type="button"
            onClick={() => switchMode(!isSignUp)}
            className="text-[16px] text-[#A0A0A0] hover:text-[#EDEDED] transition-colors font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create your account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
