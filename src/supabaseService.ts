import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const MOCKUP_PROJECTS: any[] = [];

const getLocalProjects = (): any[] => {
  return [];
};

const saveLocalProjects = (_projects: any[]) => {
  // Production data lives in Supabase only. Placeholder mode intentionally does not persist mock data.
};

// Check if credentials are placeholder
const isUsingMock = supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');

// Get all projects (public)
export const getVisibleProjects = async () => {
  if (isUsingMock) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  } catch (err) {
    console.warn('Supabase visible projects fetch failed:', err);
    return [];
  }
};

// Get all projects (admin)
export const getAllProjects = async () => {
  if (isUsingMock) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  } catch (err) {
    console.warn('Supabase admin projects fetch failed:', err);
    return [];
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
