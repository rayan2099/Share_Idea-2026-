import React, { useEffect, useState } from 'react';
import { Language } from '../types';

interface AboutPageProps {
  lang: Language;
}

export default function AboutPage({ lang }: AboutPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAr = lang === 'ar';

  const content = {
    title: isAr ? 'من نحن' : 'About Us',
    body1: isAr 
      ? 'شارك الفكرة هي منصة متخصصة في استقبال وتقييم الأفكار والمشاريع الناشئة وربطها بالمستثمرين والشركاء الاستراتيجيين. نهدف إلى تمكين رواد الأعمال من عرض أفكارهم بشكل احترافي، والحصول على تقييمات ورؤى تساعدهم على تطوير مشاريعهم وتسريع دخولها إلى السوق وتحقيق النمو المستدام.'
      : 'Share Idea is a specialized platform for receiving and evaluating early-stage startup ideas and connecting them with strategic investors and partners. We aim to empower entrepreneurs to showcase their ideas professionally, receiving scores and insights that help them develop their projects, accelerate market entry, and achieve sustainable growth.',
    body2: isAr
      ? 'تعمل المنصة على اكتشاف المشاريع الواعدة وربطها بالجهات المناسبة من مستثمرين وشركاء ومسرعات أعمال وحاضنات أعمال، بهدف دعم النمو، وتسهيل التمويل، وتسريع الوصول إلى السوق.'
      : 'The platform discovers promising projects and connects them with appropriate stakeholders including investors, partners, business accelerators, and business incubators, aiming to support growth, facilitate funding, and speed up market reach.',
    missionTitle: isAr ? 'رسالتنا' : 'Our Mission',
    missionBody: isAr
      ? 'تقديم بيئة آمنة وموثوقة لمشاركة الأفكار وتقييمها بشكل احترافي، وربط أصحاب الأفكار بالموارد والشركاء المناسبين لتحقيق النمو والتوسع.'
      : 'To offer a secure and trustworthy environment for exchanging and professionally evaluating ideas, bridging creators with relevant resources and partners to drive growth and scaling.',
    visionTitle: isAr ? 'رؤيتنا' : 'Our Vision',
    visionBody: isAr
      ? 'أن نكون المنصة الرائدة في المنطقة العربية لاكتشاف ودعم الأفكار الريادية وتمكين أصحابها من بناء مشاريع تُحدث أثراً حقيقياً في المجتمع والاقتصاد.'
      : 'To become the leading platform in the Arab region for discovering and backing entrepreneurial designs, enabling creators to build projects that foster real socioeconomic impact.',
  };

  return (
    <div 
      className="flex-1 w-full flex flex-col items-center justify-start p-6 md:p-12 relative z-10" 
      id="about-page-container"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Tajawal', sans-serif"
      }}
    >
      <div 
        className="w-full max-w-4xl mx-auto flex flex-col gap-10 mt-6"
        style={{
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Page Title & Line */}
        <div className="flex flex-col items-center text-center">
          <span className="text-4xl md:text-5xl mb-4 text-[#F5C842]">💡</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-sans tracking-tight">
            {content.title}
          </h1>
          <div className="w-20 h-1 bg-[#F5C842] rounded-full mt-4" />
        </div>

        {/* Introduction Panel */}
        <div 
          className="bg-[#0A4F68] border border-white/8 rounded-2xl p-6 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] text-right"
          style={{ direction: isAr ? 'rtl' : 'ltr' }}
          id="about-intro-panel"
        >
          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6 font-medium text-center md:text-start">
            {content.body1}
          </p>
          <p className="text-white/80 text-base md:text-lg leading-relaxed text-center md:text-start border-t border-white/5 pt-6">
            {content.body2}
          </p>
        </div>

        {/* Sub-sections: Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full" id="about-vision-mission-grid">
          {/* Card 1: Mission */}
          <div 
            className="bg-[#083D52] border border-[#F5C842]/15 rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] transform transition-all duration-300"
            id="page-about-mission-card"
          >
            <div className="text-4xl mb-4 text-[#F5C842]">🎯</div>
            <h2 className="text-2xl font-bold text-[#F5C842] mb-3">
              {content.missionTitle}
            </h2>
            <p className="text-white/85 text-base leading-relaxed leading-8">
              {content.missionBody}
            </p>
          </div>

          {/* Card 2: Vision */}
          <div 
            className="bg-[#083D52] border border-[#F5C842]/15 rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-[1.02] transform transition-all duration-300"
            id="page-about-vision-card"
          >
            <div className="text-4xl mb-4 text-[#F5C842]">🔭</div>
            <h2 className="text-2xl font-bold text-[#F5C842] mb-3">
              {content.visionTitle}
            </h2>
            <p className="text-white/85 text-base leading-relaxed leading-8">
              {content.visionBody}
            </p>
          </div>
        </div>

        {/* Call to action element */}
        <div className="text-center mt-4">
          <span className="text-sm text-[#B0D4E0]/80">
            {isAr ? 'لديك فكرة مشروع مميزة؟ نحن بانتظارك.' : 'Have a special startup idea? We are waiting for you.'}
          </span>
        </div>
      </div>
    </div>
  );
}
