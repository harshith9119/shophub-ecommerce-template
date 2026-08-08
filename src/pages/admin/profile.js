import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { getSetupStatus } from '../../lib/setupStatus';

function AdminProfileContent() {
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      try {
        const res = await fetch('/api/setup/status');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setStatus(data);
          return;
        }
      } catch {
        // API unavailable on static export — fall back to client check
      }

      try {
        const data = await getSetupStatus();
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setStatus({ supabase: false, supabaseLive: false, razorpay: false });
      }
    };

    loadStatus();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <AdminLayout title="Admin Profile">
      <div className="max-w-2xl space-y-8">
        <div className="admin-card">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-white">Store Owner</h2>
              <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-800 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Role</span>
              <span className="text-gold font-semibold uppercase tracking-wide">Administrator</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">User ID</span>
              <span className="text-gray-300 font-mono text-xs truncate max-w-[200px]">{user?.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Last sign-in</span>
              <span className="text-gray-300">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—'}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="mt-8 flex items-center gap-2 text-red-400 hover:text-red-300 text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="admin-card">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" /> System Status
          </h3>
          {status && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Supabase Database</span>
                <span className={status.supabase ? 'text-green-400' : 'text-red-400'}>{status.supabase ? 'Connected' : 'Not connected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Razorpay Payments</span>
                <span className={status.razorpay ? 'text-green-400' : 'text-yellow-400'}>{status.razorpay ? 'Connected' : 'Not set up'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Customer Login</span>
                <span className={status.supabase ? 'text-green-400' : 'text-red-400'}>{status.supabase ? 'Email & password registration' : 'Needs Supabase'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminProfile() {
  return <AdminGuard><AdminProfileContent /></AdminGuard>;
}
AdminProfile.displayName = 'AdminPage';
export default AdminProfile;
