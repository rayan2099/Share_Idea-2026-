/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'ar' | 'en';

export type SubmissionStatus = 'new' | 'under_review' | 'promising' | 'invested' | 'rejected';

export interface Submission {
  id: string;
  reference_id: string;
  founder_name: string;
  email: string;
  phone: string;
  phone_country: string; // e.g., 'sa' / '+966'
  city: string; // المدينة التي يدار منها المشروع (Operating city)
  project_name: string;
  description: string;
  problem: string;
  target_market: 'B2B' | 'B2C' | 'B2B2C' | 'Gov'; // B2B, B2C, B2B2C, حكومي
  stage: 'idea' | 'prototype' | 'early' | 'growth' | 'expansion'; // فكرة فقط | نموذج أولي | مرحلة مبكرة | نمو | توسع
  has_revenue: 'yes' | 'no';
  revenue_range?: 'early' | 'growth' | 'expansion'; // مبكرة | نمو | توسع (if has_revenue is yes)
  team_size: '1' | '2-5' | '6-15' | '15+';
  looking_for: string[]; // multi-select: استثمار | إرشاد | شراكة | تمويل متقدم | دعم مبكر
  looking_for_notes?: string; 
  revenue_model: string[]; // multi-select: اشتراك | عمولة | رسوم المعاملات | إعلانات | Freemium | شراء لمرة واحدة
  funding_range: string; // single selection: أقل من 100k etc
  sectors: string[]; // multi-select
  pitch_url?: string;
  pitch_file_name?: string;
  pitch_file_url?: string;
  pitch_file_size?: number;
  pitch_file_type?: string;
  heard_from: string;
  status: SubmissionStatus;
  score: number | null; // scale 1-10 or 1-100 or rating
  admin_notes: string;
  equity_offered?: number; // الحصة المعروضة للمستثمرين بالشراكة
  created_at: string;
  email_sent: boolean;
}

export interface AdminUser {
  email: string;
  email_sent: boolean;
}

export interface Moderator {
  id: string;
  email: string;
  password?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  sector?: string | null;
  stage?: string | null;
  image_url?: string | null;
  website_url?: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}


