/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabaseService';
import { Logo } from './Logo';

interface AdminLoginProps {
  lang: Language;
  onLoginSuccess: (email: string, role: 'main' | 'moderator') => void;
  onBack: () => void;
}

export default function AdminLogin({ lang, onLoginSuccess, onBack }: AdminLoginProps) {
  const t = translations[lang];

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (authError || !authData.user) {
        setErrorMessage(t.errorInvalidCreds);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('email, role, is_active')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile || !profile.is_active) {
        await supabase.auth.signOut();
        setErrorMessage(lang === 'ar' ? 'هذا الحساب غير مصرح له بدخول لوحة الإدارة' : 'This account is not authorized for the admin portal');
        return;
      }

      onLoginSuccess(profile.email, profile.role as 'main' | 'moderator');
    } catch (err) {
      console.error('Supabase admin login failed:', err);
      setErrorMessage(t.errorInvalidCreds);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="w-full max-w-[460px] mx-auto py-10 px-4 md:px-0 text-center select-none"
      id="admin-login-wrapper"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* 1. Top Outside Card Badges */}
      <div className="mb-6 flex flex-col items-center gap-2" id="login-header-elements">
        <span 
          className="px-3.5 py-1.5 bg-[#4B5563]/30 border border-[#9CA3AF]/20 rounded-full text-[11px] font-bold text-white tracking-wide uppercase flex items-center gap-1.5 backdrop-blur-sm shadow-sm"
          id="login-pill-badge"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse" />
          {t.adminPortalBadge}
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-1 font-serif" id="login-welcome-title">{t.welcomeBack}</h2>
        <p className="text-xs text-[var(--secondary-text)]/90 font-sans" id="login-welcome-subtitle">{t.loginSubtitle}</p>
      </div>

      {/* 2. Main Login Styled Card */}
      <div 
        className="bg-[var(--card-bg)] rounded-2xl p-6 md:p-8 border border-[var(--border-color)] shadow-[0_10px_35px_rgba(0,0,0,0.3)] text-right"
        id="login-card-box"
      >
        {/* Core Inside Logo Display */}
        <div className="flex flex-col items-center justify-center mb-8" id="login-card-logo" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
          <Logo size="md" />
        </div>

        {/* Login Title */}
        <h3 className="text-lg font-bold text-white text-center mb-6 font-sans" id="login-form-heading">
          {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </h3>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5" id="login-form-body">
          {/* Email input */}
          <div className="flex flex-col gap-2" id="login-email-group">
            <label className="text-right text-xs font-bold text-[var(--secondary-text)]" id="label-login-email">
              {t.email}
            </label>
            <div className="relative" id="input-login-email-container">
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ideaflow.com"
                required
                className="w-full px-4 py-3 bg-[var(--sidebar-bg)] text-white text-sm border border-white/12 rounded-lg outline-none transition-all placeholder-white/20 text-left focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]/10"
                style={{ direction: 'ltr' }}
                id="input-login-email"
              />
              <span className="absolute inset-y-0 right-3.5 flex items-center text-white/30 pointer-events-none" id="icon-login-email">
                <Mail className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Password Input with precise Right Eye Toggle */}
          <div className="flex flex-col gap-2" id="login-password-group">
            <label className="text-right text-xs font-bold text-[var(--secondary-text)]" id="label-login-password">
              {t.password}
            </label>
            <div className="relative" id="input-login-password-container">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full py-3 bg-[var(--sidebar-bg)] text-white text-sm border border-white/12 rounded-lg outline-none transition-all placeholder-white/20 text-left focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]/10"
                style={{ 
                  direction: 'ltr',
                  paddingLeft: '44px',
                  paddingRight: '44px' // No overlap with eye toggle on the right
                }}
                id="input-login-password"
              />
              {/* Left Padlock Icon / Right Eye Toggle dynamically structured */}
              <span className="absolute inset-y-0 left-3.5 flex items-center text-white/30 pointer-events-none" id="icon-login-lock">
                <Lock className="w-4 h-4" />
              </span>

              {/* Eye icon positioned RIGHT side of input, with padding-right: 44px to prevent overlapping */}
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-0 px-3.5 flex items-center text-white/30 hover:text-white transition-colors cursor-pointer"
                id="btn-password-eye-toggle"
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-1.5 animate-shake" id="login-error-alert">
              <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#E8703A] hover:bg-[#D4622E] text-white rounded-full font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer mt-4"
            id="btn-login-submit"
          >
            {isLoading ? (lang === 'ar' ? 'جاري الدخول...' : 'Signing in...') : t.loginButton}
          </button>
        </form>
      </div>

      {/* 3. Outside Card Footer Information Text */}
      <p className="text-xs text-white/50 mt-6 font-sans" id="login-footer-warn">
        {t.adminWarning}
      </p>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-6 text-xs text-white/70 hover:text-white flex items-center gap-1 mx-auto bg-transparent border-0 cursor-pointer transition-colors"
        id="btn-login-back"
      >
        <span>{lang === 'ar' ? 'العودة للركن الرئيسي ←' : '← Back to main site'}</span>
      </button>
    </div>
  );
}
