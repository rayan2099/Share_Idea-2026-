/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Search, 
  CheckCircle, 
  Eye, 
  User, 
  Clock, 
  RefreshCw,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { 
  getEmailLogs, 
  getContactMessagesFromSupabase, 
  markContactMessageAsReadInSupabase,
  getMessageRepliesFromSupabase,
  sendContactReplyInSupabase,
  EmailLog,
} from '../dataStore';
import { ContactMessage, MessageReply } from '../types';

interface AdminMessagesProps {
  lang: Language;
}

export default function AdminMessages({ lang }: AdminMessagesProps) {
  const isAr = lang === 'ar';
  const t = translations[lang];

  // --- STATS & LIST CONTROLS ---
  const [activeTab, setActiveTab] = useState<'outbox' | 'contact'>('contact');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageReplies, setMessageReplies] = useState<MessageReply[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');
  const [replyError, setReplyError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [readUpdateError, setReadUpdateError] = useState('');

  // Helper to format date/time beautifully
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      if (isAr) {
        return d.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } else {
        return d.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (e) {
      return dateStr;
    }
  };

  // Load message logs from data store
  const loadData = async () => {
    setIsLoading(true);
    try {
      setEmailLogs(getEmailLogs());
      setContactMessages(await getContactMessagesFromSupabase());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyBody('');
    setReplyStatus('');
    setReplyError('');
    setMessageReplies(await getMessageRepliesFromSupabase(message.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update read status for contact messages
  const handleToggleReadStatus = async (id: string, currentRead: boolean) => {
    setReadUpdateError('');
    try {
      await markContactMessageAsReadInSupabase(id, !currentRead);
      const freshMessages = await getContactMessagesFromSupabase();
      setContactMessages(freshMessages);
      setSelectedMessage(freshMessages.find(msg => msg.id === id) || null);
    } catch (error) {
      console.error('Unable to update message read status:', error);
      setReadUpdateError(isAr ? 'تعذر تحديث حالة الرسالة في قاعدة البيانات.' : 'Could not update the message status in the database.');
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage) return;

    const trimmedReply = replyBody.trim();
    setReplyStatus('');
    setReplyError('');

    if (!trimmedReply) {
      setReplyError(isAr ? 'اكتب نص الرد أولاً.' : 'Write a reply first.');
      return;
    }

    setIsSendingReply(true);
    try {
      await sendContactReplyInSupabase(selectedMessage, trimmedReply);
      setReplyBody('');
      setReplyStatus(isAr ? 'تم إرسال الرد وحفظه داخل المنصة.' : 'Reply sent and saved inside the platform.');

      const [freshMessages, freshReplies] = await Promise.all([
        getContactMessagesFromSupabase(),
        getMessageRepliesFromSupabase(selectedMessage.id)
      ]);

      setContactMessages(freshMessages);
      setSelectedMessage(freshMessages.find(msg => msg.id === selectedMessage.id) || selectedMessage);
      setMessageReplies(freshReplies);
    } catch (error) {
      console.error('Unable to send platform reply:', error);
      setReplyError(
        error instanceof Error
          ? error.message
          : (isAr ? 'تعذر إرسال الرد من داخل المنصة.' : 'Could not send the platform reply.')
      );
    } finally {
      setIsSendingReply(false);
    }
  };

  // --- FILTERED DATA LISTINGS ---
  const filteredEmails = emailLogs.filter(email => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      email.to.toLowerCase().includes(query) ||
      email.subject.toLowerCase().includes(query) ||
      email.body.toLowerCase().includes(query) ||
      email.sender.toLowerCase().includes(query)
    );
  });

  const filteredContacts = contactMessages.filter(msg => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.subject.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query)
    );
  });

  const unreadCount = contactMessages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6 select-none" id="admin-messages-panel-root" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Header controls and statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="messages-overview-stats">
        {/* Total Inquiries box */}
        <div className="bg-[#0A4F68] border border-white/8 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="text-right">
            <span className="text-xs text-[#B0D4E0] block font-ar">{isAr ? 'رسائل اتصل بنا الواردة' : 'Received Inquiries'}</span>
            <span className="text-2xl font-black text-[#F5C842] mt-0.5 inline-block font-num">{contactMessages.length}</span>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F5C842]/10 text-[#F5C842]">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        {/* Unread Inquiries alert box */}
        <div className="bg-[#0A4F68] border border-[#EF4444]/20 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="text-right">
            <span className="text-xs text-rose-300 block font-ar">{isAr ? 'رسائل تواصل غير مقروءة' : 'Unread Inquiries'}</span>
            <span className={`text-2xl font-black mt-0.5 inline-block font-num ${unreadCount > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-400'}`}>
              {unreadCount}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${unreadCount > 0 ? 'bg-rose-500/10 text-rose-400 animate-pulse' : 'bg-white/5 text-slate-500'}`}>
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Operations & Filter Bar */}
      <div className="bg-[#083D52] p-4 rounded-xl border border-white/8 flex flex-col md:flex-row items-center justify-between gap-4" id="messages-search-bar-wrap">
        {/* Simple Label/Indicator */}
        <div className="flex items-center gap-2.5 px-1 pr-2" id="messages-section-title">
          <Inbox className="w-5 h-5 text-[#F5C842]" />
          <span className="font-ar font-bold text-sm text-white">{isAr ? 'رسائل نموذج تواصل معنا' : 'Contact Us Inquiries'}</span>
        </div>

        {/* Searching input controls */}
        <div className="flex items-center gap-2 w-full md:w-auto md:max-w-xs flex-1" id="messages-filter-search-box">
          <div className="relative w-full">
            <Search className="absolute top-2.5 start-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'البحث في المراسلات والرسائل...' : 'Search in emails or messages...'}
              className="w-full pl-9 pr-9 py-2 bg-[#0A4F68] border border-white/10 rounded-lg text-white text-xs outline-none focus:border-[#F5C842] focus:ring-1 focus:ring-[#F5C842]/20 font-ar text-right"
              style={{ direction: isAr ? 'rtl' : 'ltr' }}
              id="messages-search-field"
            />
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors cursor-pointer shrink-0 border border-white/5"
            title={isAr ? 'تحديث البيانات' : 'Sync data'}
            id="btn-messages-sync"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Panel layout split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="messages-main-viewer-grid">
        
        {/* Left/Main Column - Inbox / Outbox Listing Stack (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-3" id="messages-left-indexer">
          <div className="bg-[#0A4F68] border border-white/8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col py-2" id="logs-list-wrapper">
            
            {/* Header / Sub-title */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between text-xs text-[#B0D4E0] font-ar" id="logs-header-bar">
              <span>
                {isAr ? `تواصل العملاء — ${filteredContacts.length} مراسلة` : `Guest Inquiries — ${filteredContacts.length} threads`}
              </span>
              <span>{isAr ? 'مستندات حية معتمدة' : 'Live synced records'}</span>
            </div>

            {/* List Entries */}
            <div className="divide-y divide-white/5 max-h-[580px] overflow-y-auto" id="messages-indexed-scroller">
              {isLoading ? (
                <div className="py-20 text-center text-slate-400 select-none animate-pulse flex flex-col items-center justify-center gap-2" id="loading-spinner-wrap">
                  <RefreshCw className="w-8 h-8 text-[#F5C842] animate-spin" />
                  <span className="text-xs font-ar">{isAr ? 'جاري مزامنة الرسائل الواردة...' : 'Syncing mailbox history...'}</span>
                </div>
              ) : (
                filteredContacts.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 font-ar text-xs" id="empty-contact-message">
                    <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-2.5 opacity-55" />
                    <span>{isAr ? 'لا توجد رسائل تواصل مطابقة لمدخلات البحث.' : 'No contact us inquiries match your search query.'}</span>
                  </div>
                ) : (
                  filteredContacts.map((msg) => {
                    const isSelected = selectedMessage && selectedMessage.id === msg.id;
                    const dateObj = new Date(msg.created_at);
                    
                    return (
                      <div
                        key={msg.id}
                        onClick={() => { void handleSelectMessage(msg); }}
                        className={`p-4 text-right transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected 
                            ? 'bg-[#083D52] border-r-4 border-[#F5C842]' 
                            : 'hover:bg-white/5'
                        } ${!msg.is_read ? 'bg-indigo-500/5' : ''}`}
                        id={`contact-row-${msg.id}`}
                      >
                        <div className="flex flex-col gap-1 items-center shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            !msg.is_read 
                              ? 'bg-rose-500/15 text-rose-400 animate-pulse border border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          {!msg.is_read && (
                            <span className="text-[8px] bg-[#EF4444] text-white px-1.5 py-0.5 rounded-full font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 font-ar">
                          <div className="flex items-center justify-between gap-1 mb-1 flex-row-reverse">
                            <span className="text-slate-400 text-[10px] shrink-0 font-num">
                              {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-xs text-white tracking-wide font-extrabold truncate font-sans">
                              {msg.name}
                            </span>
                          </div>
                          <span className="text-xs text-[#F2C037] font-bold block mb-1 truncate">
                            {msg.subject}
                          </span>
                          <span className="text-[11px] text-[#B0D4E0] line-clamp-2 block font-normal leading-relaxed text-right">
                            {msg.message}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Deep Content Reader Mode (Span 5) */}
        <div className="lg:col-span-5" id="messages-right-reader">
          {selectedMessage ? (
            <div className="bg-[#0A4F68] border border-white/8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex flex-col h-full overflow-hidden text-right" id="contact-reader-pane">
              {/* Header card info */}
              <div className="p-5 bg-[#083D52] border-b border-white/8" id="contact-reader-hdr">
                <div className="flex items-center justify-between mb-3 select-none">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-[#F2C037]" />
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-ar">
                      {isAr ? 'طلب تواصل وارد' : 'CONTACT INQUIRY'}
                    </span>
                  </div>

                  {/* Switch read or unread */}
                  <button
                    onClick={() => handleToggleReadStatus(selectedMessage.id, selectedMessage.is_read)}
                    className={`px-3 py-1 cursor-pointer text-[10px] font-bold rounded-lg transition-all border ${
                      selectedMessage.is_read
                        ? 'border-slate-500 text-slate-300 hover:bg-white/5 hover:text-white'
                        : 'border-rose-500 text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white'
                    }`}
                    id="btn-toggle-read-state"
                  >
                    {selectedMessage.is_read 
                      ? (isAr ? 'تحديد كغير مقروء' : 'Mark as Unread')
                      : (isAr ? 'تحديد كمقروء' : 'Mark as Read')
                    }
                  </button>
                </div>

                {readUpdateError && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] font-bold text-rose-300 font-ar">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{readUpdateError}</span>
                  </div>
                )}

                <h3 className="text-base font-extrabold text-white mb-2 font-ar leading-snug">
                  {selectedMessage.subject}
                </h3>

                <div className="space-y-2 text-xs text-[#B0D4E0] mt-4 select-all">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/60 font-bold font-ar">{isAr ? 'الاسم:' : 'NAME:'}</span>
                    <span className="font-bold text-white truncate max-w-[240px] font-ar">{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/60 font-bold font-ar">{isAr ? 'البريد الإلكتروني:' : 'EMAIL:'}</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-[#F5C842] hover:underline font-bold truncate max-w-[240px] font-mono">{selectedMessage.email}</a>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/60 font-bold font-ar">{isAr ? 'تاريخ الاستلام:' : 'RECEIVED:'}</span>
                    <span className="select-none text-[11px] text-white">
                      {formatDate(selectedMessage.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message body text */}
              <div className="p-5 md:p-6 overflow-y-auto max-h-[380px] bg-[#0A4F68] leading-relaxed text-xs text-slate-100 whitespace-pre-wrap font-sans select-text border-b border-white/5 text-right font-medium" style={{ direction: 'rtl' }}>
                {selectedMessage.message}
              </div>

              {/* In-platform reply composer */}
              <div className="p-4 bg-slate-950/40 font-ar select-none space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-white">{isAr ? 'الرد من داخل المنصة' : 'Reply inside the platform'}</span>
                  <span className="text-[10px] text-[#B0D4E0] truncate max-w-[220px] font-mono" dir="ltr">
                    {selectedMessage.email}
                  </span>
                </div>

                <textarea
                  value={replyBody}
                  onChange={(event) => {
                    setReplyBody(event.target.value);
                    setReplyStatus('');
                    setReplyError('');
                  }}
                  placeholder={isAr ? 'اكتب ردك هنا وسيصل للمرسل عبر البريد...' : 'Write your reply here and it will be emailed to the sender...'}
                  className="min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-[#083D52] p-3 text-sm leading-7 text-white outline-none transition-all placeholder:text-slate-400 focus:border-[#F5C842] focus:ring-1 focus:ring-[#F5C842]/20"
                  style={{ direction: isAr ? 'rtl' : 'ltr' }}
                  id="message-platform-reply-body"
                />

                {replyError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] font-bold text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{replyError}</span>
                  </div>
                )}

                {replyStatus && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold text-emerald-300">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{replyStatus}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { void handleSendReply(); }}
                  disabled={isSendingReply || !replyBody.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F5C842] px-5 py-2.5 text-xs font-extrabold text-[#083D52] shadow-md transition-all hover:bg-[#ffda67] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  id="btn-send-platform-reply"
                >
                  {isSendingReply ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>{isSendingReply ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرد' : 'Send reply')}</span>
                </button>

                {messageReplies.length > 0 && (
                  <div className="rounded-xl border border-white/8 bg-[#083D52]/70 p-3">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-[#F5C842]">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{isAr ? 'سجل الردود' : 'Reply history'}</span>
                    </div>
                    <div className="space-y-2">
                      {messageReplies.map((reply) => (
                        <div key={reply.id} className="rounded-lg border border-white/5 bg-black/10 p-3 text-right">
                          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-[#B0D4E0]">
                            <span className="font-mono" dir="ltr">{formatDate(reply.sent_at)}</span>
                            <span className="truncate text-[#F5C842]">{reply.subject}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-xs leading-6 text-slate-100">{reply.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0A4F68]/20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 text-center h-[350px] select-none" id="contact-reader-fallback">
              <BoxFallbackAnimation />
              <h4 className="text-sm font-bold text-slate-300 font-ar">{isAr ? 'لم يتم تحديد رسالة تواصل' : 'No thread selected'}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs font-ar leading-relaxed">{isAr ? 'اختر أحد رسائل التواصل الواردة لقراءة محتوى استفسارات الزائرين بالكامل والتواصل معهم.' : 'Select any inquiry from the left pane to view details and reply directly.'}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// Minimal Animated SVG vector placeholder
function BoxFallbackAnimation() {
  return (
    <div className="relative w-12 h-12 mb-3 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#F5C842]/10 rounded-full animate-ping opacity-25"></div>
      <Inbox className="w-10 h-10 text-slate-600 relative z-10" />
    </div>
  );
}
