/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { validateAdminLogin, getMainAdminCredentials } from '../dataStore';

interface AdminLoginProps {
  lang: Language;
  onLoginSuccess: (email: string, role: 'main' | 'moderator') => void;
  onBack: () => void;
}

export default function AdminLogin({ lang, onLoginSuccess, onBack }: AdminLoginProps) {
  const t = translations[lang];
  const mainCreds = getMainAdminCredentials();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = validateAdminLogin(email, password);
    if (res.success && res.email && res.role) {
      onLoginSuccess(res.email, res.role);
    } else {
      setErrorMessage(t.errorInvalidCreds);
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
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          {t.adminPortalBadge}
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-1" id="login-welcome-title">{t.welcomeBack}</h2>
        <p className="text-xs text-white/80 font-sans" id="login-welcome-subtitle">{t.loginSubtitle}</p>
      </div>

      {/* 2. Main Login White Card */}
      <div 
        className="bg-white rounded-2xl p-6 md:p-8 border-0 shadow-none text-right"
        id="login-card-box"
      >
        {/* Core Inside Logo Display */}
        <div className="flex flex-col items-center gap-2.5 mb-8" id="login-card-logo">
          <svg 
            width="54" 
            height="58" 
            viewBox="0 0 130 140" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="select-none bg-transparent"
            id="login-logo-lightbulb"
          >
            {/* Top spark */}
            <line x1="65" y1="2" x2="65" y2="14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            {/* Top-right spark */}
            <line x1="96" y1="10" x2="88" y2="18" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            {/* Top-left spark */}
            <line x1="34" y1="10" x2="42" y2="18" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            {/* Right spark */}
            <line x1="112" y1="42" x2="100" y2="42" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            {/* Left spark */}
            <line x1="18" y1="42" x2="30" y2="42" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>

            {/* Main bulb circle — large and clear */}
            <circle cx="65" cy="52" r="32" stroke="#F59E0B" strokeWidth="3" fill="none"/>

            {/* Filament inside — wavy line like original */}
            <path d="M50 52 C54 44, 58 60, 65 52 C72 44, 76 60, 80 52" 
                  stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

            {/* Left side of neck connecting bulb to base */}
            <path d="M45 76 Q43 88 50 92" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"/>
            {/* Right side of neck */}
            <path d="M85 76 Q87 88 80 92" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"/>

            {/* Base lines (3 horizontal lines, getting shorter) */}
            <line x1="50" y1="92" x2="80" y2="92" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            <line x1="53" y1="101" x2="77" y2="101" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
            <line x1="56" y1="110" x2="74" y2="110" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <div className="text-center" id="login-logo-text-section">
            <span className="text-xl font-extrabold text-[#F59E0B] tracking-tight block" id="login-logo-title-ar">
              {translations[lang].brandName}
            </span>
            <span 
              className="text-[10px] tracking-[0.2em] text-[#F59E0B] font-bold block uppercase font-mono mt-0.5" 
              style={{ fontVariant: 'small-caps' }}
              id="login-logo-title-en"
            >
              {translations[lang].brandSubtitle}
            </span>
          </div>
        </div>

        {/* Login Title */}
        <h3 className="text-lg font-bold text-gray-800 text-center mb-6" id="login-form-heading">
          {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </h3>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5" id="login-form-body">
          {/* Email input */}
          <div className="flex flex-col gap-2" id="login-email-group">
            <label className="text-right text-xs font-bold text-gray-600" id="label-login-email">
              {t.email}
            </label>
            <div className="relative" id="input-login-email-container">
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ideaflow.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-[#D1D5DB] text-sm text-gray-800 focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-gray-300 text-left"
                style={{ direction: 'ltr' }}
                id="input-login-email"
              />
              <span className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 pointer-events-none" id="icon-login-email">
                <Mail className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Password Input with precise Right Eye Toggle */}
          <div className="flex flex-col gap-2" id="login-password-group">
            <label className="text-right text-xs font-bold text-gray-600" id="label-login-password">
              {t.password}
            </label>
            <div className="relative" id="input-login-password-container">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full py-3 rounded-lg border border-[#D1D5DB] text-sm text-gray-800 focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-gray-300 text-left"
                style={{ 
                  direction: 'ltr',
                  paddingLeft: '16px',
                  paddingRight: '44px' // No overlap with eye toggle on the right
                }}
                id="input-login-password"
              />
              {/* Left Padlock Icon / Right Eye Toggle dynamically structured */}
              <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none" id="icon-login-lock">
                <Lock className="w-4 h-4" />
              </span>

              {/* Eye icon positioned RIGHT side of input, with padding-right: 44px to prevent overlapping */}
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-0 px-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-shake" id="login-error-alert">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer mt-4"
            id="btn-login-submit"
          >
            {t.loginButton}
          </button>
        </form>

        {/* Credentials hints helpful block */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center font-mono select-all" id="login-hints-container">
          <span className="text-[10px] text-gray-400 block mb-1">CREDENTIALS DECK:</span>
          <code className="text-[11px] text-gray-500 block">{mainCreds.email} / {mainCreds.password}</code>
        </div>
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
