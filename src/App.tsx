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
  Sparkles,
  Globe,
  Settings,
  Building2
} from 'lucide-react';
import { ContactMessage, Language, Submission, SubmissionStatus } from './types';
import { translations } from './translations';
import { 
  getSubmissionsFromSupabase,
  createSubmissionInSupabase,
  updateSubmissionAdminFieldsInSupabase,
  updateSubmissionAssignmentInSupabase,
  getContactMessagesFromSupabase,
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
import AdminProjects from './components/AdminProjects';
import ProjectsCarousel from './components/ProjectsCarousel';
import AboutPage from './components/AboutPage';
import FAQPage from './components/FAQPage';
import ContactPage from './components/ContactPage';
import DocsPage from './components/DocsPage';
import Footer from './components/Footer';
import { Logo } from './components/Logo';
import { supabase } from './supabaseService';

export default function App() {
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

  const handleAdminSignOut = async () => {
    await supabase.auth.signOut();
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

  useEffect(() => {
    let isMounted = true;

    const restoreAdminSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) return;

      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('email, role, is_active')
        .eq('id', user.id)
        .single();

      if (!isMounted) return;

      if (!error && profile?.is_active) {
        handleAdminLogin(profile.email, profile.role as 'main' | 'moderator');
      }
    };

    restoreAdminSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user || !isMounted) return;

      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('email, role, is_active')
        .eq('id', session.user.id)
        .single();

      if (!isMounted) return;

      if (!error && profile?.is_active) {
        handleAdminLogin(profile.email, profile.role as 'main' | 'moderator');
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  // 5. Shared admin data state. Start empty so deleted/demo local data never flashes before Supabase loads.
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [contactMessagesList, setContactMessagesList] = useState<ContactMessage[]>([]);
  
  // Last Reference ID submitted for success screen
  const [lastSubmittedRef, setLastSubmittedRef] = useState<string>('');

  // Sync submissions and contact messages lists when navigating in Admin.
  useEffect(() => {
    let cancelled = false;

    if (currentPath.startsWith('/admin') && isAdminAuthenticated) {
      Promise.all([
        getSubmissionsFromSupabase(),
        getContactMessagesFromSupabase()
      ]).then(([submissions, messages]) => {
        if (cancelled) return;
        setSubmissionsList(submissions);
        setContactMessagesList(messages);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [currentPath, isAdminAuthenticated]);

  // Form submit handler
  const handleFormSubmission = async (payload: any) => {
    try {
      const created = await createSubmissionInSupabase(payload);
      const latest = await getSubmissionsFromSupabase();
      setSubmissionsList(latest);
      setLastSubmittedRef(created.reference_id);
      navigate('/submit-success');
    } catch (err: any) {
      const message = err?.message || '';
      const isNetworkIssue = message === 'NETWORK_SUBMISSION_FAILED' || /load failed|failed to fetch|network/i.test(message);
      throw new Error(lang === 'ar'
        ? (isNetworkIssue
          ? 'تعذر الاتصال مؤقتاً. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.'
          : `تعذر حفظ الفكرة في قاعدة البيانات: ${message || 'خطأ غير معروف'}`)
        : (isNetworkIssue
          ? 'Temporary connection issue. Please check your internet connection and try again.'
          : `Could not save the idea to the database: ${message || 'Unknown error'}`)
      );
    }
  };

  // Modify evaluation metrics
  const handleUpdateEvaluation = async (id: string, update: { status?: SubmissionStatus; score?: number | null; admin_notes?: string }) => {
    await updateSubmissionAdminFieldsInSupabase(id, update);
    const latest = await getSubmissionsFromSupabase();
    setSubmissionsList(latest);
  };

  const handleUpdateAssignment = async (id: string, assignedAdminId: string | null) => {
    await updateSubmissionAssignmentInSupabase(id, assignedAdminId);
    const latest = await getSubmissionsFromSupabase();
    setSubmissionsList(latest);
  };

  // Redirect gate: If on admin private pages but unauthenticated, fallback to Login
  useEffect(() => {
    if (['/admin/dashboard', '/admin/submissions', '/admin/messages', '/admin/settings', '/admin/projects'].includes(currentPath) && !isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [currentPath, isAdminAuthenticated]);

  const t = translations[lang];
  const adminScopedSubmissions = adminRole === 'main'
    ? submissionsList
    : submissionsList.filter(sub => (sub.assigned_admin_email || '').toLowerCase() === adminEmail.toLowerCase());

  const adminScopedContactEmails = new Set(adminScopedSubmissions.map(sub => sub.email.toLowerCase()));
  const adminScopedContactMessages = adminRole === 'main'
    ? contactMessagesList
    : contactMessagesList.filter(message => adminScopedContactEmails.has(message.email.toLowerCase()));

  // Count columns helper
  const countNewSubmissions = adminScopedSubmissions.filter(s => s.status === 'new').length;
  const countUnreadContactMessages = adminScopedContactMessages.filter(m => !m.is_read).length;

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
    if (['/admin/dashboard', '/admin/submissions', '/admin/messages', '/admin/settings', '/admin/projects'].includes(currentPath)) {
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
              <Logo size="md" />
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

              {/* Menu Item 2.7: Projects (مشاريعنا) */}
              <button
                onClick={() => navigate('/admin/projects')}
                className={`flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  currentPath === '/admin/projects'
                    ? 'bg-[rgba(245,200,66,0.1)] border-r-[3px] border-r-[#F5C842] text-[#F5C842]'
                    : 'text-[#B0D4E0] hover:text-white bg-transparent'
                }`}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  margin: '4px 12px',
                  width: 'calc(100% - 24px)',
                }}
                id="menu-btn-projects"
              >
                <div className="flex items-center gap-2.5 font-ar">
                  <span className="text-base select-none">🏢</span>
                  <span>{t.nav_projects}</span>
                </div>
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
                        : currentPath === '/admin/projects'
                          ? t.nav_projects
                          : t.nav_settings}
                </h3>
                <p className="text-xs text-[var(--secondary-text)] font-ar mt-0.5">
                  {currentPath === '/admin/dashboard' 
                    ? (lang === 'ar' ? 'رصد بالوقت الفعلي لأداء ومقاييس الأفكار الابتكارية' : 'Real-time monitoring of innovation statistics and evaluations')
                    : currentPath === '/admin/submissions'
                      ? (lang === 'ar' ? 'قائمة وتفاصيل الأفكار المقدمة من رواد الأعمال للمراجعة' : 'Complete details of startup submissions waiting for grading')
                      : currentPath === '/admin/messages'
                        ? (lang === 'ar' ? 'قائمة وتفاصيل رسائل البريد المرسلة واستفسارات نموذج اتصل بنا' : 'Full history logs of outbox emails and incoming guest contact inquiries')
                        : currentPath === '/admin/projects'
                          ? (lang === 'ar' ? 'إدارة وتصنيف وأرشفة المشاريع والكيانات المستفيدة من المنصة' : 'Manage, categorize and display all projects featured on the homepage')
                          : (lang === 'ar' ? 'إدارة وتخصيص تفضيلات الحساب والمظهر العام ونظام العرض' : 'Manage account security, styling preferences, and core system indices')
                  }
                </p>
              </div>

              {/* Quick statistics badge & Sign out to the top left */}
              <div className="flex items-center gap-2.5 font-num" id="canvas-header-indicators">
                <span className="px-3 py-1.5 bg-[var(--card-bg)] text-white font-bold text-xs rounded-full inline-block border border-white/8 shadow-md">
                  {lang === 'ar' ? `إجمالي الأفكار: ${adminScopedSubmissions.length}` : `All Ideas: ${adminScopedSubmissions.length}`}
                </span>
                <span className="px-3 py-1.5 bg-[var(--card-bg)] text-[var(--accent-gold)] font-bold text-xs rounded-full inline-block border border-[var(--accent-gold)]/20 shadow-md">
                  {lang === 'ar' ? `المشاريع الواعدة: ${adminScopedSubmissions.filter(s => s.status === 'promising').length}` : `Promising: ${adminScopedSubmissions.filter(s => s.status === 'promising').length}`}
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
                submissions={adminScopedSubmissions}
                onNavigate={(path) => navigate(path)}
              />
            ) : currentPath === '/admin/submissions' ? (
              <AdminSubmissions 
                lang={lang}
                submissions={submissionsList}
                adminEmail={adminEmail}
                adminRole={adminRole}
                onUpdateAdminFields={handleUpdateEvaluation}
                onUpdateAssignment={handleUpdateAssignment}
              />
            ) : currentPath === '/admin/messages' ? (
              <AdminMessages 
                lang={lang}
                adminEmail={adminEmail}
                adminRole={adminRole}
                submissions={submissionsList}
              />
            ) : currentPath === '/admin/projects' ? (
              <AdminProjects 
                lang={lang}
              />
            ) : (
              <AdminSettings 
                lang={lang}
                onToggleLang={toggleLanguage}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
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
        <ProjectsCarousel lang={lang} />
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

    </div>
  );
}
