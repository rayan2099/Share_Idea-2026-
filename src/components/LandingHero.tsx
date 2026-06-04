/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface LandingHeroProps {
  lang: Language;
  onStart: () => void;
  submissionsCount?: number;
}

export default function LandingHero({ lang, onStart, submissionsCount = 500 }: LandingHeroProps) {
  const t = translations[lang];

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-20 relative z-10 selection:bg-orange-500 selection:text-white"
      id="landing-hero-container"
    >
      {/* Large Hero Icon */}
      <div className="mb-6" id="hero-pulse-wrapper">
        <svg 
          width="130" 
          height="140" 
          viewBox="0 0 130 140" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="select-none bg-transparent"
          id="hero-lightbulb-svg"
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
      </div>

      {/* Headline */}
      <h1 
        className="text-white text-4xl md:text-[56px] font-extrabold leading-tight mb-6 drop-shadow-sm tracking-tight max-w-4xl"
        id="hero-title-text"
      >
        {t.heroTitle}
      </h1>

      {/* Subtitle */}
      <p 
        className="text-white/90 text-[15px] md:text-[17px] max-w-[640px] leading-relaxed mb-12 font-light font-sans"
        id="hero-description-text"
      >
        {t.heroSubtitle}
      </p>

      {/* CTA Button */}
      <div className="mb-12 z-10" id="hero-cta-wrapper">
        <button
          onClick={onStart}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-10 py-4 rounded-full text-base md:text-xl font-bold flex items-center gap-4 shadow-2xl transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
          id="hero-start-cta-button"
        >
          <span>{lang === 'ar' ? 'ابدأ الآن' : 'Start Now'}</span>
          <span className="flex items-center justify-center bg-white/20 rounded-full p-1">
            <svg 
              className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${lang === 'ar' ? 'rotate-180' : 'rotate-0'}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 12H3m14-4l4 4-4 4" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
