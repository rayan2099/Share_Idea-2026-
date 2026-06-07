import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface FAQPageProps {
  lang: Language;
}

interface FAQItem {
  id: number;
  q_ar: string;
  a_ar: React.ReactNode;
  q_en: string;
  a_en: React.ReactNode;
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
      a_ar: (
        <div className="space-y-4">
          <p>
            نعم، نولي سرية الأفكار والمشاريع أهمية قصوى. جميع المعلومات التي تقوم بمشاركتها عبر منصة شارك الفكرة يتم التعامل معها بأعلى درجات السرية والخصوصية، ولا يتم نشرها أو مشاركتها مع أي طرف خارجي دون موافقتك أو وفقًا للأنظمة والسياسات المعتمدة.
          </p>
          <p>
            كما نلتزم بتطبيق إجراءات تقنية وتنظيمية تهدف إلى حماية بيانات المستخدمين والمشاريع من الوصول غير المصرح به، وتشمل:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pr-2">
            <li>تخزين البيانات بشكل آمن داخل أنظمة محمية.</li>
            <li>تقييد الوصول إلى معلومات المشاريع على الأشخاص المخولين فقط.</li>
            <li>استخدام بروتوكولات أمان حديثة لحماية البيانات أثناء الإرسال والتخزين.</li>
            <li>مراقبة الأنظمة بشكل مستمر للكشف عن أي محاولات وصول غير مصرح بها.</li>
          </ul>
          <p>
            ونؤكد أن ملكية الفكرة أو المشروع تبقى لصاحبها بالكامل، وأن تقديم الفكرة عبر المنصة لا يمنح أي طرف آخر أي حقوق ملكية فكرية عليها.
          </p>
          <p>
            هدف المنصة هو مساعدة رواد الأعمال على تطوير مشاريعهم وربطهم بالفرص المناسبة، مع الحفاظ على سرية المعلومات واحترام حقوق الملكية الفكرية لأصحاب الأفكار.
          </p>
          <p className="text-xs text-[#F5C842]/90 border-t border-white/5 pt-3 mt-3">
            <strong>ملاحظة:</strong> في حال احتاج المشروع إلى عرضه على مستثمر أو جهة شريكة مستقبلًا، فلن يتم ذلك إلا ضمن الإجراءات والضوابط المعتمدة من المنصة وبما يتوافق مع مصلحة صاحب المشروع.
          </p>
        </div>
      ),
      q_en: 'Are my project information and details confidential?',
      a_en: (
        <div className="space-y-4">
          <p>
            Yes, we attach the utmost importance to the confidentiality of ideas and projects. All information you share through the Share Idea platform is handled with the highest levels of confidentiality and privacy, and is never published or shared with any external party without your consent or in accordance with approved regulations and policies.
          </p>
          <p>
            We are also committed to implementing technical and organizational measures aimed at protecting user and project data from unauthorized access, including:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Securely storing data within protected systems.</li>
            <li>Restricting access to project information to authorized personnel only.</li>
            <li>Using modern security protocols to protect data during transmission and storage.</li>
            <li>Continuous monitoring of systems to detect any unauthorized access attempts.</li>
          </ul>
          <p>
            We stress that the ownership of the idea or project remains entirely with its owner, and that submitting the idea through the platform does not grant any other party any intellectual property rights over it.
          </p>
          <p>
            The platform's goal is to help entrepreneurs develop their projects and connect them with the right opportunities, while maintaining confidentiality of information and respecting the intellectual property rights of idea owners.
          </p>
          <p className="text-xs text-[#F5C842]/90 border-t border-white/5 pt-3 mt-3">
            <strong>Note:</strong> In the event that the project needs to be presented to an investor or a partner in the future, this will only be done within the approved procedures and controls of the platform and in line with the interests of the project owner.
          </p>
        </div>
      ),
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
                    maxHeight: isOpen ? '1000px' : '0',
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
