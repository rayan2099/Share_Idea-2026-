import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';

interface FooterProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export default function Footer({ lang, onNavigate }: FooterProps) {
  const isAr = lang === 'ar';
  const currentYear = new Date().getFullYear();

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
            <Logo size="md" />
          </div>
          <p className="text-sm text-[#B0D4E0] leading-relaxed max-w-sm">
            {isAr 
              ? 'شارك الفكرة هي منصة ريادية متخصصة في استقبال وتقييم الأفكار والمشاريع الناشئة وتسهيل ربطها بالمستثمرين والشركاء الاستراتيجيين لتحقيق التوسع والتمويل.' 
              : 'Share Idea is an entrepreneurial platform specializing in receiving and grading early-stage project concepts, aligning them with investors and strategic stakeholders for scale.'}
          </p>
          <div className="text-xs text-[#B0D4E0]/80 flex flex-wrap items-center gap-1.5 pt-1" id="footer-cr-number" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            <span>{isAr ? 'رقم السجل التجاري:' : 'CR Number:'}</span>
            <span className="font-mono text-white select-all">7052045826</span>
          </div>
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
          <span>{isAr ? `© ${currentYear} شارك الفكرة. جميع الحقوق محفوظة.` : `© ${currentYear} Share Idea. All rights reserved.`}</span>
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
    </footer>
  );
}

