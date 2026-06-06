/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { Logo } from './Logo';

interface SuccessViewProps {
  lang: Language;
  referenceId: string;
  onReset: () => void;
}

export default function SuccessView({ lang, referenceId, onReset }: SuccessViewProps) {
  const t = translations[lang];
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="w-full max-w-[560px] mx-auto bg-[var(--card-bg)] rounded-2xl p-8 md:p-10 border border-[var(--border-color)] shadow-[0_10px_35px_rgba(0,0,0,0.3)] text-center select-none animate-scale-up"
      id="success-card-outer"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Brand Logo */}
      <div className="flex justify-center mb-6" id="success-logo-wrapper" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
        <Logo size="md" />
      </div>

      {/* Large Green Checkmark */}
      <div className="flex justify-center mb-6" id="success-checkmark-wrapper">
        <CheckCircle2 
          className="w-16 h-16 text-[#22C55E] drop-shadow-[0_4px_12px_rgba(34,197,94,0.2)] animate-pulse"
          id="success-checkmark-icon"
        />
      </div>

      {/* Title */}
      <h2 
        className="text-2xl md:text-3xl font-extrabold text-white font-serif"
        id="success-title-header"
      >
        {t.successTitle}
      </h2>

      {/* Reference ID Container */}
      <div 
        className="mt-6 p-4 bg-[var(--sidebar-bg)] rounded-xl border border-[var(--border-color)] flex flex-col items-center gap-1.5 cursor-pointer hover:bg-[var(--card-bg-hover)] transition-colors"
        onClick={handleCopy}
        title="Copy ID"
        id="success-ref-container"
      >
        <span className="text-xs text-[var(--secondary-text)]/75 font-medium font-sans">
          {t.orderNo}
        </span>
        <div className="flex items-center gap-2" id="success-ref-inline">
          <span className="text-lg md:text-xl font-mono font-extrabold text-[var(--accent-gold)]" id="success-ref-text">
            {referenceId}
          </span>
          <button 
            type="button" 
            className="text-[var(--secondary-text)]/50 hover:text-white p-1"
          >
            {copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <p 
        className="mt-6 text-sm text-[var(--secondary-text)] leading-relaxed font-sans max-w-[380px] mx-auto"
        id="success-subtitle-text"
      >
        {t.successSubtitle}
      </p>

      {/* CTA Button */}
      <div className="mt-8" id="success-cta-wrapper">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-[#E8703A] hover:bg-[#D4622E] text-white rounded-full font-bold text-sm cursor-pointer transition-all shadow-md transform hover:scale-[1.03]"
          id="btn-success-reset"
        >
          {t.submitAnother}
        </button>
      </div>
    </div>
  );
}
