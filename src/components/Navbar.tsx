import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { Logo } from './Logo';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Navbar({ lang, onToggleLang, currentPath, onNavigate }: NavbarProps) {
  const t = translations[lang];
  const isAr = lang === 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Link definitions
  const links = [
    { label: isAr ? 'الرئيسية' : 'Home', path: '/' },
    { label: isAr ? 'من نحن' : 'About Us', path: '/about' },
    { label: isAr ? 'الأسئلة الشائعة' : 'FAQ', path: '/faq' },
    { label: isAr ? 'تواصل معنا' : 'Contact Us', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className="w-full flex items-center justify-between relative z-40 transition-all duration-300" 
      style={{ height: '75px', padding: '0 24px', backgroundColor: 'transparent' }} 
      id="top-navbar" 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Left (or Right relative to RTL): logo view */}
      <div 
        className="flex items-center cursor-pointer select-none" 
        onClick={() => handleNavClick('/')}
        id="navbar-logo-container"
        style={{ background: 'transparent', border: 'none', padding: 0, transform: 'translateY(10px)' }}
      >
        <Logo size="sm" />
      </div>

      {/* 2. Desktop Navigation Center Links (View hidden on Mobile) */}
      <div 
        className="hidden md:flex items-center gap-7 text-[#B0D4E0] font-ar text-sm font-semibold select-none"
        id="desktop-nav-links-container"
      >
        {links.map((link) => {
          const isActive = currentPath === link.path;
          return (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`hover:text-white transition-colors cursor-pointer relative py-1 ${
                isActive ? 'text-[#F5C842] font-bold' : ''
              }`}
            >
              <span>{link.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5C842] rounded-full animate-scale-up" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Right: Control Deck (Desktop) */}
      <div className="hidden md:flex items-center gap-6" id="navbar-controls-desktop">
        {/* Admin portal trigger link */}
        <button
          onClick={() => {
            if (currentPath.startsWith('/admin')) {
              handleNavClick('/');
            } else {
              handleNavClick('/admin/login');
            }
          }}
          className="text-white/95 hover:text-[#F5C842] font-semibold text-sm transition-colors cursor-pointer"
          id="navbar-admin-link"
        >
          <span>{currentPath.startsWith('/admin') ? (isAr ? 'الرئيسية' : 'Home') : t.adminLink}</span>
        </button>

        {/* Global language toggle badge */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 text-white/90 hover:text-[#F5C842] border border-white/20 px-3.5 py-1.5 rounded-full transition-all text-xs font-bold bg-transparent hover:bg-white/5 cursor-pointer"
          id="navbar-language-toggle"
        >
          <svg className="w-3.5 h-3.5 text-[#F5C842]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="font-extrabold">{isAr ? 'EN' : 'AR'}</span>
        </button>
      </div>

      {/* 4. Mobile Controls: Burger trigger, Lang switch */}
      <div className="flex md:hidden items-center gap-4" id="navbar-controls-mobile">
        {/* Language switch wrapper */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 text-white/90 border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold bg-transparent"
        >
          <span className="font-extrabold text-[#F5C842]">{isAr ? 'EN' : 'AR'}</span>
        </button>

        {/* Hamburger open trigger button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:text-[#F5C842] focus:outline-none focus:ring-1 focus:ring-white/20 p-1.5 rounded-lg transition-colors bg-white/5"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 5. Mobile Accordion sliding full backdrop navigation menu */}
      {isMobileMenuOpen && (
        <div 
          className="absolute top-[75px] left-0 right-0 bg-[#0A4F68] border-b border-white/10 shadow-2xl p-5 md:hidden z-50 flex flex-col gap-4 animate-scale-up"
          id="mobile-drawer-canvas"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="flex flex-col gap-3">
            {links.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-start py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-[#F5C842]/10 text-[#F5C842] border-r-4 border-[#F5C842]' 
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="h-[1px] bg-white/5 my-1" />

          {/* Secure admin view and session trigger */}
          <button
            onClick={() => {
              if (currentPath.startsWith('/admin')) {
                handleNavClick('/');
              } else {
                handleNavClick('/admin/login');
              }
            }}
            className="w-full text-center py-3 bg-[#083D52] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-[#F5C842] transition-all"
          >
            {currentPath.startsWith('/admin') ? (isAr ? 'العودة للرئيسية' : 'Back to Home') : t.adminLink}
          </button>
        </div>
      )}
    </nav>
  );
}
