/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FolderGit2, 
  CalendarDays, 
  Star, 
  Coins, 
  TrendingUp, 
  Sparkles,
  RefreshCw,
  Download,
  Users,
  Globe,
  MapPin,
  PlusCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { Submission, Language } from '../types';
import { translations } from '../translations';

// Custom CSS animation injected once
const SPIN_STYLE = `
  @keyframes spinIn {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-in {
    animation: spinIn 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    transform-origin: center;
  }
`;

const renderSeekingCountLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const barWidth = width || 0;
  return (
    <text
      x={x + barWidth + 14}
      y={y + (height || 0) / 2}
      dy={4}
      fill="#FFFFFF"
      fontSize="12px"
      fontWeight="700"
      textAnchor="start"
      className="font-num select-none"
    >
      {value}
    </text>
  );
};

const renderPieLabel = (props: any, lang: Language) => {
  const { cx, cy, x, y, name, percent, value } = props;
  if (value === undefined || value === null) return null;
  const isAr = lang === 'ar';

  // Clean alignment based on text direction in Arabic RTL
  const textAnchor = isAr 
    ? (x > cx ? 'end' : 'start') 
    : (x > cx ? 'start' : 'end');

  const pVal = percent !== undefined && percent !== null ? percent : 0;
  const percentageStr = `${(pVal * 100).toFixed(0)}%`;
  const labelText = `${name} ${percentageStr}`;

  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      fontSize="11px"
      textAnchor={textAnchor}
      dominantBaseline="central"
      direction={isAr ? 'rtl' : 'ltr'}
      className="font-ar font-bold select-none"
    >
      {labelText}
    </text>
  );
};

interface AdminDashboardProps {
  lang: Language;
  submissions: Submission[];
  onNavigate?: (path: string) => void;
}

export default function AdminDashboard({ lang, submissions, onNavigate }: AdminDashboardProps) {
  const t = translations[lang];

  // --- STATE MANAGERS ---
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshMinutes, setRefreshMinutes] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // Automatically update elapsed refresh minutes
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedMs = new Date().getTime() - lastRefreshTime.getTime();
      setRefreshMinutes(Math.floor(elapsedMs / 60000));
    }, 60000);
    return () => clearInterval(timer);
  }, [lastRefreshTime]);

  const triggerSearchLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleRefreshClick = () => {
    setLastRefreshTime(new Date());
    setRefreshMinutes(0);
    triggerSearchLoading();
  };

  // --- FILTERED SUBMISSIONS ---
  const getFilteredSubmissions = () => {
    return submissions.filter(s => {
      const created = new Date(s.created_at);
      if (dateFrom && new Date(dateFrom) > created) return false;
      if (dateTo) {
        const toDateWithTime = new Date(dateTo);
        toDateWithTime.setHours(23, 59, 59, 999);
        if (created > toDateWithTime) return false;
      }
      return true;
    });
  };

  const fSubs = getFilteredSubmissions();

  // --- KPI CARD COMPUTATIONS ---
  const totalCount = fSubs.length;
  
  // New this week
  const sevenDaysAgo = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));
  const countNewThisWeek = fSubs.filter(s => new Date(s.created_at) >= sevenDaysAgo).length;

  // Pending Review
  const pendingCount = fSubs.filter(s => s.status === 'new' || s.status === 'under_review').length;

  // Shortlisted
  const shortlistedCount = fSubs.filter(s => s.status === 'promising' || s.status === 'invested').length;

  // Rejected
  const rejectedCount = fSubs.filter(s => s.status === 'rejected').length;

  // Average Score
  const scoredItems = fSubs.filter(s => s.score !== null);
  const avgScore = scoredItems.length > 0 
    ? Math.round(scoredItems.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredItems.length) 
    : 0;

  // Average Equity
  const avgEquity = Math.round(
    fSubs.length > 0 
      ? fSubs.reduce((acc: number, cur: any) => acc + (cur.equity_offered || cur.equity || 12), 0) / fSubs.length 
      : 0
  );

  // Revenue count
  const withRevenueCount = fSubs.filter(s => s.has_revenue === 'yes').length;

  // Total funding Helper
  const parseFundingNumeric = (range: string): number => {
    if (!range) return 0;
    const rLower = range.toLowerCase();
    
    // Exact mapping for dropdown choices
    if (rLower.includes('أكثر من 10') || rLower.includes('more than 10')) {
      return 12000000;
    }
    if (rLower.includes('5 مليون - 10') || rLower.includes('5 million - 10')) {
      return 7500000;
    }
    if (rLower.includes('1 مليون - 5') || rLower.includes('1 million - 5')) {
      return 3000000;
    }
    if (rLower.includes('500,000 - 1,000,000') || rLower.includes('500000')) {
      return 750000;
    }
    if (rLower.includes('100,000 - 500,000') || rLower.includes('100000')) {
      return 300000;
    }
    if (rLower.includes('أقل من 100,000') || rLower.includes('less than 100,000')) {
      return 50000;
    }
    
    // Fallback parser
    const numbers = range.replace(/,/g, '').match(/\d+/g);
    if (!numbers) return 0;
    const isMillion = range.includes('مليون') || range.includes('Million');
    const single = parseInt(numbers[0], 10);
    if (numbers.length === 1) {
      return isMillion && single < 1000 ? single * 1000000 : single;
    }
    const val = (single + parseInt(numbers[1], 10)) / 2;
    return isMillion && val < 1000 ? val * 1000000 : val;
  };

  const totalFunding = fSubs.reduce((sum, curr) => sum + parseFundingNumeric(curr.funding_range), 0);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return lang === 'ar' 
        ? `${(amount / 1000000000).toFixed(1).replace(/\.0$/, '')} مليار` 
        : `${(amount / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (amount >= 1000000) {
      return lang === 'ar' 
        ? `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')} مليون` 
        : `${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (amount >= 1000) {
      return lang === 'ar' 
        ? `${(amount / 1000).toFixed(1).replace(/\.0$/, '')} ألف` 
        : `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return amount.toLocaleString();
  };

  const renderFormattedValue = (val: string | number) => {
    if (typeof val !== 'string') {
      return <AnimatedNumber value={val} />;
    }
    
    if (val.endsWith('%')) {
      return (
        <span className="font-num select-none">
          {val}
        </span>
      );
    }

    const match = val.match(/^([\d.,]+)\s*(.*)$/);
    if (match) {
      const numPart = match[1];
      const textPart = match[2];
      if (textPart) {
        return (
          <span className="inline-flex items-baseline gap-1 select-none" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            <span className="font-num font-extrabold" style={{ fontSize: '32px' }}>{numPart}</span>
            <span className="text-[#B0D4E0] font-sans font-medium" style={{ fontSize: '15px', marginRight: lang === 'ar' ? '4px' : '0', marginLeft: lang === 'ar' ? '0' : '4px' }}>
              {textPart}
            </span>
          </span>
        );
      }
    }
    return <span className="font-num font-extrabold">{val}</span>;
  };

  // --- ACTIONS ---
  const handleExportCSV = () => {
    const headers = ['Ref ID', 'Founder', 'Email', 'Project', 'Target Market', 'Stage', 'Funding Requested', 'Status', 'Date'];
    const rows = fSubs.map(s => [
      s.reference_id,
      `"${s.founder_name.replace(/"/g, '""')}"`,
      s.email,
      `"${s.project_name.replace(/"/g, '""')}"`,
      s.target_market,
      s.stage,
      `"${s.funding_range}"`,
      s.status,
      s.created_at
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `share_idea_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CHART HELPERS ---
  const getLineData = () => {
    const now = new Date();
    let steps = 30;
    if (period === '7d') steps = 7;
    else if (period === '90d') steps = 90;
    else if (period === '1y') steps = 365;

    const dataMap: Record<string, { total: number; shortlisted: number }> = {};
    for (let i = steps - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const str = d.toISOString().split('T')[0];
      dataMap[str] = { total: 0, shortlisted: 0 };
    }

    fSubs.forEach(s => {
      const str = s.created_at.split('T')[0];
      if (str in dataMap) {
        dataMap[str].total++;
        if (s.status === 'promising' || s.status === 'invested') {
          dataMap[str].shortlisted++;
        }
      }
    });

    const list = Object.entries(dataMap).map(([date, val]) => {
      const parts = date.split('-');
      return {
        name: `${parts[1]}/${parts[2]}`,
        total: val.total,
        shortlisted: val.shortlisted
      };
    });

    // Subsample to make it legible
    if (steps === 30) return list.filter((_, idx) => idx % 4 === 0);
    if (steps === 90) return list.filter((_, idx) => idx % 12 === 0);
    if (steps === 365) return list.filter((_, idx) => idx % 30 === 0);
    return list;
  };

  const getSectorStats = () => {
    const counts: Record<string, number> = {};
    fSubs.forEach(s => {
      s.sectors.forEach(sec => {
        counts[sec] = (counts[sec] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
  };

  const getRevenueStats = () => {
    let yes = 0, no = 0, unknown = 0;
    fSubs.forEach(s => {
      if (s.has_revenue === 'yes') yes++;
      else if (s.has_revenue === 'no') no++;
      else unknown++;
    });
    return [
      { name: lang === 'ar' ? 'يوجد إيرادات' : 'With Revenue', value: yes, color: '#34D399' },
      { name: lang === 'ar' ? 'لا يوجد إيرادات' : 'No Revenue', value: no, color: '#EF4444' },
      { name: lang === 'ar' ? 'لم يحدد' : 'Not Specified', value: unknown, color: '#6B7280' }
    ];
  };

  const interpolateColor = (index: number, total: number) => {
    const r1 = 245, g1 = 200, b1 = 66; // #F5C842 (gold)
    const r2 = 14, g2 = 107, b2 = 140; // #0E6B8C (teal)
    const ratio = total > 1 ? index / (total - 1) : 0;
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getStageCounts = () => {
    const stages = [
      { key: 'idea', label: lang === 'ar' ? 'فكرة فقط' : 'Idea Only' },
      { key: 'prototype', label: lang === 'ar' ? 'نموذج أولي' : 'Prototype' },
      { key: 'early', label: lang === 'ar' ? 'مرحلة مبكرة' : 'Early Stage' },
      { key: 'growth', label: lang === 'ar' ? 'نمو' : 'Growth' },
      { key: 'expansion', label: lang === 'ar' ? 'توسع' : 'Scaling' },
    ];
    return stages.map(st => ({
      ...st,
      count: fSubs.filter(s => s.stage === st.key).length
    }));
  };

  // --- WHAT FOUNDERS WANT ---
  const getLookingForCounts = () => {
    const counts = { invest: 0, mentor: 0, partner: 0, advFunding: 0, support: 0 };
    fSubs.forEach(s => {
      if (s.looking_for) {
        s.looking_for.forEach(lf => {
          if (lf.includes('استثمار') || lf.toLowerCase().includes('invest')) counts.invest++;
          else if (lf.includes('إرشاد') || lf.toLowerCase().includes('mentor')) counts.mentor++;
          else if (lf.includes('شراكة') || lf.toLowerCase().includes('partner')) counts.partner++;
          else if (lf.includes('تمويل متقدم') || lf.toLowerCase().includes('adv') || lf.toLowerCase().includes('funding')) counts.advFunding++;
          else if (lf.includes('دعم مبكر') || lf.toLowerCase().includes('support')) counts.support++;
        });
      }
    });
    return [
      { name: lang === 'ar' ? 'استثمار' : 'Investment', count: counts.invest },
      { name: lang === 'ar' ? 'إرشاد' : 'Mentorship', count: counts.mentor },
      { name: lang === 'ar' ? 'شراكة' : 'Partnership', count: counts.partner },
      { name: lang === 'ar' ? 'تمويل متقدم' : 'Advanced Funding', count: counts.advFunding },
      { name: lang === 'ar' ? 'دعم مبكر' : 'Early Support', count: counts.support }
    ].sort((a, b) => b.count - a.count);
  };

  // --- CITY STATS HELPER ---
  const getCityStats = () => {
    const counts: Record<string, number> = {};
    fSubs.forEach(s => {
      let cName = s.city || (lang === 'ar' ? 'الرياض' : 'Riyadh');
      cName = cName.trim();
      counts[cName] = (counts[cName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => {
      return { flag: '📍', name, count };
    }).sort((a,b) => b.count - a.count).slice(0, 10);
  };

  // --- FUNDING RANGE BUCKETS ---
  const getFundingBucket = (funding: string) => {
    if (!funding) return "$0–$50K";
    const lower = funding.toLowerCase();
    if (lower.includes('أقل من') || lower.includes('less than') || lower.includes('100,000')) return "$0–$50K";
    if (lower.includes('100,000 - 500,000') || lower.includes('500,000')) return "$50K–$200K";
    if (lower.includes('500,000 - 1,000,000')) return "$200K–$500K";
    if (lower.includes('1 مليون') || lower.includes('1 million')) return "$500K–$1M";
    if (lower.includes('5 مليون') || lower.includes('5 million')) return "$1M–$5M";
    return "+$5M";
  };

  const getFundingStats = () => {
    const buckets: Record<string, number> = {
      "$0–$50K": 0,
      "$50K–$200K": 0,
      "$200K–$500K": 0,
      "$500K–$1M": 0,
      "$1M–$5M": 0,
      "+$5M": 0
    };
    fSubs.forEach(s => {
      buckets[getFundingBucket(s.funding_range)]++;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  };

  // --- TARGET MARKET STATS ---
  const getTargetMarketStats = () => {
    const counts: Record<string, number> = { B2B: 0, B2C: 0, B2B2C: 0, Gov: 0 };
    fSubs.forEach(s => {
      const tm = s.target_market || 'B2B';
      const key = tm === 'Gov' ? 'Gov' : tm;
      counts[key] = (counts[key] || 0) + 1;
    });
    if (lang === 'ar') {
      return [
        { name: 'للشركات (B2B)', value: counts.B2B, originalName: 'B2B' },
        { name: 'للمستهلكين (B2C)', value: counts.B2C, originalName: 'B2C' },
        { name: 'للشركات والمستهلكين (B2B2C)', value: counts.B2B2C, originalName: 'B2B2C' },
        { name: 'القطاع الحكومي (Gov)', value: counts.Gov, originalName: 'Gov' }
      ];
    }
    return [
      { name: 'B2B', value: counts.B2B, originalName: 'B2B' },
      { name: 'B2C', value: counts.B2C, originalName: 'B2C' },
      { name: 'B2B2C', value: counts.B2B2C, originalName: 'B2B2C' },
      { name: 'Gov', value: counts.Gov, originalName: 'Gov' }
    ];
  };

  // --- LATEST SUBMISSIONS TABLE ---
  const getLatestSubmissions = () => {
    return [...fSubs].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  };

  // --- EMBEDDED COMPONENTS ---

  const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayVal, setDisplayVal] = useState(0);
    useEffect(() => {
      let active = true;
      let start = 0;
      const duration = 400;
      const increment = Math.ceil(value / 20) || 1;
      const delay = Math.floor(duration / 20) || 16;
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          if (active) setDisplayVal(value);
          clearInterval(timer);
        } else {
          if (active) setDisplayVal(start);
        }
      }, delay);

      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [value]);

    return <span className="font-mono">{displayVal.toLocaleString()}</span>;
  };

  const ChartSkeleton = () => (
    <div className="w-full h-full flex flex-col justify-between p-2 animate-pulse" id="chart-skeleton">
      <div className="h-5 bg-teal-500/10 rounded w-1/3 mb-4" />
      <div className="flex-1 flex items-end gap-3" id="skeleton-bars">
        <div className="h-[25%] bg-teal-500/10 rounded w-full" />
        <div className="h-[60%] bg-teal-500/10 rounded w-full" />
        <div className="h-[85%] bg-teal-500/10 rounded w-full" />
        <div className="h-[45%] bg-teal-500/10 rounded w-full" />
        <div className="h-[70%] bg-teal-500/10 rounded w-full" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[220px]" id="chart-empty-state">
      <svg width="50" height="50" viewBox="0 0 130 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 text-[#F5C842] animate-pulse">
        <circle cx="65" cy="52" r="32" stroke="#F5C842" strokeWidth="3" fill="none"/>
        <path d="M50 52 C54 44, 58 60, 65 52 C72 44, 76 60, 80 52" stroke="#F5C842" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="65" y1="2" x2="65" y2="14" stroke="#F5C842" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <p className="text-gray-300 text-sm font-bold">{lang === 'ar' ? 'لا توجد بيانات بعد' : 'No data available yet'}</p>
    </div>
  );

  const ChartCard = ({ title, icon, isEmpty, children }: { title: string; icon: React.ReactNode; isEmpty: boolean; children: React.ReactNode }) => (
    <div 
      className="bg-[#0A4F68] text-white p-6 rounded-[16px] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative" 
      id={`card-${title.replace(/\s+/g, '-')}`}
    >
      <div className="mb-4 flex items-center gap-2 border-b border-transparent pb-3 justify-start flex-row-reverse">
        {icon && React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4 text-[#F5C842]' })}
        <h4 
          className="text-white font-ar select-none" 
          style={{ fontSize: '16px', fontWeight: 600, textAlign: 'right', flex: 1 }}
        >
          {title}
        </h4>
      </div>
      <div className="h-[280px]">
        {isLoading ? <ChartSkeleton /> : isEmpty ? <EmptyState /> : children}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 select-none" id="dashboard-tab-outer" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <style>{SPIN_STYLE}</style>

      {/* STEP 11 — DASHBOARD HEADER REGULATORY CONTROLS */}
      <div 
        className="bg-[#083D52] p-5 rounded-2xl border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-3 md:h-[60px] min-h-[60px]" 
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        id="dashboard-hdr-controls"
      >
        <div className="flex flex-wrap items-center gap-3" id="filters-date-inputs">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#B0D4E0] font-ar font-bold">{lang === 'ar' ? 'من:' : 'From:'}</span>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); triggerSearchLoading(); }}
              className="bg-[#0A4F68] border border-white/15 outline-none text-white text-xs px-3 py-2 rounded-lg font-num focus:border-[#F5C842]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#B0D4E0] font-ar font-bold">{lang === 'ar' ? 'إلى:' : 'To:'}</span>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); triggerSearchLoading(); }}
              className="bg-[#0A4F68] border border-white/15 outline-none text-white text-xs px-3 py-2 rounded-lg font-num focus:border-[#F5C842]"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button 
              onClick={() => { setDateFrom(''); setDateTo(''); triggerSearchLoading(); }}
              className="text-[10px] text-[#F5C842] hover:underline cursor-pointer bg-transparent border-0 font-ar"
            >
              {lang === 'ar' ? 'إعادة تعيين' : 'Clear Filters'}
            </button>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-3" id="header-action-buttons">
          <div className="flex items-center gap-1.5 text-xs text-[#B0D4E0] font-ar" style={{ fontSize: '12px' }} id="refresh-timer-wrapper">
            <Clock className="w-3.5 h-3.5 text-[#F5C842]" />
            <span>
              {lang === 'ar' ? `آخر تحديث: منذ ${refreshMinutes} دقيقة` : `Last updated: ${refreshMinutes}m ago`}
            </span>
          </div>

          <button 
            onClick={handleRefreshClick}
            disabled={isLoading}
            className="px-3 py-2 bg-transparent border border-white/20 text-[#B0D4E0] hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-all flex items-center gap-2 text-xs font-bold font-ar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-3 py-2 bg-[#F5C842] text-[#083D52] hover:bg-[#F5C842]/90 rounded-lg cursor-pointer font-bold transition-all flex items-center gap-2 text-xs font-ar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS (8 GORGEOUS DATA CONTAINERS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]" id="stats-grid-8-kpi">
        {[
          { label: lang === 'ar' ? 'إجمالي الأفكار' : 'Total Ideas', val: totalCount, icon: <FolderGit2 /> },
          { label: lang === 'ar' ? 'جديد هذا الأسبوع' : 'New This Week', val: countNewThisWeek, icon: <CalendarDays /> },
          { label: lang === 'ar' ? 'قيد المراجعة' : 'Pending Review', val: pendingCount, icon: <Clock /> },
          { label: lang === 'ar' ? 'الأفكار المختارة' : 'Shortlisted', val: shortlistedCount, icon: <Star className="fill-[#F5C842] text-[#F5C842]" /> },
          { label: lang === 'ar' ? 'الأفكار المرفوضة' : 'Rejected', val: rejectedCount, icon: <PlusCircle className="rotate-45" /> },
          { label: lang === 'ar' ? 'التمويل المطلوب (ر.س)' : 'Funding Sought (SAR)', val: formatCurrency(totalFunding), icon: <Coins />, isRaw: true },
          { label: lang === 'ar' ? 'متوسط الحصة المعروضة' : 'Avg Equity Offered', val: `${avgEquity}%`, icon: <TrendingUp />, isRaw: true },
          { label: lang === 'ar' ? 'مشاريع لديها إيرادات' : 'With Revenue', val: withRevenueCount, icon: <Briefcase /> }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className="bg-[#0A4F68] border border-[#F5C842]/15 rounded-[16px] flex items-center justify-between transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.2)]" 
            style={{ 
              height: '110px', 
              padding: '20px 24px',
              fontFamily: "'Tajawal', sans-serif" 
            }} 
            id={`kpi-${idx}`}
          >
            <div className="flex flex-col justify-between h-full text-right flex-1 select-none overflow-hidden pr-2">
              <span className="text-[#B0D4E0] font-ar leading-snug text-xs block truncate" style={{ fontWeight: 400, textAlign: 'right' }}>
                {item.label}
              </span>
              <span 
                className="text-[#F5C842] font-num font-extrabold leading-none block mt-1" 
                style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  textAlign: 'right' 
                }}
              >
                {item.isRaw ? renderFormattedValue(item.val) : <AnimatedNumber value={item.val as number} />}
              </span>
            </div>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(245,200,66,0.1)] text-[#F5C842] shrink-0 font-sans" 
              style={{ width: '40px', height: '40px' }}
            >
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5 text-[#F5C842]' })}
            </div>
          </div>
        ))}
      </div>

      {/* ROW 1: SECTOR CHART */}
      <div className="grid grid-cols-1 gap-6" id="row-charts-1">
        
        {/* STEP 2: SECTOR BAR CHART */}
        <ChartCard title={lang === 'ar' ? 'توزيع المشاريع حسب القطاع المفضل' : 'Submissions by Sector'} icon={<Sparkles />} isEmpty={getSectorStats().length === 0}>
          <div dir="ltr" className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getSectorStats().slice(0, 6)} layout="vertical" margin={{ top: 10, right: 35, left: 115, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#B0D4E0" fontSize={11} tickLine={false} allowDecimals={false} className="font-num" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#FFFFFF" 
                  fontSize={12} 
                  axisLine={false} 
                  tickLine={false} 
                  width={105} 
                  tickMargin={8}
                  className="font-ar text-white/95"
                  tickFormatter={(val) => {
                    if (!val) return "";
                    return val.length > 22 ? val.substring(0, 20) + '...' : val;
                  }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0A4F68] border border-white/8 text-white p-2.5 rounded-xl text-xs font-ar font-bold shadow-lg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                          <strong className="block text-[#F5C842] mb-1">{label}</strong>
                          <span>{lang === 'ar' ? 'عدد المشاريع:' : 'Count:'} {payload[0]?.value}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#FFFFFF', fontSize: 11, fontWeight: 'bold', offset: 14 }} isAnimationActive={false} barSize={12}>
                  {getSectorStats().slice(0, 6).map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx < 3 ? '#F5C842' : '#2A9FC9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ROW 2: FUNNEL CHART & REVENUE DONUT CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="row-charts-2">
        
        {/* STEP 3: HIGHLY POLISHED PROJECT STAGES AND MATURITY INDEX PROGRESS PIPELINE */}
        <div className="bg-[#0A4F68] text-white p-6 rounded-[16px] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" id="card-stage-funnel-original">
          <div className="mb-4 flex items-center gap-2 border-b border-transparent pb-3 justify-start flex-row-reverse">
            <FolderGit2 className="w-4 h-4 text-[#F5C842]" />
            <h4 className="font-ar select-none" style={{ fontSize: '16px', fontWeight: 600, textAlign: 'right', flex: 1 }}>
              {lang === 'ar' ? 'مؤشر جاهزية ومرحلة نضج المشاريع' : 'Project Maturity & Readiness Index'}
            </h4>
          </div>
          <div className="h-[280px]">
            {isLoading ? <ChartSkeleton /> : totalCount === 0 ? <EmptyState /> : (
              <div className="space-y-3.5 w-full flex flex-col justify-center h-full overflow-y-auto pr-1" id="funnel-container-scroll">
                {getStageCounts().map((step, idx) => {
                  const percentOfTotal = totalCount > 0 ? Math.round((step.count / totalCount) * 100) : 0;
                  
                  // Premium modern color scheme matching dashboard palette
                  const colors = [
                    { bar: 'bg-[#F2C037]', text: 'text-[#F2C037]', bgOpacity: 'bg-[#F2C037]/10' }, // Idea
                    { bar: 'bg-[#F29F05]', text: 'text-[#F29F05]', bgOpacity: 'bg-[#F29F05]/10' }, // Prototype
                    { bar: 'bg-[#E8703A]', text: 'text-[#E8703A]', bgOpacity: 'bg-[#E8703A]/10' }, // Early
                    { bar: 'bg-[#2A9FC9]', text: 'text-[#2A9FC9]', bgOpacity: 'bg-[#2A9FC9]/10' }, // Growth
                    { bar: 'bg-[#0E9E8C]', text: 'text-[#0E9E8C]', bgOpacity: 'bg-[#0E9E8C]/10' }, // Scaling
                  ];
                  const scheme = colors[idx] || colors[0];

                  return (
                    <div key={step.key} className="flex flex-col gap-1.5 group" id={`funnel-row-${step.key}`}>
                      {/* Grid label and counters */}
                      <div className="flex items-center justify-between text-xs px-1 select-none flex-row-reverse">
                        <span className="font-ar font-bold text-white/95 flex items-center gap-1.5 flex-row-reverse">
                          <span className={`w-2 h-2 rounded-full ${scheme.bar}`} />
                          {step.label}
                        </span>
                        
                        <div className="flex items-center gap-2.5 font-num">
                          <span className={`${scheme.bgOpacity} ${scheme.text} px-2 py-0.5 rounded-md text-[11px] font-black`}>
                            {percentOfTotal}%
                          </span>
                          <span className="text-white font-extrabold text-sm">
                            {step.count}
                          </span>
                        </div>
                      </div>

                      {/* Smooth progress bar container */}
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out relative ${scheme.bar} shadow-[0_0_10px_rgba(245,200,66,0.15)]`}
                          style={{ width: `${Math.max(percentOfTotal, 2)}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* STEP 4: UPGRADE DONUT CHART (REVENUE) */}
        <div className="bg-[#0A4F68] text-white p-6 rounded-[16px] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative" id="card-revenue-donut-upgraded">
          <div className="mb-4 flex items-center gap-2 border-b border-transparent pb-3 justify-start flex-row-reverse">
            <Coins className="w-4 h-4 text-[#F5C842]" />
            <h4 className="font-ar select-none" style={{ fontSize: '16px', fontWeight: 600, textAlign: 'right', flex: 1 }}>
              {lang === 'ar' ? 'حالة الإيرادات للمشاريع' : 'Revenue Status Breakdown'}
            </h4>
          </div>
          <div className="h-[280px]">
            {isLoading ? <ChartSkeleton /> : totalCount === 0 ? <EmptyState /> : (
              <div className="flex flex-col md:flex-row items-center justify-between h-full" id="donut-container-sub">
                <div className="relative w-full md:w-1/2 h-[220px] flex items-center justify-center">
                  <div className="absolute flex flex-col items-center justify-center select-none pointer-events-none text-center">
                    <span className="font-num font-extrabold text-[#F5C842]" style={{ fontSize: '28px', lineHeight: 1 }}>
                      {totalCount}
                    </span>
                    <span className="font-ar block uppercase tracking-wide mt-1 text-[#B0D4E0]" style={{ fontSize: '12px', fontWeight: 400 }}>
                      {lang === 'ar' ? 'فكرة إجمالاً' : 'Ideas Total'}
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getRevenueStats()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {getRevenueStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#0A4F68] border border-white/8 text-white p-2.5 rounded-xl text-xs font-sans shadow-lg">
                                <strong>{payload[0]?.name}:</strong> {payload[0]?.value}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3 pl-4" id="donut-labels-section">
                  {getRevenueStats().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-sans border-b border-white/5 pb-1.5" id={`donut-lbl-${idx}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-white font-ar">{item.name}</span>
                      </div>
                      <span className="font-num font-bold text-white">
                        {item.value} ({totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: TOP COUNTRIES & WHAT FOUNDERS WANT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="row-charts-3">
        
        {/* STEP 7: TOP CITIES BAR CHART LIST */}
        <div className="bg-[#0A4F68] text-white p-6 rounded-[16px] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" id="card-cities-upgraded">
          <div className="mb-4 flex items-center gap-2 border-b border-transparent pb-3 justify-start flex-row-reverse">
            <MapPin className="w-4 h-4 text-[#F5C842]" />
            <h4 className="font-ar select-none font-bold" style={{ fontSize: '16px', fontWeight: 600, textAlign: 'right', flex: 1 }}>{lang === 'ar' ? 'اكثر المدن مشاركة' : 'Most Participating Cities'}</h4>
          </div>
          <div className="h-[280px] overflow-y-auto pr-1" id="cities-list-scroller">
            {isLoading ? <ChartSkeleton /> : getCityStats().length === 0 ? <EmptyState /> : (
              <div className="space-y-4" id="cities-list-wrapper">
                {getCityStats().map((item, idx) => {
                  const maxCount = Math.max(...getCityStats().map(c => c.count)) || 1;
                  const ratio = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1.5" id={`city-item-${idx}`}>
                      <div className="flex items-center justify-between text-xs font-bold font-sans">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.flag}</span>
                          <span className="text-white font-ar">{item.name}</span>
                        </div>
                        <span className="font-num text-[#F5C842] font-bold">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2A9FC9] rounded-full transition-all duration-500" style={{ width: `${ratio}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* STEP 6: WHAT FOUNDERS WANT */}
        <ChartCard title={lang === 'ar' ? 'ماذا يبحث أصحاب الأفكار؟' : 'What Founders Are Seeking'} icon={<Users />} isEmpty={totalCount === 0}>
          <div dir="ltr" className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getLookingForCounts()} layout="vertical" margin={{ top: 15, right: 40, left: 120, bottom: 5 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#B0D4E0" fontSize={11} tickLine={false} className="font-num" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#FFFFFF" 
                  fontSize={13} 
                  axisLine={false} 
                  tickLine={false} 
                  width={115} 
                  tickMargin={8}
                  className="font-ar text-white/95"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0A4F68] border border-white/8 text-white p-2 rounded-lg text-xs font-bold shadow-md" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                          <strong>{payload[0]?.name}:</strong> {payload[0]?.value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#F5C842" radius={[0, 4, 4, 0]} label={renderSeekingCountLabel} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ROW 4: FUNDING RANGE & TARGET MARKET */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="row-charts-4">
        
        {/* STEP 8: FUNDING RANGE BUDGETS */}
        <div className="bg-[#0A4F68] text-white p-6 rounded-[16px] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" id="card-funding-budgets-card">
          <div className="mb-4 flex items-center gap-2 border-b border-transparent pb-3 justify-start flex-row-reverse">
            <Coins className="w-4 h-4 text-[#F5C842]" />
            <h4 className="font-ar select-none font-bold" style={{ fontSize: '16px', fontWeight: 600, textAlign: 'right', flex: 1 }}>{lang === 'ar' ? 'توزيع التمويل المطلوب للمشروع' : 'Funding Range Distribution'}</h4>
          </div>
          <div className="h-[280px]">
            {isLoading ? <ChartSkeleton /> : totalCount === 0 ? <EmptyState /> : (
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getFundingStats()} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="fundingGradient" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#2A9FC9" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#F5C842" stopOpacity={0.95}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#B0D4E0" fontSize={10} tickLine={false} interval={0} />
                    <YAxis stroke="#B0D4E0" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#0A4F68] border border-white/8 text-white p-2.5 rounded-xl text-xs font-bold shadow-lg">
                              <span>{lang === 'ar' ? 'المشاريع:' : 'Count:'} {payload[0]?.value}</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="url(#fundingGradient)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* STEP 9: TARGET MARKET PIE CHART */}
        <ChartCard title={lang === 'ar' ? 'نوع السوق والجمهور المستهدف' : 'Target Market Distribution'} icon={<Users />} isEmpty={totalCount === 0}>
          <div className="flex flex-col h-full justify-between pb-2">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart width={300} height={240}>
                  <Pie
                    data={getTargetMarketStats()}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={(props) => renderPieLabel(props, lang)}
                    labelLine={{ stroke: 'rgba(255, 255, 255, 0.7)', strokeWidth: 1.5 }}
                    isAnimationActive={false}
                    className="font-num"
                  >
                    {getTargetMarketStats().map((entry, index) => {
                      let fillVal = '#0E9E8C';
                      if (entry.originalName === 'B2B') fillVal = '#F5C842';
                      else if (entry.originalName === 'B2C') fillVal = '#E8703A';
                      else if (entry.originalName === 'B2B2C') fillVal = '#2A9FC9';
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={fillVal} 
                          stroke="#0A4F68" 
                          strokeWidth={2} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0A4F68] border border-white/8 text-white p-2 rounded-lg text-xs font-bold shadow-md">
                            <strong>{payload[0]?.name}:</strong> {payload[0]?.value}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend: below chart, horizontal, white text */}
            <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-white font-ar pt-1">
              {getTargetMarketStats().map((item, idx) => {
                let colVal = '#0E9E8C';
                if (item.originalName === 'B2B') colVal = '#F5C842';
                else if (item.originalName === 'B2C') colVal = '#E8703A';
                else if (item.originalName === 'B2B2C') colVal = '#2A9FC9';
                return (
                  <div key={idx} className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colVal }} />
                    <span className="truncate max-w-[150px]">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* STEP 10 — LATEST SUBMISSIONS TABLE */}
      <div className="bg-[#0A4F68] text-white p-6 rounded-[16px] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" id="card-latest-submissions-panel">
        <div className="mb-4 flex items-center justify-between border-b border-transparent pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5C842]" />
            <h4 className="font-ar select-none font-bold" style={{ fontSize: '16px', fontWeight: 600, textAlign: 'right' }}>
              {lang === 'ar' ? 'آخر الأفكار المستلمة' : 'Latest Received Startup Ideas'}
            </h4>
          </div>
          {onNavigate && (
            <button 
              onClick={() => onNavigate('/admin/submissions')}
              className="text-xs font-bold text-[#F5C842] hover:text-[#F5C842]/80 hover:underline cursor-pointer transition-all bg-transparent border-0 font-ar"
              id="view-all-submissions-tablelink"
            >
              {lang === 'ar' ? 'عرض الكل ←' : 'View All ←'}
            </button>
          )}
        </div>
        <div className="overflow-x-auto min-h-[160px]">
          {isLoading ? (
            <div className="h-28 flex items-center justify-center font-mono text-xs text-gray-400">
              {lang === 'ar' ? 'جاري المزامنة...' : 'Syncing submissions...'}
            </div>
          ) : getLatestSubmissions().length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-center" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-[#083D52] text-[#B0D4E0] border-b border-white/10" style={{ fontSize: '13px', fontWeight: 600 }}>
                  <th className="py-3 px-4 text-center font-semibold">#</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'اسم المؤسس' : 'Founder'}</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'اسم المشروع' : 'Project'}</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'القطاع' : 'Sector'}</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'المرحلة' : 'Stage'}</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'التمويل' : 'Funding'}</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center font-semibold">{lang === 'ar' ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent font-ar">
                {getLatestSubmissions().map((sub, idx) => {
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

                  const stageText = sub.stage === 'idea' ? (lang === 'ar' ? 'فكرة فقط' : 'Idea')
                    : sub.stage === 'prototype' ? (lang === 'ar' ? 'نموذج أولي' : 'Prototype')
                    : sub.stage === 'early' ? (lang === 'ar' ? 'مرحلة مبكرة' : 'Early Stage')
                    : sub.stage === 'growth' ? (lang === 'ar' ? 'نمو' : 'Growth')
                    : (lang === 'ar' ? 'توسع' : 'Scaling');

                  const isEven = idx % 2 === 1;

                  return (
                    <tr 
                      key={sub.id} 
                      className="border-b border-white/5 transition-all cursor-pointer group"
                      style={{
                        backgroundColor: isEven ? 'rgba(255,255,255,0.02)' : 'transparent',
                      }}
                      onClick={() => onNavigate && onNavigate('/admin/submissions')}
                    >
                      <td className="py-3 px-4 font-num text-sm text-white text-center align-middle">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm text-white text-center align-middle">{sub.founder_name}</td>
                      <td className="py-3 px-4 text-sm text-center align-middle" style={{ color: '#F5C842', fontWeight: 600 }}>{sub.project_name}</td>
                      <td className="py-3 px-4 text-sm text-white text-center align-middle">{sub.sectors.join(', ')}</td>
                      <td className="py-3 px-4 text-sm text-white text-center align-middle">{stageText}</td>
                      <td className="py-3 px-4 text-sm font-num text-white text-center align-middle">{sub.funding_range}</td>
                      <td className="py-3 px-4 text-xs font-num text-[#B0D4E0] text-center align-middle">{new Date(sub.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</td>
                      <td className="py-3 px-4 text-center align-middle">
                        <span style={badgeStyle}>{statusText}</span>
                      </td>
                      <td className="py-3 px-4 text-center align-middle">
                        {onNavigate && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onNavigate('/admin/submissions'); }}
                            className="bg-[#F5C842] text-[#083D52] hover:bg-[#F5C842]/90 border-0 cursor-pointer font-ar"
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              borderRadius: '8px',
                              padding: '6px 14px'
                            }}
                          >
                            {lang === 'ar' ? 'عرض' : 'View'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
