declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

type ManageAdminPayload =
  | { action: 'list' }
  | { action: 'create'; email: string; password: string }
  | { action: 'deactivate'; id: string }
  | { action: 'set_active'; id: string; is_active: boolean };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });

const requireEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name} secret`);
  return value;
};

async function requireMainAdmin(req: Request, supabaseUrl: string, anonKey: string) {
  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    throw new Error('Admin login required');
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: authorization
    }
  });

  const user = await userResponse.json().catch(() => null);

  if (!userResponse.ok || !user?.id) {
    throw new Error('Admin login required');
  }

  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?id=eq.${user.id}&role=eq.main&is_active=eq.true&select=id`, {
    headers: {
      apikey: anonKey,
      Authorization: authorization
    }
  });

  const profiles = await profileResponse.json().catch(() => []);

  if (!profileResponse.ok || !Array.isArray(profiles) || profiles.length === 0) {
    throw new Error('Only the main admin can manage sub-admins');
  }

  return user;
}

async function findUserByEmail(supabaseUrl: string, serviceRoleKey: string, email: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || 'Could not list auth users');
  }

  const users = Array.isArray(result?.users) ? result.users : [];
  return users.find((user: { id: string; email?: string }) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function findAdminProfileByEmail(supabaseUrl: string, serviceRoleKey: string, email: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?email=eq.${encodeURIComponent(email)}&select=id,email,role,is_active&limit=1`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });

  const result = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(result?.message || 'Could not verify admin profile');
  }

  return Array.isArray(result) ? result[0] : null;
}

async function createAuthUser(supabaseUrl: string, serviceRoleKey: string, email: string, password: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'moderator',
        source: 'share_idea_admin_panel'
      }
    })
  });

  const result = await response.json().catch(() => ({}));

  if (response.ok) {
    return result;
  }

  const existingUser = await findUserByEmail(supabaseUrl, serviceRoleKey, email);
  if (existingUser) {
    return existingUser;
  }

  throw new Error(result?.message || 'Could not create auth user');
}

async function upsertModeratorProfile(supabaseUrl: string, serviceRoleKey: string, user: { id: string; email?: string }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/admin_profiles`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      role: 'moderator',
      is_active: true,
      updated_at: new Date().toISOString()
    })
  });

  const result = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(result?.message || 'Could not save moderator profile');
  }

  return Array.isArray(result) ? result[0] : result;
}

async function listModerators(supabaseUrl: string, serviceRoleKey: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?role=eq.moderator&select=id,email,role,is_active,created_at,updated_at&order=created_at.desc`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });

  const result = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(result?.message || 'Could not list moderators');
  }

  return result;
}

async function setModeratorActive(supabaseUrl: string, serviceRoleKey: string, id: string, isActive: boolean) {
  const response = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?id=eq.${id}&role=eq.moderator`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
  });

  const result = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(result?.message || 'Could not update moderator access');
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const anonKey = requireEnv('SUPABASE_ANON_KEY');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

    await requireMainAdmin(req, supabaseUrl, anonKey);

    const payload = await req.json() as ManageAdminPayload;

    if (payload.action === 'list') {
      return jsonResponse({ ok: true, moderators: await listModerators(supabaseUrl, serviceRoleKey) });
    }

    if (payload.action === 'create') {
      const email = payload.email?.trim().toLowerCase();
      const password = payload.password || '';

      if (!email || !email.includes('@')) {
        return jsonResponse({ error: 'Valid email is required' }, 400);
      }

      if (password.length < 8) {
        return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
      }

      const existingProfile = await findAdminProfileByEmail(supabaseUrl, serviceRoleKey, email);
      if (existingProfile?.role === 'main') {
        return jsonResponse({ error: 'This email is already the main admin and cannot be added as a sub-admin' }, 400);
      }

      const authUser = await createAuthUser(supabaseUrl, serviceRoleKey, email, password);
      const moderator = await upsertModeratorProfile(supabaseUrl, serviceRoleKey, authUser);
      return jsonResponse({ ok: true, moderator, moderators: await listModerators(supabaseUrl, serviceRoleKey) });
    }

    if (payload.action === 'deactivate') {
      if (!payload.id) {
        return jsonResponse({ error: 'Moderator id is required' }, 400);
      }

      await setModeratorActive(supabaseUrl, serviceRoleKey, payload.id, false);
      return jsonResponse({ ok: true, moderators: await listModerators(supabaseUrl, serviceRoleKey) });
    }

    if (payload.action === 'set_active') {
      if (!payload.id) {
        return jsonResponse({ error: 'Moderator id is required' }, 400);
      }

      await setModeratorActive(supabaseUrl, serviceRoleKey, payload.id, Boolean(payload.is_active));
      return jsonResponse({ ok: true, moderators: await listModerators(supabaseUrl, serviceRoleKey) });
    }

    return jsonResponse({ error: 'Unsupported action' }, 400);
  } catch (error) {
    console.error('manage-admin-users failed:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Admin management failed' }, 500);
  }
});
