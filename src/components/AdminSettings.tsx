/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Globe, 
  LogOut, 
  ShieldCheck,
  Plus,
  Trash2,
  Key,
  Users,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Language, Moderator } from '../types';
import { translations } from '../translations';
import { 
  getMainAdminCredentials, 
  updateMainAdminCredentials,
  getModeratorsFromSupabase,
  addModeratorToSupabase,
  deactivateModeratorInSupabase
} from '../dataStore';

interface AdminSettingsProps {
  lang: Language;
  onToggleLang: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
  adminEmail: string;
  adminRole: 'main' | 'moderator';
  onAdminInfoUpdate?: (email: string) => void;
}

export default function AdminSettings({
  lang,
  onToggleLang,
  isDarkMode,
  onToggleDarkMode,
  onSignOut,
  adminEmail,
  adminRole,
  onAdminInfoUpdate
}: AdminSettingsProps) {
  const t = translations[lang];

  // 1. Main Admin Edit States
  const [mainEmailInput, setMainEmailInput] = useState('');
  const [mainPasswordInput, setMainPasswordInput] = useState('');
  const [showMainPassword, setShowMainPassword] = useState(false);
  const [mainEditSuccess, setMainEditSuccess] = useState(false);

  // 2. Secondary Moderator Addition States
  const [newModEmail, setNewModEmail] = useState('');
  const [newModPassword, setNewModPassword] = useState('');
  const [showModPassword, setShowModPassword] = useState(false);
  const [modAddSuccess, setModAddSuccess] = useState(false);
  const [modAddError, setModAddError] = useState('');
  const [modsList, setModsList] = useState<Moderator[]>([]);
  const [isModsLoading, setIsModsLoading] = useState(false);
  const [isSavingMod, setIsSavingMod] = useState(false);

  // Load Initial settings
  useEffect(() => {
    const mainCreds = getMainAdminCredentials();
    setMainEmailInput(mainCreds.email);
    setMainPasswordInput(mainCreds.password);
    
    if (adminRole === 'main') {
      void loadModerators();
    }
  }, [adminRole]);

  const loadModerators = async () => {
    setIsModsLoading(true);
    setModAddError('');
    try {
      setModsList(await getModeratorsFromSupabase());
    } catch (error) {
      setModAddError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذر تحميل المشرفين الفرعيين' : 'Could not load sub-admins'));
    } finally {
      setIsModsLoading(false);
    }
  };

  // Handle saving main admin info
  const handleSaveMainCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setMainEditSuccess(false);

    if (!mainEmailInput.trim() || !mainPasswordInput.trim()) {
      return;
    }

    updateMainAdminCredentials(mainEmailInput, mainPasswordInput);
    setMainEditSuccess(true);
    if (onAdminInfoUpdate) {
      onAdminInfoUpdate(mainEmailInput.trim().toLowerCase());
    }

    // Auto dismiss success toast
    setTimeout(() => {
      setMainEditSuccess(false);
    }, 5000);
  };

  // Handle adding secondary moderator
  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setModAddSuccess(false);
    setModAddError('');

    if (!newModEmail.trim() || !newModPassword.trim()) {
      setModAddError(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    // Check if email already exists as main admin
    const mainCreds = getMainAdminCredentials();
    if (newModEmail.trim().toLowerCase() === mainCreds.email) {
      setModAddError(
        lang === 'ar' 
          ? 'لا يمكن استخدام نفس بريد المشرف الرئيسي لمشرف فرعي' 
          : 'Cannot use main administrator email for a sub-moderator'
      );
      return;
    }

    // Check if duplicate in active or previously created moderators.
    if (modsList.some(m => m.email === newModEmail.trim().toLowerCase())) {
      setModAddError(
        lang === 'ar' 
          ? 'هذا المشرف مسجل وموجود بالفعل بالنظام' 
          : 'This moderator email is already registered in the system'
      );
      return;
    }

    setIsSavingMod(true);
    try {
      setModsList(await addModeratorToSupabase(newModEmail, newModPassword));
      setNewModEmail('');
      setNewModPassword('');
      setModAddSuccess(true);

      setTimeout(() => {
        setModAddSuccess(false);
      }, 4000);
    } catch (error) {
      setModAddError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذر إضافة المشرف الفرعي' : 'Could not add sub-admin'));
    } finally {
      setIsSavingMod(false);
    }
  };

  // Handle deleting sub mod
  const handleDeleteMod = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'هل تريد إلغاء صلاحية هذا المشرف الفرعي؟' : 'Deactivate this sub-admin?')) {
      return;
    }

    setModAddError('');
    try {
      setModsList(await deactivateModeratorInSupabase(id));
    } catch (error) {
      setModAddError(error instanceof Error ? error.message : (lang === 'ar' ? 'تعذر إلغاء صلاحية المشرف' : 'Could not deactivate sub-admin'));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in" id="admin-settings-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. Header Profile State Banner */}
      <section className="bg-[#083D52] border border-white/8 rounded-xl p-6 transition-all" id="settings-profile-section">
        <h3 className="text-[#F5C842] font-semibold text-base mb-4 flex items-center gap-2.5 border-b border-white/8 pb-3 font-ar">
          <User className="w-5 h-5 animate-pulse text-[#F5C842]" />
          <span>{lang === 'ar' ? 'معلومات الحساب والمشرف الحالي' : 'Authorized Account Session'}</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between" id="profile-card-layout">
          <div className="flex items-center gap-3.5" id="profile-avatar-row">
            <div className="p-3 bg-[#0A4F68] border border-[#F5C842]/30 rounded-xl text-[#F5C842] shadow-inner" id="settings-avatar-circle">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="flex flex-col text-right leading-relaxed" id="settings-actor-meta">
              <span className="text-white text-lg font-bold tracking-tight block">{adminEmail}</span>
              <span className="text-xs text-[#F5C842] font-semibold flex items-center gap-1.5 font-ar mt-0.5" id="admin-role-badge">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {adminRole === 'main' 
                  ? (lang === 'ar' ? 'صلاحية: مشرف رئيسي معتمد بالنظام' : 'Access Level: Main Administrator')
                  : (lang === 'ar' ? 'صلاحية: مشرف فرعي معتمد بالمنصة' : 'Access Level: Sub-Moderator')
                }
              </span>
            </div>
          </div>
          
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold uppercase tracking-wider select-none font-mono flex items-center gap-1">
            <span>● AUTH_STATE: SECURE_SPA</span>
          </div>
        </div>
      </section>

      {/* 2. Main Admin Edit Profile Form - Restricted to main admin */}
      {adminRole === 'main' && (
      <section className="bg-[#083D52] border border-white/8 rounded-xl p-6 transition-all" id="settings-main-admin-edit">
        <h3 className="text-[#F5C842] font-semibold text-base mb-4 flex items-center gap-2.5 border-b border-white/8 pb-3 font-ar">
          <Key className="w-5 h-5 text-[#F5C842]" />
          <span>{lang === 'ar' ? 'تعديل بيانات المشرف الرئيسي' : 'Modify Main Admin Credentials'}</span>
        </h3>

        <form onSubmit={handleSaveMainCredentials} className="space-y-4" id="main-admin-creds-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#B0D4E0] font-ar">
                {lang === 'ar' ? 'البريد الإلكتروني الأساسي للمشرف' : 'Primary Admin Email'}
              </label>
              <input
                type="email"
                value={mainEmailInput}
                onChange={(e) => setMainEmailInput(e.target.value)}
                disabled={adminRole !== 'main'}
                required
                placeholder="admin@ideaflow.com"
                className="w-full px-4 py-2.5 bg-[#062F3F] border border-white/8 rounded-lg text-sm text-white focus:border-[#F5C842] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left font-mono"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#B0D4E0] font-ar">
                {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Admin Password'}
              </label>
              <div className="relative">
                <input
                  type={showMainPassword ? 'text' : 'password'}
                  value={mainPasswordInput}
                  onChange={(e) => setMainPasswordInput(e.target.value)}
                  disabled={adminRole !== 'main' || isSavingMod}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#062F3F] border border-white/8 rounded-lg text-sm text-white focus:border-[#F5C842] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left font-mono"
                  style={{ direction: 'ltr', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowMainPassword(!showMainPassword)}
                  disabled={adminRole !== 'main'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[#B0D4E0] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {showMainPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          </div>

          {mainEditSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-semibold text-emerald-400 flex items-center gap-2 font-ar animate-fade-in">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'ar' 
                  ? 'تم تحديث البريد الإلكتروني وكلمة المرور للمشرف الرئيسي بنجاح وبشكل آمن!' 
                  : 'Main administrator credentials set and updated securely!'}
              </span>
            </div>
          )}

          {adminRole === 'main' && (
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#F5C842] hover:bg-[#E0B533] text-[#083D52] font-bold text-sm rounded-lg transition-all cursor-pointer active:scale-97 flex items-center gap-1.5 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ إعدادات الحساب الرئيسي' : 'Save Main Admin Account'}</span>
              </button>
            </div>
          )}
        </form>
      </section>
      )}

      {/* 3. Moderators Management Section - Restricted to main admin */}
      {adminRole === 'main' && (
      <section className="bg-[#083D52] border border-white/8 rounded-xl p-6 transition-all" id="settings-add-sub-admins">
        <h3 className="text-[#F5C842] font-semibold text-base mb-4 flex items-center gap-2.5 border-b border-white/8 pb-3 font-ar">
          <Users className="w-5 h-5 text-[#F5C842]" />
          <span>{lang === 'ar' ? 'إدارة المشرفين الفرعيين (مشرفين)' : 'Sub-Administrators & Mods Management'}</span>
        </h3>

        {/* Form to add sub admin, visible/enabled ONLY for main admin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border-b md:border-b-0 md:border-e border-white/8 pb-6 md:pb-0 md:pe-6">
            <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider font-ar">
              {lang === 'ar' ? 'إضافة مشرف فرعي جديد' : 'Register New Moderator'}
            </h4>
            
            <form onSubmit={handleAddModerator} className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#B0D4E0] font-ar">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Moderator Email'}
                </label>
                <input
                  type="email"
                  value={newModEmail}
                  onChange={(e) => setNewModEmail(e.target.value)}
                  disabled={adminRole !== 'main'}
                  required
                  placeholder="mod@ideaflow.com"
                  className="w-full px-3 py-2 bg-[#062F3F] border border-white/8 rounded-lg text-xs text-white focus:border-[#F5C842] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left font-mono"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#B0D4E0] font-ar">
                  {lang === 'ar' ? 'تعيين كلمة المرور' : 'Assign Password'}
                </label>
                <div className="relative">
                  <input
                    type={showModPassword ? 'text' : 'password'}
                    value={newModPassword}
                    onChange={(e) => setNewModPassword(e.target.value)}
                    disabled={adminRole !== 'main' || isSavingMod}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#062F3F] border border-white/8 rounded-lg text-xs text-white focus:border-[#F5C842] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left font-mono"
                    style={{ direction: 'ltr', paddingRight: '35px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowModPassword(!showModPassword)}
                    disabled={adminRole !== 'main' || isSavingMod}
                    className="absolute inset-y-0 right-0 px-2.5 flex items-center text-[#B0D4E0] hover:text-white transition-colors"
                  >
                    {showModPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] leading-relaxed text-[#B0D4E0]/70 font-ar">
                  {lang === 'ar'
                    ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل. يفضل استخدام حروف وأرقام لزيادة الأمان.'
                    : 'Password must be at least 6 characters. Letters and numbers are recommended for better security.'}
                </p>
              </div>

              {modAddError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] font-semibold text-red-400 font-ar flex items-center gap-1.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{modAddError}</span>
                </div>
              )}

              {modAddSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-semibold text-emerald-400 font-ar flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{lang === 'ar' ? 'تمت إضافة المشرف بنجاح!' : 'Moderator registered successfully!'}</span>
                </div>
              )}

              {adminRole === 'main' && (
                <button
                  type="submit"
                  disabled={isSavingMod}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-1 shadow-sm mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingMod ? <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isSavingMod ? (lang === 'ar' ? 'جاري الإضافة...' : 'Registering...') : (lang === 'ar' ? 'إضافة وتثبيت المشرف' : 'Register Moderator')}</span>
                </button>
              )}
            </form>
          </div>

          {/* List of current mods */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="text-white text-xs font-bold mb-3 uppercase tracking-wider font-ar">
              {lang === 'ar' ? 'المشرفون الفرعيون المعتمدون بالمنصة' : 'Verified Sub-Moderators Directory'}
            </h4>

            {isModsLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl bg-white/1 justify-self-stretch">
                <ShieldCheck className="w-8 h-8 text-[#F5C842] mb-2 animate-pulse" />
                <p className="text-xs text-[#B0D4E0] font-ar">
                  {lang === 'ar' ? 'جاري تحميل المشرفين الفرعيين...' : 'Loading sub-admins...'}
                </p>
              </div>
            ) : modsList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-xl bg-white/1 justify-self-stretch">
                <Users className="w-8 h-8 text-white/20 mb-2" />
                <p className="text-xs text-[#B0D4E0] font-ar">
                  {lang === 'ar' ? 'لا يوجد أي مشرف فرعي مضاف حالياً' : 'Do not have any registered sub-moderators yet.'}
                </p>
                <p className="text-[10px] text-white/40 font-sans mt-1">
                  {lang === 'ar' 
                    ? 'يمكن للمشرف الرئيسي تعيين مشرفين إضافيين وتحديد حساباتهم من لوحة التسجيل.' 
                    : 'Use the left registration module to authorize additional platform mod accounts.'}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border border-white/8 rounded-xl divide-y divide-white/8 bg-[#062F3F] max-h-[295px] overflow-y-auto">
                {modsList.map((mod) => (
                  <div key={mod.id} className="p-3.5 flex items-center justify-between gap-3 text-xs" id={`mod-row-${mod.id}`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-white font-mono text-left block" style={{ direction: 'ltr' }}>
                        {mod.email}
                      </span>
                      <span className="text-[10px] text-[#B0D4E0]/60 block font-ar">
                        {lang === 'ar'
                          ? `تاريخ الإضافة: ${new Date(mod.created_at).toLocaleDateString('ar-SA')}`
                          : `Added: ${new Date(mod.created_at).toLocaleDateString()}`
                        }
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold font-ar ${
                        mod.is_active === false
                          ? 'border-rose-500/35 bg-rose-500/10 text-rose-300'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      }`}>
                        {mod.is_active === false
                          ? (lang === 'ar' ? 'غير نشط' : 'Inactive')
                          : (lang === 'ar' ? 'مصرح له بالدخول' : 'Authorized')
                        }
                      </span>

                      {adminRole === 'main' ? (
                      <button
                        onClick={() => handleDeleteMod(mod.id)}
                        disabled={mod.is_active === false}
                        className="p-1.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 rounded-lg transition-colors border border-rose-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={lang === 'ar' ? 'إلغاء وسحب الصلاحية' : 'Revoke authorization'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* 4. Display Preferences Card */}
      <section className="bg-[#083D52] border border-white/8 rounded-xl p-6 transition-all" id="settings-visual-section">
        <h3 className="text-[#F5C842] font-semibold text-base mb-4 flex items-center gap-2.5 border-b border-white/8 pb-3 font-ar">
          <Globe className="w-5 h-5 text-[#F5C842]" />
          <span>{lang === 'ar' ? 'تفضيلات النظام ولغة الواجهة' : 'System & Language Preferences'}</span>
        </h3>

        <div className="max-w-md" id="preferences-grids">
          <div className="space-y-3" id="lang-pref-box">
            <span className="text-xs text-[#B0D4E0] font-bold block uppercase tracking-wider font-ar">
              {lang === 'ar' ? 'لغة الواجهة الرئيسية لبرنامج شارك الفكرة' : 'Main Interface Language'}
            </span>
            <div className="grid grid-cols-2 gap-2" id="lang-buttons-row">
              <button
                type="button"
                onClick={() => lang !== 'ar' && onToggleLang()}
                className={`py-3 px-4 rounded-xl font-bold text-sm cursor-pointer transition-all border flex items-center justify-center gap-2 font-ar ${
                  lang === 'ar'
                    ? 'bg-[#F5C842]/10 border-[#F5C842] text-[#F5C842] shadow-md'
                    : 'bg-white/5 border-white/8 text-[#B0D4E0] hover:bg-white/10 hover:text-white'
                }`}
                id="btn-set-lang-ar"
              >
                <span>العربية</span>
              </button>
              <button
                type="button"
                onClick={() => lang !== 'en' && onToggleLang()}
                className={`py-3 px-4 rounded-xl font-bold text-sm cursor-pointer transition-all border flex items-center justify-center gap-2 font-sans ${
                  lang === 'en'
                    ? 'bg-[#F5C842]/10 border-[#F5C842] text-[#F5C842] shadow-md'
                    : 'bg-white/5 border-white/8 text-[#B0D4E0] hover:bg-white/10 hover:text-white'
                }`}
                id="btn-set-lang-en"
              >
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
