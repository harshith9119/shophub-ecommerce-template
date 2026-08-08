import React from "react";
import AdminLayout from "../../components/AdminLayout";
import { isSupabaseConfigured, ADMIN_EMAILS } from "../../lib/supabase";

export default function AdminDebug() {
  return (
    <AdminLayout title="Admin Debug">
      <div className="max-w-3xl space-y-4">
        <div className="admin-card">
          <h2 className="font-bold text-lg">Supabase Status</h2>
          <p>isSupabaseConfigured: {String(isSupabaseConfigured())}</p>
          <p>Allowed admin emails (NEXT_PUBLIC_ADMIN_EMAILS): {ADMIN_EMAILS.join(', ')}</p>
          <p className="text-sm text-gray-400 mt-2">If you cannot log in: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local, and your email is included in NEXT_PUBLIC_ADMIN_EMAILS.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
