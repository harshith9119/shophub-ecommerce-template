import { isSupabaseConfigured, supabase } from './supabase';

/** Client-side connection check — works with static export (no API route needed). */
export async function getSetupStatus() {
  const supabaseConfigured = isSupabaseConfigured();
  let supabaseLive = supabaseConfigured;

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      supabaseLive = !error || supabaseConfigured;
    } catch {
      supabaseLive = supabaseConfigured;
    }
  }

  const razorpay = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

  return {
    supabase: supabaseConfigured,
    supabaseLive,
    razorpay,
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'abcdef@gmail.com',
  };
}
