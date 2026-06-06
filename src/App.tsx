/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  LogOut, 
  Moon, 
  Sun, 
  User, 
  Send, 
  ChevronRight, 
  Info,
  CheckCircle,
  Sparkles,
  Globe,
  X,
  Settings
} from 'lucide-react';
import { Language, Submission, SubmissionStatus } from './types';
import { translations } from './translations';
import { 
  getSubmissions, 
  createSubmission, 
  updateSubmissionAdminFields, 
  getEmailLogs, 
  clearAllSubmissionsAndSetDefaults,
  getContactMessages,
  initDataStore,
  EmailLog 
} from './dataStore';

// Dynamic Sub-components imports
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import AboutUs from './components/AboutUs';
import SubmissionForm from './components/SubmissionForm';
import SuccessView from './components/SuccessView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminSubmissions from './components/AdminSubmissions';
import AdminMessages from './components/AdminMessages';
import AdminSettings from './components/AdminSettings';
import AboutPage from './components/AboutPage';
import FAQPage from './components/FAQPage';
import ContactPage from './components/ContactPage';
import DocsPage from './components/DocsPage';
import Footer from './components/Footer';
import { Logo } from './components/Logo';

export default function App() {
  // Initialize Database on load
  useEffect(() => {
    initDataStore();
  }, []);

  // 1. Language Preference State (Stored in localStorage)
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shareidea_lang') as Language;
      if (stored === 'ar' || stored === 'en') return stored;
    }
    return 'ar'; // Default to Arabic
  });

  // Apply visual page HTML dir when lang changes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('shareidea_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  // 2. Custom Router State (synchronizes nicely with actual window search/pathname or internal navigators)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (['/submit', '/about', '/faq', '/contact', '/privacy', '/terms', '/admin/login', '/admin/dashboard', '/admin/submissions', '/admin/messages', '/admin/settings'].includes(pathname)) {
        return pathname;
      }
    }
    return '/'; // Homepage default
  });

  // Client-side router syncer
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Admin Authentication State (Stored in sessionStorage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('shareidea_admin_auth') === 'true';
    }
    return false;
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('shareidea_admin_email') || 'admin@ideaflow.com';
    }
    return 'admin@ideaflow.com';
  });

  const [adminRole, setAdminRole] = useState<'main' | 'moderator'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('shareidea_admin_role') as 'main' | 'moderator') || 'main';
    }
    return 'main';
  });

  const handleAdminLogin = (email: string, role: 'main' | 'moderator') => {
    setIsAdminAuthenticated(true);
    setAdminEmail(email);
    setAdminRole(role);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shareidea_admin_auth', 'true');
      sessionStorage.setItem('shareidea_admin_email', email);
      sessionStorage.setItem('shareidea_admin_role', role);
    }
    navigate('/admin/dashboard');
  };

  const handleAdminSignOut = () => {
    setIsAdminAuthenticated(false);
    setAdminEmail('admin@ideaflow.com');
    setAdminRole('main');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('shareidea_admin_auth');
      sessionStorage.removeItem('shareidea_admin_email');
      sessionStorage.removeItem('shareidea_admin_role');
    }
    navigate('/');
  };

  // 4. Admin Dark Mode (Sidebar toggle option)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shareidea_dark_mode') === 'true';
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('shareidea_dark_mode', String(next));
      return next;
    });
  };

  // 5. Shared submissions list state
  const [submissionsList, setSubmissionsList] = useState<Submission[]>(() => getSubmissions());
  const [contactMessagesList, setContactMessagesList] = useState(() => getContactMessages());
  
  // Last Reference ID submitted for success screen
  const [lastSubmittedRef, setLastSubmittedRef] = useState<string>('');

  // 6. Active Live EmailLogs (so developers can inspect double emails triggered instantly)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false);

  // Sync emails lists
  useEffect(() => {
    setEmailLogs(getEmailLogs());
  }, [submissionsList]);

  // Sync submissions and contact messages lists when navigating in Admin
  useEffect(() => {
    if (currentPath.startsWith('/admin')) {
      setSubmissionsList(getSubmissions());
      setContactMessagesList(getContactMessages());
    }
  }, [currentPath]);

  // Form submit handler
  const handleFormSubmission = (payload: any) => {
    const created = createSubmission(payload);
    // Reload database
    setSubmissionsList(getSubmissions());
    setLastSubmittedRef(created.reference_id);
    navigate('/submit-success');
  };

  // Modify evaluation metrics
  const handleUpdateEvaluation = (id: string, update: { status?: SubmissionStatus; score?: number | null; admin_notes?: string }) => {
    updateSubmissionAdminFields(id, update);
    setSubmissionsList(getSubmissions());
  };

  // System Clean Reset Database
  const handleHardReset = () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من إعادة ضبط كل البيانات والطلبات الافتراضية؟' : 'Are you sure you want to reset all data changes?')) {
      clearAllSubmissionsAndSetDefaults();
      setSubmissionsList(getSubmissions());
      setContactMessagesList(getContactMessages());
      navigate('/admin/dashboard');
    }
  };

  // Redirect gate: If on admin private pages but unauthenticated, fallback to Login
  useEffect(() => {
    if (['/admin/dashboard', '/admin/submissions', '/admin/messages', '/admin/settings'].includes(currentPath) && !isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [currentPath, isAdminAuthenticated]);

  const t = translations[lang];

  // Count columns helper
  const countNewSubmissions = submissionsList.filter(s => s.status === 'new').length;
  const countUnreadContactMessages = contactMessagesList.filter(m => !m.is_read).length;

  // --- RENDER ROUTING DECISIONS ---

  const renderContent = () => {
    // 1. Success Screen (Path state triggered)
    if (currentPath === '/submit-success') {
      return (
        <div className="flex-1 w-full flex items-center justify-center p-6 relative z-10" id="success-screen-route">
          <SuccessView 
            lang={lang}
            referenceId={lastSubmittedRef || 'IDEA-2026-7711'}
            onReset={() => {
              setLastSubmittedRef('');
              navigate('/submit');
            }}
          />
        </div>
      );
    }

    // 2. Multi-step submission form
    if (currentPath === '/submit') {
      return (
        <div className="flex-1 w-full flex items-center justify-center p-6 relative z-10" id="submit-form-route">
          <SubmissionForm 
            lang={lang}
            onSubmit={handleFormSubmission}
            onCancel={() => navigate('/')}
          />
        </div>
      );
    }

    // 3. Admin Login page
    if (currentPath === '/admin/login') {
      if (isAdminAuthenticated) {
        // Redirect to Dashboard if already authenticated
        navigate('/admin/dashboard');
        return null;
      }
      return (
        <div className="flex-1 w-full flex items-center justify-center p-6 relative z-10" id="admin-login-route">
          <AdminLogin 
            lang={lang}
            onLoginSuccess={handleAdminLogin}
            onBack={() => navigate('/')}
          />
        </div>
      );
    }

    // 4. Admin Authenticated views (Layout includes Sidebar + Canvas content)
    if (['/admin/dashboard', '/admin/submissions', '/admin/messages', '/admin/settings'].includes(currentPath)) {
      return (
        <div 
          className="flex-1 w-full flex flex-col md:flex-row transition-colors bg-[var(--primary-bg)] text-white font-ar"
          id="admin-dashboard-root-layout"
        >
          {/* Side panel menu */}
          <aside 
            className="w-full md:w-[200px] lg:w-[252px] border-e border-white/8 shrink-0 flex flex-col bg-[var(--sidebar-bg)]"
            id="admin-sidebar"
          >
            {/* Sidebar logo header */}
            <div className="flex flex-col items-center justify-center select-none" style={{ background: 'transparent', border: 'none', padding: '16px 12px 0', boxShadow: 'none' }} id="sidebar-logo-header">
              <Logo size="custom" style={{ width: 'clamp(100px, 15vw, 160px)', height: 'auto', display: 'block' }} />
            </div>

            {/* Menu options stack */}
            <nav className="flex-1 space-y-1" style={{ padding: '12px 0 24px' }} id="sidebar-menus-stack">
              {/* Menu Item 1: Dashboard */}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className={`flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  currentPath === '/admin/dashboard'
                    ? 'bg-[rgba(245,200,66,0.1)] border-r-[3px] border-r-[#F5C842] text-[#F5C842]'
                    : 'text-[#B0D4E0] hover:text-white bg-transparent'
                }`}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  margin: '4px 12px',
                  width: 'calc(100% - 24px)',
                }}
                id="menu-btn-dashboard"
              >
                <div className="flex items-center gap-2.5 font-ar">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t.nav_dashboard}</span>
                </div>
              </button>

              {/* Menu Item 2: Submissions (with count notifications pill) */}
              <button
                onClick={() => navigate('/admin/submissions')}
                className={`flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  currentPath === '/admin/submissions'
                    ? 'bg-[rgba(245,200,66,0.1)] border-r-[3px] border-r-[#F5C842] text-[#F5C842]'
                    : 'text-[#B0D4E0] hover:text-white bg-transparent'
                }`}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  margin: '4px 12px',
                  width: 'calc(100% - 24px)',
                }}
                id="menu-btn-submissions"
              >
                <div className="flex items-center gap-2.5 font-ar">
                  <Inbox className="w-4 h-4" />
                  <span>{t.nav_submissions}</span>
                </div>

                {/* Coral count notification badge */}
                {countNewSubmissions > 0 && (
                  <span className="px-2 py-0.5 bg-[#EF4444] text-white text-[10px] font-num rounded-full animate-pulse font-bold" id="sidebar-coral-badge">
                    {countNewSubmissions}
                  </span>
                )}
              </button>

              {/* Menu Item 2.5: Messages (الرسائل) */}
              <button
                onClick={() => navigate('/admin/messages')}
                className={`flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  currentPath === '/admin/messages'
                    ? 'bg-[rgba(245,200,66,0.1)] border-r-[3px] border-r-[#F5C842] text-[#F5C842]'
                    : 'text-[#B0D4E0] hover:text-white bg-transparent'
                }`}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  margin: '4px 12px',
                  width: 'calc(100% - 24px)',
                }}
                id="menu-btn-messages"
              >
                <div className="flex items-center gap-2.5 font-ar">
                  <Send className="w-4 h-4" />
                  <span>{t.nav_messages}</span>
                </div>

                {/* Badge indicator */}
                {countUnreadContactMessages > 0 && (
                  <span className="px-2 py-0.5 bg-[#EF4444] text-white text-[10px] font-num rounded-full animate-pulse font-bold" id="sidebar-messages-coral-badge">
                    {countUnreadContactMessages}
                  </span>
                )}
              </button>

              {/* Menu Item 3: Settings (الاعدادات) */}
              <button
                onClick={() => navigate('/admin/settings')}
                className={`flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  currentPath === '/admin/settings'
                    ? 'bg-[rgba(245,200,66,0.1)] border-r-[3px] border-r-[#F5C842] text-[#F5C842]'
                    : 'text-[#B0D4E0] hover:text-white bg-transparent'
                }`}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  margin: '4px 12px',
                  width: 'calc(100% - 24px)',
                }}
                id="menu-btn-settings"
              >
                <div className="flex items-center gap-2.5 font-ar">
                  <Settings className="w-4 h-4" />
                  <span>{t.nav_settings}</span>
                </div>
              </button>
            </nav>

            {/* Sidebar Bottom section: simplified secure session status */}
            <div className="p-4 border-t border-white/8 space-y-2 font-sans text-center flex flex-col justify-center items-center" id="sidebar-user-footer">
              <span className="text-[10px] text-[#B0D4E0]/50 uppercase tracking-widest font-mono block">
                {lang === 'ar' 
                  ? (adminRole === 'main' ? 'مشرف رئيسي معتمد' : 'مشرف فرعي معتمد') 
                  : (adminRole === 'main' ? 'Main Administrator' : 'Secure Mod Session')}
              </span>
              <div className="text-[10px] font-bold text-emerald-400 font-mono inline-flex items-center gap-1.5 justify-center bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 max-w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="truncate">{adminEmail}</span>
              </div>
            </div>
          </aside>

          {/* Core Panel Content Canvas */}
          <main className="flex-1 p-6 overflow-y-auto bg-[var(--primary-bg)] text-white" id="admin-main-canvas">
            {/* Top Area header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-5" id="canvas-header">
              <div id="canvas-header-welcome">
                <h3 className="text-white font-ar" style={{ fontSize: '24px', fontWeight: 700 }}>
                  {currentPath === '/admin/dashboard' 
                    ? t.nav_dashboard 
                    : currentPath === '/admin/submissions' 
                      ? t.nav_submissions 
                      : currentPath === '/admin/messages'
                        ? t.nav_messages
                        : t.nav_settings}
                </h3>
                <p className="text-xs text-[var(--secondary-text)] font-ar mt-0.5">
                  {currentPath === '/admin/dashboard' 
                    ? (lang === 'ar' ? 'رصد بالوقت الفعلي لأداء ومقاييس الأفكار الابتكارية' : 'Real-time monitoring of innovation statistics and evaluations')
                    : currentPath === '/admin/submissions'
                      ? (lang === 'ar' ? 'قائمة وتفاصيل الأفكار المقدمة من رواد الأعمال للمراجعة' : 'Complete details of startup submissions waiting for grading')
                      : currentPath === '/admin/messages'
                        ? (lang === 'ar' ? 'قائمة وتفاصيل رسائل البريد المرسلة واستفسارات نموذج اتصل بنا' : 'Full history logs of outbox emails and incoming guest contact inquiries')
                        : (lang === 'ar' ? 'إدارة وتخصيص تفضيلات الحساب والمظهر العام ونظام العرض' : 'Manage account security, styling preferences, and core system indices')
                  }
                </p>
              </div>

              {/* Quick statistics badge & Sign out to the top left */}
              <div className="flex items-center gap-2.5 font-num" id="canvas-header-indicators">
                <span className="px-3 py-1.5 bg-[var(--card-bg)] text-white font-bold text-xs rounded-full inline-block border border-white/8 shadow-md">
                  {lang === 'ar' ? `إجمالي الأفكار: ${submissionsList.length}` : `All Ideas: ${submissionsList.length}`}
                </span>
                <span className="px-3 py-1.5 bg-[var(--card-bg)] text-[var(--accent-gold)] font-bold text-xs rounded-full inline-block border border-[var(--accent-gold)]/20 shadow-md">
                  {lang === 'ar' ? `المشاريع الواعدة: ${submissionsList.filter(s => s.status === 'promising').length}` : `Promising: ${submissionsList.filter(s => s.status === 'promising').length}`}
                </span>

                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  className="px-4 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs rounded-full border border-rose-500/25 transition-all flex items-center gap-1.5 active:scale-95 shadow-md cursor-pointer font-ar"
                  id="canvas-header-signout"
                  title={lang === 'ar' ? 'تسجيل الخروج الآمن' : 'Secure Sign Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                </button>
              </div>
            </div>

            {/* Dynamic tabs payload display */}
            {currentPath === '/admin/dashboard' ? (
              <AdminDashboard 
                lang={lang}
                submissions={submissionsList}
                onNavigate={(path) => navigate(path)}
              />
            ) : currentPath === '/admin/submissions' ? (
              <AdminSubmissions 
                lang={lang}
                submissions={submissionsList}
                onUpdateAdminFields={handleUpdateEvaluation}
              />
            ) : currentPath === '/admin/messages' ? (
              <AdminMessages 
                lang={lang}
              />
            ) : (
              <AdminSettings 
                lang={lang}
                onToggleLang={toggleLanguage}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onHardReset={handleHardReset}
                onSignOut={handleAdminSignOut}
                adminEmail={adminEmail}
                adminRole={adminRole}
                onAdminInfoUpdate={(newEmail) => setAdminEmail(newEmail)}
              />
            )}
          </main>
        </div>
      );
    }

    if (currentPath === '/about') {
      return <AboutPage lang={lang} />;
    }

    if (currentPath === '/faq') {
      return <FAQPage lang={lang} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage lang={lang} />;
    }

    if (currentPath === '/privacy') {
      return <DocsPage lang={lang} mode="privacy" />;
    }

    if (currentPath === '/terms') {
      return <DocsPage lang={lang} mode="terms" />;
    }

    // Default: Landing Screen
    return (
      <div className="flex flex-col w-full animate-fade-in" id="landing-page-flow">
        <LandingHero 
          lang={lang}
          submissionsCount={submissionsList.length}
          onStart={() => navigate('/submit')}
        />
        <AboutUs lang={lang} />
      </div>
    );
  };

  // --- GENERAL APP FRAME LAYOUT ---

  // For landing page & submission & login routes, display the teal gradient full backdrop
  const showTealGradientBackdrop = ['/', '/about', '/faq', '/contact', '/privacy', '/terms', '/submit', '/submit-success', '/admin/login'].includes(currentPath);

  return (
    <div 
      className={`min-h-screen w-full flex flex-col relative ${
        showTealGradientBackdrop 
          ? 'bg-gradient-to-br from-[var(--primary-bg)] to-[var(--sidebar-bg)] overflow-x-hidden' 
          : 'bg-white'
      }`}
      id="app-full-viewport"
    >
      
      {/* 1. Navbar displayed on outer site pages */}
      {showTealGradientBackdrop && (
        <Navbar 
          lang={lang}
          onToggleLang={toggleLanguage}
          currentPath={currentPath}
          onNavigate={navigate}
        />
      )}

      {/* 2. Core Content Page Renderer */}
      {renderContent()}

      {/* Global Footer for public pages */}
      {showTealGradientBackdrop && currentPath !== '/admin/login' && (
        <Footer lang={lang} onNavigate={navigate} />
      )}

      {/* 3. SIMULATED RESEND OUTGOING EMAIL DISPATCHES HUD LOGGER PANEL (COLLAPSIBLE FLOATING TRAY) */}
      {currentPath !== '/' && (
        <div 
          className="fixed bottom-4 end-4 z-50 flex flex-col items-end gap-2.5 font-sans"
          id="simulated-emails-toast-trigger"
        >
          <button
            onClick={() => setIsEmailViewerOpen(prev => !prev)}
            className="p-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white rounded-full flex items-center gap-2 shadow-xl cursor-pointer hover:scale-[1.03] transition-all"
            id="btn-trigger-email-live-viewer"
          >
            <span className="relative flex h-2.5 w-2.5" id="pulse-dot">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Send className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold tracking-wide">
              {lang === 'ar' ? `المحاكي: رسائل البريد المرسلة (${emailLogs.length})` : `EMULATOR: Outbox (${emailLogs.length})`}
            </span>
          </button>

          {isEmailViewerOpen && (
            <div 
              className="w-[360px] md:w-[460px] max-h-[380px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 flex flex-col overflow-hidden text-right animate-scale-up text-xs font-medium"
              id="simulated-emails-panel-window"
            >
              {/* Outbox header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3" id="outbox-hud-header">
                <div className="flex items-center gap-1.5" id="outbox-title-label">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="font-extrabold text-emerald-400 tracking-wider">RESEND OUTGOING EMULATION DECK</span>
                </div>
                <button 
                  onClick={() => setIsEmailViewerOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer font-bold"
                  id="btn-close-outbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Outbox messages logs list stack */}
              <div className="flex-1 overflow-y-auto space-y-3.5" id="outbox-hud-stack">
                {emailLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500" id="empty-outbox">
                    <span className="block italic text-[11px]" id="empty-outbox-msg">
                      {lang === 'ar' ? 'لا توجد رسائل مرسلة بعد. قدّم طلباً إلكترونياً لتجربتها!' : 'Outbox is empty. Submit a startup idea to trigger dynamic emails!'}
                    </span>
                  </div>
                ) : (
                  emailLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg space-y-1.5 selection:bg-slate-700 selection:text-white"
                      id={`log-item-${log.id}`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 border-b border-slate-700 pb-1" id="log-meta">
                        <span className="truncate max-w-[200px]">TO: <strong className="text-slate-200">{log.to}</strong></span>
                        <span>{new Date(log.sent_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="font-bold text-emerald-400 border-b border-slate-800/20 pb-0.5" id="log-subject">
                        {log.subject}
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto font-sans text-right" id="log-body" style={{ direction: 'rtl' }}>
                        {log.body}
                      </div>
                      <div className="text-[9px] text-[#F59E0B] font-semibold text-center select-none" id="log-sent-indicator">
                        ✓ RESEND API STATUS: OK (Status Deliver Code 202)
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] text-slate-500 font-sans text-center" id="outbox-hud-footer">
                Using resend_secrets_vault callback edge function dynamically.
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
