import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Realistic premium mockup projects representing an Arabic incubator / startup hub
export const MOCKUP_PROJECTS = [
  {
    id: 'mock-1',
    title: 'منصة سندك التمويلية | Sanadak',
    description: 'منصة ذكية متخصصة في التمويل متناهي الصغر وسد الفجوات التمويلية للأفراد ورواد الأعمال الناشئين عبر حلول تقنية مرنة متوافقة مع الشريعة وتعتمد على خوارزميات تقييم ائتماني متطورة تلائم تطلعات السوق المحلي.',
    sector: 'التكنولوجيا المالية',
    stage: 'نموذج أولي (MVP)',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
    website_url: 'https://sanadak-fintech.example.com',
    is_visible: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    title: 'مساعد دراسات الذكي | Diraasat AI',
    description: 'منظومة دراسية شاملة تستعين بالذكاء الاصطناعي لمساندة الطلاب والأكاديميين في تلخيص المحاضرات والبحوث، ورسم مسارات تعلم مخصصة تعزز التحصيل العلمي والمهني بأساليب تفاعلية مبتكرة.',
    sector: 'الذكاء الاصطناعي',
    stage: 'مرحلة التجريب والنمو',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    website_url: 'https://diraasat-ai.example.com',
    is_visible: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    title: 'مشروع حصاد الزراعي | Hasaad IoT',
    description: 'مشروع ريادي يستهدف أتمتة البيوت المحمية والمنشآت المائية التقليدية بالاعتماد على مستشعرات إنترنت الأشياء والتحليلات السحابية لتنظيم الري وتقليص معدلات هدر المياه وزيادة الإنتاجية الخضراء.',
    sector: 'التقنية الزراعية',
    stage: 'جاهز للاستثمار التجاري',
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600',
    website_url: 'https://hasaad-iot.example.com',
    is_visible: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-4',
    title: 'تطبيق شفاء الطبي | Shefa Tech',
    description: 'منصة رعاية صحية متكاملة تتيح للمستخدمين حجز الاستشارات الفورية مع كبار الأطباء والوصول الفوري إلى سجل طبي موحد مدعوم بالذكاء الاصطناعي لتحليل الفحوصات الدورية وصرف الوصفات المعتمدة.',
    sector: 'التقنية الصحية',
    stage: 'مرحلة نمو تجاري',
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    website_url: 'https://shefa-tech.example.com',
    is_visible: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-5',
    title: 'منصة مسار التعليمية | Masaar Edu',
    description: 'منصة تعليمية تقدم مسارات متكاملة لتعليم البرمجة وتقنيات المستقبل للأطفال والناشئين بالاعتماد على التلعيب والتفاعل المباشر لبناء القدرات الرقمية للأجيال القادمة.',
    sector: 'التقنية التعليمية',
    stage: 'مرحلة التجريب والنمو',
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
    website_url: 'https://masaar-edu.example.com',
    is_visible: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-6',
    title: 'منظومة ساري اللوجستية | Sary Express',
    description: 'حلول ذكية لإدارة سلاسل الإمداد والتوصيل السريع للمتاجر الإلكترونية الكبرى، تعتمد على خوارزميات التوزيع الجغرافي الذكي لتقليص زمن الشحن وحوسبة مسارات المندوبين بكفاءة متناهية.',
    sector: 'الخدمات اللوجستية',
    stage: 'جاهز للاستثمار التجاري',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
    website_url: 'https://sary-express.example.com',
    is_visible: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper to manage mock list in localStorage
const getLocalProjects = (): any[] => {
  const stored = localStorage.getItem('mockup_projects');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // If we added new hardcoded mockup projects, make sure to sync them up or replace the stale list
      if (parsed.length >= MOCKUP_PROJECTS.length || parsed.some((p: any) => p.id.startsWith('mock-4'))) {
        return parsed;
      }
    } catch (e) {
      // fallback
    }
  }
  localStorage.setItem('mockup_projects', JSON.stringify(MOCKUP_PROJECTS));
  return MOCKUP_PROJECTS;
};

const saveLocalProjects = (projects: any[]) => {
  localStorage.setItem('mockup_projects', JSON.stringify(projects));
};

// Check if credentials are placeholder
const isUsingMock = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');

// Get all projects (public)
export const getVisibleProjects = async () => {
  if (isUsingMock) {
    return getLocalProjects()
      .filter(p => p.is_visible)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      // Table exists but is completely empty: fall back to mockup to keep site gorgeous
      return getLocalProjects()
        .filter(p => p.is_visible)
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetch failed, utilizing mockup fallback projects:', err);
    return getLocalProjects()
      .filter(p => p.is_visible)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }
};

// Get all projects (admin)
export const getAllProjects = async () => {
  if (isUsingMock) {
    return getLocalProjects().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return getLocalProjects().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetch failed, utilizing mockup fallback projects for admin view:', err);
    return getLocalProjects().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }
};

// Create project
export const createProject = async (project: any, imageFile?: File) => {
  if (isUsingMock) {
    const local = getLocalProjects();
    let image_url = project.image_url || null;
    if (imageFile) {
      image_url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }
    const newProject = {
      id: 'mock-' + Date.now(),
      ...project,
      image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    local.push(newProject);
    saveLocalProjects(local);
    return newProject;
  }

  let image_url = project.image_url || null;
  if (imageFile) {
    const ext = imageFile.name.split('.').pop();
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('project-images').upload(path, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
    const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(path);
    image_url = publicUrl;
  }
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...project, image_url })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update project
export const updateProject = async (id: string, updates: any, imageFile?: File) => {
  if (isUsingMock || id.startsWith('mock-')) {
    const local = getLocalProjects();
    const idx = local.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Mock project not found');

    let image_url = updates.image_url !== undefined ? updates.image_url : local[idx].image_url;
    if (imageFile) {
      image_url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }

    const updatedProject = {
      ...local[idx],
      ...updates,
      image_url,
      updated_at: new Date().toISOString()
    };
    local[idx] = updatedProject;
    saveLocalProjects(local);
    return updatedProject;
  }

  const projectUpdates = { ...updates };
  if (imageFile) {
    const ext = imageFile.name.split('.').pop();
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('project-images').upload(path, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
    const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(path);
    projectUpdates.image_url = publicUrl;
  }
  const { data, error } = await supabase
    .from('projects')
    .update(projectUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete project
export const deleteProject = async (id: string, imageUrl?: string | null) => {
  if (isUsingMock || id.startsWith('mock-')) {
    const local = getLocalProjects();
    const filtered = local.filter(p => p.id !== id);
    saveLocalProjects(filtered);
    return;
  }

  // If imageUrl exists, try to extract file path and delete from storage
  if (imageUrl) {
    try {
      const parts = imageUrl.split('/project-images/');
      if (parts.length > 1) {
        const filePath = parts[1];
        await supabase.storage.from('project-images').remove([filePath]);
      }
    } catch (e) {
      console.error('Failed to delete project image from storage:', e);
    }
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// Toggle visibility
export const toggleProjectVisibility = async (id: string, is_visible: boolean) => {
  if (isUsingMock || id.startsWith('mock-')) {
    const local = getLocalProjects();
    const idx = local.findIndex(p => p.id === id);
    if (idx !== -1) {
      local[idx].is_visible = is_visible;
      saveLocalProjects(local);
    }
    return;
  }

  const { error } = await supabase.from('projects').update({ is_visible }).eq('id', id);
  if (error) throw new Error(error.message);
};
