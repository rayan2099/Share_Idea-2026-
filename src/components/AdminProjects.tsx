import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Globe, 
  Upload, 
  X, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { Project, Language } from '../types';
import { 
  getAllProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  toggleProjectVisibility 
} from '../supabaseService';

interface AdminProjectsProps {
  lang: Language;
}

export default function AdminProjects({ lang }: AdminProjectsProps) {
  // Localization helper
  const isAr = lang === 'ar';

  // State Management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  
  // Image Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drag and Drop
  const [isDragging, setIsDragging] = useState(false);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteImageUrl, setDeleteImageUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Projects on Mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProjects();
      setProjects(data || []);
    } catch (err: any) {
      console.error(err);
      setError(
        isAr 
          ? 'حدث خطأ أثناء تحميل المشاريع. تأكد من إعداد مكتبة Supabase بشكل صحيح.' 
          : 'Failed to load projects. Please verify your Supabase configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Open Modal for Create
  const handleOpenAdd = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setSector('');
    setStage('');
    setWebsiteUrl('');
    setIsVisible(true);
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setSector(project.sector || '');
    setStage(project.stage || '');
    setWebsiteUrl(project.website_url || '');
    setIsVisible(project.is_visible);
    setImageFile(null);
    setImagePreview(project.image_url || null);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetImage(file);
    }
  };

  // File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetImage(file);
    }
  };

  // Image validation
  const validateAndSetImage = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError(
        isAr 
          ? 'يرجى اختيار ملف صورة صالح ومطابق (JPEG, PNG, WebP)' 
          : 'Please select a valid image file (JPEG, PNG, WebP)'
      );
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        isAr 
          ? 'حجم الصورة كبير جداً، الحد الأقصى هو 5 ميجابايت' 
          : 'Image size is too large. Maximum size is 5MB.'
      );
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Visibility Toggle Switch
  const handleToggleVisible = async (id: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      // Optimistic update
      setProjects(prev => prev.map(p => p.id === id ? { ...p, is_visible: newVal } : p));
      await toggleProjectVisibility(id, newVal);
    } catch (err: any) {
      console.error(err);
      // Revert if failed
      fetchProjects();
    }
  };

  // Submit Form
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSaving(true);
    setUploadError(null);

    const projectData = {
      title,
      description: description.substring(0, 300),
      sector: sector.trim() || null,
      stage: stage.trim() || null,
      website_url: websiteUrl.trim() || null,
      is_visible: isVisible
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectData, imageFile || undefined);
      } else {
        await createProject(projectData, imageFile || undefined);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      setUploadError(
        isAr 
          ? 'فشل جراء حفظ ملفات المشروع. من فضلك تأكد من تفعيل صلاحيات حوض التخزين وجدول مشاريعنا.' 
          : 'Failed to save project. Ensure database permissions and storage buckets are configured.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProject(deleteId, deleteImageUrl);
      setDeleteId(null);
      setDeleteImageUrl(null);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      alert(
        isAr 
          ? 'حدث خطأ أثناء رغبة الإزالة. يرجى مراجعة الصلاحيات الأمنية.' 
          : 'An error occurred while deleting. Please check RLS policies.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-ar" id="admin-projects-section">
      {/* Top Controls Action Menu */}
      <div className="flex items-center justify-between" id="projects-list-header">
        <div>
          <h4 className="text-lg font-bold text-white">
            {isAr ? 'قائمة المشاريع' : 'All Projects'}
          </h4>
          <p className="text-xs text-[var(--secondary-text)]">
            {isAr 
              ? 'عرض وتعديل وتصنيف المشاريع الريادية الابتكارية لزوار الصفحة' 
              : 'Review, modify and filter innovative corporate products displayed on landing page'}
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#E8703A] hover:bg-[#d05d2c] text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          id="btn-add-project"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة مشروع جديد' : 'Add New Project'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-4" id="skeleton-container">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-[var(--card-bg)] border border-white/8 rounded-xl p-4 flex items-center gap-4">
              <div className="w-[60px] h-[60px] bg-white/5 rounded-lg shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="w-1/4 h-4 bg-white/10 rounded"></div>
                <div className="w-1/3 h-3 bg-white/5 rounded"></div>
              </div>
              <div className="w-16 h-8 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200" id="error-banner">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-2 text-xs font-bold underline text-white/90 hover:text-white"
            >
              {isAr ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 bg-[var(--card-bg)] border border-white/8 rounded-2xl flex flex-col items-center justify-center text-center py-16" id="empty-projects">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/8">
            <Building2 className="w-8 h-8 text-[#F5C842] filter drop-shadow-[0_0_8px_rgba(245,200,66,0.3)]" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            {isAr ? 'لا توجد مشاريع حالياً' : 'No projects found'}
          </h4>
          <p className="text-xs text-[var(--secondary-text)] max-w-sm mb-5">
            {isAr 
              ? 'يرجى النقر على زر "إضافة مشروع جديد" للبدء بإضافة وتصنيف مشاريعك وتوفيرها على الصفحة الرئيسية' 
              : 'Add projects to showcases business entities supporting national and international scale.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-transparent text-[#F5C842] border border-[#F5C842]/35 hover:bg-[#F5C842]/10 transition-all font-bold text-xs rounded-lg active:scale-95"
          >
            {isAr ? 'أضف أول مشروع للمنصة' : 'Create First Project'}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--card-bg)] border border-white/8 rounded-xl shadow-lg" id="projects-table-wrapper">
          <table className="w-full text-right border-collapse" dir="rtl">
            <thead>
              <tr className="border-b border-white/8 bg-white/5 text-[11px] font-bold text-[var(--secondary-text)]">
                <th className="p-4 w-[80px]">{isAr ? 'الصورة' : 'Thumbnail'}</th>
                <th className="p-4 text-right">{isAr ? 'اسم المشروع' : 'Project Title'}</th>
                <th className="p-4 text-right">{isAr ? 'القطاع' : 'Sector'}</th>
                <th className="p-4 text-right">{isAr ? 'المرحلة' : 'Stage'}</th>
                <th className="p-4 text-center">{isAr ? 'مرئي' : 'Visible'}</th>
                <th className="p-4 text-center w-[120px]">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6 text-xs font-sans">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-white/2 transition-colors">
                  {/* Thumbnail Image */}
                  <td className="p-4">
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-[60px] h-[60px] rounded-lg object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-lg bg-[#0e5f7a] flex items-center justify-center text-white/50 border border-white/10">
                        {/* Custom spiral lightbulb icon placeholder */}
                        <Building2 className="w-6 h-6 text-[#F5C842]" />
                      </div>
                    )}
                  </td>

                  {/* Title / Description info */}
                  <td className="p-4 align-middle">
                    <div className="font-bold text-white text-sm font-ar">{project.title}</div>
                    <div className="text-xs text-[var(--secondary-text)] truncate max-w-[220px] mt-1 font-ar">
                      {project.description}
                    </div>
                  </td>

                  {/* Sector Badge */}
                  <td className="p-4 align-middle font-ar">
                    {project.sector ? (
                      <span className="px-2.5 py-1 bg-[#F5C842]/10 text-[#F5C842] border border-[#F5C842]/20 rounded-full font-bold text-[10px]">
                        {project.sector}
                      </span>
                    ) : (
                      <span className="text-white/30 text-[10px]">-</span>
                    )}
                  </td>

                  {/* Stage Badge */}
                  <td className="p-4 align-middle font-ar">
                    {project.stage ? (
                      <span className="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-full font-bold text-[10px]">
                        {project.stage}
                      </span>
                    ) : (
                      <span className="text-white/30 text-[10px]">-</span>
                    )}
                  </td>

                  {/* Is Visible Toggle switch */}
                  <td className="p-4 align-middle text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(project.id, project.is_visible)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        project.is_visible ? 'bg-[#E8703A]' : 'bg-white/10'
                      }`}
                      style={{ direction: 'ltr' }}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          project.is_visible ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions (Edit / Delete) */}
                  <td className="p-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(project)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-white hover:text-[#F5C842] rounded-lg transition-all border border-white/8"
                        title={isAr ? 'تعديل المشروع' : 'Edit Project'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(project.id);
                          setDeleteImageUrl(project.image_url || null);
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded-lg transition-all border border-rose-500/15"
                        title={isAr ? 'حذف المشروع' : 'Delete Project'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="project-form-modal">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isSaving && setIsModalOpen(false)}
          ></div>

          {/* Modal content widget */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="relative w-full max-w-lg rounded-2xl bg-[#092B38] border border-white/10 p-6 shadow-2xl text-white transform transition-all space-y-4"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#F5C842]" />
                  <h3 className="text-base font-bold text-white font-ar">
                    {editingProject 
                      ? (isAr ? 'تعديل مشروع قائم' : 'Edit Existing Project') 
                      : (isAr ? 'إضافة مشروع ريادي جديد' : 'Publish New Startup Project')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body fields */}
              <form onSubmit={handleSaveProject} className="space-y-4 font-ar select-none">
                {/* Product Name (اسم المشروع) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--secondary-text)]">
                    {isAr ? 'اسم المشروع*' : 'Project Name*'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#051c24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5C842]/50 font-sans"
                    placeholder={isAr ? 'أدخل الاسم الرسمي أو التجاري للمشروع' : 'Enter official project name'}
                  />
                </div>

                {/* Description (الوصف)* */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-[var(--secondary-text)]">
                      {isAr ? 'الوصف ومؤشرات القيمة المضافة*' : 'Project Description*'}
                    </label>
                    <span className="text-[10px] text-white/40 font-num">
                      {description.length}/300
                    </span>
                  </div>
                  <textarea
                    required
                    maxLength={300}
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[#051c24] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#F5C842]/50 leading-relaxed font-ar"
                    placeholder={isAr ? 'اكتب وصفاً جذاباً واحترافياً لا يتخطى الـ 300 حرف...' : 'Provide attractive startup overview...'}
                  />
                </div>

                {/* Grid Inputs sector + stage */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Sector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--secondary-text)]">
                      {isAr ? 'القطاع' : 'Sector / Index'}
                    </label>
                    <input
                      type="text"
                      value={sector}
                      onChange={e => setSector(e.target.value)}
                      className="w-full bg-[#051c24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5C842]/50 font-ar"
                      placeholder={isAr ? 'مثال: التكنولوجيا المالية' : 'e.g., FinTech'}
                    />
                  </div>

                  {/* Stage / Phase */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--secondary-text)]">
                      {isAr ? 'المرحلة' : 'Stage / Maturity'}
                    </label>
                    <input
                      type="text"
                      value={stage}
                      onChange={e => setStage(e.target.value)}
                      className="w-full bg-[#051c24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5C842]/50 font-ar"
                      placeholder={isAr ? 'مثال: نموذج أولي، مرحلة نمو' : 'e.g., MVP, Early Stage'}
                    />
                  </div>
                </div>

                {/* Website Url link */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--secondary-text)]">
                    {isAr ? 'رابط الموقع الإلكتروني (اختياري)' : 'Website Link (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    className="w-full bg-[#051c24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5C842]/50 font-sans"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Is Visible Check */}
                <div className="flex items-center gap-2.5 bg-[#051c24] border border-white/8 p-3.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsVisible(prev => !prev)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isVisible ? 'bg-[#E8703A]' : 'bg-white/10'
                    }`}
                    style={{ direction: 'ltr' }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isVisible ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-white">
                      {isAr ? 'مرئي في الموقع العام' : 'Visible in Landing'}
                    </span>
                    <span className="block text-[10px] text-[var(--secondary-text)]">
                      {isAr ? 'تحديد ما إذا كان المشروع سيظهر للزوار في شريط عرض المشاريع' : 'Determine if this project is visible in the landing slider'}
                    </span>
                  </div>
                </div>

                {/* IMAGE UPLOAD CONTAINER FRAME */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--secondary-text)]">
                    {isAr ? 'صورة المشروع التعريفية' : 'Featured Project Image'}
                  </label>
                  
                  {/* File dropzone / manager block */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden ${
                      isDragging 
                        ? 'border-[#F5C842] bg-[#F5C842]/5' 
                        : imagePreview 
                          ? 'border-emerald-500/40 bg-emerald-500/5' 
                          : 'border-white/15 hover:border-white/25 bg-[#051c24]'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="space-y-2 w-full flex flex-col items-center relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-[90px] w-auto rounded-lg object-contain shadow-md border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-[10px] text-emerald-400 font-bold font-ar flex items-center gap-1">
                          <span>{imageFile ? (isAr ? 'تم تحميل الصورة بنجاح!' : 'New file selected') : (isAr ? 'صورة حالية محفوظة' : 'Current saved image')}</span>
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-1 -left-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-colors active:scale-90"
                          title={isAr ? 'إزالة الصورة الحالية' : 'Delete photo'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 flex flex-col items-center">
                        <div className="p-2.5 bg-white/5 rounded-full border border-white/8 text-white/60">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-white">
                          {isAr ? 'اسحب الصورة وأفلتها هنا، أو اضغط للتصفح' : 'Drag image here, or click to browse'}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {isAr ? 'الحد الأقصى للتخزين: 5 ميجابايت (PNG, JPG, WebP)' : 'Limits: 5MB maximum file (PNG, JPG, WebP)'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submitting Error Display */}
                {uploadError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{uploadError}</span>
                  </div>
                )}

                {/* Control Action Buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-white/8 pt-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/8 text-white font-bold text-xs rounded-lg cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isAr ? 'إلغاء الأمر' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#E8703A] hover:bg-[#d05d2c] text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {isSaving 
                        ? (isAr ? 'يجري الحفظ...' : 'Saving...') 
                        : (isAr ? 'حفظ البيانات' : 'Save Details')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="delete-confirm-dialog">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-xl bg-[#092B38] border border-white/10 p-5 shadow-2xl text-white transform transition-all text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white font-ar">
                  {isAr ? 'تأكيد الحذف النهائي' : 'Confirm Permanent Deletion'}
                </h3>
                <p className="text-xs text-[var(--secondary-text)] leading-relaxed font-ar">
                  {isAr 
                    ? 'هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟ سيتم إزالة الصورة المرتبطة والمشروع ولا يمكن التراجع عن هذا الإجراء.' 
                    : 'Are you sure you want to delete this project? Associated images will be expunged from the storage bucket.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 border-t border-white/6 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteImageUrl(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/8 text-white font-bold text-xs rounded-lg transition-all"
                >
                  {isAr ? 'التراجع' : 'No, Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{isAr ? 'نعم، احذف' : 'Yes, Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
