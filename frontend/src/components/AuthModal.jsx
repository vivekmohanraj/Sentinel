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

const AuthModal = ({ isOpen, onClose, initialSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(null);

  const [formData, setFormData] = useState({
    loginIdentifier: '', // Username or Work Email for Sign In
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isSignUp) {
      if (!formData.loginIdentifier.trim()) {
        newErrors.loginIdentifier = 'Username or Email is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Work email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid work email address';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
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

    // Simulate backend authentication lifecycle
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className={`relative w-full ${
          isSignUp ? 'max-w-[720px]' : 'max-w-[540px]'
        } bg-[#171717] rounded-[16px] border border-[#262626] shadow-2xl overflow-hidden p-6 md:p-8 my-auto text-[#EDEDED] transition-all duration-300`}
      >
        {/* Close Modal CTA */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 h-12 w-12 flex items-center justify-center text-[#A0A0A0] hover:text-[#EDEDED] rounded-[8px] hover:bg-[#1F1F1F] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
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

        {/* Success Alert */}
        {authSuccess && (
          <div className="mb-6 p-4 rounded-[8px] bg-[#0D2D29] border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center gap-3 text-[16px]">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Social Fast-Auth Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            className="h-12 px-4 rounded-[8px] bg-[#1F1F1F] border border-[#262626] hover:border-[#333333] hover:bg-[#262626] text-[#EDEDED] font-medium text-[16px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {/* Custom SVG Google Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.1 8.8 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.3-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 10.9 0 12.5s.6 3.1 1.6 5.1l3.7-2.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.1-6.7-5.1L1.6 17c1.9 3.8 5.8 7 10.4 7z"
              />
            </svg>
            <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>
          <button
            type="button"
            className="h-12 px-4 rounded-[8px] bg-[#1F1F1F] border border-[#262626] hover:border-[#333333] hover:bg-[#262626] text-[#EDEDED] font-medium text-[16px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {/* GitHub Octocat SVG */}
            <svg className="w-5 h-5 shrink-0 fill-current text-[#EDEDED]" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>{isSignUp ? 'Sign up with GitHub' : 'Continue with GitHub'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-[#262626]"></div>
          <span className="text-[14px] font-semibold tracking-wider text-[#A0A0A0] uppercase">
            {isSignUp ? 'OR WITH EMAIL' : 'OR'}
          </span>
          <div className="flex-1 border-t border-[#262626]"></div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isSignUp ? (
            /* --- STATE A: SIGN IN VIEW --- */
            <>
              {/* Username or Work Email */}
              <div>
                <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                  Username or Work Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.loginIdentifier}
                    onChange={(e) => handleChange('loginIdentifier', e.target.value)}
                    placeholder="username or email@organization.local"
                    className={`w-full h-12 px-4 pr-11 rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none transition-colors ${
                      errors.loginIdentifier
                        ? 'border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]'
                        : 'border-[#262626] focus:border-accent'
                    }`}
                  />
                  {errors.loginIdentifier && (
                    <div className="absolute right-3 pointer-events-none flex items-center">
                      <AlertCircle className="w-5 h-5 text-[#ffb4ab]" />
                    </div>
                  )}
                </div>
                {renderError('loginIdentifier')}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full h-12 px-4 pr-20 rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none transition-colors ${
                      errors.password
                        ? 'border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]'
                        : 'border-[#262626] focus:border-accent'
                    }`}
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {errors.password && (
                      <AlertCircle className="w-5 h-5 text-[#ffb4ab] mr-1" />
                    )}
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
            /* --- STATE B: SIGN UP / REGISTRATION VIEW --- */
            <>
              {/* Row 1: First Name & Last Name */}
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
                      placeholder="Alex"
                      className={`w-full h-12 px-4 pr-11 rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none transition-colors ${
                        errors.firstName
                          ? 'border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]'
                          : 'border-[#262626] focus:border-accent'
                      }`}
                    />
                    {errors.firstName && (
                      <div className="absolute right-3 pointer-events-none flex items-center">
                        <AlertCircle className="w-5 h-5 text-[#ffb4ab]" />
                      </div>
                    )}
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
                      placeholder="Mercer"
                      className={`w-full h-12 px-4 pr-11 rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none transition-colors ${
                        errors.lastName
                          ? 'border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]'
                          : 'border-[#262626] focus:border-accent'
                      }`}
                    />
                    {errors.lastName && (
                      <div className="absolute right-3 pointer-events-none flex items-center">
                        <AlertCircle className="w-5 h-5 text-[#ffb4ab]" />
                      </div>
                    )}
                  </div>
                  {renderError('lastName')}
                </div>
              </div>

              {/* Row 2: Work Email & Username */}
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
                      placeholder="admin@organization.local"
                      className={`w-full h-12 px-4 pr-11 rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]'
                          : 'border-[#262626] focus:border-accent'
                      }`}
                    />
                    {errors.email && (
                      <div className="absolute right-3 pointer-events-none flex items-center">
                        <AlertCircle className="w-5 h-5 text-[#ffb4ab]" />
                      </div>
                    )}
                  </div>
                  {renderError('email')}
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-[#EDEDED] mb-1.5">
                    Username <span className="text-xs text-[#A0A0A0] font-normal">(Optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="amercer_dev"
                      className="w-full h-12 px-4 rounded-[8px] bg-[#111111] border border-[#262626] text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
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
                      placeholder="••••••••••••"
                      className={`w-full h-12 px-4 pr-14 rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none transition-colors ${
                        errors.password
                          ? 'border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]'
                          : 'border-[#262626] focus:border-accent'
                      }`}
                    />
                    <div className="absolute right-1 flex items-center">
                      {errors.password && (
                        <AlertCircle className="w-5 h-5 text-[#ffb4ab] mr-1" />
                      )}
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
                      placeholder="••••••••••••"
                      className={`w-full h-12 px-4 pr-14 rounded-[8px] bg-[#111111] border text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none transition-colors ${
                        errors.confirmPassword
                          ? 'border-[#ffb4ab] text-[#ffb4ab] focus:border-[#ffb4ab]'
                          : 'border-[#262626] focus:border-accent'
                      }`}
                    />
                    <div className="absolute right-1 flex items-center">
                      {errors.confirmPassword && (
                        <AlertCircle className="w-5 h-5 text-[#ffb4ab] mr-1" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="h-10 w-10 flex items-center justify-center text-[#A0A0A0] hover:text-[#EDEDED] rounded-[8px] transition-colors"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {renderError('confirmPassword')}
                </div>
              </div>

              {/* Row 4: Access Role & Phone Number */}
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
                  <p className="mt-1 text-[12px] text-[#A0A0A0]">
                    Strictly enforced under Goodhart&apos;s Law.
                  </p>
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
                      placeholder="+1 (555) 019-2834"
                      className="w-full h-12 px-4 rounded-[8px] bg-[#111111] border border-[#262626] text-[16px] text-[#EDEDED] placeholder-[#A0A0A0] focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Primary CTA Button */}
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

        {/* Footer Toggle */}
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
