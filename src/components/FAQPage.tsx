import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface FAQPageProps {
  lang: Language;
}

interface FAQItem {
  id: number;
  q_ar: string;
  a_ar: string;
  q_en: string;
  a_en: string;
}

export default function FAQPage({ lang }: FAQPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAr = lang === 'ar';

  const faqs: FAQItem[] = [
    {
      id: 1,
      q_ar: 'من يمكنه استخدام المنصة؟',
      a_ar: 'أي شخص لديه فكرة مشروع أو شركة ناشئة ويرغب في عرضها وتقييمها وربطها بفرص استثمارية أو شراكات استراتيجية.',
      q_en: 'Who can use the platform?',
      a_en: 'Anyone with a project idea or an early-stage startup wishing to present, evaluate, and connect it to potential investors or strategic alliances.',
    },
    {
      id: 2,
      q_ar: 'هل يمكنني مشاركة فكرة لا تزال في مرحلة الفكرة فقط؟',
      a_ar: 'نعم، المنصة تستقبل الأفكار والمشاريع في جميع المراحل.',
      q_en: 'Can I share an idea that is still in the concept phase?',
      a_en: 'Yes, the platform accepts and nurtures startup concepts and projects across all development stages.',
    },
    {
      id: 3,
      q_ar: 'هل يشترط وجود إيرادات؟',
      a_ar: 'لا، يمكن تقديم المشروع سواء كان يحقق إيرادات أو لا يزال في مرحلة التطوير.',
      q_en: 'Is having revenue required?',
      a_en: 'No, you may pitch your project whether it is already generating revenue or is still undergoing active development.',
    },
    {
      id: 4,
      q_ar: 'ماذا يحدث بعد إرسال الفكرة؟',
      a_ar: 'يتم تحليل المشروع وإنشاء ملخص احترافي وتقييم أولي يساعد على فهم فرص النمو والاستثمار.',
      q_en: 'What happens after I submit my idea?',
      a_en: 'Your idea is analyzed, and a professional brief and preliminary grading are formulated to help gauge growth prospects and investment fit.',
    },
    {
      id: 5,
      q_ar: 'هل تساعد المنصة في الوصول إلى المستثمرين؟',
      a_ar: 'نعم، المنصة تهدف إلى تسهيل الربط بين المشاريع الواعدة والمستثمرين والشركاء المناسبين.',
      q_en: 'Does the platform help in reaching investors?',
      a_en: 'Yes, the core objective of the platform is to bridge promising projects with aligned investors and strategic advisors.',
    },
    {
      id: 6,
      q_ar: 'هل معلوماتي ومشروعي سرية؟',
      a_ar: 'يتم التعامل مع المعلومات وفق سياسات الخصوصية والأمان المعتمدة في المنصة الإلكترونية لحماية سرية ابتكاراتك.',
      q_en: 'Are my project information and details confidential?',
      a_en: 'All data is strictly processed according to certified privacy and confidentiality guidelines, securing your proprietary innovations.',
    },
  ];

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div 
      className="flex-1 w-full flex flex-col items-center justify-start p-6 md:p-12 relative z-10" 
      id="faq-page-container"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Tajawal', sans-serif"
      }}
    >
      <div 
        className="w-full max-w-3xl mx-auto flex flex-col gap-10 mt-6"
        style={{
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Header styling */}
        <div className="flex flex-col items-center text-center">
          <HelpCircle className="w-12 h-12 text-[#F5C842] mb-3" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-xs md:text-sm text-[#B0D4E0]/85 mt-2">
            {isAr ? 'كل ما تود معرفته عن منصة شارك الفكرة وكيف نساند طموحك' : 'Everything you want to know about Share Idea and how we support you'}
          </p>
          <div className="w-20 h-1 bg-[#F5C842] rounded-full mt-4" />
        </div>

        {/* Accordions container stack */}
        <div className="flex flex-col gap-4 w-full" id="faq-accordions-group">
          {faqs.map((item) => {
            const isOpen = openId === item.id;
            const question = isAr ? item.q_ar : item.q_en;
            const answer = isAr ? item.a_ar : item.a_en;

            return (
              <div 
                key={item.id}
                className="bg-[#0A4F68] border border-white/8 rounded-xl overflow-hidden transition-all duration-300 shadow-md"
                id={`faq-item-card-${item.id}`}
              >
                {/* Trigger Button bar */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-right bg-transparent text-white font-bold text-base hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-[#F5C842]/30 cursor-pointer"
                  id={`faq-trigger-btn-${item.id}`}
                >
                  <span className="flex-1 text-right leading-relaxed pr-2 font-semibold">
                    {question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#F5C842] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    id={`faq-icon-arrow-${item.id}`}
                  />
                </button>

                {/* Animated content box */}
                <div 
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isOpen ? '200px' : '0',
                    opacity: isOpen ? 1 : 0,
                  }}
                  id={`faq-animated-drawer-${item.id}`}
                >
                  <div 
                    className="p-5 text-sm text-[rgba(255,255,255,0.85)] leading-relaxed border-t border-white/5"
                    style={{
                      direction: isAr ? 'rtl' : 'ltr',
                      backgroundColor: '#083D52'
                    }}
                  >
                    {answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small helper footer */}
        <div className="text-center mt-4">
          <span className="text-sm text-[#B0D4E0]/80">
            {isAr ? 'لم تجد إجابة لسؤالك؟ تواصل معنا مباشرة.' : 'Did not find your answer? Reach out to us.'}
          </span>
        </div>
      </div>
    </div>
  );
}
