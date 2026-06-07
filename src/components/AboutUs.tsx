import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

interface AboutUsProps {
  lang: Language;
}

export default function AboutUs({ lang }: AboutUsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const isAr = lang === 'ar';

  const t = {
    aboutTitle: isAr ? 'من نحن' : 'About Us',
    aboutBody: isAr
      ? 'شارك الفكرة منصة ريادية متخصصة في استقبال أفكار المشاريع وتقييمها، نؤمن بأن كل فكرة عظيمة تستحق أن تُسمع وأن تجد طريقها إلى الواقع. نعمل على ربط رواد الأعمال بالمستثمرين والشركاء الاستراتيجيين لتحويل الأفكار إلى مشاريع ناجحة.'
      : 'Share Idea is a pioneering platform specialized in receiving and evaluating project ideas. We believe that every great idea deserves to be heard and find its way to reality. We connect entrepreneurs with investors and strategic partners to transform ideas into successful projects.',
    
    visionTitleParent: isAr ? 'الرؤية و الرسالة' : 'Vision & Mission',
    visionTitle: isAr ? 'رؤيتنا' : 'Our Vision',
    visionBody: isAr
      ? 'أن نكون المنصة الرائدة في المنطقة العربية لاكتشاف ودعم الأفكار الريادية وتمكين أصحابها من بناء مشاريع تُحدث أثراً حقيقياً في المجتمع والاقتصاد.'
      : 'To be the leading platform in the Arab region for discovering and supporting entrepreneurial ideas, and empowering their creators to build projects that have a real impact on society and the economy.',
    
    missionTitle: isAr ? 'رسالتنا' : 'Our Mission',
    missionBody: isAr
      ? 'تقديم بيئة آمنة وموثوقة لمشاركة الأفكار وتقييمها بشكل احترافي، وربط أصحاب الأفكار بالموارد والشركاء المناسبين لتحقيق النمو والتوسع.'
      : 'To provide a secure and reliable environment for sharing and professionally evaluating ideas, connecting creators with suitable resources and partners to achieve growth and expansion.',

    goalsTitleParent: isAr ? 'أهدافنا' : 'Our Goals',
    goal1Title: isAr ? 'ربط الأفكار بالفرص' : 'Bridging Ideas with Opportunities',
    goal1Body: isAr
      ? 'نوفر جسراً مباشراً بين أصحاب الأفكار المبتكرة والمستثمرين والشركاء الباحثين عن فرص واعدة.'
      : 'We provide a direct bridge between creators of innovative ideas and investors and partners looking for promising opportunities.',
    
    goal2Title: isAr ? 'تقييم احترافي' : 'Professional Evaluation',
    goal2Body: isAr
      ? 'نقدم تقييماً شاملاً لكل فكرة يشمل دراسة السوق والجدوى الاقتصادية لمساعدة أصحابها على تطوير مشاريعهم.'
      : 'We offer a comprehensive evaluation of each idea, including market studies and economic feasibility, to help creators develop their projects.',
    
    goal3Title: isAr ? 'دعم النمو' : 'Supporting Growth',
    goal3Body: isAr
      ? 'نرافق رواد الأعمال في رحلتهم من مرحلة الفكرة حتى الإطلاق والتوسع من خلال شبكة واسعة من الخبراء والموارد.'
      : 'We accompany entrepreneurs on their journey from idea stage to launch and expansion through a vast network of experts and resources.'
  };

  const SectionHeader = ({ text }: { text: string }) => (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}
      className="select-none"
    >
      <h2 style={{
        fontSize: '28px',
        fontWeight: '800',
        color: '#FFFFFF',
        fontFamily: 'Tajawal, sans-serif',
        margin: 0,
        textAlign: 'center',
      }}>
        {text}
      </h2>
      <div style={{
        width: '60px',
        height: '3px',
        backgroundColor: '#F5C842',
        borderRadius: '2px',
        marginTop: '8px',
      }} />
    </div>
  );

  return (
    <div
      ref={sectionRef}
      id="about-us-section"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: '#134F68',
        padding: '80px 40px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      }}
      className="flex flex-col items-center text-center font-ar"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-[72px]">
        
        {/* Sub-section 1: About Us info block */}
        <div className="flex flex-col items-center max-w-3xl mx-auto" id="about-info-block">
          <div className="text-[36px] mb-4 text-[#F5C842]" id="about-info-icon" style={{ fontSize: '36px' }}>
            {/* Golden lightbulb SVG */}
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-10 h-10 mx-auto"
            >
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
          </div>
          <SectionHeader text={t.aboutTitle} />
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.8',
            fontWeight: 'normal',
            maxWidth: '680px',
            margin: '0 auto',
            fontFamily: 'Tajawal, sans-serif',
          }}>
            {t.aboutBody}
          </p>
        </div>

        {/* Sub-section 2: Vision and Mission cards */}
        <div id="vision-mission-row" className="flex flex-col">
          <SectionHeader text={t.visionTitleParent} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* Card 1: Vision */}
            <div 
              style={{
                backgroundColor: '#0E5F7A',
                border: '1px solid rgba(245, 200, 66, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              className="hover:scale-[1.02] hover:shadow-lg"
              id="vision-card"
            >
              <div style={{ fontSize: '36px', color: '#F5C842', marginBottom: '16px' }}>🔭</div>
              <h3 style={{
                fontSize: '20px',
                color: '#F5C842',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Tajawal, sans-serif',
              }}>
                {t.visionTitle}
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.8',
                fontFamily: 'Tajawal, sans-serif',
                margin: 0,
              }}>
                {t.visionBody}
              </p>
            </div>

            {/* Card 2: Mission */}
            <div 
              style={{
                backgroundColor: '#0E5F7A',
                border: '1px solid rgba(245, 200, 66, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              className="hover:scale-[1.02] hover:shadow-lg"
              id="mission-card"
            >
              <div style={{ fontSize: '36px', color: '#F5C842', marginBottom: '16px' }}>🎯</div>
              <h3 style={{
                fontSize: '20px',
                color: '#F5C842',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Tajawal, sans-serif',
              }}>
                {t.missionTitle}
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.8',
                fontFamily: 'Tajawal, sans-serif',
                margin: 0,
              }}>
                {t.missionBody}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-section 3: Goals */}
        <div id="goals-row" className="flex flex-col">
          <SectionHeader text={t.goalsTitleParent} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {/* Card 1: Goal 1 */}
            <div 
              style={{
                backgroundColor: '#0E5F7A',
                border: '1px solid rgba(245, 200, 66, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '100%',
              }}
              className="hover:scale-[1.02] hover:shadow-lg"
              id="goal-card-1"
            >
              <div style={{ fontSize: '36px', color: '#F5C842', marginBottom: '16px' }}>🤝</div>
              <h3 style={{
                fontSize: '20px',
                color: '#F5C842',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Tajawal, sans-serif',
              }}>
                {t.goal1Title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.8',
                fontFamily: 'Tajawal, sans-serif',
                margin: 0,
              }}>
                {t.goal1Body}
              </p>
            </div>

            {/* Card 2: Goal 2 */}
            <div 
              style={{
                backgroundColor: '#0E5F7A',
                border: '1px solid rgba(245, 200, 66, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '100%',
              }}
              className="hover:scale-[1.02] hover:shadow-lg"
              id="goal-card-2"
            >
              <div style={{ fontSize: '36px', color: '#F5C842', marginBottom: '16px' }}>📊</div>
              <h3 style={{
                fontSize: '20px',
                color: '#F5C842',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Tajawal, sans-serif',
              }}>
                {t.goal2Title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.8',
                fontFamily: 'Tajawal, sans-serif',
                margin: 0,
              }}>
                {t.goal2Body}
              </p>
            </div>

            {/* Card 3: Goal 3 */}
            <div 
              style={{
                backgroundColor: '#0E5F7A',
                border: '1px solid rgba(245, 200, 66, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '100%',
              }}
              className="hover:scale-[1.02] hover:shadow-lg"
              id="goal-card-3"
            >
              <div style={{ fontSize: '36px', color: '#F5C842', marginBottom: '16px' }}>🚀</div>
              <h3 style={{
                fontSize: '20px',
                color: '#F5C842',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: 'Tajawal, sans-serif',
              }}>
                {t.goal3Title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.8',
                fontFamily: 'Tajawal, sans-serif',
                margin: 0,
              }}>
                {t.goal3Body}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
