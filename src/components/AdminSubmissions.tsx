/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar, 
  User, 
  Trophy, 
  Edit3, 
  X, 
  Check, 
  MailWarning, 
  MailCheck, 
  Star, 
  PhoneCall, 
  Grid,
  Download,
  Mail,
  UserCheck
} from 'lucide-react';
import { Submission, SubmissionStatus, Language, Moderator } from '../types';
import { translations } from '../translations';
import { downloadFile, getModeratorsFromSupabase } from '../dataStore';
import { Logo } from './Logo';

interface AdminSubmissionsProps {
  lang: Language;
  submissions: Submission[];
  adminEmail: string;
  adminRole: 'main' | 'moderator';
  onUpdateAdminFields: (id: string, update: { status?: SubmissionStatus; score?: number | null; admin_notes?: string }) => void | Promise<void>;
  onUpdateAssignment: (id: string, assignedAdminId: string | null) => void | Promise<void>;
}

export default function AdminSubmissions({ lang, submissions, adminEmail, adminRole, onUpdateAdminFields, onUpdateAssignment }: AdminSubmissionsProps) {
  const t = translations[lang];

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Highlighted Modal Detail state
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);

  // Edit states inside the details modal
  const [editStatus, setEditStatus] = useState<SubmissionStatus>('new');
  const [editScore, setEditScore] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');
  const [editAssignedAdminId, setEditAssignedAdminId] = useState('');
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);

  useEffect(() => {
    if (adminRole !== 'main') return;

    getModeratorsFromSupabase()
      .then(list => setModerators(list.filter(mod => mod.is_active !== false)))
      .catch(error => console.warn('Could not load moderators for delegation:', error));
  }, [adminRole]);

  // Parse Date nicely
  const formatDateStr = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Convert stored raw/English looking_for value to localized string
  const getLookingForLabel = (lf: string): string => {
    const val = lf.trim().toLowerCase();
    if (val === 'استثمار' || val.includes('invest')) return t.lf_investment;
    if (val === 'إرشاد' || val.includes('mentor')) return t.lf_mentorship;
    if (val === 'شراكة' || val.includes('partner')) return t.lf_partnership;
    if (val === 'تمويل متقدم' || val.includes('adv') || val.includes('funding')) return t.lf_advFunding;
    if (val === 'دعم مبكر' || val.includes('support')) return t.lf_support;
    return lf;
  };

  // Trigger download of files submitted by participants
  const handleDownload = async (fileName: string, fileUrl?: string) => {
    if (fileUrl && fileUrl.startsWith('http') && !fileUrl.includes('shareidea-vault.storage.cloud')) {
      window.open(fileUrl, '_blank');
      return;
    }
    
    try {
      if (fileUrl) {
        await downloadFile(fileUrl, fileName);
        return;
      }
    } catch (err) {
      console.warn('downloadFile failed, falling back to simulation generation:', err);
    }
    
    // Check if the original uploaded file is cached in the browser's SPA session memory
    const win = (typeof window !== 'undefined' ? window : null) as any;
    const cachedFile = win?.__uploadedFiles?.[fileUrl || ''] || win?.__uploadedFiles?.[fileName];
    
    if (cachedFile) {
      // Stream the genuine binary file uploaded by the founder!
      const url = URL.createObjectURL(cachedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = cachedFile.name || fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // Fallback logic for mock files (or pre-populated elements)
    const isPdf = fileName.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // Standardize values to ASCII-safe strings for basic PDF West Europe compliance
      const safeFileName = fileName.replace(/[()]/g, '').replace(/[^\x00-\x7F]/g, '?');
      const safeProjName = (viewingSubmission?.project_name || 'N/A').replace(/[()]/g, '').replace(/[^\x00-\x7F]/g, '?');
      const safeFounder = (viewingSubmission?.founder_name || 'N/A').replace(/[()]/g, '').replace(/[^\x00-\x7F]/g, '?');
      const safeEmail = (viewingSubmission?.email || 'N/A').replace(/[()]/g, '').replace(/[^\x00-\x7F]/g, '?');

      const streamContent = `BT
/F1 16 Tf
50 780 Td
(SHAREIDEA VAULT - PITCH FILE PREVIEW) Tj
/F1 12 Tf
0 -35 Td
(File Name: ${safeFileName}) Tj
0 -20 Td
(Project Name: ${safeProjName}) Tj
0 -20 Td
(Founder:  ${safeFounder}) Tj
0 -20 Td
(Email: ${safeEmail}) Tj
0 -40 Td
(This is a secure simulation of the uploaded pitch document) Tj
0 -15 Td
(within the AI Studio environment.) Tj
ET`;

      const pdfBody = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nstream_end\nendobj\n`;

      const normalizedBody = pdfBody.replace('stream_end', 'endstream');
      const parts = normalizedBody.split('\n');
      let currentOffset = 0;
      const offsets: number[] = [];
      
      for (let i = 0; i < parts.length; i++) {
        const line = parts[i];
        if (line.match(/^\d+ \d+ obj/)) {
          offsets.push(currentOffset);
        }
        currentOffset += line.length + 1; // +1 for the newline char
      }
      
      let xref = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
      for (const offset of offsets) {
        const padded = String(offset).padStart(10, '0');
        xref += `${padded} 00000 n \n`;
      }
      
      const trailer = `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF`;
      const finalPdf = normalizedBody + xref + trailer;

      const bytes = new Uint8Array(finalPdf.length);
      for (let i = 0; i < finalPdf.length; i++) {
        bytes[i] = finalPdf.charCodeAt(i) & 0xff;
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Default to plain text format mockup for other legacy/unsupported mock extensions (.docx, .ppt etc)
      const content = `==================================================
SHAREIDEA VAULT - PITCH DECK FILE PREVIEW
==================================================
File Name: ${fileName}
Project Name: ${viewingSubmission?.project_name || 'N/A'}
Founder: ${viewingSubmission?.founder_name || 'N/A'}
Email: ${viewingSubmission?.email || 'N/A'}
Date: ${viewingSubmission ? formatDateStr(viewingSubmission.created_at) : 'N/A'}

Description:
${viewingSubmission?.description || 'N/A'}

This file simulates the uploaded document securely within the AI Studio preview environment.
==================================================`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Status badge styling generator
  const getStatusBadgeStyle = (status: SubmissionStatus) => {
    switch (status) {
      case 'new':
        return 'bg-teal-50 text-teal-700 border border-teal-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'promising':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'invested':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Status Badge Label Translated
  const getStatusLabel = (status: SubmissionStatus) => {
    return t[`filter_${status}` as keyof typeof t] || status;
  };

  const getAssignedLabel = (sub: Submission) => {
    if (!sub.assigned_admin_email) {
      return lang === 'ar' ? 'غير مفوض' : 'Unassigned';
    }
    return sub.assigned_admin_email;
  };

  // Stage Translate
  const getStageLabel = (stage: string) => {
    return t[`stage_${stage}` as keyof typeof t] || stage;
  };

  // Open Detailed Evaluator Modal
  const handleOpenEvaluator = (sub: Submission) => {
    setViewingSubmission(sub);
    setEditStatus(sub.status);
    setEditScore(sub.score || 0);
    setEditNotes(sub.admin_notes || '');
    setEditAssignedAdminId(sub.assigned_admin_id || '');
  };

  const handleDownloadPDF = () => {
    if (!viewingSubmission) return;

    const isAr = lang === 'ar';
    const directions = isAr ? 'rtl' : 'ltr';
    const alignment = isAr ? 'right' : 'left';

    const lookingForPills = viewingSubmission.looking_for
      .map(lf => `<span class="badge badge-orange">${getLookingForLabel(lf)}</span>`)
      .join(' ');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}" dir="${directions}">
      <head>
        <meta charset="utf-8">
        <title>${viewingSubmission.project_name} - PDF Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap');
          
          body {
            font-family: ${isAr ? '"Cairo", "Inter", sans-serif' : '"Inter", sans-serif'};
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background-color: #ffffff;
            direction: ${directions};
            text-align: ${alignment};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0a4f68;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          
          .header-title-container {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .main-title {
            font-size: 26px;
            font-weight: 800;
            color: #0a4f68;
            margin: 0;
          }
          
          .ref-badge {
            font-family: monospace;
            background-color: #e2f1f6;
            border: 1px solid #7dc4df;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 13px;
            color: #083d52;
            font-weight: bold;
          }
          
          .instructions-banner {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #166534;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .print-btn {
            background-color: #16a34a;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            font-size: 12px;
          }
          
          .intro-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .intro-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          
          .intro-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .intro-label {
            font-size: 11px;
            font-weight: 700;
            color: #1a5c74;
            text-transform: uppercase;
          }
          
          .intro-value {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 25px;
          }
          
          .card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            page-break-inside: avoid;
          }
          
          .full-width {
            grid-column: span 2;
          }
          
          .card-title {
            font-size: 12px;
            font-weight: 800;
            color: #0a4f68;
            text-transform: uppercase;
            margin-top: 0;
            margin-bottom: 8px;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 4px;
          }
          
          .card-content {
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            margin: 0;
            white-space: pre-line;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            margin: 2px;
          }
          
          .badge-orange {
            background-color: #ffedd5;
            color: #c2410c;
            border: 1px solid #fed7aa;
          }
          
          .badge-teal {
            background-color: #ccfbf1;
            color: #0f766e;
            border: 1px solid #99f6e4;
          }
          
          .footer-watermark {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px dashed #e2e8f0;
            padding-top: 12px;
          }

          @media print {
            .instructions-banner {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="instructions-banner">
          <span>
            ${isAr 
              ? '💡 <strong>جاهز للطباعة:</strong> سيظهر خيار الحفظ كـ PDF تلقائياً، أو يمكنك الضغط على زر الطباعة.' 
              : '💡 <strong>Ready to Print:</strong> The Save as PDF screen will open automatically, or click print.'}
          </span>
          <button class="print-btn" onclick="window.print()">${isAr ? 'طباعة' : 'Print'}</button>
        </div>

        <div class="header">
          <div class="header-title-container">
            <h1 class="main-title">${viewingSubmission.project_name}</h1>
            <div style="font-size: 14px; color: #64748b; font-weight: 600;">
              ${isAr ? 'ملخص فكرة المشروع تفصيلياً' : 'Detailed Project Idea Summary'}
            </div>
          </div>
          <span class="ref-badge">ID: ${viewingSubmission.reference_id}</span>
        </div>
        
        <div class="intro-card">
          <div class="intro-grid">
            <div class="intro-item">
              <span class="intro-label">${isAr ? 'اسم المؤسس' : 'Founder'}</span>
              <span class="intro-value">${viewingSubmission.founder_name}</span>
            </div>
            <div class="intro-item">
              <span class="intro-label">${isAr ? 'البريد الإلكتروني' : 'Email'}</span>
              <span class="intro-value" style="font-size: 13px; word-break: break-all;">${viewingSubmission.email}</span>
            </div>
            <div class="intro-item">
              <span class="intro-label">${isAr ? 'رقم الاتصال' : 'Mobile'}</span>
              <span class="intro-value" dir="ltr">${(viewingSubmission.phone_country || '').trim()}${(viewingSubmission.phone || '').trim()}</span>
            </div>
            <div class="intro-item">
              <span class="intro-label">${isAr ? 'تاريخ التقديم' : 'Date'}</span>
              <span class="intro-value">${formatDateStr(viewingSubmission.created_at)}</span>
            </div>
          </div>
        </div>
        
        <div class="section-grid">
          <div class="card full-width">
            <h3 class="card-title">${isAr ? 'الوصف المختصر للمشروع' : 'Description summary'}</h3>
            <p class="card-content">${viewingSubmission.description || '—'}</p>
          </div>
          
          <div class="card full-width">
            <h3 class="card-title">${isAr ? 'المشكلة ومعالجتها' : 'Problem & Solution'}</h3>
            <p class="card-content">${viewingSubmission.problem || '—'}</p>
          </div>
          
          <div class="card">
            <h3 class="card-title">${isAr ? 'المرحلة الحالية والإيرادات' : 'Current Stage & Revenues'}</h3>
            <p class="card-content" style="font-weight: bold; color: #0a4f68; margin-bottom: 6px;">
              ${getStageLabel(viewingSubmission.stage)}
            </p>
            <p class="card-content" style="font-size: 13px; color: #64748b;">
              ${viewingSubmission.has_revenue === 'yes' 
                ? (isAr ? `لديه إيرادات (${viewingSubmission.revenue_range})` : `Has Revenue (${viewingSubmission.revenue_range})`) 
                : (isAr ? 'لا توجد إيرادات مسجلة حالياً' : 'No recorded revenue yet')
              }
            </p>
          </div>
          
          <div class="card">
            <h3 class="card-title">${isAr ? 'السوق وحجم الفريق' : 'Market Segment & Team'}</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div>
                <span class="intro-label" style="display: block; margin-bottom: 3px;">${isAr ? 'السوق المستهدف:' : 'Target Segment:'}</span>
                <span class="badge badge-teal">${viewingSubmission.target_market === 'Gov' ? (isAr ? 'حكومي' : 'Governmental') : viewingSubmission.target_market}</span>
              </div>
              <div>
                <span class="intro-label" style="display: block; margin-bottom: 3px;">${isAr ? 'حجم الفريق الحالي:' : 'Current Team Size:'}</span>
                <span style="font-size: 14px; font-weight: bold; color: #1e293b;">${viewingSubmission.team_size}</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="card-title">${isAr ? 'متطلبات الوصول والنمو' : 'Sought Access Channels'}</h3>
            <div style="margin-bottom: 8px;">
              ${lookingForPills}
            </div>
            ${viewingSubmission.looking_for_notes ? `<p class="card-content" style="font-size: 12px; color: #64748b; font-style: italic; border-top: 1px dashed #e2e8f0; padding-top: 8px; margin-top: 8px;">${viewingSubmission.looking_for_notes}</p>` : ''}
          </div>
          
          <div class="card">
            <h3 class="card-title">${isAr ? 'نموذج الإيرادات والقطاعات المعنية' : 'Revenue Models & Sectors'}</h3>
            <p class="card-content" style="font-weight: bold; margin-bottom: 6px;">
              ${viewingSubmission.revenue_model.join('، ')}
            </p>
            <p class="card-content" style="font-size: 13px; color: #64748b;">
              <strong>${isAr ? 'القطاعات:' : 'Sectors:'}</strong> ${viewingSubmission.sectors.join('، ')}
            </p>
          </div>

          <div class="card">
            <h3 class="card-title">${isAr ? 'التمويل والحصة المعروضة' : 'Funding & Equity Offered'}</h3>
            <p class="card-content" style="font-size: 18px; font-weight: 800; color: #e8703a;">
              ${viewingSubmission.funding_range}
            </p>
            <p class="card-content" style="font-size: 14px; font-weight: 600; color: #0284c7; margin-top: 6px;">
              ${isAr ? 'الحصة المعروضة:' : 'Equity Offered:'} ${viewingSubmission.equity_offered || viewingSubmission.equity || 10}%
            </p>
          </div>

          <div class="card">
            <h3 class="card-title">${isAr ? 'معلومات التقديم الأساسية' : 'Submission Details'}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <span class="intro-label" style="display: block;">${isAr ? 'المدينة' : 'City'}</span>
                <span style="font-size: 14px; font-weight: 600;">${viewingSubmission.city || '—'}</span>
              </div>
              <div>
                <span class="intro-label" style="display: block;">${isAr ? 'مصدر القدوم' : 'Referral Source'}</span>
                <span style="font-size: 14px; font-weight: 600;">${viewingSubmission.heard_from || '—'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-watermark">
          ${isAr ? 'تم تصدير هذا التقرير التفصيلي من منصة شارك الفكرة' : 'This report was exported from ShareIdea Platform.'}
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          }
        </script>
      </body>
      </html>
    `;

    // Direct Blob download of a perfectly formatted document
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${viewingSubmission.project_name}_report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save current evaluated state back
  const handleSaveEvaluation = async () => {
    if (!viewingSubmission) return;

    setSaveError('');
    setIsSavingEvaluation(true);

    try {
      const update = {
        status: editStatus,
        score: editScore > 0 ? editScore : null,
        admin_notes: editNotes
      };

      await onUpdateAdminFields(viewingSubmission.id, update);

      if (adminRole === 'main' && editAssignedAdminId !== (viewingSubmission.assigned_admin_id || '')) {
        await onUpdateAssignment(viewingSubmission.id, editAssignedAdminId || null);
      }

      setViewingSubmission(prev => prev ? {
        ...prev,
        ...update,
        assigned_admin_id: adminRole === 'main' ? (editAssignedAdminId || null) : prev.assigned_admin_id,
        assigned_admin_email: adminRole === 'main'
          ? (moderators.find(mod => mod.id === editAssignedAdminId)?.email || null)
          : prev.assigned_admin_email,
        assigned_at: adminRole === 'main' && editAssignedAdminId !== (prev.assigned_admin_id || '') ? new Date().toISOString() : prev.assigned_at
      } : null);

      setShowSaveToast(true);
      setTimeout(() => {
        setShowSaveToast(false);
        setViewingSubmission(null);
      }, 1500);
    } catch (error) {
      console.error('Unable to save submission evaluation:', error);
      const message = error instanceof Error ? error.message : '';
      setSaveError(lang === 'ar'
        ? `تعذر حفظ التقييم في قاعدة البيانات.${message ? ` ${message}` : ''}`
        : `Could not save the evaluation in the database.${message ? ` ${message}` : ''}`
      );
    } finally {
      setIsSavingEvaluation(false);
    }
  };

  const handleCheckboxToggleAll = () => {
    if (selectedIds.length === filteredSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map(s => s.id));
    }
  };

  const handleCheckboxToggleSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening modal row details simply on clicking checkboxes
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const visibleSubmissions = adminRole === 'main'
    ? submissions
    : submissions.filter(sub => (sub.assigned_admin_email || '').toLowerCase() === adminEmail.toLowerCase());

  // Filter Submissions
  const filteredSubmissions = visibleSubmissions.filter(sub => {
    const matchesSearch = 
      sub.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.founder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.reference_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none" id="submissions-tab-wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Search and Filters Strip */}
      <div 
        className="flex flex-col md:flex-row items-center gap-4 bg-[#0A4F68] p-4 rounded-xl border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" 
        id="table-filters-strip"
      >
        {/* Full width Search input bar */}
        <div className="relative flex-1 w-full" id="search-input-wrapper">
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full px-4 py-2.5 ps-11 rounded-lg border border-white/10 bg-[#083D52] text-sm text-white focus:border-[#F5C842] outline-none transition-all placeholder-[#B0D4E0]/50"
            id="table-search-bar"
          />
          <span className="absolute inset-y-0 start-4 flex items-center text-[#B0D4E0] pointer-events-none" id="table-search-icon">
            <Search className="w-4.5 h-4.5" />
          </span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 end-3.5 flex items-center text-[#B0D4E0] hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              id="btn-clear-search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto" id="status-filter-wrapper">
          <Filter className="w-4 h-4 text-[#B0D4E0] hidden md:block" />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-[220px] px-3.5 py-2.5 rounded-lg border border-white/10 bg-[#083D52] text-xs font-bold text-white focus:border-[#F5C842] outline-none cursor-pointer"
            id="select-status-filter"
          >
            <option value="all" className="bg-[#083D52] text-white">{t.filterAll}</option>
            <option value="new" className="bg-[#083D52] text-white">{t.filter_new}</option>
            <option value="under_review" className="bg-[#083D52] text-white">{t.filter_under_review}</option>
            <option value="promising" className="bg-[#083D52] text-white">{t.filter_promising}</option>
            <option value="invested" className="bg-[#083D52] text-white">{t.filter_invested}</option>
            <option value="rejected" className="bg-[#083D52] text-white">{t.filter_rejected}</option>
          </select>
        </div>
      </div>

      {/* Row counter and multi-actions */}
      <div className="flex items-center justify-between text-xs text-[#B0D4E0] font-sans" id="table-rows-meta-strip">
        <div>
          {lang === 'ar' 
            ? `عرض ${filteredSubmissions.length} من أصل ${visibleSubmissions.length} طلبات` 
            : `Showing ${filteredSubmissions.length} of ${visibleSubmissions.length} items`
          }
        </div>
        {selectedIds.length > 0 && (
          <div className="p-1 px-3 bg-[#E8703A]/20 border border-[#E8703A]/35 rounded-lg text-[#E8703A] font-bold animate-fade-in font-ar" id="bulk-selection-meta">
            {lang === 'ar' ? `محدد (${selectedIds.length}) طلب` : `Selected (${selectedIds.length}) items`}
          </div>
        )}
      </div>

      {/* Main Responsive Table */}
      <div className="bg-[#0A4F68] rounded-[16px] border border-white/8 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)]" id="table-box-container">
        <div className="overflow-x-auto" id="scrollable-table-inner">
          <table className="w-full text-center text-xs border-collapse" id="submissions-table" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-[#083D52] text-[#B0D4E0] text-xs font-extrabold border-b border-white/10 uppercase" id="table-head">
                <th className="py-4 px-4 text-center w-[50px]">
                  <input 
                    type="checkbox"
                    checked={filteredSubmissions.length > 0 && selectedIds.length === filteredSubmissions.length}
                    onChange={handleCheckboxToggleAll}
                    className="w-4 h-4 rounded text-[#E8703A] border-white/15 focus:ring-0 cursor-pointer accent-[#E8703A]"
                    id="checkbox-select-all"
                  />
                </th>
                <th className="py-4 px-5 text-center font-bold" style={{ fontSize: '13px' }}>{t.col_project}</th>
                <th className="py-4 px-4 text-center font-bold" style={{ fontSize: '13px' }}>{t.col_founder}</th>
                <th className="py-4 px-4 text-center font-bold" style={{ fontSize: '13px' }}>{t.col_stage}</th>
                <th className="py-4 px-4 text-center font-bold" style={{ fontSize: '13px' }}>{t.col_score}</th>
                {adminRole === 'main' && (
                  <th className="py-4 px-4 text-center font-bold" style={{ fontSize: '13px' }}>
                    {lang === 'ar' ? 'مفوض إلى' : 'Assigned To'}
                  </th>
                )}
                <th className="py-4 px-4 text-center font-bold" style={{ fontSize: '13px' }}>{t.col_status}</th>
                <th className="py-4 px-4 text-center font-bold" style={{ fontSize: '13px' }}>{t.col_date}</th>
                <th className="py-4 px-4 text-center font-semibold" style={{ fontSize: '13px' }}>{t.col_actions}</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5" id="table-body">
              {filteredSubmissions.length === 0 ? (
                <tr id="empty-table-row">
                  <td colSpan={adminRole === 'main' ? 9 : 8} className="py-16 text-center text-[var(--secondary-text)]/70 font-ar flex flex-col items-center justify-center gap-3" id="empty-table-cell" style={{ display: 'table-cell' }}>
                    <div className="flex justify-center mb-3" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                      <Logo size="sm" />
                    </div>
                    <p className="text-sm font-bold mb-1">{t.noSubmissions}</p>
                    <p className="text-xs opacity-75">{lang === 'ar' ? 'جرّب كتابة كلمة بحث أخرى أو تعديل فلاتر الحالة' : 'Try typing another keyword or toggling options'}</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const isChecked = selectedIds.includes(sub.id);
                  const isEven = idx % 2 === 1;

                  let badgeStyle = {
                    background: "rgba(59,130,246,0.15)",
                    color: "#60A5FA",
                    border: "1px solid #3B82F6",
                    borderRadius: "20px",
                    padding: "3px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "inline-block"
                  };
                  let statusText = lang === 'ar' ? 'جديدة' : 'New';
                  
                  if (sub.status === 'under_review') {
                    badgeStyle = {
                      background: "rgba(245,158,11,0.15)",
                      color: "#FCD34D",
                      border: "1px solid #F59E0B",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "inline-block"
                    };
                    statusText = lang === 'ar' ? 'قيد المراجعة' : 'Under Review';
                  } else if (sub.status === 'promising' || sub.status === 'invested') {
                    badgeStyle = {
                      background: "rgba(34,197,94,0.15)",
                      color: "#4ADE80",
                      border: "1px solid #22C55E",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "inline-block"
                    };
                    statusText = lang === 'ar' ? 'مختارة' : 'Shortlisted';
                  } else if (sub.status === 'rejected') {
                    badgeStyle = {
                      background: "rgba(239,68,68,0.15)",
                      color: "#F87171",
                      border: "1px solid #EF4444",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "inline-block"
                    };
                    statusText = lang === 'ar' ? 'مرفوضة' : 'Rejected';
                  }

                  return (
                    <tr 
                      key={sub.id}
                      onClick={() => handleOpenEvaluator(sub)}
                      className="border-b border-white/5 transition-all cursor-pointer group"
                      style={{
                        backgroundColor: isChecked ? 'rgba(232,112,58,0.06)' : isEven ? 'rgba(255,255,255,0.02)' : 'transparent',
                      }}
                      id={`row-${sub.id}`}
                    >
                      {/* Checkbox column */}
                      <td className="py-4 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxToggleSingle(sub.id, e as any)}
                          className="w-4 h-4 rounded text-[#E8703A] border-white/10 cursor-pointer accent-[#E8703A]"
                          id={`checkbox-${sub.id}`}
                        />
                      </td>

                      {/* Project Column (name + id) */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex flex-col gap-1 items-center" id={`project-cell-stack-${sub.id}`}>
                          <span className="font-bold text-[#F5C842] line-clamp-1" style={{ fontSize: '13px' }}>{sub.project_name}</span>
                          <span className="text-[10px] font-mono text-[#B0D4E0] font-medium">{sub.reference_id}</span>
                          <span className="text-[10px] inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono font-bold" title={lang === 'ar' ? 'الحصة المعروضة للمستثمرين' : 'Proposed Equity Offered'}>
                            {lang === 'ar' ? 'الحصة:' : 'Equity:'} {sub.equity_offered || (sub as any).equity || 10}%
                          </span>
                        </div>
                      </td>

                      {/* Founder info */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col gap-1 items-center" id={`founder-cell-stack-${sub.id}`}>
                          <span className="font-semibold text-white text-xs truncate">{sub.founder_name}</span>
                          <span className="text-[10px] font-mono text-[#B0D4E0] truncate">{sub.email}</span>
                        </div>
                      </td>

                      {/* Stage column as pills */}
                      <td className="py-4 px-4 text-center text-xs">
                        <span className="px-2.5 py-1 bg-[#083D52] border border-white/10 text-white font-bold rounded-full">
                          {getStageLabel(sub.stage)}
                        </span>
                      </td>

                      {/* Score metric block */}
                      <td className="py-4 px-4 text-center">
                        {sub.score !== null ? (
                          <div className="inline-flex items-center gap-1 bg-[#F5C842]/10 border border-[#F5C842]/20 px-2.5 py-1 rounded-lg text-[#F5C842] text-xs font-mono font-extrabold" id={`score-cell-${sub.id}`}>
                            <Star className="w-3.5 h-3.5 fill-[#F5C842] text-[#F5C842]" />
                            <span>{sub.score}</span>
                          </div>
                        ) : (
                          <span className="text-[#B0D4E0]/40 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Status indicator badge */}
                      {adminRole === 'main' && (
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex max-w-[180px] items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                            sub.assigned_admin_email
                              ? 'border-[#F5C842]/25 bg-[#F5C842]/10 text-[#F5C842]'
                              : 'border-white/10 bg-white/5 text-[#B0D4E0]'
                          }`}>
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate" dir="ltr">{getAssignedLabel(sub)}</span>
                          </span>
                        </td>
                      )}

                      {/* Status indicator badge */}
                      <td className="py-4 px-4 text-center">
                        <span style={badgeStyle} id={`status-badge-cell-${sub.id}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Date column */}
                      <td className="py-2.5 px-4 text-xs font-medium text-[#B0D4E0] font-num text-center">
                        {formatDateStr(sub.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEvaluator(sub)}
                          className="p-1.5 text-[#B0D4E0] hover:text-[#F5C842] hover:bg-white/5 rounded-lg transition-colors cursor-pointer inline-flex items-center bg-transparent border-0"
                          title="Evaluate"
                          id={`btn-evaluate-${sub.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED EVALUATOR REGISTER MODAL / DIALOG POPUP */}
      {viewingSubmission && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setViewingSubmission(null)}
          id="evaluator-modal-overlay"
        >
          {/* Modal Container */}
          <div 
            className="bg-[#0A4F68] text-white rounded-2xl w-full max-w-[720px] max-h-[85vh] overflow-y-auto shadow-[0_10px_50px_rgba(0,0,0,0.4)] relative border border-white/10 flex flex-col"
            onClick={e => e.stopPropagation()}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            id="evaluator-modal-content"
          >
            {/* Modal Top Header bar */}
            <div className="sticky top-0 bg-[#083D52] border-b border-white/5 p-5 flex items-center justify-between z-20" id="modal-top-bar">
              <div className="flex items-center gap-2 flex-row-reverse justify-start" id="modal-title-stack">
                <Trophy className="w-5 h-5 text-[#F5C842]" />
                <span className="font-ar font-bold text-white text-lg">{t.detailsTitle}</span>
              </div>
              <div className="flex items-center gap-2" id="modal-actions-container">
                <button
                  onClick={handleDownloadPDF}
                  className="px-3.5 py-1.5 bg-[#F5C842]/10 hover:bg-[#F5C842]/20 text-[#F5C842] rounded-lg cursor-pointer font-ar text-xs font-bold transition-all border border-[#F5C842]/20 flex items-center gap-1.5 flex-row-reverse shadow-[0_2px_8px_rgba(245,200,66,0.1)] active:scale-95"
                  id="btn-download-pdf-report"
                  title={lang === 'ar' ? 'تنزيل التقرير بصيغة PDF' : 'Download PDF Report'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
                </button>
                <button 
                  onClick={() => setViewingSubmission(null)}
                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-[#B0D4E0] hover:text-white rounded-lg cursor-pointer font-sans text-xs transition-colors border-0"
                  id="btn-close-modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body Info Fields wrapper */}
            <div className="p-6 space-y-6 flex-1 text-right font-ar" id="modal-fields-body">
              {/* Project Title Block card */}
              <div className="p-8 bg-gradient-to-br from-[#0E5C77] to-[#0A3D52] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center gap-5 shadow-[0_12px_45px_rgba(0,0,0,0.3)] transition-all hover:border-white/15 duration-300 relative overflow-hidden" id="modal-card-brand">
                {/* Absolute Top Left ID Badge */}
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-black/35 border border-white/10 text-[10px] text-[#B0D4E0] font-mono rounded-md tracking-wider select-all z-10 animate-fade-in">
                  ID: {viewingSubmission.reference_id}
                </span>

                <div className="space-y-4 flex flex-col items-center justify-center text-center w-full" id="mcard-text-stack">
                  <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest text-[#F5C842] uppercase font-bold bg-[#F5C842]/10 border border-[#F5C842]/20 px-3 py-1 rounded-full select-none" style={{ fontWeight: 900 }}>
                    <span className="w-1.5 h-1.5 bg-[#F5C842] rounded-full inline-block animate-pulse"></span>
                    {lang === 'ar' ? "ملف فكرة المشروع" : "PROJECT DECK"}
                  </span>
                  <h4 className="text-3xl font-black text-white tracking-wide">{viewingSubmission.project_name}</h4>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-[#B0D4E0] pt-1 font-sans" id="mcard-meta-line">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[#E2F1F6] hover:bg-white/10 transition-colors">
                      <User className="w-3.5 h-3.5 text-[#F5C842]" />
                      <span className="font-semibold">{viewingSubmission.founder_name}</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[#E2F1F6] hover:bg-white/10 transition-colors font-num">
                      <Calendar className="w-3.5 h-3.5 text-[#F5C842]" />
                      <span>{formatDateStr(viewingSubmission.created_at)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[#E2F1F6] hover:bg-white/10 transition-colors font-num">
                      <PhoneCall className="w-3.5 h-3.5 text-[#F5C842]" />
                      <span dir="ltr" className="tracking-wide select-all inline-block">{(viewingSubmission.phone_country || '').trim()}{(viewingSubmission.phone || '').trim()}</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[#E2F1F6] hover:bg-white/10 transition-colors select-all font-mono text-[11px]" title={lang === 'ar' ? 'البريد الإلكتروني' : 'Participant Email'}>
                      <Mail className="w-3.5 h-3.5 text-[#F5C842]" />
                      <span>{viewingSubmission.email}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2-column of submission core answers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="modal-data-table-grid">
                
                {/* Description Text block (full width) */}
                <div className="p-4 bg-[#083D52] rounded-xl md:col-span-2 space-y-1" id="mdata-desc">
                  <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "الوصف المختصر" : "Description summary"}</span>
                  <p className="text-sm text-white leading-relaxed">{viewingSubmission.description}</p>
                </div>

                {/* Problem block */}
                <div className="p-4 bg-[#083D52] rounded-xl space-y-1" id="mdata-problem">
                  <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "المشكلة ومعالجتها" : "Problem & Solution"}</span>
                  <p className="text-sm text-white leading-relaxed">{viewingSubmission.problem}</p>
                </div>

                {/* Target Market */}
                <div className="p-4 bg-[#083D52] rounded-xl space-y-2.5 flex flex-col justify-between" id="mdata-market">
                  <div className="space-y-1" id="mdata-market-sub">
                    <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "السوق المستهدف" : "Target Segment"}</span>
                    <span className="px-3 py-1 bg-[#E8703A]/20 border border-[#E8703A]/30 text-[#E8703A] font-extrabold text-xs rounded-full inline-block">
                      {viewingSubmission.target_market === 'Gov' ? (lang === 'ar' ? 'حكومي' : 'Governmental') : viewingSubmission.target_market}
                    </span>
                  </div>
                  <div className="space-y-1" id="mdata-team-sub">
                    <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "حجم الفريق الحالي" : "Current Team Size"}</span>
                    <span className="text-sm font-bold text-white font-num">{viewingSubmission.team_size}</span>
                  </div>
                </div>

                {/* Business Stage */}
                <div className="p-4 bg-[#083D52] rounded-xl space-y-1" id="mdata-stage">
                  <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "المرحلة الحالية" : "Current Stage"}</span>
                  <span className="text-sm font-bold text-[#F5C842] block">{getStageLabel(viewingSubmission.stage)}</span>
                  <span className="text-xs text-[#B0D4E0] block">
                    {viewingSubmission.has_revenue === 'yes' 
                      ? (lang === 'ar' ? `لديه إيرادات (${viewingSubmission.revenue_range})` : `Has Revenue (${viewingSubmission.revenue_range} growth)`) 
                      : (lang === 'ar' ? 'لا توجد إيرادات مسجلة حالياً' : 'No recorded revenue yet')
                    }
                  </span>
                </div>

                {/* Looking For choices & Notes */}
                <div className="p-4 bg-[#083D52] rounded-xl space-y-1.5" id="mdata-looking-for">
                  <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "متطلبات الوصول والنمو" : "Sought Access Channels"}</span>
                  <div className="flex flex-wrap gap-1.5 justify-start" id="mdata-lf-pills">
                    {viewingSubmission.looking_for.map((lf, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#E8703A]/10 text-[#E8703A] text-[10px] font-bold rounded border border-[#E8703A]/20">
                        {getLookingForLabel(lf)}
                      </span>
                    ))}
                  </div>
                  {viewingSubmission.looking_for_notes && (
                    <p className="text-[11px] text-[#B0D4E0]/80 italic pt-1">{viewingSubmission.looking_for_notes}</p>
                  )}
                </div>

                {/* Revenue models used */}
                <div className="p-4 bg-[#083D52] rounded-xl space-y-1" id="mdata-revenue-model">
                  <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "نموذج الإيرادات" : "Revenue Models"}</span>
                  <span className="text-sm font-bold text-white block">{viewingSubmission.revenue_model.join('، ')}</span>
                </div>

                {/* Funding Required & Sectors */}
                <div className="p-4 bg-[#083D52] rounded-xl space-y-1.5" id="mdata-funding-sectors">
                  <div className="space-y-0.5" id="ms-funding-box">
                    <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "التمويل المطلوب" : "Funding Required"}</span>
                    <span className="text-sm font-black text-[#F5C842] font-num">{viewingSubmission.funding_range}</span>
                  </div>
                  <div className="space-y-0.5 pt-1.5 border-t border-white/5" id="ms-equity-box">
                    <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "الحصة المعروضة للمستثمرين" : "Proposed Equity Offered"}</span>
                    <span className="text-sm font-black text-emerald-400 font-num">{viewingSubmission.equity_offered || viewingSubmission.equity || 10}%</span>
                  </div>
                  <div className="space-y-0.5 pt-1.5 border-t border-white/5" id="ms-sectors-box">
                    <span className="text-xs font-bold text-[#B0D4E0] block">{lang === 'ar' ? "القطاعات المعنية" : "Sectors Covered"}</span>
                    <span className="text-xs font-bold text-[#B0D4E0] block">{viewingSubmission.sectors.join('، ')}</span>
                  </div>
                </div>

                {/* Pitch deck fallbacks & how heard about us */}
                <div className="p-4 bg-[#083D52] rounded-xl space-y-2 md:col-span-2" id="mdata-external">
                  <div className="flex flex-wrap gap-4 items-center justify-between flex-row-reverse" id="mext-cols flex">
                    <div className="space-y-1 text-right" id="mext-pitch-box">
                      <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "العرض التقديمي" : "Pitch Deck File or Link"}</span>
                      {viewingSubmission.pitch_url ? (
                        <a 
                          href={viewingSubmission.pitch_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-[#2A9FC9] hover:underline flex items-center gap-1 justify-end"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{viewingSubmission.pitch_url}</span>
                        </a>
                      ) : (viewingSubmission.pitch_file_name || (viewingSubmission as any).file_name) ? (
                        <button 
                          onClick={() => handleDownload(
                            viewingSubmission.pitch_file_name || (viewingSubmission as any).file_name!, 
                            viewingSubmission.pitch_file_url || (viewingSubmission as any).file_url
                          )}
                          title={lang === 'ar' ? "انقر لتنزيل الملف" : "Click to download file"}
                          className="text-xs text-white hover:text-[#F5C842] font-mono font-bold bg-[#0A4F68] hover:bg-[#0E5B78] px-2 py-1.5 rounded border border-white/5 flex items-center gap-1.5 justify-end transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5 text-[#B0D4E0]" />
                          <span className="underline">{viewingSubmission.pitch_file_name || (viewingSubmission as any).file_name}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#B0D4E0]/40 italic">{lang === 'ar' ? 'لم يتم إرفاق عرض تقديمي' : 'No pitch deck uploaded'}</span>
                      )}
                    </div>

                    <div className="flex gap-4 flex-row-reverse" id="mext-source-city-group">
                      <div className="space-y-0.5 text-right" id="mext-source-box">
                        <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "مصدر القدوم" : "Referral source"}</span>
                        <span className="text-xs text-white font-bold">{viewingSubmission.heard_from || '—'}</span>
                      </div>
                      <div className="space-y-0.5 border-r border-white/10 pr-4 text-right" id="mext-city-box">
                        <span className="text-xs font-bold text-[#B0D4E0] uppercase block">{lang === 'ar' ? "المدينة" : "City"}</span>
                        <span className="text-xs text-white font-bold">{viewingSubmission.city || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* EVALUATOR CONTROLS SECTION */}
              <div className="p-5 bg-[#083D52] border border-[#F5C842]/15 rounded-2xl space-y-4" id="evaluator-decision-panel">
                <span className="text-xs tracking-widest text-[#F5C842] font-black uppercase block">{lang === 'ar' ? "لوحة تقييم المشرف" : "SUPERVISOR EVALUATION PANEL"}</span>
                
                {/* Status selector & Score slider twin layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="eval-twins">
                  {/* Status Dropdown */}
                  <div className="flex flex-col gap-2" id="eval-status-box">
                    <label className="text-xs font-bold text-[#B0D4E0]">{lang === 'ar' ? 'حالة الطلب الحالية' : 'Update Status'}</label>
                    <select 
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as SubmissionStatus)}
                      className="w-full p-2.5 bg-[#0A4F68] border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#F5C842] cursor-pointer"
                      id="eval-select-status"
                    >
                      <option value="new" className="bg-[#0A4F68] text-white">{t.filter_new}</option>
                      <option value="under_review" className="bg-[#0A4F68] text-white">{t.filter_under_review}</option>
                      <option value="promising" className="bg-[#0A4F68] text-white">{t.filter_promising}</option>
                      <option value="invested" className="bg-[#0A4F68] text-white">{t.filter_invested}</option>
                      <option value="rejected" className="bg-[#0A4F68] text-white">{t.filter_rejected}</option>
                    </select>
                  </div>

                  {/* Score Slider */}
                  <div className="flex flex-col gap-1.5" id="eval-score-box">
                    <div className="flex items-center justify-between font-sans">
                      <span className="text-xs font-bold text-[#B0D4E0]">{t.col_score}</span>
                      <span className="text-xs font-num font-bold text-[#F5C842]">{editScore} / 100</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5" id="score-slider-inline">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={editScore}
                        onChange={e => setEditScore(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-[#0A4F68] rounded-lg appearance-none cursor-pointer accent-[#F5C842]"
                        id="eval-score-range"
                      />
                    </div>
                  </div>
                </div>

                {adminRole === 'main' && (
                  <div className="flex flex-col gap-2" id="eval-assignment-box">
                    <label className="text-xs font-bold text-[#B0D4E0] flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#F5C842]" />
                      <span>{lang === 'ar' ? 'تفويض الطلب إلى مشرف فرعي' : 'Delegate idea to sub-admin'}</span>
                    </label>
                    <select
                      value={editAssignedAdminId}
                      onChange={e => setEditAssignedAdminId(e.target.value)}
                      className="w-full p-2.5 bg-[#0A4F68] border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#F5C842] cursor-pointer"
                      id="eval-select-assigned-admin"
                    >
                      <option value="" className="bg-[#0A4F68] text-white">
                        {lang === 'ar' ? 'غير مفوض حالياً' : 'Not assigned'}
                      </option>
                      {moderators.map(mod => (
                        <option key={mod.id} value={mod.id} className="bg-[#0A4F68] text-white">
                          {mod.email}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#B0D4E0]/70">
                      {lang === 'ar'
                        ? 'بعد التفويض سيظهر هذا الطلب للمشرف الفرعي المحدد داخل صفحة الطلبات.'
                        : 'After delegation, this request appears in the selected sub-admin requests page.'}
                    </p>
                  </div>
                )}

                {/* Admin Notes custom remarks */}
                <div className="flex flex-col gap-2" id="eval-notes-box">
                  <label className="text-[#B0D4E0] text-xs font-bold">{t.adminNotes}</label>
                  <textarea 
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب ملاحظاتك الاستشارية وتقييمك للأفكار هنا...' : 'Write your advisory remarks or investment potential evaluations here...'}
                    rows={3}
                    className="w-full p-3 bg-[#0A4F68] border border-white/10 rounded-lg text-xs text-white outline-none resize-none focus:border-[#F5C842]"
                    id="eval-textarea-notes"
                  />
                </div>

                {/* Submit button inside evaluation Panel */}
                <div className="flex items-center justify-between gap-4 pt-2 flex-row-reverse" id="eval-panel-footer">
                  <button
                    onClick={handleSaveEvaluation}
                    type="button"
                    disabled={isSavingEvaluation}
                    className="px-6 py-3 bg-[#F5C842] hover:bg-[#F5C842]/90 text-[#083D52] text-xs font-extrabold rounded-full border-0 cursor-pointer flex items-center gap-1.5"
                    id="btn-save-evaluation"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingEvaluation ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.saveNotes}</span>
                  </button>

                  {saveError && (
                    <span className="text-xs text-rose-300 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg" id="save-error-banner">
                      {saveError}
                    </span>
                  )}

                  {showSaveToast && (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-lg animate-fade-in" id="save-toast-banner">
                      {lang === 'ar' ? '✓ تم حفظ التغييرات والتقييم!' : '✓ Evaluation saved successfully!'}
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
