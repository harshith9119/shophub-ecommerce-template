import React, { useState } from 'react';
import { ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { getAllProducts, getSiteSettings, migrateAllImagesToStorage } from '../../lib/db';
import { countImagesNeedingMigration, isStorageUrl } from '../../lib/storage';

function MigrationProgress({ progress }) {
  if (!progress) return null;
  const { done, total, percent, label, etaLabel } = progress;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-orange-400 truncate pr-4">{label || 'Migrating…'}</span>
        <span className="text-gray-400 flex-shrink-0">{done}/{total} · {percent}%</span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold to-orange-400 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {etaLabel && <p className="text-gray-500 text-xs">{etaLabel}</p>}
    </div>
  );
}

function ImagesContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [products, settings] = await Promise.all([getAllProducts(), getSiteSettings()]);
      const pending = await countImagesNeedingMigration(products, settings);
      const onStorage = products.filter((p) => isStorageUrl(p.image)).length;
      setStats({ products: products.length, onStorage, pending });
    } catch {
      setStats({ products: 0, onStorage: 0, pending: 0 });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const handleMigrate = async () => {
    if (stats?.pending === 0) {
      setResult({ type: 'success', message: 'All images are already on Supabase Storage — nothing to migrate.' });
      return;
    }
    if (!window.confirm(`Migrate ${stats?.pending || 'remaining'} image(s) to Supabase Storage CDN? Already-stored images will be skipped.`)) return;
    setMigrating(true);
    setResult(null);
    setProgress({ done: 0, total: stats?.pending || 1, percent: 0, label: 'Starting…', etaLabel: '' });
    try {
      const res = await migrateAllImagesToStorage(setProgress);
      setResult({ type: 'success', message: res.message });
      await loadStats();
    } catch (err) {
      setResult({ type: 'error', message: err.message || 'Migration failed.' });
    }
    setMigrating(false);
    setProgress(null);
  };

  return (
    <AdminLayout title="Image Storage">
      <div className="max-w-2xl space-y-8">
        <div className="admin-card space-y-6">
          <div className="flex items-start gap-4">
            <ImageIcon className="w-10 h-10 text-orange-400 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg text-white">Supabase Storage (CDN)</h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Images live on Supabase CDN for fast loading. New products auto-upload on save.
                Migration skips photos already on storage.
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg text-sm text-gray-400 space-y-2">
            <p className="font-bold text-gray-300">First-time setup — run in Supabase SQL Editor:</p>
            <code className="block text-gold text-xs">supabase/storage.sql</code>
          </div>

          {loading ? (
            <p className="text-gray-500 animate-pulse">Checking images…</p>
          ) : stats && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-white">{stats.products}</p>
                <p className="text-xs text-gray-500 mt-1">Products</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{stats.onStorage}</p>
                <p className="text-xs text-gray-500 mt-1">On CDN</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Need migration</p>
              </div>
            </div>
          )}

          {migrating && <MigrationProgress progress={progress} />}

          {result && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${result.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {result.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {result.message}
            </div>
          )}

          <button
            onClick={handleMigrate}
            disabled={migrating || loading || stats?.pending === 0}
            className="admin-btn w-full disabled:opacity-50"
          >
            {migrating ? 'Migrating…' : stats?.pending === 0 ? 'All Images on CDN ✓' : 'Migrate Remaining Images'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminImages() {
  return <AdminGuard><ImagesContent /></AdminGuard>;
}
AdminImages.displayName = 'AdminPage';
export default AdminImages;
