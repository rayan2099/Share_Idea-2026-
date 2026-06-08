import React, { useEffect, useState } from 'react';
import { Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { createContactMessageInSupabase } from '../dataStore';

interface ContactPageProps {
  lang: Language;
}

export default function ContactPage({ lang }: ContactPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAr = lang === 'ar';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim() || !formState.subject.trim() || !formState.message.trim()) {
      setSubmitError(isAr ? 'برجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await createContactMessageInSupabase({
        name: formState.name,
        email: formState.email,
        subject: formState.subject,
        message: formState.message
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(isAr
        ? `تعذر إرسال الرسالة: ${err.message || 'خطأ غير معروف'}`
        : `Could not send your message: ${err.message || 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="flex-1 w-full flex flex-col items-center justify-start p-6 md:p-12 relative z-10" 
      id="contact-page-container"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Tajawal', sans-serif"
      }}
    >
      <div 
        className="w-full max-w-5xl mx-auto flex flex-col gap-10 mt-6"
        style={{
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Page title and description */}
        <div className="flex flex-col items-center text-center">
          <Mail className="w-12 h-12 text-[#F5C842] mb-3" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {isAr ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className="text-xs md:text-sm text-[#B0D4E0]/85 mt-2">
            {isAr ? 'فريقنا جاهز للرد على استفساراتكم ومساعدتكم طوال أيام الأسبوع' : 'Our team is ready to answer your inquiries and assist you throughout the week'}
          </p>
          <div className="w-20 h-1 bg-[#F5C842] rounded-full mt-4" />
        </div>

        {/* 2 columns layout: Form & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full" id="contact-twin-columns">
          
          {/* Column A: Contact Details & Quick Call/Mail Buttons (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6" id="contact-info-panel-col">
            <div className="bg-[#0A4F68] border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              <h3 className="text-xl font-bold text-white border-b border-white/5 pb-3">
                {isAr ? 'معلومات الاتصال المباشر' : 'Direct Contact Info'}
              </h3>
              
              {/* Phone item */}
              <div className="flex items-center gap-4 text-right justify-start" id="direct-phone-box">
                <div className="w-11 h-11 rounded-lg bg-[#083D52] border border-[#F5C842]/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#F5C842]" />
                </div>
                <div>
                  <span className="text-xs text-[#B0D4E0] block">{isAr ? 'الهاتف المباشر' : 'Direct Telephone'}</span>
                  <a href="tel:+966568121122" className="text-base text-white tracking-wide hover:text-[#F5C842] transition-colors font-bold select-all text-left font-mono" dir="ltr">
                    +966 56 812 1122
                  </a>
                </div>
              </div>

              {/* Email item */}
              <div className="flex items-center gap-4 text-right justify-start" id="direct-email-box">
                <div className="w-11 h-11 rounded-lg bg-[#083D52] border border-[#F5C842]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#F5C842]" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs text-[#B0D4E0] block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
                  <a href="mailto:shareidea01@gmail.com" className="text-base text-white hover:text-[#F5C842] transition-colors font-bold select-all truncate block">
                    shareidea01@gmail.com
                  </a>
                </div>
              </div>

              {/* Direct call-to-actions buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4" id="direct-links-cta-dock">
                <a 
                  href="tel:+966568121122" 
                  className="px-4 py-3 bg-[#F5C842] hover:bg-[#ffda67] text-[#083D52] font-bold text-center text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
                  id="btn-call-direct"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isAr ? 'اتصال مباشر' : 'Call Direct'}</span>
                </a>
                <a 
                  href="mailto:shareidea01@gmail.com" 
                  className="px-4 py-3 bg-[#083D52] hover:bg-white/5 text-white border border-white/10 font-bold text-center text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
                  id="btn-email-direct"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isAr ? 'إرسال إيميل' : 'Send Email'}</span>
                </a>
              </div>
            </div>

            {/* Quick response badge */}
            <div className="bg-[#083D52]/40 border border-white/5 rounded-xl p-4 flex items-center gap-3 text-right">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <p className="text-[11px] text-[#B0D4E0] leading-relaxed m-0">
                {isAr ? 'سيقوم فريق الدعم الفني بالرد على طلباتكم ومراسلاتكم في غضون 24 ساعة كحد أقصى.' : 'Our help desk coordinates and replies to queries within 24 hours.'}
              </p>
            </div>
          </div>

          {/* Column B: Interactive Contact Form (Span 7) */}
          <div className="lg:col-span-7" id="contact-form-panel-col">
            <div className="bg-[#0A4F68] border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in" id="contact-success-state">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isAr ? 'تم إرسال رسالتك بنجاح' : 'Message Sent Successfully'}
                  </h3>
                  <p className="text-sm text-[#B0D4E0] leading-relaxed max-w-sm mb-6">
                    {isAr ? 'شكراً لتواصلك معنا. سنقوم بمراجعة موضوع رسالتك والرد عليك في أقرب وقت ممكن.' : 'Thanks for connecting with us. We have successfully registered your message and will update you shortly.'}
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormState({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    {isAr ? 'إرسال رسالة جديدة' : 'Send another message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 font-ar" id="contact-form-flow">
                  <h3 className="text-xl font-bold text-white border-b border-white/5 pb-3">
                    {isAr ? 'نموذج إرسال رسالة' : 'Send Us a Message'}
                  </h3>

                  {submitError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#B0D4E0] font-bold">{isAr ? 'الاسم بالكامل *' : 'Full Name *'}</label>
                      <input 
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-[#083D52] border border-white/10 rounded-lg text-white text-sm outline-none transition-all focus:border-[#F5C842] focus:ring-1 focus:ring-[#F5C842]/20"
                        placeholder={isAr ? 'أدخل اسمك بالكامل' : 'Your name'}
                        required
                      />
                    </div>

                    {/* Email input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#B0D4E0] font-bold">{isAr ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
                      <input 
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-[#083D52] border border-white/10 rounded-lg text-white text-sm outline-none transition-all focus:border-[#F5C842] focus:ring-1 focus:ring-[#F5C842]/20 text-left"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Subject input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#B0D4E0] font-bold">{isAr ? 'الموضوع *' : 'Subject *'}</label>
                    <input 
                      type="text"
                      name="subject"
                      value={formState.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-[#083D52] border border-white/10 rounded-lg text-white text-sm outline-none transition-all focus:border-[#F5C842] focus:ring-1 focus:ring-[#F5C842]/20"
                      placeholder={isAr ? 'موضوع الرسالة' : 'Message topic'}
                      required
                    />
                  </div>

                  {/* Message body */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#B0D4E0] font-bold">{isAr ? 'الرسالة *' : 'Message *'}</label>
                    <textarea 
                      name="message"
                      value={formState.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-2.5 bg-[#083D52] border border-white/10 rounded-lg text-white text-sm outline-none transition-all focus:border-[#F5C842] focus:ring-1 focus:ring-[#F5C842]/20 resize-none min-h-[120px]"
                      placeholder={isAr ? 'اكتب تفاصيل استفسارك أو اقتراحك هنا...' : 'Describe your query here...'}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#F5C842] hover:bg-[#ffda67] text-[#083D52] font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mt-2 cursor-pointer active:scale-[0.98]"
                    id="btn-submit-contact-form"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة الإلكترونية' : 'Submit My Message')}</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
