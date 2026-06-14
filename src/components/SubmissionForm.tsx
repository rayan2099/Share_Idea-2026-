/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, ChevronDown, Check, Trash2, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { uploadFile } from '../dataStore';

interface SubmissionFormProps {
  lang: Language;
  onSubmit: (formData: any) => Promise<void> | void;
  onCancel: () => void;
}

const saudiCities = [
  { ar: 'الرياض', en: 'Riyadh' },
  { ar: 'جدة', en: 'Jeddah' },
  { ar: 'مكة المكرمة', en: 'Mecca' },
  { ar: 'المدينة المنورة', en: 'Medina' },
  { ar: 'الدمام', en: 'Dammam' },
  { ar: 'الخبر', en: 'Khobar' },
  { ar: 'الظهران', en: 'Dhahran' },
  { ar: 'بريدة', en: 'Buraydah' },
  { ar: 'عنيزة', en: 'Unaizah' },
  { ar: 'حائل', en: 'Hail' },
  { ar: 'تبوك', en: 'Tabuk' },
  { ar: 'أبها', en: 'Abha' },
  { ar: 'خميس مشيط', en: 'Khamis Mushait' },
  { ar: 'جازان', en: 'Jazan' },
  { ar: 'نجران', en: 'Najran' },
  { ar: 'الباحة', en: 'Al-Baha' },
  { ar: 'سكاكا', en: 'Sakaka' },
  { ar: 'عرعر', en: 'Arar' },
  { ar: 'الطائف', en: 'Taif' },
  { ar: 'الجبيل', en: 'Jubail' },
  { ar: 'ينبع', en: 'Yanbu' },
  { ar: 'القطيف', en: 'Qatif' },
  { ar: 'الهفوف / الأحساء', en: 'Al-Ahsa' },
  { ar: 'حفر الباطن', en: 'Hafar Al-Batin' },
  { ar: 'الخرج', en: 'Al-Kharj' },
  { ar: 'الدوادمي', en: 'Aldwadmi' },
  { ar: 'القريات', en: 'Al-Qurayyat' },
  { ar: 'رابغ', en: 'Rabigh' },
  { ar: 'الرس', en: 'Al-Rass' },
  { ar: 'بيشة', en: 'Bisha' },
  { ar: 'شرورة', en: 'Sharurah' },
];

export default function SubmissionForm({ lang, onSubmit, onCancel }: SubmissionFormProps) {
  const t = translations[lang];

  // Current Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Validation feedback per step
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [founderName, setFounderName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('+966'); // Saudi default
  const [projectName, setProjectName] = useState('');
  const [city, setCity] = useState('');
  
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [targetMarket, setTargetMarket] = useState<'B2B' | 'B2C' | 'B2B2C' | 'Gov' | ''>('');

  const [stage, setStage] = useState<'idea' | 'prototype' | 'early' | 'growth' | 'expansion' | ''>('');
  const [hasRevenue, setHasRevenue] = useState<'yes' | 'no' | ''>('');
  const [revenueRange, setRevenueRange] = useState<'early' | 'growth' | 'expansion' | undefined>(undefined);
  const [teamSize, setTeamSize] = useState<'1' | '2-5' | '6-15' | '15+' | ''>('');

  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [lookingForNotes, setLookingForNotes] = useState('');
  
  // Custom Dropdowns States
  const [revenueModel, setRevenueModel] = useState<string[]>([]);
  const [revenueModelOther, setRevenueModelOther] = useState('');
  const [fundingRange, setFundingRange] = useState<string>('');
  const [equityOffered, setEquityOffered] = useState<string>('10');
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorsOther, setSectorsOther] = useState('');

  // Dropdown open states
  const [isRevModelOpen, setIsRevModelOpen] = useState(false);
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [isSectorsOpen, setIsSectorsOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // File Upload state
  const [pitchFileName, setPitchFileName] = useState<string>('');
  const [pitchFileUrl, setPitchFileUrl] = useState<string>('');
  const [pitchFileSize, setPitchFileSize] = useState<number>(0);
  const [pitchFileType, setPitchFileType] = useState<string>('');
  const [pitchUrl, setPitchUrl] = useState<string>('');
  const [heardFrom, setHeardFrom] = useState('');
  const [isUploadingPitch, setIsUploadingPitch] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Dropdown refs to detect click outside
  const revModelRef = useRef<HTMLDivElement>(null);
  const fundingRef = useRef<HTMLDivElement>(null);
  const sectorsRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (revModelRef.current && !revModelRef.current.contains(event.target as Node)) {
        setIsRevModelOpen(false);
      }
      if (fundingRef.current && !fundingRef.current.contains(event.target as Node)) {
        setIsFundingOpen(false);
      }
      if (sectorsRef.current && !sectorsRef.current.contains(event.target as Node)) {
        setIsSectorsOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown choices translated dynamically
  const revenueModelOptions = [
    { key: 'rm_subscription', value: t.rm_subscription },
    { key: 'rm_commission', value: t.rm_commission },
    { key: 'rm_transaction', value: t.rm_transaction },
    { key: 'rm_ads', value: t.rm_ads },
    { key: 'rm_freemium', value: t.rm_freemium },
    { key: 'rm_one_time', value: t.rm_one_time },
    { key: 'rm_other', value: t.rm_other },
  ];

  const fundingRangeOptions = [
    lang === 'ar' ? 'أقل من 100,000 ر.س' : 'Less than 100,000 SAR',
    lang === 'ar' ? '100,000 - 500,000 ر.س' : '100,000 - 500,000 SAR',
    lang === 'ar' ? '500,000 - 1,000,000 ر.س' : '500,000 - 1,000,000 SAR',
    lang === 'ar' ? '1 مليون - 5 مليون ر.س' : '1 Million - 5 Million SAR',
    lang === 'ar' ? '5 مليون - 10 مليون ر.س' : '5 Million - 10 Million SAR',
    lang === 'ar' ? 'أكثر من 10 مليون ر.س' : 'More than 10 Million SAR',
  ];

  const sectorsOptions = [
    { key: 'sec_fintech', value: t.sec_fintech },
    { key: 'sec_healthtech', value: t.sec_healthtech },
    { key: 'sec_edtech', value: t.sec_edtech },
    { key: 'sec_agritech', value: t.sec_agritech },
    { key: 'sec_ecommerce', value: t.sec_ecommerce },
    { key: 'sec_saas', value: t.sec_saas },
    { key: 'sec_ai', value: t.sec_ai },
    { key: 'sec_realestate', value: t.sec_realestate },
    { key: 'sec_logistics', value: t.sec_logistics },
    { key: 'sec_energy', value: t.sec_energy },
    { key: 'sec_social', value: t.sec_social },
    { key: 'sec_media', value: t.sec_media },
    { key: 'sec_industrial', value: t.sec_industrial },
    { key: 'sec_commercial', value: t.sec_commercial },
    { key: 'sec_beauty', value: t.sec_beauty },
    { key: 'sec_other', value: t.sec_other },
  ];

  const validateStep = (stepNum: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!founderName.trim()) stepErrors.founderName = t.requiredField;
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) stepErrors.email = lang === 'ar' ? 'بريد إلكتروني صحيح مطلوب' : 'Valid email required';
      if (!phone.trim() || !/^\d{9,10}$/.test(phone.replace(/\s+/g, ''))) {
        stepErrors.phone = lang === 'ar' ? 'رقم جوال صحيح مطلوب (9 خانات)' : 'Valid telephone is required (9 digits)';
      }
      if (!projectName.trim()) stepErrors.projectName = t.requiredField;
      if (!city.trim()) stepErrors.city = t.requiredField;
    }

    if (stepNum === 2) {
      if (!description.trim()) stepErrors.description = t.requiredField;
      if (description.length > 500) stepErrors.description = lang === 'ar' ? 'تجاوزت الحد الأقصى (500 حرف)' : 'Exceeded limit (500 chars)';
      if (!problem.trim()) stepErrors.problem = t.requiredField;
      if (!targetMarket) stepErrors.targetMarket = t.requiredField;
    }

    if (stepNum === 3) {
      if (!stage) stepErrors.stage = t.requiredField;
      if (!hasRevenue) stepErrors.hasRevenue = t.requiredField;
      if (hasRevenue === 'yes' && !revenueRange) stepErrors.revenueRange = t.requiredField;
      if (!teamSize) stepErrors.teamSize = t.requiredField;
    }

    if (stepNum === 4) {
      if (lookingFor.length === 0) stepErrors.lookingFor = t.requiredField;
      if (revenueModel.length === 0) stepErrors.revenueModel = t.requiredField;
      if ((revenueModel.includes(translations.ar.rm_other) || revenueModel.includes(translations.en.rm_other)) && !revenueModelOther.trim()) {
        stepErrors.revenueModelOther = t.requiredField;
      }
      if (!fundingRange) stepErrors.fundingRange = t.requiredField;
      if (!equityOffered.trim()) {
        stepErrors.equityOffered = t.requiredField;
      } else {
        const val = parseFloat(equityOffered);
        if (isNaN(val) || val < 0 || val > 100) {
          stepErrors.equityOffered = lang === 'ar' ? 'يجب أن تكون الحصة نسبة بين 0 و 100' : 'Equity must be between 0 and 100';
        }
      }
      if (sectors.length === 0) stepErrors.sectors = t.requiredField;
      if ((sectors.includes(translations.ar.sec_other) || sectors.includes(translations.en.sec_other)) && !sectorsOther.trim()) {
        stepErrors.sectorsOther = t.requiredField;
      }
    }

    if (stepNum === 5) {
      if (!heardFrom.trim()) stepErrors.heardFrom = t.requiredField;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = async () => {
    if (isSubmitting || isUploadingPitch) return;
    setSubmitError('');

    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Final Submission
        const payload = {
          founder_name: founderName,
          email,
          phone,
          phone_country: phoneCountry,
          city,
          project_name: projectName,
          description,
          problem,
          target_market: targetMarket,
          stage,
          has_revenue: hasRevenue,
          revenue_range: hasRevenue === 'yes' ? revenueRange : undefined,
          team_size: teamSize,
          looking_for: lookingFor,
          looking_for_notes: lookingForNotes,
          revenue_model: revenueModel.map(model => {
            if (model === translations.ar.rm_other || model === translations.en.rm_other) {
              const prefix = lang === 'ar' ? 'أخرى' : 'Other';
              return `${prefix}: ${revenueModelOther}`;
            }
            return model;
          }),
          funding_range: fundingRange,
          equity_offered: parseFloat(equityOffered) || 10,
          sectors: sectors.map(sec => {
            if (sec === translations.ar.sec_other || sec === translations.en.sec_other) {
              const prefix = lang === 'ar' ? 'أخرى' : 'Other';
              return `${prefix}: ${sectorsOther}`;
            }
            return sec;
          }),
          pitch_url: pitchUrl,
          pitch_file_url: pitchFileUrl || '',
          pitch_file_name: pitchFileName,
          pitch_file_size: pitchFileSize || undefined,
          pitch_file_type: pitchFileType || undefined,
          // Support both naming schemes for files to ensure flawless DB insertion or updates
          file_url: pitchFileUrl || '',
          file_name: pitchFileName,
          file_size: pitchFileSize || undefined,
          file_type: pitchFileType || undefined,
          heard_from: heardFrom
        };
        try {
          setIsSubmitting(true);
          await onSubmit(payload);
        } catch (error) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : (lang === 'ar' ? 'تعذر إرسال الفكرة. يرجى المحاولة مرة أخرى.' : 'Could not submit the idea. Please try again.')
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    } else if (currentStep === 5) {
      setSubmitError(lang === 'ar' ? 'يرجى تعبئة الحقول المطلوبة قبل إرسال الفكرة.' : 'Please complete the required fields before submitting.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  // Helper selectors toggle
  const toggleLookingFor = (item: string) => {
    if (lookingFor.includes(item)) {
      setLookingFor(prev => prev.filter(x => x !== item));
    } else {
      setLookingFor(prev => [...prev, item]);
    }
  };

  const toggleRevenueModel = (item: string) => {
    if (revenueModel.includes(item)) {
      setRevenueModel(prev => prev.filter(x => x !== item));
    } else {
      setRevenueModel(prev => [...prev, item]);
    }
  };

  const toggleSectorSelection = (item: string) => {
    if (sectors.includes(item)) {
      setSectors(prev => prev.filter(x => x !== item));
    } else {
      setSectors(prev => [...prev, item]);
    }
  };

  // File drag & selection upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadError('');
      if (file.size > 20 * 1024 * 1024) {
        setUploadError(lang === 'ar' ? 'الملف كبير جداً، الحد الأقصى 20 ميغابايت' : 'File is too large. Maximum limit is 20MB.');
        return;
      }
      try {
        setIsUploadingPitch(true);
        setPitchFileName(file.name);
        setPitchFileSize(file.size);
        setPitchFileType(file.type || 'application/octet-stream');
        
        const randomPath = `${Math.random().toString(36).substr(2, 9)}/${file.name}`;
        const storageUrl = await uploadFile(file, 'pitch_decks', randomPath);
        setPitchFileUrl(storageUrl);
      } catch (err) {
        console.error('File upload error:', err);
        setPitchFileUrl('');
        setUploadError(lang === 'ar' ? 'تعذر رفع الملف. يمكنك إرسال الطلب بدون ملف أو وضع رابط العرض التقديمي.' : 'Could not upload the file. You can submit without a file or add a pitch link.');
      } finally {
        setIsUploadingPitch(false);
      }
    }
  };

  return (
    <div 
      className="w-full max-w-[680px] mx-auto bg-white rounded-2xl p-6 md:p-8 border-0 shadow-none relative"
      id="submission-card-outer"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* CARD TOP BAR */}
      <div className="flex items-center justify-between mb-4 select-none" id="card-top-header">
        {/* Step Title (Right RTL / Left LTR) */}
        <span 
          className="text-lg md:text-xl font-bold text-[#F59E0B]"
          id="card-step-title"
        >
          {t[`step${currentStep}Title` as keyof typeof t]}
        </span>

        {/* Step Counter (Left RTL / Right LTR) */}
        <span 
          className="text-sm font-medium text-gray-500 font-mono"
          id="card-step-counter"
        >
          {lang === 'ar' 
            ? `${currentStep} ${t.of} 5 ${t.step}`
            : `${t.step} ${currentStep} ${t.of} 5`
          }
        </span>
      </div>

      {/* FULL WIDTH PROGRESS BAR (AMBER) */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden" id="card-progress-bar-container">
        <div 
          className="h-full bg-[#F59E0B] transition-all duration-300 rounded-full" 
          style={{ width: `${(currentStep / 5) * 100}%` }}
          id="card-progress-bar-fill"
        />
      </div>

      {/* STEP BODY */}
      <div className="space-y-6" id="form-fields-container">
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in" id="step-1-fields">
            {/* Founder Name */}
            <div className="flex flex-col gap-2" id="field-founder-name-group">
              <label className="text-right font-semibold text-sm text-[#374151] flex items-center justify-between" id="label-founder">
                <span>{t.founderName} <span className="text-[#EF4444]">*</span></span>
              </label>
              <input 
                type="text"
                value={founderName}
                onChange={e => setFounderName(e.target.value)}
                placeholder={t.founderNamePlaceholder}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 ${errors.founderName ? 'border-red-500 bg-red-50/10' : 'border-[#D1D5DB]'} focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-[#9CA3AF]`}
                id="input-founder-name"
              />
              {errors.founderName && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-founder-name"><AlertCircle className="w-3.5 h-3.5" />{errors.founderName}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2" id="field-email-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-email">
                {t.email} <span className="text-[#EF4444]">*</span>
              </label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                dir="ltr"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 text-left ${errors.email ? 'border-red-500 bg-red-50/10' : 'border-[#D1D5DB]'} focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-[#9CA3AF]`}
                id="input-email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-email"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>
              )}
            </div>

            {/* Telephone with Saudi Flag Selector */}
            <div className="flex flex-col gap-2" id="field-phone-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-phone">
                {t.phone} <span className="text-[#EF4444]">*</span>
              </label>
              <div className="flex rounded-lg overflow-hidden border border-[#D1D5DB] focus-within:border-[#3B82F6] focus-within:ring-3 focus-within:ring-[#3B82F6]/10 transition-all" id="phone-input-wrapper">
                {/* Saudi Flag Tag */}
                <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-e border-[#D1D5DB] font-mono text-xs text-gray-600 select-none" id="phone-flag-box">
                  <span className="text-lg">🇸🇦</span>
                  <span>+966</span>
                </div>
                <input 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.phonePlaceholder}
                  dir="ltr"
                  className={`w-full px-4 py-3 text-sm text-gray-800 outline-none placeholder-[#9CA3AF] ${errors.phone ? 'bg-red-50/10' : ''}`}
                  id="input-phone"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-mono text-right" id="phone-hint">من 9 أرقام، مثال: 501234567</p>
              {errors.phone && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-phone"><AlertCircle className="w-3.5 h-3.5" />{errors.phone}</p>
              )}
            </div>

            {/* Project Name */}
            <div className="flex flex-col gap-2" id="field-project-name-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-project-name">
                {t.projectName} <span className="text-[#EF4444]">*</span>
              </label>
              <input 
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder={t.projectNamePlaceholder}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 ${errors.projectName ? 'border-red-500 bg-red-50/10' : 'border-[#D1D5DB]'} focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-[#9CA3AF]`}
                id="input-project-name"
              />
              {errors.projectName && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-project-name"><AlertCircle className="w-3.5 h-3.5" />{errors.projectName}</p>
              )}
            </div>

            {/* Operating City */}
            <div className={`flex flex-col gap-2 relative ${isCityOpen ? 'z-40' : 'z-10'}`} ref={cityRef} id="field-city-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-city">
                {t.city} <span className="text-[#EF4444]">*</span>
              </label>
              
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCityOpen(prev => !prev);
                  setCitySearch('');
                }}
                className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between text-sm transition-all cursor-pointer bg-white ${
                  errors.city ? 'border-red-500 font-bold' : 'border-[#D1D5DB]'
                } focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 text-gray-700`}
                id="btn-dropdown-city"
              >
                <span>{city || (lang === 'ar' ? 'اختر المدينة...' : 'Select city...')}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown list (Opens upward since it's at the bottom) */}
              {isCityOpen && (
                <div className="absolute bottom-[102%] right-0 left-0 bg-white border border-[#D1D5DB] rounded-xl shadow-2xl z-50 py-1.5 max-h-[250px] flex flex-col" id="dropdown-city-options">
                  <div className="px-3 py-2 border-b border-gray-150" id="city-search-box-container">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#3B82F6] font-sans text-right"
                      placeholder={lang === 'ar' ? 'ابحث عن مدينة...' : 'Search city...'}
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      id="input-city-search"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 max-h-[180px]" id="city-options-list">
                    {saudiCities
                      .filter(c => 
                        c.ar.includes(citySearch) || 
                        c.en.toLowerCase().includes(citySearch.toLowerCase())
                      )
                      .map((c, idx) => {
                        const cityName = lang === 'ar' ? c.ar : c.en;
                        const isSelected = city === cityName;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCity(cityName);
                              setIsCityOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-right text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-all cursor-pointer ${
                              isSelected ? 'border-r-4 border-r-[#3B82F6] bg-blue-50/20 font-bold' : ''
                            }`}
                            id={`option-city-${idx}`}
                          >
                            <span>{cityName}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#3B82F6]" />}
                          </button>
                        );
                      })}
                    {saudiCities.filter(c => 
                      c.ar.includes(citySearch) || 
                      c.en.toLowerCase().includes(citySearch.toLowerCase())
                    ).length === 0 && (
                      <div className="text-center py-4 text-xs text-gray-400 font-sans">
                        {lang === 'ar' ? 'لم يتم العثور على المدينة' : 'No city found'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {errors.city && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-city"><AlertCircle className="w-3.5 h-3.5" />{errors.city}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: IDEA DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in" id="step-2-fields">
            {/* Description (max 500 length) */}
            <div className="flex flex-col gap-2" id="field-description-group">
              <div className="flex justify-between items-center text-sm font-semibold text-[#374151]" id="desc-label-header">
                <div>
                  {t.description} <span className="text-[#EF4444]">*</span>
                </div>
                <div className={`font-mono text-xs ${description.length > 500 ? 'text-red-500' : 'text-gray-400'}`} id="desc-char-counter">
                  {description.length}/500
                </div>
              </div>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 resize-none ${errors.description ? 'border-red-500 bg-red-50/10' : 'border-[#D1D5DB]'} focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-[#9CA3AF]`}
                id="textarea-description"
              />
              {errors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-description"><AlertCircle className="w-3.5 h-3.5" />{errors.description}</p>
              )}
            </div>

            {/* Problem solved */}
            <div className="flex flex-col gap-2" id="field-problem-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-problem">
                {t.problem} <span className="text-[#EF4444]">*</span>
              </label>
              <textarea 
                value={problem}
                onChange={e => setProblem(e.target.value)}
                placeholder={t.problemPlaceholder}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 resize-none ${errors.problem ? 'border-red-500 bg-red-50/10' : 'border-[#D1D5DB]'} focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-[#9CA3AF]`}
                id="textarea-problem"
              />
              {errors.problem && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-problem"><AlertCircle className="w-3.5 h-3.5" />{errors.problem}</p>
              )}
            </div>

            {/* Target Market in 2x2 Grid option cards */}
            <div className="flex flex-col gap-3.5" id="field-target-market-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-target-market">
                {t.targetMarket} <span className="text-[#EF4444]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="target-market-grid">
                {/* B2B */}
                <button
                  type="button"
                  onClick={() => setTargetMarket('B2B')}
                  className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer text-sm ${
                    targetMarket === 'B2B' 
                      ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                      : 'border-[#D1D5DB] text-[#374151] bg-white hover:bg-gray-50'
                  }`}
                  id="btn-market-b2b"
                >
                  <span className="font-bold block text-sm" id="market-b2b-header">B2B</span>
                  <span className="text-xs opacity-80 mt-1" id="market-b2b-subtitle">{lang === 'ar' ? 'البيع للشركات والمؤسسات التجارية' : 'Selling to corporations & businesses'}</span>
                </button>

                {/* B2C */}
                <button
                  type="button"
                  onClick={() => setTargetMarket('B2C')}
                  className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer text-sm ${
                    targetMarket === 'B2C' 
                      ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                      : 'border-[#D1D5DB] text-[#374151] bg-white hover:bg-gray-50'
                  }`}
                  id="btn-market-b2c"
                >
                  <span className="font-bold block text-sm" id="market-b2c-header">B2C</span>
                  <span className="text-xs opacity-80 mt-1" id="market-b2c-subtitle">{lang === 'ar' ? 'البيع للأفراد والمستهلكين مباشرة' : 'Selling directly to consumers'}</span>
                </button>

                {/* B2B2C */}
                <button
                  type="button"
                  onClick={() => setTargetMarket('B2B2C')}
                  className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer text-sm ${
                    targetMarket === 'B2B2C' 
                      ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                      : 'border-[#D1D5DB] text-[#374151] bg-white hover:bg-gray-50'
                  }`}
                  id="btn-market-b2b2c"
                >
                  <span className="font-bold block text-sm" id="market-b2b2c-header">B2B2C</span>
                  <span className="text-xs opacity-80 mt-1" id="market-b2b2c-subtitle">{lang === 'ar' ? 'البيع عبر الشركاء للمستخدم النهائي' : 'Selling via businesses to end users'}</span>
                </button>

                {/* Gov */}
                <button
                  type="button"
                  onClick={() => setTargetMarket('Gov')}
                  className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer text-sm ${
                    targetMarket === 'Gov' 
                      ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                      : 'border-[#D1D5DB] text-[#374151] bg-white hover:bg-gray-50'
                  }`}
                  id="btn-market-gov"
                >
                  <span className="font-bold block text-sm" id="market-gov-header">{lang === 'ar' ? 'حكومي' : 'Government'}</span>
                  <span className="text-xs opacity-80 mt-1" id="market-gov-subtitle">{lang === 'ar' ? 'الجهات والمؤسسات الحكومية والبلدية' : 'Providing to government agencies'}</span>
                </button>
              </div>
              {errors.targetMarket && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-target-market"><AlertCircle className="w-3.5 h-3.5" />{errors.targetMarket}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: BUSINESS INFORMATION */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in" id="step-3-fields">
            {/* Current Stage: 5 Toggle buttons in a single row */}
            <div className="flex flex-col gap-3 font-sans" id="field-stage-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-stage">
                {t.currentStage} <span className="text-[#EF4444]">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2" id="stage-row-container">
                {(['idea', 'prototype', 'early', 'growth', 'expansion'] as const).map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setStage(stg)}
                    className={`flex-1 min-w-[90px] py-3 px-2 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                      stage === stg
                        ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50 shadow-sm'
                        : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
                    }`}
                    id={`btn-stage-${stg}`}
                  >
                    {t[`stage_${stg}` as keyof typeof t]}
                  </button>
                ))}
              </div>
              {errors.stage && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-stage"><AlertCircle className="w-3.5 h-3.5" />{errors.stage}</p>
              )}
            </div>

            {/* Has Revenue? 2 Toggle Buttons */}
            <div className="flex flex-col gap-3" id="field-has-revenue-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-has-revenue">
                {t.hasRevenue} <span className="text-[#EF4444]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3" id="has-revenue-row">
                <button
                  type="button"
                  onClick={() => {
                    setHasRevenue('yes');
                    setRevenueRange('early');
                  }}
                  className={`py-3 px-4 rounded-lg border text-sm font-bold text-center cursor-pointer transition-all ${
                    hasRevenue === 'yes'
                      ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                      : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
                  }`}
                  id="btn-revenue-yes"
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasRevenue('no');
                    setRevenueRange(undefined);
                  }}
                  className={`py-3 px-4 rounded-lg border text-sm font-bold text-center cursor-pointer transition-all ${
                    hasRevenue === 'no'
                      ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                      : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
                  }`}
                  id="btn-revenue-no"
                >
                  {t.no}
                </button>
              </div>
              {errors.hasRevenue && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-has-revenue"><AlertCircle className="w-3.5 h-3.5" />{errors.hasRevenue}</p>
              )}
            </div>

            {/* Revenue range: 3 toggle buttons (Conditional showing) */}
            {hasRevenue === 'yes' && (
              <div className="flex flex-col gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100 animate-slide-down" id="field-revenue-range-group">
                <label className="text-right font-semibold text-sm text-[#374151]" id="label-revenue-range">
                  {t.revenueRange} <span className="text-[#EF4444]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2" id="revenue-range-row">
                  {(['early', 'growth', 'expansion'] as const).map((rKey) => (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => setRevenueRange(rKey)}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                        revenueRange === rKey
                          ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                          : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
                      }`}
                      id={`btn-rev-range-${rKey}`}
                    >
                      {t[`rev_${rKey}` as keyof typeof t]}
                    </button>
                  ))}
                </div>
                {errors.revenueRange && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-revenue-range"><AlertCircle className="w-3.5 h-3.5" />{errors.revenueRange}</p>
                )}
              </div>
            )}

            {/* Team size: 4 toggle buttons */}
            <div className="flex flex-col gap-3" id="field-team-size-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-team-size">
                {t.teamSize} <span className="text-[#EF4444]">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2" id="team-size-grid">
                {(['1', '2-5', '6-15', '15+'] as const).map((ts) => (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => setTeamSize(ts)}
                    className={`py-3 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                      teamSize === ts
                        ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                        : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
                    }`}
                    id={`btn-teamsize-${ts}`}
                  >
                    {ts}
                  </button>
                ))}
              </div>
              {errors.teamSize && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-team-size"><AlertCircle className="w-3.5 h-3.5" />{errors.teamSize}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: FUNDING & SECTORS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in text-right" id="step-4-fields">
            {/* Looking For multi-select wrapping row toggles */}
            <div className="flex flex-col gap-3" id="field-looking-for-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-looking-for">
                {t.lookingFor} <span className="text-[#EF4444]">*</span>
              </label>
              <div className="flex flex-wrap gap-2 justify-start items-center" id="looking-for-flex">
                {[
                  { key: 'lf_investment', raw: 'استثمار', label: t.lf_investment },
                  { key: 'lf_mentorship', raw: 'إرشاد', label: t.lf_mentorship },
                  { key: 'lf_partnership', raw: 'شراكة', label: t.lf_partnership },
                  { key: 'lf_advFunding', raw: 'تمويل متقدم', label: t.lf_advFunding },
                  { key: 'lf_support', raw: 'دعم مبكر', label: t.lf_support },
                ].map((item) => {
                  const isSelected = lookingFor.includes(item.raw);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleLookingFor(item.raw)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? 'border-[#F97316] text-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]/50'
                          : 'border-[#D1D5DB] text-[#374151] bg-white hover:bg-gray-50'
                      }`}
                      id={`btn-lookingfor-${item.key}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.lookingFor && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-looking-for"><AlertCircle className="w-3.5 h-3.5" />{errors.lookingFor}</p>
              )}
            </div>

            {/* Looking For Notes text input, shown when choice is made */}
            {lookingFor.length > 0 && (
              <div className="flex flex-col gap-2 animate-slide-down" id="field-looking-for-notes-group">
                <label className="text-right text-xs font-semibold text-gray-500" id="label-looking-for-notes">
                  {t.pleaseClarify} <span className="text-[#EF4444]">*</span>
                </label>
                <input 
                  type="text"
                  value={lookingForNotes}
                  onChange={e => setLookingForNotes(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب تفاصيل أكثر عما ترغب في الوصول إليه...' : 'Write more details about what you hope to access...'}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] text-sm text-gray-800 focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none placeholder-[#9CA3AF]"
                  id="input-looking-for-notes"
                  required
                />
              </div>
            )}

            {/* Custom Multi-select Dropdown: Revenue Model */}
            <div className={`flex flex-col gap-2 relative ${isRevModelOpen ? 'z-40' : 'z-20'}`} ref={revModelRef} id="field-revenue-model-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-revenue-model">
                {t.revenueModel} <span className="text-[#EF4444]">*</span>
              </label>
              
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsRevModelOpen(prev => !prev)}
                className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between text-sm transition-all cursor-pointer bg-white ${
                  errors.revenueModel ? 'border-red-500' : 'border-[#D1D5DB]'
                } focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 text-gray-700`}
                id="btn-dropdown-rev-model"
              >
                <span className="truncate max-w-[90%]">
                  {revenueModel.length > 0 
                    ? revenueModel.join('، ')
                    : t.dropdownChoose
                  }
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isRevModelOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Checklist Dropdown Portal */}
              {isRevModelOpen && (
                <div className="absolute top-[102%] right-0 left-0 bg-white border border-[#D1D5DB] rounded-xl shadow-xl z-50 py-1.5 max-h-[220px] overflow-y-auto" id="dropdown-rev-model-options">
                  {revenueModelOptions.map((opt) => {
                    const isChecked = revenueModel.includes(opt.value);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleRevenueModel(opt.value)}
                        className={`w-full px-4 py-2 text-right text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-all font-medium cursor-pointer ${
                          isChecked ? 'border-r-4 border-r-[#3B82F6] bg-blue-50/20' : ''
                        }`}
                        id={`option-rev-model-${opt.key}`}
                      >
                        <span>{opt.value}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-gray-300'
                        }`} id={`checkbox-rev-model-${opt.key}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.revenueModel && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-revenue-model"><AlertCircle className="w-3.5 h-3.5" />{errors.revenueModel}</p>
              )}
            </div>

            {/* Other Revenue Model input field */}
            {(revenueModel.includes(translations.ar.rm_other) || revenueModel.includes(translations.en.rm_other)) && (
              <div className="flex flex-col gap-2 animate-slide-down text-right" id="field-revenue-model-other-group">
                <label className="text-right text-xs font-semibold text-gray-500" id="label-revenue-model-other">
                  {t.pleaseClarify} <span className="text-[#EF4444]">*</span>
                </label>
                <input 
                  type="text"
                  value={revenueModelOther}
                  onChange={e => setRevenueModelOther(e.target.value)}
                  placeholder={t.rm_other_placeholder}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none placeholder-[#9CA3AF] ${errors.revenueModelOther ? 'border-red-500 bg-red-50/10' : 'border-[#D1D5DB]'}`}
                  id="input-revenue-model-other"
                  required
                />
                {errors.revenueModelOther && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-revenue-model-other">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.revenueModelOther}
                  </p>
                )}
              </div>
            )}

            {/* Custom Single-select Dropdown: Funding required in SAR */}
            <div className={`flex flex-col gap-2 relative ${isFundingOpen ? 'z-40' : 'z-10'}`} ref={fundingRef} id="field-funding-range-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-funding-range">
                {t.fundingRequired} <span className="text-[#EF4444]">*</span>
              </label>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsFundingOpen(prev => !prev)}
                className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between text-sm transition-all cursor-pointer bg-white ${
                  errors.fundingRange ? 'border-red-500' : 'border-[#D1D5DB]'
                } focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 text-gray-700`}
                id="btn-dropdown-funding"
              >
                <span>{fundingRange || t.selectFunding}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isFundingOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom list */}
              {isFundingOpen && (
                <div className="absolute top-[102%] right-0 left-0 bg-white border border-[#D1D5DB] rounded-xl shadow-xl z-50 py-1.5 max-h-[220px] overflow-y-auto" id="dropdown-funding-options">
                  {fundingRangeOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFundingRange(opt);
                        setIsFundingOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-right text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-all cursor-pointer ${
                        fundingRange === opt ? 'border-r-4 border-r-[#3B82F6] bg-blue-50/20 font-bold' : ''
                      }`}
                      id={`option-funding-${idx}`}
                    >
                      <span>{opt}</span>
                      {fundingRange === opt && <Check className="w-3.5 h-3.5 text-[#3B82F6]" />}
                    </button>
                  ))}
                </div>
              )}
              {errors.fundingRange && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-funding-range"><AlertCircle className="w-3.5 h-3.5" />{errors.fundingRange}</p>
              )}
            </div>

            {/* Input field: Equity Offered (%) الحصة المعروضة للشركاء/المستثمرين */}
            <div className="flex flex-col gap-2" id="field-equity-offered-group">
              <label className="text-right font-semibold text-sm text-[#374151] flex items-center justify-between" id="label-equity-offered">
                <span>
                  {lang === 'ar' ? 'الحصة المعروضة للمستستثمرين (%)' : 'Proposed Equity Offered (%)'} <span className="text-[#EF4444]">*</span>
                </span>
                <span className="text-[11px] text-gray-400 font-normal">
                  {lang === 'ar' ? 'أدخل النسبة المطلوبة (مثال: 10)' : 'Enter percentage (e.g., 10)'}
                </span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={equityOffered}
                  onChange={(e) => setEquityOffered(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border text-sm transition-all focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 text-gray-700 bg-white font-mono focus:outline-none ${
                    errors.equityOffered ? 'border-red-500' : 'border-[#D1D5DB]'
                  } ${lang === 'ar' ? 'text-left pl-12' : 'text-left pr-12'}`}
                  placeholder="10"
                  id="input-equity-offered"
                />
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'left-4' : 'right-4'} flex items-center text-sm font-extrabold text-gray-400 font-mono pointer-events-none`}>
                  %
                </span>
              </div>
              <p className="text-[11px] text-gray-400 text-right mt-0.5 font-ar">
                {lang === 'ar' 
                  ? 'النسبة المئوية المقترح التنازل عنها للمستثمرين مقابل قيمة الدعم / التمويل المطلوب' 
                  : 'Proposed percentage of startup equity of this venture to offer in exchange for the requested funding.'}
              </p>
              {errors.equityOffered && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-equity-offered">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.equityOffered}
                </p>
              )}
            </div>

            {/* Custom Multi-select Dropdown: Sectors */}
            <div className={`flex flex-col gap-2 relative ${isSectorsOpen ? 'z-40' : 'z-0'}`} ref={sectorsRef} id="field-sectors-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-sectors">
                {t.sectorsLabel} <span className="text-[#EF4444]">*</span>
              </label>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsSectorsOpen(prev => !prev)}
                className={`w-full px-4 py-3 rounded-lg border border-[#D1D5DB] flex items-center justify-between text-sm transition-all cursor-pointer bg-white ${
                  errors.sectors ? 'border-red-500' : 'border-[#D1D5DB]'
                } focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 text-gray-700`}
                id="btn-dropdown-sectors"
              >
                <span className="truncate max-w-[90%]">
                  {sectors.length > 0 
                    ? sectors.join('، ')
                    : t.selectSectors
                  }
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isSectorsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Options popup */}
              {isSectorsOpen && (
                <div className="absolute bottom-[102%] right-0 left-0 bg-white border border-[#D1D5DB] rounded-xl shadow-xl z-50 py-1.5 max-h-[220px] overflow-y-auto" id="dropdown-sectors-options">
                  {sectorsOptions.map((opt) => {
                    const isChecked = sectors.includes(opt.value);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleSectorSelection(opt.value)}
                        className={`w-full px-4 py-2 text-right text-xs text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-all font-medium cursor-pointer ${
                          isChecked ? 'border-r-4 border-r-[#3B82F6] bg-blue-50/20' : ''
                        }`}
                        id={`option-sector-${opt.key}`}
                      >
                        <span>{opt.value}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-gray-300'
                        }`} id={`checkbox-sector-${opt.key}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.sectors && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-sectors"><AlertCircle className="w-3.5 h-3.5" />{errors.sectors}</p>
              )}
            </div>

            {/* Other Sector input field */}
            {(sectors.includes(translations.ar.sec_other) || sectors.includes(translations.en.sec_other)) && (
              <div className="flex flex-col gap-2 animate-slide-down text-right animate-fade-in" id="field-sectors-other-group">
                <label className="text-right text-xs font-semibold text-gray-500" id="label-sectors-other">
                  {t.pleaseClarify} <span className="text-[#EF4444]">*</span>
                </label>
                <input 
                  type="text"
                  value={sectorsOther}
                  onChange={e => setSectorsOther(e.target.value)}
                  placeholder={t.sec_other_placeholder}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none placeholder-[#9CA3AF] ${errors.sectorsOther ? 'border-red-500 bg-red-50/10' : 'border-[#D1D5DB]'}`}
                  id="input-sectors-other"
                  required
                />
                {errors.sectorsOther && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-sectors-other">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.sectorsOther}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in text-right" id="step-5-fields">
            {/* Pitch deck upload area */}
            <div className="flex flex-col gap-2.5" id="field-pitch-deck-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-pitch-deck">
                {t.pitchDeck}
              </label>

              {/* Dashed Border Box */}
              <div 
                className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-6 text-center hover:border-orange-400 transition-colors bg-gray-50/30 flex flex-col items-center justify-center gap-3 select-none cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
                id="file-upload-dropzone"
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  className="hidden"
                  id="input-hidden-file"
                />
                
                {pitchFileName ? (
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-3 w-full max-w-[320px] mx-auto relative animate-fade-in" id="file-uploaded-view">
                    <div className="p-2 bg-orange-100 text-[#F97316] rounded-lg" id="file-icon-box">
                      <Upload className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="flex-1 text-right truncate text-xs font-bold text-gray-700" id="file-details">
                      {pitchFileName}
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPitchFileName('');
                        setPitchFileUrl('');
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                      id="btn-remove-file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-orange-50 text-[#F97316] rounded-full" id="upload-icon-circle">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-gray-500" id="upload-helper-subtitle">
                      {t.pitchUploadText}
                    </div>
                  </>
                )}
              </div>
              {isUploadingPitch && (
                <p className="text-xs text-[#F97316] font-semibold mt-2 text-center" id="pitch-upload-progress">
                  {lang === 'ar' ? 'جاري رفع الملف، يرجى الانتظار...' : 'Uploading file, please wait...'}
                </p>
              )}
              {uploadError && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-2" id="error-pitch-upload">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {uploadError}
                </p>
              )}

              {/* URL fallback divider */}
              <div className="flex items-center gap-4 my-2" id="pitch-divider">
                <div className="flex-1 h-[1px] bg-gray-200" />
                <span className="text-xs text-gray-400">{t.pitchOrUrl}</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>

              {/* URL input fallback */}
              <input 
                type="url"
                value={pitchUrl}
                onChange={e => setPitchUrl(e.target.value)}
                placeholder={t.pitchUrlPlaceholder}
                dir="ltr"
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg text-sm text-gray-800 focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none transition-all placeholder-[#9CA3AF]"
                id="input-pitch-url"
              />
            </div>

            {/* How did you hear about us? */}
            <div className="flex flex-col gap-2" id="field-heard-from-group">
              <label className="text-right font-semibold text-sm text-[#374151]" id="label-heard-from">
                {t.heardFrom} <span className="text-[#EF4444]">*</span>
              </label>
              <input 
                type="text"
                value={heardFrom}
                onChange={e => setHeardFrom(e.target.value)}
                placeholder={t.heardFromPlaceholder}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 ${errors.heardFrom ? 'border-red-500' : 'border-[#D1D5DB]'} focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 outline-none-transition placeholder-[#9CA3AF]`}
                id="input-heard-from"
              />
              {errors.heardFrom && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1" id="error-heard-from"><AlertCircle className="w-3.5 h-3.5" />{errors.heardFrom}</p>
              )}
            </div>

            {/* Gray Summary Card */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex flex-col gap-2 select-none" id="review-summary-card">
              <div className="text-sm font-bold text-[#0F766E] mb-1" id="summary-header">
                {t.requestSummary}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs text-gray-600" id="summary-details">
                <div className="flex items-center gap-1" id="summary-project-box">
                  <span className="font-semibold text-gray-700">{lang === 'ar' ? 'اسم المشروع:' : 'Project:'}</span>
                  <span className="truncate">{projectName || '—'}</span>
                </div>
                <div className="flex items-center gap-1" id="summary-founder-box">
                  <span className="font-semibold text-gray-700">{lang === 'ar' ? 'المؤسس:' : 'Founder:'}</span>
                  <span className="truncate">{founderName || '—'}</span>
                </div>
                <div className="flex items-center gap-1" id="summary-city-box">
                  <span className="font-semibold text-gray-700">{lang === 'ar' ? 'المدينة:' : 'City:'}</span>
                  <span className="truncate">{city || '—'}</span>
                </div>
                <div className="flex items-center gap-1" id="summary-email-box">
                  <span className="font-semibold text-gray-700">{lang === 'ar' ? 'البريد:' : 'Email:'}</span>
                  <span className="truncate">{email || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER NAVIGATION ACTIONS */}
      {(submitError || isUploadingPitch) && (
        <div className={`mt-6 rounded-xl border px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
          submitError
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-orange-200 bg-orange-50 text-orange-700'
        }`} id="submission-final-feedback">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {submitError || (lang === 'ar' ? 'انتظر حتى ينتهي رفع الملف قبل إرسال الفكرة.' : 'Please wait until the file upload finishes before submitting.')}
          </span>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between" id="form-card-navigation">
        {/* Next Button / Submit (Always situated bottom LEFT) */}
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting || isUploadingPitch}
          className="px-6 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full font-bold text-sm cursor-pointer transition-all shadow-md flex items-center gap-2 select-none order-1 disabled:opacity-60 disabled:cursor-not-allowed"
          id="btn-nav-next"
        >
          {currentStep === 5 ? (
            <>
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : t.submit}</span>
            </>
          ) : (
            <>
              <span>{t.next}</span>
              <span className={`inline-block ${lang === 'ar' ? 'rotate-0' : 'rotate-180'}`}>←</span>
            </>
          )}
        </button>

        {/* Back Link (Always situated bottom RIGHT) */}
        <button
          type="button"
          onClick={handleBack}
          disabled={isSubmitting}
          className="text-gray-400 hover:text-gray-600 font-bold transition-all flex items-center gap-1 text-sm bg-transparent border-0 cursor-pointer select-none order-2 disabled:opacity-60 disabled:cursor-not-allowed"
          id="btn-nav-back"
        >
          <span className={`inline-block ${lang === 'ar' ? 'rotate-0' : 'rotate-180'}`}>→</span>
          <span>{currentStep === 1 ? (lang === 'ar' ? 'إلغاء' : 'Cancel') : t.back}</span>
        </button>
      </div>
    </div>
  );
}
