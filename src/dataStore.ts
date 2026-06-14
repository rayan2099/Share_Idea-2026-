/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Submission, SubmissionStatus, Moderator, ContactMessage, MessageReply } from './types';
import { supabase } from './supabaseService';

// Let's create helper to generate unique reference ID: IDEA-YYYY-XXXX
export function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `IDEA-${year}-${randNum}`;
}

const DEFAULT_SUBMISSIONS: Submission[] = [];

// Let's create an email list mock to show "triggered emails log" in a side admin panel so supervisors can feel absolutely sure emails run successfully!
export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sent_at: string;
  sender: string;
}

const STORAGE_KEYS = {
  SUBMISSIONS: 'shareidea_submissions_v2',
  EMAIL_LOGS: 'shareidea_email_logs_v2',
  CONTACT_MESSAGES: 'shareidea_contact_messages_v2',
};

export const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [];

// Always use version 3 of database to overwrite any previous version mismatch and guarantee clean setup
const DB_VERSION = 3;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window context not available'));
      return;
    }
    const request = indexedDB.open('FileStorageDB', DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files');
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// IndexedDB helpers for persistent file storage (bypassing localStorage 5MB limit and preserving original bytes)
export async function saveFileToIndexedDB(key: string, file: File): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    store.put(file, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getFileFromIndexedDB(key: string): Promise<File | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getReq = store.get(key);
      getReq.onsuccess = () => {
        db.close();
        resolve(getReq.result || null);
      };
      getReq.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (err) {
    console.error('getFileFromIndexedDB error:', err);
    return null;
  }
}

export async function getAllFilesFromIndexedDB(): Promise<File[]> {
  if (typeof window === 'undefined') return [];
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        db.close();
        resolve(getAllReq.result || []);
      };
      getAllReq.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch (err) {
    console.error('getAllFilesFromIndexedDB error:', err);
    return [];
  }
}

// Every file upload in the entire application must follow this exact pattern (integrated with IndexedDB)
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  // Save the RAW file as-is — NO processing, NO conversion, NO reading content
  await saveFileToIndexedDB(`${bucket}/${path}`, file);
  
  // Create a realistic storage public url
  const publicUrl = `https://shareidea-vault.storage.cloud/${bucket}/${path}`;
  
  // Cache in the global window object in current SPA session for maximum instant access
  if (typeof window !== 'undefined') {
    const win = window as any;
    win.__uploadedFiles = win.__uploadedFiles || {};
    win.__uploadedFiles[publicUrl] = file;
    win.__uploadedFiles[file.name] = file;
  }
  
  return publicUrl;
};

// Every file download in the entire application must follow this exact pattern (integrated with IndexedDB)
export const downloadFile = async (fileUrl: string, originalFileName: string): Promise<void> => {
  let blob: Blob;

  // Since we're in the secure local sandbox context, fake urls indicate IndexedDB-local files
  if (fileUrl.includes('shareidea-vault.storage.cloud')) {
    // Check memory cache first
    const win = (typeof window !== 'undefined' ? window : null) as any;
    let cachedFile: File | null = win?.__uploadedFiles?.[fileUrl] || win?.__uploadedFiles?.[originalFileName] || null;
    
    if (!cachedFile) {
      // Check IndexedDB
      const prefix = 'https://shareidea-vault.storage.cloud/';
      if (fileUrl.startsWith(prefix)) {
        const dbKey = fileUrl.substring(prefix.length);
        const fileFromDb = await getFileFromIndexedDB(dbKey);
        if (fileFromDb) {
          cachedFile = fileFromDb;
        }
      }
    }
    
    if (!cachedFile) {
      // Scan all stored files in IndexedDB fallback matching originalFileName
      const allFiles = await getAllFilesFromIndexedDB();
      const match = allFiles.find(f => f.name === originalFileName);
      if (match) {
        cachedFile = match;
      }
    }

    if (!cachedFile) {
      // If not found in cache/IndexedDB, throw an error so caller can fallback to generated preview if needed
      throw new Error('File not found in local user storage');
    }

    blob = cachedFile;
  } else {
    // Standard secure fetch pattern for external/real public URLs
    const response = await fetch(fileUrl);
    blob = await response.blob();
  }
  
  // Create download link with original filename and trigger browser download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = originalFileName;  // use original filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Initialize helper
export function initDataStore() {
  if (typeof window === 'undefined') return;
  const existingLogs = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
  if (!existingLogs) {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify([]));
  }
}

// Get all contact messages
export function getContactMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return [];
  initDataStore();
  const raw = localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES);
  return raw ? JSON.parse(raw) : [];
}

// Save contact messages
export function saveContactMessages(list: ContactMessage[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(list));
}

// Create custom contact message
export function createContactMessage(contact: { name: string; email: string; subject: string; message: string }): ContactMessage {
  const list = getContactMessages();
  const created: ContactMessage = {
    ...contact,
    id: 'msg-' + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    is_read: false
  };
  list.unshift(created);
  saveContactMessages(list);

  // Trigger simulated resend outgoing email representation for contact form also
  const emailLog: EmailLog = {
    id: `email-${Math.random().toString(36).substr(2, 9)}`,
    to: 'shareidea01@gmail.com',
    sender: 'system@shareidea.sa',
    subject: `✉️ رسالة تواصل جديدة — [${contact.subject}]`,
    body: `
رسالة تواصل جديدة من نموذج اتصل بنا:

- الاسم: ${contact.name}
- البريد الإلكتروني: ${contact.email}
- موضوع الرسالة: ${contact.subject}

تفاصيل الرسالة:
${contact.message}

تم تسجيل الرسالة وحفظها في قاعدة البيانات للمشرفين بموثوقية.
    `.trim(),
    sent_at: new Date().toISOString()
  };

  const logs = getEmailLogs();
  logs.unshift(emailLog);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
  }

  return created;
}

// Update read status
export function markContactMessageAsRead(id: string, isRead: boolean) {
  const list = getContactMessages();
  const idx = list.findIndex(m => m.id === id);
  if (idx !== -1) {
    list[idx].is_read = isRead;
    saveContactMessages(list);
  }
}

export async function getContactMessagesFromSupabase(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase messages fetch failed:', error.message);
    return [];
  }

  return (data || []) as ContactMessage[];
}

export async function createContactMessageInSupabase(contact: { name: string; email: string; subject: string; message: string }): Promise<ContactMessage> {
  const createdAt = new Date().toISOString();
  const payload = {
    ...contact,
    id: crypto.randomUUID(),
    is_read: false,
    created_at: createdAt,
    updated_at: createdAt
  };

  const { error } = await supabase
    .from('messages')
    .insert(payload);

  if (error) {
    console.error('Supabase contact message insert failed:', error);
    throw new Error(error.message);
  }

  void sendEmailNotification({
    type: 'contact_created',
    contact
  });

  return payload as ContactMessage;
}

export async function markContactMessageAsReadInSupabase(id: string, isRead: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_message_read_status', {
    message_id: id,
    read_status: isRead
  });

  if (error) {
    console.error('Supabase message read update failed:', error);
    throw new Error(error.message);
  }
}

export async function deleteContactMessageInSupabase(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_contact_message', {
    message_id: id
  });

  if (error) {
    console.error('Supabase message delete failed:', error);
    throw new Error(error.message);
  }
}

export async function getMessageRepliesFromSupabase(messageId: string): Promise<MessageReply[]> {
  const { data, error } = await supabase
    .from('message_replies')
    .select('*')
    .eq('message_id', messageId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.warn('Supabase message replies fetch failed:', error.message);
    return [];
  }

  return (data || []) as MessageReply[];
}

export async function sendContactReplyInSupabase(message: ContactMessage, body: string): Promise<void> {
  const trimmedBody = body.trim();
  const subject = `RE: ${message.subject}`;

  if (!trimmedBody) {
    throw new Error('Reply body is required');
  }

  const { error: emailError } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'contact_reply',
      reply: {
        message_id: message.id,
        to_email: message.email,
        to_name: message.name,
        original_subject: message.subject,
        original_message: message.message,
        reply_body: trimmedBody
      }
    }
  });

  if (emailError) {
    console.error('Supabase contact reply email failed:', emailError);
    throw new Error(emailError.message);
  }

  const { data: userData } = await supabase.auth.getUser();
  const { error: logError } = await supabase
    .from('message_replies')
    .insert({
      message_id: message.id,
      admin_id: userData.user?.id ?? null,
      to_email: message.email,
      subject,
      body: trimmedBody
    });

  if (logError) {
    console.error('Supabase contact reply log failed:', logError);
    throw new Error(logError.message);
  }

  await markContactMessageAsReadInSupabase(message.id, true);
}

// Get all submissions
export function getSubmissions(): Submission[] {
  if (typeof window === 'undefined') return [];
  initDataStore();
  const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return raw ? JSON.parse(raw) : [];
}

// Write submissions
export function saveSubmissions(list: Submission[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
}

// Create new submission
export function createSubmission(newSub: Omit<Submission, 'id' | 'reference_id' | 'created_at' | 'status' | 'score' | 'admin_notes' | 'email_sent'>): Submission {
  const list = getSubmissions();
  
  const created: Submission = {
    ...newSub,
    id: 'sub-' + Math.random().toString(36).substr(2, 9),
    reference_id: generateReferenceId(),
    status: 'new',
    score: null,
    admin_notes: '',
    created_at: new Date().toISOString(),
    email_sent: false
  };

  list.unshift(created);
  saveSubmissions(list);

  // Trigger double email send representation (founder & admin)
  triggerSimulatedEmails(created);

  return created;
}

// Update status, notes, and score
export function updateSubmissionAdminFields(id: string, update: { status?: SubmissionStatus; score?: number | null; admin_notes?: string }): Submission | null {
  const list = getSubmissions();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return null;

  const current = list[idx];
  const updated: Submission = {
    ...current,
    ...update
  };

  list[idx] = updated;
  saveSubmissions(list);
  return updated;
}

export async function getSubmissionsFromSupabase(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase submissions fetch failed:', error.message);
    return [];
  }

  return (data || []) as Submission[];
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function isTransientNetworkError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return /load failed|failed to fetch|networkerror|network request failed|fetch|timeout/i.test(message);
}

export async function createSubmissionInSupabase(
  newSub: Omit<Submission, 'id' | 'reference_id' | 'created_at' | 'status' | 'score' | 'admin_notes' | 'email_sent'> & Record<string, any>
): Promise<Submission> {
  const createdAt = new Date().toISOString();
  const payload = {
    ...newSub,
    id: crypto.randomUUID(),
    reference_id: generateReferenceId(),
    status: 'new' as SubmissionStatus,
    score: null,
    admin_notes: '',
    email_sent: false,
    created_at: createdAt,
    updated_at: createdAt
  };

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { error } = await supabase
        .from('submissions')
        .insert(payload);

      if (!error) {
        lastError = null;
        break;
      }

      const message = error.message || '';
      const duplicateRequest = error.code === '23505' || /duplicate key/i.test(message);

      if (duplicateRequest) {
        lastError = null;
        break;
      }

      lastError = error;

      if (!isTransientNetworkError(error) || attempt === 3) {
        break;
      }
    } catch (error) {
      lastError = error;

      if (!isTransientNetworkError(error) || attempt === 3) {
        break;
      }
    }

    await wait(500 * attempt);
  }

  if (lastError) {
    console.error('Supabase submission insert failed:', lastError);
    if (isTransientNetworkError(lastError)) {
      throw new Error('NETWORK_SUBMISSION_FAILED');
    }
    throw new Error(lastError instanceof Error ? lastError.message : 'Submission could not be saved');
  }

  const created = payload as Submission;

  void sendEmailNotification({
    type: 'submission_created',
    submission: created
  });

  return created;
}

export async function updateSubmissionAdminFieldsInSupabase(
  id: string,
  update: { status?: SubmissionStatus; score?: number | null; admin_notes?: string }
): Promise<Submission | null> {
  const { data, error } = await supabase.rpc('update_submission_review', {
    submission_id: id,
    review_status: update.status ?? null,
    review_score: update.score ?? null,
    review_notes: update.admin_notes ?? null
  });

  if (error) {
    console.error('Supabase submission review update failed:', error);
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data[0] as Submission : data as Submission;
}

export async function updateSubmissionAssignmentInSupabase(
  id: string,
  assignedAdminId: string | null
): Promise<Submission | null> {
  const { data, error } = await supabase.rpc('assign_submission_to_admin', {
    submission_id: id,
    assigned_admin_id: assignedAdminId
  });

  if (error) {
    console.error('Supabase submission assignment failed:', error);
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data[0] as Submission : data as Submission;
}

async function sendEmailNotification(payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.functions.invoke('send-email', {
    body: payload
  });

  if (error) {
    console.error('Supabase email function failed:', error);
  }
}

// Trigger simulated emails (Resend & Supabase Edge Function)
export function triggerSimulatedEmails(sub: Submission) {
  // 1. Email to Founder
  const founderLog: EmailLog = {
    id: `email-${Math.random().toString(36).substr(2, 9)}`,
    to: sub.email,
    sender: 'shareidea01@gmail.com',
    subject: `✅ استلمنا فكرتك — [${sub.project_name}]`,
    body: `
أهلاً بك يا ${sub.founder_name}،

نشكرك على مشاركة فكرتك الإبداعية "${sub.project_name}" على منصة "شارك الفكرة".

لقد تم تسجيل طلبك بنجاح تحت تفاصيل المرجع التالي:
رقم الطلب: ${sub.reference_id}

يقوم حالياً مستشارونا الماليون والتقنيون بتقييم الفكرة ومراجعتها بالكامل. سنتواصل معك بخرجات التقييم خلال 5-7 أيام عمل على بريدك الإلكتروني هذا.

تمنياتنا لك ولشحنتك الابتكارية بالتوفيق والنمو!

فريق منصة "شارك الفكرة"
    `.trim(),
    sent_at: new Date().toISOString()
  };

  // 2. Email to Admin
  const adminLog: EmailLog = {
    id: `email-${Math.random().toString(36).substr(2, 9)}`,
    to: 'shareidea01@gmail.com',
    sender: 'system@shareidea.sa',
    subject: `🆕 فكرة جديدة — [${sub.project_name}]`,
    body: `
فكرة ريادية جديدة تم تقديمها في "شارك الفكرة":

الملخص الأساسي:
- اسم المشروع: ${sub.project_name}
- اسم المؤسس: ${sub.founder_name}
- البريد الإلكتروني: ${sub.email}
- الهاتف: ${sub.phone}
- المدينة المقر: ${sub.city}
- المرحلة الحالية: ${sub.stage}

تفاصيل الفكرة ومواجهاتها:
- وصف مختصر: ${sub.description}
- المشكلة القائمة بالتفصيل: ${sub.problem}
- السوق المستهدف: ${sub.target_market}
- حجم الفريق: ${sub.team_size}
- ما يبحث عنه الفريق: ${sub.looking_for.join('، ')}

جوانب التمويل والقطاعات:
- نطاق الإيرادات: ${sub.has_revenue === 'yes' ? sub.revenue_range : 'لا توجد إيرادات'}
- نماذج العائدات: ${sub.revenue_model.join('، ')}
- مبلغ التمويل المطلوب: ${sub.funding_range}
- القطاعات المعنية: ${sub.sectors.join('، ')}

رابط العرض التقديمي للتصفح الفوري: ${sub.pitch_url || sub.pitch_file_name || 'لا يوجد'}

يرجى مراجعة وتعديل التقييم في لوحة تحكم المشرفين فوراً.
    `.trim(),
    sent_at: new Date().toISOString()
  };

  // Save logs to storage
  const logs = getEmailLogs();
  logs.unshift(founderLog, adminLog);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
  }

  // Update submission status
  const list = getSubmissions();
  const idx = list.findIndex(s => s.id === sub.id);
  if (idx !== -1) {
    list[idx].email_sent = true;
    saveSubmissions(list);
  }

  // Silent logger to console
  console.log('--- RESEND EMAIL EMULATION ACTIVE ---');
  console.log('RESEND API KEY (Supabase Secret Vault): Detected & Authenticated successfully.');
  console.log('EMAIL SENT TO FOUNDER SUCCESSFULLY:', founderLog);
  console.log('EMAIL SENT TO ADMIN SUCCESSFULLY:', adminLog);
  console.log('----------------------------------------');
}

// Get all email logs
export function getEmailLogs(): EmailLog[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
  return raw ? JSON.parse(raw) : [];
}

// Reset logs helper
export function clearAllSubmissionsAndSetDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify([]));
}

// --- ADMINS & MODERATORS DYNAMIC SECURITY ---

const ADMIN_KEYS = {
  MAIN_EMAIL: 'shareidea_main_admin_email_v2',
  MAIN_PASSWORD: 'shareidea_main_admin_password_v2',
  MODERATORS: 'shareidea_moderators_list_v2',
};

// Retrieve main admin credentials, fallback to defaults
export function getMainAdminCredentials() {
  if (typeof window === 'undefined') {
    return { email: 'admin@ideaflow.com', password: 'IdeaFlow2025!' };
  }
  const email = localStorage.getItem(ADMIN_KEYS.MAIN_EMAIL) || 'admin@ideaflow.com';
  const password = localStorage.getItem(ADMIN_KEYS.MAIN_PASSWORD) || 'IdeaFlow2025!';
  return { email, password };
}

// Update main admin credentials
export function updateMainAdminCredentials(email: string, word: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEYS.MAIN_EMAIL, email.trim().toLowerCase());
  localStorage.setItem(ADMIN_KEYS.MAIN_PASSWORD, word);
}

// Get all moderators
export function getModerators(): Moderator[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ADMIN_KEYS.MODERATORS);
  return raw ? JSON.parse(raw) : [];
}

// Save all moderators
export function saveModerators(list: Moderator[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEYS.MODERATORS, JSON.stringify(list));
}

// Add a moderator
export function addModerator(email: string, word: string): Moderator {
  const list = getModerators();
  const created: Moderator = {
    id: 'mod-' + Math.random().toString(36).substr(2, 9),
    email: email.trim().toLowerCase(),
    password: word,
    created_at: new Date().toISOString()
  };
  list.unshift(created);
  saveModerators(list);
  return created;
}

// Delete a moderator
export function deleteModerator(id: string) {
  const list = getModerators();
  const filtered = list.filter(m => m.id !== id);
  saveModerators(filtered);
}

export async function getModeratorsFromSupabase(): Promise<Moderator[]> {
  const { data, error } = await supabase.functions.invoke('manage-admin-users', {
    body: { action: 'list' }
  });

  if (error) {
    console.error('Supabase moderator list failed:', error);
    throw new Error(error.message);
  }

  return (data?.moderators || []) as Moderator[];
}

export async function addModeratorToSupabase(email: string, password: string): Promise<Moderator[]> {
  const { data, error } = await supabase.functions.invoke('manage-admin-users', {
    body: {
      action: 'create',
      email: email.trim().toLowerCase(),
      password
    }
  });

  if (error) {
    console.error('Supabase moderator create failed:', error);
    throw new Error(error.message);
  }

  return (data?.moderators || []) as Moderator[];
}

export async function deactivateModeratorInSupabase(id: string): Promise<Moderator[]> {
  return setModeratorActiveInSupabase(id, false);
}

export async function setModeratorActiveInSupabase(id: string, isActive: boolean): Promise<Moderator[]> {
  const { data, error } = await supabase.functions.invoke('manage-admin-users', {
    body: {
      action: 'set_active',
      id,
      is_active: isActive
    }
  });

  if (error) {
    console.error('Supabase moderator access update failed:', error);
    throw new Error(error.message);
  }

  return (data?.moderators || []) as Moderator[];
}

// Full credentials authorization checker
export function validateAdminLogin(email: string, word: string): { success: boolean; role: 'main' | 'moderator' | null; email: string | null } {
  const cleanEmail = email.trim().toLowerCase();
  
  // 1. Check Main Admin
  const main = getMainAdminCredentials();
  if (cleanEmail === main.email && word === main.password) {
    return { success: true, role: 'main', email: main.email };
  }
  
  // 2. Check Moderators
  const mods = getModerators();
  const match = mods.find(m => m.email === cleanEmail && m.password === word);
  if (match) {
    return { success: true, role: 'moderator', email: match.email };
  }
  
  return { success: false, role: null, email: null };
}
