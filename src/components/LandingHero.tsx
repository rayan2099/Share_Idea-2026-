/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Logo } from './Logo';
import { motion } from 'motion/react';

interface LandingHeroProps {
  lang: Language;
  onStart: () => void;
  submissionsCount?: number;
}

export default function LandingHero({ lang, onStart, submissionsCount = 500 }: LandingHeroProps) {
  const t = translations[lang];

  return (
    <section 
      style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'calc(4vh + 60px) 24px 40px',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
      id="landing-hero-container"
    >
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0',
          maxWidth: '680px',
          width: '100%',
          marginTop: '10px',
        }}
        id="hero-content-group"
      >
        {/* Logo */}
        <Logo size="lg" className="select-none mb-8" />

        {/* Headline */}
        <motion.h1 
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            margin: '16px 0 28px 0',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: '800',
            color: '#FFFFFF',
            fontFamily: 'Tajawal, sans-serif',
            lineHeight: '1.4',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            wordSpacing: '0.15em',
            display: 'inline-block',
          }}
          id="hero-title-text"
        >
          {t.heroTitle}
        </motion.h1>

        {/* Subtitle */}
        <p 
          style={{
            margin: '0 0 40px 0',
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: '1.8',
            fontFamily: 'Tajawal, sans-serif',
            maxWidth: '560px',
          }}
          id="hero-description-text"
        >
          {t.heroSubtitle}
        </p>

        {/* CTA Button */}
        <div className="z-10" id="hero-cta-wrapper">
          <button
            onClick={onStart}
            className="bg-[#E8703A] hover:bg-[#D4622E] text-white px-10 py-4 rounded-full text-base md:text-xl font-bold flex items-center gap-4 shadow-2xl transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
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
    </section>
  );
}
