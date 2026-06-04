/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

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
      className="w-full max-w-[560px] mx-auto bg-white rounded-2xl p-8 md:p-10 border-0 shadow-xl text-center select-none animate-scale-up"
      id="success-card-outer"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Large Green Checkmark */}
      <div className="flex justify-center mb-6" id="success-checkmark-wrapper">
        <CheckCircle2 
          className="w-20 h-20 text-[#10B981] drop-shadow-[0_4px_12px_rgba(16,185,129,0.2)] animate-bounce"
          style={{ animationDuration: '2s' }}
          id="success-checkmark-icon"
        />
      </div>

      {/* Title */}
      <h2 
        className="text-2xl md:text-3xl font-extrabold text-[#111827]"
        id="success-title-header"
      >
        {t.successTitle}
      </h2>

      {/* Reference ID Container */}
      <div 
        className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-orange-100/50 transition-colors"
        onClick={handleCopy}
        title="Copy ID"
        id="success-ref-container"
      >
        <span className="text-xs text-gray-400 font-medium font-sans">
          {t.orderNo}
        </span>
        <div className="flex items-center gap-2" id="success-ref-inline">
          <span className="text-lg md:text-xl font-mono font-extrabold text-[#F59E0B]" id="success-ref-text">
            {referenceId}
          </span>
          <button 
            type="button" 
            className="text-gray-400 hover:text-[#F3F4F6] p-1"
          >
            {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <p 
        className="mt-6 text-sm text-gray-500 leading-relaxed font-sans max-w-[380px] mx-auto"
        id="success-subtitle-text"
      >
        {t.successSubtitle}
      </p>

      {/* CTA Button */}
      <div className="mt-8" id="success-cta-wrapper">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full font-bold text-sm cursor-pointer transition-all shadow-md transform hover:scale-[1.03]"
          id="btn-success-reset"
        >
          {t.submitAnother}
        </button>
      </div>
    </div>
  );
}
