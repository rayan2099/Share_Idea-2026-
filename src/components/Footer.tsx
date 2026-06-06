import React, { useState } from 'react';
import { Phone, Mail, MapPin, X, FileText, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';

interface FooterProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export default function Footer({ lang, onNavigate }: FooterProps) {
  const isAr = lang === 'ar';
  const currentYear = new Date().getFullYear();
  const [showCrModal, setShowCrModal] = useState(false);

  return (
    <footer 
      className="w-full bg-[#083D52] border-t border-white/10 text-white mt-auto pt-12 pb-6 relative z-10"
      id="site-global-footer"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Tajawal', sans-serif"
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8" id="footer-gird-wrapper">
        
        {/* Col 1: Brand & Mini About (Span 5) */}
        <div className="md:col-span-5 space-y-4" id="footer-col-brand">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <Logo size="custom" style={{ width: '130px', display: 'block' }} />
          </div>
          <p className="text-sm text-[#B0D4E0] leading-relaxed max-w-sm">
            {isAr 
              ? 'شير فكرة منصة ريادية متخصصة في استقبال وتقييم الأفكار والمشاريع الناشئة وتسهيل ربطها بالمستثمرين والشركاء الاستراتيجيين لتحقيق التوسع والتمويل.' 
              : 'Share Idea is an entrepreneurial platform specializing in receiving and grading early-stage project concepts, aligning them with investors and strategic stakeholders for scale.'}
          </p>
        </div>

        {/* Col 2: Quick Links (Span 3) */}
        <div className="md:col-span-3 space-y-3" id="footer-col-quicklinks">
          <h4 className="text-base font-extrabold text-[#F5C842]">
            {isAr ? 'روابط سريعة' : 'Quick Navigation'}
          </h4>
          <ul className="space-y-2 text-sm text-white/80" id="footer-nav-list">
            <li>
              <button 
                onClick={() => onNavigate('/about')}
                className="hover:text-[#F5C842] transition-colors bg-transparent border-none p-0 cursor-pointer text-right text-sm"
              >
                {isAr ? 'من نحن' : 'About Us'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('/faq')}
                className="hover:text-[#F5C842] transition-colors bg-transparent border-none p-0 cursor-pointer text-right text-sm"
              >
                {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setShowCrModal(true)}
                className="hover:text-[#F5C842] transition-colors bg-transparent border-none p-0 cursor-pointer text-right text-sm font-bold flex items-center gap-1.5"
                id="btn-cr-modal-trigger"
              >
                <FileText className="w-4 h-4 text-[#F5C842]" />
                <span>{isAr ? 'السجل التجاري' : 'Commercial Register'}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Direct Contact (Span 4) */}
        <div className="md:col-span-4 space-y-3" id="footer-col-contact">
          <h4 className="text-base font-extrabold text-[#F5C842]">
            {isAr ? 'اتصل بنا' : 'Get in Touch'}
          </h4>
          <div className="space-y-2.5 text-sm" id="footer-contact-details">
            {/* Phone item */}
            <div className="flex items-center gap-2" style={{ direction: 'ltr', justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
              <Phone className="w-4 h-4 text-[#F5C842] shrink-0" />
              <a href="tel:+966568121122" className="text-white hover:text-[#F5C842] transition-colors tracking-wide font-medium font-mono select-all">
                +966 56 812 1122
              </a>
            </div>

            {/* Email item */}
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F5C842] shrink-0" />
              <a href="mailto:shareidea01@gmail.com" className="text-white hover:text-[#F5C842] transition-colors font-medium select-all">
                shareidea01@gmail.com
              </a>
            </div>

            {/* Location context */}
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="w-4 h-4 text-[#F5C842] shrink-0" />
              <span>{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-bar footer: Legals, Copyright (RTL check) */}
      <div className="max-w-6xl mx-auto px-6 border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#B0D4E0]/80" id="footer-copyright-bar">
        <div>
          <span>{isAr ? `© ${currentYear} شير فكرة. جميع الحقوق محفوظة.` : `© ${currentYear} Share Idea. All rights reserved.`}</span>
        </div>
        
        {/* Legal links */}
        <div className="flex items-center gap-4 text-xs" id="footer-legal-links-dock">
          <button 
            onClick={() => onNavigate('/privacy')}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-xs"
          >
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </button>
          <span className="text-white/10 select-none">|</span>
          <button 
            onClick={() => onNavigate('/terms')}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-xs"
          >
            {isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </button>
        </div>
      </div>

      {/* --- ELECTRONIC CR CERTIFICATE MODAL DIALOG --- */}
      {showCrModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in"
          id="cr-modal-overlay"
          onClick={() => setShowCrModal(false)}
        >
          <div 
            className="bg-white text-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative border border-white/20 select-none animate-scale-up"
            style={{ direction: 'rtl', fontFamily: "'Tajawal', sans-serif" }}
            onClick={(e) => e.stopPropagation()}
            id="cr-modal-container"
          >
            {/* Header / Dismiss controls */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
              <button 
                onClick={() => setShowCrModal(false)}
                className="p-2 bg-slate-100/80 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-sm"
                aria-label="Close"
                id="btn-cr-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* --- OFFICIAL CERTIFICATE DIRECT IMAGE AS IS --- */}
            <div 
              className="relative w-full bg-[#113C54] p-3 md:p-6 flex flex-col justify-center items-center"
              id="cr-certificate-document"
            >
              <img 
                src="https://i.imgur.com/bptL4ho.png" 
                alt="شهادة السجل التجاري - مؤسسة شير فكره التجارية" 
                className="w-full h-auto object-contain rounded-lg max-h-[80vh] shadow-2xl border border-white/10" 
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Modal Bottom control panel */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500 rounded-b-2xl">
              <span className="font-bold">وزارة التجارة - شهادة السجل التجاري الإلكترونية</span>
              <button 
                onClick={() => setShowCrModal(false)}
                className="text-[#0E5F7A] hover:text-[#0a455a] font-black hover:underline cursor-pointer focus:outline-none"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}

