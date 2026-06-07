import React, { useEffect, useState } from 'react';
import { ShieldCheck, Calendar } from 'lucide-react';
import { Language } from '../types';

interface DocsPageProps {
  lang: Language;
  mode: 'privacy' | 'terms';
}

export default function DocsPage({ lang, mode }: DocsPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mode]);

  const isAr = lang === 'ar';
  const isPrivacy = mode === 'privacy';

  return (
    <div 
      className="flex-1 w-full flex flex-col items-center justify-start p-6 md:p-12 relative z-10" 
      id="docs-page-container"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Tajawal', sans-serif"
      }}
    >
      <div 
        className="w-full max-w-3xl mx-auto flex flex-col gap-8 mt-6"
        style={{
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
        }}
      >
        {/* Title area */}
        <div className="flex flex-col items-center text-center">
          <ShieldCheck className="w-12 h-12 text-[#F5C842] mb-3" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {isPrivacy 
              ? (isAr ? 'سياسة الخصوصية' : 'Privacy Policy') 
              : (isAr ? 'الشروط والأحكام' : 'Terms & Conditions')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-[#B0D4E0]/80 mt-2 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>{isAr ? 'آخر تحديث: يونيو 2026' : 'Last Updated: June 2026'}</span>
          </div>
          <div className="w-20 h-1 bg-[#F5C842] rounded-full mt-4" />
        </div>

        {/* Legal Text content paper */}
        <div 
          className="bg-[#0A4F68] border border-white/8 rounded-2xl p-6 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] text-right"
          style={{ direction: isAr ? 'rtl' : 'ltr' }}
          id="docs-content-paper"
        >
          {isPrivacy ? (
            // Privacy Policy Texts
            <div className="space-y-6 text-white/90 text-sm md:text-base leading-relaxed" id="privacy-content-ar">
              {isAr ? (
                <>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">1. جمع المعلومات الشخصية والتقنية</h3>
                    <p>
                      نقوم بجمع البيانات الشخصية التي تزودنا بها طواعية مثل الاسم، البريد الإلكتروني، ورقم الهاتف، إضافة إلى تفاصيل مشروعك أو فكرتك المبتكرة عند استخدام نماذج تعبئة البيانات في المنصة.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">2. كيفية استخدام البيانات والمعلومات</h3>
                    <p>
                      نستخدم هذه البيانات لتسهيل عملية التقييم الأولي للأفكار الريادية، وحساب المؤشرات والمقاييس، والتواصل مع رواد الأعمال ومواءمتهم مع المستثمرين والشركاء المناسبين.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">3. حماية سرية الأفكار والملكية الفكرية</h3>
                    <p>
                      تلتزم منصتنا بأعلى معايير الأمان التقني والحوكمة لضمان سرية أفكار المشاريع والملفات وشرائح العرض المرفوعة من قبل أصحاب المشاريع، لضمان سلامتكم البيئية للملكية الفكرية.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">4. ملفات تعريف الارتباط والتقنيات الرديفة</h3>
                    <p>
                      تستخدم المنصة ملفات تعريف الارتباط البسيطة لتحسين سرعة التصفح وتخصيص إعدادات اللغة الافتراضية وحفظ الجلسات النشطة للمستخدمين والمشرفين.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">1. Information Collection</h3>
                    <p>
                      We gather personal and project data voluntarily provided by you, such as your full credentials, contact details, operating cities, and startup pitches.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">2. Use of Collected Data</h3>
                    <p>
                      Your information supports processing the evaluations, grading your submissions, communicating matchings, and aligning startup projects with potential investors.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">3. Confidentiality & Security</h3>
                    <p>
                      We mandate professional standards to secure your submitted concepts, slide decks, and details, avoiding leakage or unauthorized access.
                    </p>
                  </section>
                </>
              )}
            </div>
          ) : (
            // Terms of Service Texts
            <div className="space-y-6 text-white/90 text-sm md:text-base leading-relaxed" id="terms-content-ar">
              {isAr ? (
                <>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">1. القبول والالتزام بالشروط</h3>
                    <p>
                      باستخدامك لمنصة "شارك الفكرة"، فإنك تقر وتوافق بالكامل على الشروط والأحكام المطبقة هنا، وعلى سياسات استقبال وتقييم الأفكار المعروضة لتطوير ريادة الأعمال.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">2. أهلية الاستخدام ومسؤولية البيانات</h3>
                    <p>
                      يتحمل رائد الأعمال أو المستخدم المسؤولية القانونية الكاملة عن صحة كافة البيانات المقدمة، العروض التقديمية، وأرقام التواصل المرفقة بالمنصة.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">3. إخلاء المسؤولية عن قرارات الاستثمار</h3>
                    <p>
                      تعمل المنصة كمنسق أو نقطة ربط تقييمية وأداة تسهيل أولية فقط؛ وبالتالي لا تتحمل أي مسؤولية بشأن الصفقات والمفاوضات المالية النهائية التي تتم لاحقاً بين المستثمرين ورياديي الأعمال.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">4. التعديل على الخدمات والشروط</h3>
                    <p>
                      تحتفظ المنصة بالحق الكامل في تعديل هذه الشروط بصفة دورية ومنتظمة لمواكبة التغييرات التشريعية والتحديثات البرمجية.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">1. Acceptance of Terms</h3>
                    <p>
                      By utilizing "Share Idea", you fully consent and adhere strictly to these terms of service, governance conditions, and review operations.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">2. Accountability of Shared Concepts</h3>
                    <p>
                      Users bear absolute accountability regarding the truth, proprietary rights, and authenticity of any project material presented inside the workspace.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-lg font-bold text-[#F5C842]">3. Financial & Investment Disclaimer</h3>
                    <p>
                      The platform functions solely as a grading and matchmaking helper. We do not intermediate or guarantee finalized transaction rates, valuations, or fundings.
                    </p>
                  </section>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Button to return home */}
        <div className="text-center mt-2 pb-6">
          <span className="text-sm text-[#B0D4E0]/80">
            {isAr ? 'شارك الفكرة - تمكين الابتكار الريادي' : 'Share Idea - Empowering Innovation'}
          </span>
        </div>
      </div>
    </div>
  );
}
