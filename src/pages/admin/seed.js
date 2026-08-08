import React, { useState } from 'react';
import { Database, CheckCircle, AlertTriangle } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { seedDatabase } from '../../lib/db';

function SeedContent() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm('This will import 29 products from shophub.com and default site settings. Existing data will NOT be overwritten. Continue?')) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await seedDatabase();
      setStatus({ type: 'success', message: `Successfully seeded ${result.products} products and default settings!` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Seed failed. Make sure Supabase is configured and you are logged in as admin.' });
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Seed Database">
      <div className="max-w-2xl">
        <div className="admin-card space-y-6">
          <div className="flex items-start gap-4">
            <Database className="w-10 h-10 text-orange-400 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg text-white">Import Reference Data</h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                This imports all 29 saree products from shophub.com with real product images,
                prices, descriptions, and categories. It also sets up default site settings, policies,
                and homepage content matching the reference website.
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg text-sm text-gray-400">
            <p className="font-bold text-gray-300 mb-2">What gets imported:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>29 products (migrate images to Supabase CDN from Image Storage page)</li>
              <li>Default categories (Silk, Organza, Chinon, Linen, Designer)</li>
              <li>Site settings (hero, footer, policies, homepage sections)</li>
            </ul>
            <p className="mt-3 text-orange-400/80">Note: Won&apos;t overwrite existing products or settings.</p>
          </div>

          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${status.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {status.message}
            </div>
          )}

          <button onClick={handleSeed} disabled={loading} className="admin-btn w-full">
            {loading ? 'Importing...' : 'Seed Database Now'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminSeed() {
  return <AdminGuard><SeedContent /></AdminGuard>;
}
AdminSeed.displayName = 'AdminPage';
export default AdminSeed;


