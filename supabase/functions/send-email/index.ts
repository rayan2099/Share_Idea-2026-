declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

type SubmissionEmailPayload = {
  type: 'submission_created';
  submission: {
    reference_id: string;
    project_name: string;
    founder_name: string;
    email: string;
    phone?: string;
    city?: string;
    stage?: string;
    description?: string;
    problem?: string;
    target_market?: string;
    team_size?: string;
    looking_for?: string[];
    funding_range?: string;
    sectors?: string[];
    pitch_url?: string;
    pitch_file_name?: string;
  };
};

type ContactEmailPayload = {
  type: 'contact_created';
  contact: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
};

type ContactReplyPayload = {
  type: 'contact_reply';
  reply: {
    message_id: string;
    to_email: string;
    to_name?: string;
    original_subject: string;
    original_message?: string;
    reply_body: string;
  };
};

type EmailPayload = SubmissionEmailPayload | ContactEmailPayload | ContactReplyPayload;

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

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

async function sendEmail(args: {
  apiKey: string;
  from: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: args.from,
      to: args.to,
      reply_to: args.replyTo,
      subject: args.subject,
      html: args.html
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || `Resend error ${response.status}`);
  }

  return result;
}

async function requireAdmin(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const authorization = req.headers.get('Authorization');

  if (!supabaseUrl || !supabaseAnonKey || !authorization) {
    throw new Error('Admin login required');
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: authorization
    }
  });

  const user = await userResponse.json().catch(() => null);

  if (!userResponse.ok || !user?.id) {
    throw new Error('Admin login required');
  }

  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?id=eq.${user.id}&is_active=eq.true&select=id`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: authorization
    }
  });

  const profiles = await profileResponse.json().catch(() => []);

  if (!profileResponse.ok || !Array.isArray(profiles) || profiles.length === 0) {
    throw new Error('Only active admins can send platform replies');
  }

  return user;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('EMAIL_FROM') || 'Share Idea <onboarding@resend.dev>';
  const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'shareidea01@gmail.com';
  const siteUrl = Deno.env.get('SITE_URL') || 'https://www.shareidea.site';

  if (!resendApiKey) {
    return jsonResponse({ error: 'Missing RESEND_API_KEY Supabase secret' }, 500);
  }

  let payload: EmailPayload;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  try {
    if (payload.type === 'submission_created') {
      const sub = payload.submission;

      if (!sub?.email || !sub?.project_name || !sub?.reference_id) {
        return jsonResponse({ error: 'Missing submission email fields' }, 400);
      }

      const founderHtml = `
        <div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;line-height:1.8;color:#0f172a">
          <h2 style="color:#0A4F68">تم استلام فكرتك بنجاح</h2>
          <p>أهلاً ${escapeHtml(sub.founder_name)}،</p>
          <p>نشكرك على مشاركة فكرتك <strong>${escapeHtml(sub.project_name)}</strong> عبر منصة شارك الفكرة.</p>
          <p>رقم الطلب:</p>
          <p style="font-size:22px;font-weight:bold;color:#E8703A">${escapeHtml(sub.reference_id)}</p>
          <p>سيقوم فريقنا بمراجعة الفكرة والتواصل معك خلال 5-7 أيام عمل.</p>
          <p>فريق Share Idea</p>
        </div>
      `;

      const adminHtml = `
        <div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;line-height:1.8;color:#0f172a">
          <h2 style="color:#0A4F68">فكرة ريادية جديدة</h2>
          <p><strong>رقم الطلب:</strong> ${escapeHtml(sub.reference_id)}</p>
          <p><strong>اسم المشروع:</strong> ${escapeHtml(sub.project_name)}</p>
          <p><strong>المؤسس:</strong> ${escapeHtml(sub.founder_name)}</p>
          <p><strong>البريد:</strong> ${escapeHtml(sub.email)}</p>
          <p><strong>الهاتف:</strong> ${escapeHtml(sub.phone)}</p>
          <p><strong>المدينة:</strong> ${escapeHtml(sub.city)}</p>
          <p><strong>المرحلة:</strong> ${escapeHtml(sub.stage)}</p>
          <p><strong>السوق:</strong> ${escapeHtml(sub.target_market)}</p>
          <p><strong>الفريق:</strong> ${escapeHtml(sub.team_size)}</p>
          <p><strong>التمويل المطلوب:</strong> ${escapeHtml(sub.funding_range)}</p>
          <p><strong>القطاعات:</strong> ${escapeHtml(sub.sectors?.join('، '))}</p>
          <hr />
          <p><strong>الوصف:</strong><br />${escapeHtml(sub.description)}</p>
          <p><strong>المشكلة:</strong><br />${escapeHtml(sub.problem)}</p>
          <p><strong>يبحث عن:</strong> ${escapeHtml(sub.looking_for?.join('، '))}</p>
          <p><strong>العرض التقديمي:</strong> ${escapeHtml(sub.pitch_url || sub.pitch_file_name || 'لا يوجد')}</p>
          <p><a href="${siteUrl}/admin/submissions">فتح لوحة الطلبات</a></p>
        </div>
      `;

      const [founderResult, adminResult] = await Promise.all([
        sendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: sub.email,
          subject: `استلمنا فكرتك - ${sub.reference_id}`,
          html: founderHtml
        }),
        sendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: adminEmail,
          replyTo: sub.email,
          subject: `فكرة جديدة: ${sub.project_name}`,
          html: adminHtml
        })
      ]);

      return jsonResponse({ ok: true, founderResult, adminResult });
    }

    if (payload.type === 'contact_created') {
      const contact = payload.contact;

      if (!contact?.email || !contact?.subject || !contact?.message) {
        return jsonResponse({ error: 'Missing contact email fields' }, 400);
      }

      const adminHtml = `
        <div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;line-height:1.8;color:#0f172a">
          <h2 style="color:#0A4F68">رسالة تواصل جديدة</h2>
          <p><strong>الاسم:</strong> ${escapeHtml(contact.name)}</p>
          <p><strong>البريد:</strong> ${escapeHtml(contact.email)}</p>
          <p><strong>الموضوع:</strong> ${escapeHtml(contact.subject)}</p>
          <hr />
          <p>${escapeHtml(contact.message)}</p>
          <p><a href="${siteUrl}/admin/messages">فتح لوحة الرسائل</a></p>
        </div>
      `;

      const senderHtml = `
        <div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;line-height:1.8;color:#0f172a">
          <h2 style="color:#0A4F68">تم استلام رسالتك</h2>
          <p>أهلاً ${escapeHtml(contact.name)}،</p>
          <p>وصلتنا رسالتك بعنوان <strong>${escapeHtml(contact.subject)}</strong>.</p>
          <p>سيقوم فريق Share Idea بالرد عليك قريباً.</p>
        </div>
      `;

      const [adminResult, senderResult] = await Promise.all([
        sendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: adminEmail,
          replyTo: contact.email,
          subject: `رسالة تواصل: ${contact.subject}`,
          html: adminHtml
        }),
        sendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: contact.email,
          subject: 'تم استلام رسالتك - Share Idea',
          html: senderHtml
        })
      ]);

      return jsonResponse({ ok: true, adminResult, senderResult });
    }

    if (payload.type === 'contact_reply') {
      await requireAdmin(req);

      const reply = payload.reply;

      if (!reply?.to_email || !reply?.original_subject || !reply?.reply_body) {
        return jsonResponse({ error: 'Missing contact reply fields' }, 400);
      }

      const replyHtml = `
        <div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;line-height:1.8;color:#0f172a">
          <h2 style="color:#0A4F68">رد من فريق Share Idea</h2>
          <p>أهلاً ${escapeHtml(reply.to_name || '')}،</p>
          <p>${escapeHtml(reply.reply_body).replaceAll('\\n', '<br />')}</p>
          <hr />
          <p style="color:#64748b"><strong>رسالتك الأصلية:</strong> ${escapeHtml(reply.original_subject)}</p>
          ${reply.original_message ? `<p style="color:#64748b">${escapeHtml(reply.original_message).replaceAll('\\n', '<br />')}</p>` : ''}
        </div>
      `;

      const result = await sendEmail({
        apiKey: resendApiKey,
        from: fromEmail,
        to: reply.to_email,
        subject: `RE: ${reply.original_subject}`,
        html: replyHtml
      });

      return jsonResponse({ ok: true, result });
    }

    return jsonResponse({ error: 'Unsupported email type' }, 400);
  } catch (error) {
    console.error('send-email function failed:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Email send failed' }, 500);
  }
});
