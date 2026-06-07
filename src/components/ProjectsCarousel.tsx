import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  ExternalLink,
  Building2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Language } from '../types';
import { getVisibleProjects } from '../supabaseService';

interface ProjectsCarouselProps {
  lang: Language;
}

export default function ProjectsCarousel({ lang }: ProjectsCarouselProps) {
  const isAr = lang === 'ar';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active center index of the slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  
  // Track touch swap
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Detect items count per page dynamically on mount & resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchVisibleProjects();
  }, []);

  // Slowly rotate projects automatically every 4.5 seconds, pausing on hover
  useEffect(() => {
    if (projects.length <= itemsPerView || isHovered) return;
    
    // Calculate the maximum start index to avoid empty trailing spaces
    const maxIndex = Math.max(0, projects.length - itemsPerView);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [projects.length, itemsPerView, isHovered]);

  const fetchVisibleProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVisibleProjects();
      setProjects(data || []);
    } catch (err: any) {
      console.error('Failed to fetch carousel projects:', err);
      setError(
        isAr 
          ? 'حدث خطأ أثناء تحميل سجل مشاريعنا من الخادم الاستراتيجي.' 
          : 'Could not load active innovation portfolio projects.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (projects.length === 0) return;
    const maxIndex = Math.max(0, projects.length - itemsPerView);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (projects.length === 0) return;
    const maxIndex = Math.max(0, projects.length - itemsPerView);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      isAr ? handlePrev() : handleNext();
    }
    if (isRightSwipe) {
      isAr ? handleNext() : handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full" id="carousel-loading-sec">
        <div className="text-center mb-10 space-y-2">
          <div className="h-8 bg-white/10 rounded w-48 mx-auto animate-pulse"></div>
          <div className="h-4 bg-white/5 rounded w-80 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-[#092B38]/50 border border-white/5 rounded-2xl p-5 space-y-4 animate-pulse h-[360px] flex flex-col justify-between"
            >
              <div className="w-full h-40 bg-white/5 rounded-xl border border-white/5"></div>
              <div className="space-y-2">
                <div className="h-5 bg-white/10 rounded w-2/3"></div>
                <div className="h-4 bg-white/5 rounded w-full"></div>
                <div className="h-4 bg-white/5 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-white/10 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 max-w-lg mx-auto w-full text-center" id="carousel-error-sec">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <h4 className="text-sm font-bold text-white">
            {isAr ? 'عذراً، فشل تحميل المشاريع الرسمية' : 'Could not fetch projects portfolio'}
          </h4>
          <p className="text-xs text-[var(--secondary-text)] leading-relaxed">
            {error}
          </p>
          <button
            onClick={fetchVisibleProjects}
            className="mt-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors"
          >
            {isAr ? 'إعادة تحميل' : 'Reload'}
          </button>
        </div>
      </section>
    );
  }

  // If there are no projects, hide this section completely as requested
  if (projects.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-20 bg-transparent text-white w-full select-none" 
      dir="rtl"
      id="public-projects-showcase"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        {/* Title & Headline Header */}
        <div className="text-center space-y-3" id="projects-showcase-title">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3.5xl font-extrabold text-white font-ar"
            style={{ letterSpacing: '-0.02em' }}
          >
            {isAr ? 'مشاريعنا' : 'Our Projects'}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm text-[var(--secondary-text)] max-w-xl mx-auto leading-relaxed font-ar"
          >
            {isAr 
              ? 'نستعرض باقة من أبرز المشاريع الريادية الناشئة التي تشرّفنا بالتعاون معها ودعم مسيرتها الطموحة.' 
              : 'Discover some of the outstanding startup ventures we have proudly partnered with and supported along their journey.'}
          </motion.p>
        </div>

        {/* Carousel Slider Frame Container */}
        <div 
          className="relative max-w-5xl mx-auto px-10 md:px-14" 
          id="projects-carousel-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Active Card Slider viewport */}
          <div className="overflow-hidden py-4" id="carousel-viewport">
            <motion.div 
              className="flex pointer-events-auto"
              animate={{
                x: isAr 
                  ? `${currentIndex * (100 / itemsPerView)}%` 
                  : `-${currentIndex * (100 / itemsPerView)}%`
              }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.8 }}
            >
              {projects.map((project, idx) => {
                const isMain = idx === currentIndex;
                return (
                  <div 
                    key={project.id}
                    className="w-full md:w-1/2 lg:w-1/3 shrink-0 px-3 flex flex-col"
                  >
                    <div
                      className={`bg-gradient-to-b from-[#092B38] to-[#041a22] border rounded-2xl p-5 flex flex-col justify-between h-[420px] relative group shadow-xl transition-all duration-300 ${
                        isMain
                          ? 'border-[#F5C842]/40 shadow-[#F5C842]/5 ring-1 ring-[#F5C842]/20 scale-[1.01]'
                          : 'border-white/10 hover:border-white/20 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Badge top elements */}
                      <div className="space-y-4">
                        {/* Image Thumbnail with object-cover */}
                        <div className="w-full h-44 rounded-xl overflow-hidden relative border border-white/10 bg-black/20 shrink-0">
                          {project.image_url ? (
                            <img 
                              src={project.image_url} 
                              alt={project.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#08222b] flex flex-col items-center justify-center text-white/30 gap-1.5">
                              <Building2 className="w-10 h-10 text-[#F5C842]/70 animate-pulse" />
                              <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">portfolio piece</span>
                            </div>
                          )}

                          {/* Top float indicators */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                            {project.sector && (
                              <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-[#F5C842] border border-[#F5C842]/20 rounded-full font-bold text-[9px] font-ar">
                                {project.sector}
                              </span>
                            )}
                            {project.stage && (
                              <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white/90 border border-white/10 rounded-full font-bold text-[9px] font-ar">
                                {project.stage}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-white group-hover:text-[#F5C842] transition-colors font-ar truncate">
                            {project.title}
                          </h3>
                          <p className="text-xs text-[var(--secondary-text)] leading-relaxed font-ar h-[68px] overflow-hidden line-clamp-3">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action: Website URL */}
                      <div className="pt-4 border-t border-white/6 flex items-center justify-between shrink-0">
                        {project.website_url ? (
                          <a
                            href={project.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 bg-[#E8703A] hover:bg-[#d05d2c] active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                            id={`visit-btn-${project.id}`}
                          >
                            <Globe className="w-4.5 h-4.5 shrink-0" />
                            <span>{isAr ? 'زيارة موقع المشروع' : 'Visit Project Web'}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
                          </a>
                        ) : (
                          <div className="w-full text-center py-2.5 bg-white/5 border border-white/6 text-white/40 font-bold text-xs rounded-xl cursor-default font-ar">
                            {isAr ? 'رابط الموقع غير متوفر حالياً' : 'Website coming soon'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Navigation Controllers (Arrows) */}
          {projects.length > itemsPerView && (
            <>
              {/* Previous Arrow button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-[#092B38] hover:bg-[#0e3a4b] text-white rounded-full transition-all border border-white/10 shadow-lg cursor-pointer hover:scale-105 active:scale-95 z-10"
                aria-label="Previous Projects"
                id="carousel-nav-prev"
              >
                {/* RTL Arrow logic: Right arrow is "Previous" card progression in swipe view */}
                <ChevronRight className="w-5 h-5 text-[#F5C842]" />
              </button>

              {/* Next Arrow button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-[#092B38] hover:bg-[#0e3a4b] text-white rounded-full transition-all border border-white/10 shadow-lg cursor-pointer hover:scale-105 active:scale-95 z-10"
                aria-label="Next Projects"
                id="carousel-nav-next"
              >
                <ChevronLeft className="w-5 h-5 text-[#F5C842]" />
              </button>
            </>
          )}

          {/* Indicators dots tracker */}
          {projects.length > itemsPerView && (
            <div className="flex items-center justify-center gap-1.5 mt-8" id="carousel-indicator-dots" style={{ direction: 'ltr' }}>
              {Array.from({ length: Math.max(1, projects.length - itemsPerView + 1) }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentIndex 
                      ? 'w-6 bg-[#E8703A]' 
                      : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to project slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
