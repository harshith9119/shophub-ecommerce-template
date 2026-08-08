import { createServiceClient, isSupabaseConfigured, supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const supabaseConfigured = isSupabaseConfigured();

  const razorpay = Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  );

  let supabaseLive = false;
  if (supabaseConfigured) {
    try {
      const client = createServiceClient() || supabase;
      if (client) {
        const { error } = await client.from('products').select('id').limit(1);
        supabaseLive = !error;
      }
    } catch {
      supabaseLive = false;
    }
  }

  res.status(200).json({
    supabase: supabaseConfigured,
    supabaseLive,
    razorpay,
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'abcdef@gmail.com',
    summary: {
      database: supabaseConfigured
        ? supabaseLive
          ? 'connected'
          : 'keys set — run supabase/schema.sql in Supabase SQL Editor'
        : 'not configured',
      payments: razorpay ? 'razorpay ready' : 'cod only (razorpay not set up)',
      customerLogin: supabaseConfigured ? 'email/password registration ready' : 'needs supabase',
    },
  });
}
