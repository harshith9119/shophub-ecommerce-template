import React, { useState } from 'react';
import { Upload, Link2 } from 'lucide-react';
import { uploadProductImage, uploadSiteImage } from '../../lib/db';
import { isStorageUrl } from '../../lib/storage';

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'general',
  type = 'site',
  productSlug,
  hint,
  previewClass = 'w-32 h-32 object-cover rounded border border-gray-700',
}) {
  const [uploading, setUploading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url =
        type === 'product'
          ? await uploadProductImage(file, productSlug || folder)
          : await uploadSiteImage(file, folder);
      onChange(url);
    } catch (err) {
      alert(err.message || 'Upload failed. Run supabase/storage.sql and sign in as admin.');
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleMigrate = async () => {
    if (!value || isStorageUrl(value)) return;
    setMigrating(true);
    try {
      const { migrateUrlToStorage, BUCKETS } = await import('../../lib/storage');
      const bucket = type === 'product' ? BUCKETS.products : BUCKETS.site;
      const url = await migrateUrlToStorage(value, bucket, productSlug || folder);
      onChange(url);
    } catch (err) {
      alert(err.message || 'Could not move image to storage. Upload the file directly instead.');
    }
    setMigrating(false);
  };

  const needsMigration = value && !isStorageUrl(value) && !value.startsWith('data:');

  return (
    <div className="space-y-3">
      {label && <label className="admin-label">{label}</label>}
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input"
        placeholder="https://… or upload a file below"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="admin-btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading…' : 'Upload to Storage'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {needsMigration && (
          <button type="button" onClick={handleMigrate} disabled={migrating} className="admin-btn-secondary text-sm inline-flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            {migrating ? 'Moving…' : 'Move URL to Storage'}
          </button>
        )}
      </div>
      {hint && <p className="text-gray-500 text-xs">{hint}</p>}
      {value && (
        <div className="space-y-2">
          <img src={value} alt="Preview" className={previewClass} />
          {isStorageUrl(value) && (
            <p className="text-green-400 text-xs">✓ Stored on Supabase CDN</p>
          )}
        </div>
      )}
    </div>
  );
}
