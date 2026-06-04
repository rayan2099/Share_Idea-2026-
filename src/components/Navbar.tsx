/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Navbar({ lang, onToggleLang, currentPath, onNavigate }: NavbarProps) {
  const t = translations[lang];

  return (
    <nav className="w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between relative z-30" id="top-navbar" dir="ltr">
      {/* Left: Logo Section */}
      <div 
        className="flex items-center gap-3 cursor-pointer select-none bg-transparent" 
        onClick={() => onNavigate('/')}
        id="navbar-logo-container"
      >
        <svg 
          width="28" 
          height="30" 
          viewBox="0 0 130 140" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="select-none bg-transparent"
          id="navbar-logo-lightbulb"
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
        <div className="flex flex-col items-start leading-none" id="navbar-logo-text-box">
          <span className="text-[#F59E0B] font-bold text-xl tracking-tight" id="navbar-brand-name">
            {translations[lang].brandName}
          </span>
          <span 
            className="text-[#F59E0B] text-[10px] font-bold tracking-[0.2em] uppercase font-mono mt-0.5" 
            style={{ fontVariant: 'small-caps' }}
            id="navbar-brand-subtitle"
          >
            {translations[lang].brandSubtitle}
          </span>
        </div>
      </div>

      {/* Right: Navigation Controls */}
      <div className="flex items-center gap-6 md:gap-8 animate-fade-in" id="navbar-controls-container">
        {/* Admin Link */}
        <button
          onClick={() => {
            if (currentPath.startsWith('/admin')) {
              onNavigate('/');
            } else {
              onNavigate('/admin/login');
            }
          }}
          className="text-white/90 hover:text-white font-medium text-sm transition-colors cursor-pointer"
          id="navbar-admin-link"
        >
          <span>{currentPath.startsWith('/admin') ? (lang === 'ar' ? 'الرئيسية' : 'Home') : t.adminLink}</span>
        </button>

        {/* Language Switch Toggle */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-2 text-white/90 hover:text-white border border-white/20 px-3.5 py-1.5 rounded-md transition-all text-xs font-bold leading-none bg-transparent hover:bg-white/5 cursor-pointer"
          id="navbar-language-toggle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="text-sm font-bold">{lang === 'ar' ? 'EN' : 'AR'}</span>
        </button>
      </div>
    </nav>
  );
}
