import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const MOCKUP_PROJECTS: any[] = [];

const PROJECT_IMAGE_WIDTH = 1200;
const PROJECT_IMAGE_HEIGHT = 900;
const PROJECT_IMAGE_BACKGROUND = '#051c24';

const getLocalProjects = (): any[] => {
  return [];
};

const saveLocalProjects = (_projects: any[]) => {
  // Production data lives in Supabase only. Placeholder mode intentionally does not persist mock data.
};

const loadImageElement = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read image file.'));
    };
    image.src = objectUrl;
  });
};

const normalizeProjectImage = async (file: File) => {
  if (typeof document === 'undefined') return file;

  const image = await loadImageElement(file);
  const canvas = document.createElement('canvas');
  canvas.width = PROJECT_IMAGE_WIDTH;
  canvas.height = PROJECT_IMAGE_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to prepare image canvas.');
  }

  context.fillStyle = PROJECT_IMAGE_BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const offsetX = (canvas.width - drawWidth) / 2;
  const offsetY = (canvas.height - drawHeight) / 2;

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('Image conversion failed.'));
        return;
      }
      resolve(result);
    }, 'image/jpeg', 0.92);
  });

  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
};

const extractProjectImagePath = (imageUrl: string) => {
  try {
    const url = new URL(imageUrl);
    const marker = '/project-images/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    const marker = '/project-images/';
    const markerIndex = imageUrl.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
  }
};

const downloadProjectImageAsFile = async (imageUrl: string, fallbackName: string) => {
  const storagePath = extractProjectImagePath(imageUrl);
  if (storagePath) {
    const { data, error } = await supabase.storage.from('project-images').download(storagePath);
    if (!error && data) {
      const fileName = storagePath.split('/').pop() || fallbackName || 'project-image.jpg';
      return new File([data], fileName, {
        type: data.type || 'image/jpeg',
        lastModified: Date.now(),
      });
    }
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch image from ${imageUrl}`);
  }
  const blob = await response.blob();
  const name = fallbackName || imageUrl.split('/').pop() || 'project-image.jpg';
  return new File([blob], name, {
    type: blob.type || 'image/jpeg',
    lastModified: Date.now(),
  });
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
    const normalizedImage = await normalizeProjectImage(imageFile);
    const path = `${Date.now()}-${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage.from('project-images').upload(path, normalizedImage, {
      contentType: normalizedImage.type,
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
    const normalizedImage = await normalizeProjectImage(imageFile);
    const path = `${Date.now()}-${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage.from('project-images').upload(path, normalizedImage, {
      contentType: normalizedImage.type,
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
      const filePath = extractProjectImagePath(imageUrl);
      if (filePath) {
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

export const bulkNormalizeProjectImages = async (
  projects: { id: string; title: string; image_url?: string | null }[],
  onProgress?: (progress: {
    index: number;
    total: number;
    title: string;
    status: 'updated' | 'skipped' | 'error';
    message?: string;
  }) => void
) => {
  const eligibleProjects = projects.filter(project => !!project.image_url);
  const total = eligibleProjects.length;
  const results = {
    total,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [] as { id: string; title: string; error: string }[],
  };

  for (let i = 0; i < eligibleProjects.length; i += 1) {
    const project = eligibleProjects[i];

    try {
      if (!project.image_url) {
        results.skipped += 1;
        onProgress?.({
          index: i + 1,
          total,
          title: project.title,
          status: 'skipped',
          message: 'No image to normalize',
        });
        continue;
      }

      const imageFile = await downloadProjectImageAsFile(project.image_url, `${project.title}.jpg`);
      const oldPath = extractProjectImagePath(project.image_url);
      await updateProject(project.id, {}, imageFile);

      if (oldPath) {
        try {
          await supabase.storage.from('project-images').remove([oldPath]);
        } catch (removeError) {
          console.warn('Could not remove old project image:', removeError);
        }
      }

      results.updated += 1;
      onProgress?.({
        index: i + 1,
        total,
        title: project.title,
        status: 'updated',
        message: 'Normalized and re-uploaded',
      });
    } catch (error) {
      results.failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({ id: project.id, title: project.title, error: message });
      onProgress?.({
        index: i + 1,
        total,
        title: project.title,
        status: 'error',
        message,
      });
    }
  }

  return results;
};
