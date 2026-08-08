import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co'));

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'abcdef@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Development bypass for local testing: set NEXT_PUBLIC_DEV_ADMIN_BYPASS=true in .env.local
export const DEV_ADMIN_BYPASS = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === 'true';

export const isAdminEmail = (email) => {
  if (DEV_ADMIN_BYPASS && process.env.NODE_ENV !== 'production') return true; // allow any email in dev when bypass enabled
  return email && ADMIN_EMAILS.includes(email.toLowerCase());
};

/** Server-side client with service role (API routes only — never expose to browser) */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
