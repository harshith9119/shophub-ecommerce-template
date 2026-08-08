import React, { useState, useEffect } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { getSiteSettings, updateSiteSettings } from '../../lib/db';
import { useSiteSettings } from '../../context/SiteSettingsContext';

function DesignEditor() {
  const { refresh } = useSiteSettings();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  if (!settings) return <p className="animate-pulse text-gray-500">Loading...</p>;

  const updateGeneral = (field, value) =>
    setSettings((s) => ({ ...s, general: { ...s.general, [field]: value } }));
  const updateHero = (field, value) =>
    setSettings((s) => ({ ...s, hero: { ...s.hero, [field]: value } }));

  const handleSave = async () => {
    setSaving(true);
    await updateSiteSettings({ general: settings.general, hero: settings.hero });
    await refresh();
    setSaving(false);
    alert('Design saved!');
  };

  const { general, hero } = settings;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg border-b border-gray-800 pb-3">Brand & Colors</h2>
        {[
          ['brandName', 'Brand Name'],
          ['tagline', 'Tagline'],
          ['shippingBanner', 'Shipping Banner Text'],
          ['supportEmail', 'Support Email'],
          ['whatsappNumber', 'WhatsApp Number (with country code)'],
          ['phone', 'Phone Number'],
          ['address', 'Address'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="admin-label">{label}</label>
            <input value={general[key] || ''} onChange={(e) => updateGeneral(key, e.target.value)} className="admin-input" />
          </div>
        ))}
        <ImageUploadField
          label="Logo"
          value={general.logoUrl}
          onChange={(url) => updateGeneral('logoUrl', url)}
          folder="logo"
          hint="Optional. Upload your brand logo to Supabase Storage."
          previewClass="h-16 w-auto object-contain rounded border border-gray-700 bg-white/5 p-2"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={general.primaryColor || '#ea580c'} onChange={(e) => updateGeneral('primaryColor', e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
              <input value={general.primaryColor || '#ea580c'} onChange={(e) => updateGeneral('primaryColor', e.target.value)} className="admin-input flex-1" />
            </div>
          </div>
          <div>
            <label className="admin-label">Shipping Charge (₹)</label>
            <input type="number" value={general.shippingCharge || 150} onChange={(e) => updateGeneral('shippingCharge', Number(e.target.value))} className="admin-input" />
          </div>
        </div>
      </div>

      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg border-b border-gray-800 pb-3">Hero Section</h2>
        {[
          ['subtitle', 'Subtitle'],
          ['title', 'Title (use \\n for line break)'],
          ['description', 'Description'],
          ['buttonText', 'Button Text'],
          ['buttonLink', 'Button Link'],
          ['secondaryTitle', 'Secondary Banner Title'],
          ['secondarySubtitle', 'Secondary Banner Subtitle'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="admin-label">{label}</label>
            {key === 'description' || key === 'title' ? (
              <textarea value={(hero[key] || '').replace(/\\n/g, '\n')} onChange={(e) => updateHero(key, e.target.value)} rows={key === 'title' ? 2 : 3} className="admin-input" />
            ) : (
              <input value={hero[key] || ''} onChange={(e) => updateHero(key, e.target.value)} className="admin-input" />
            )}
          </div>
        ))}
        <ImageUploadField
          label="Hero Background Image"
          value={hero.image}
          onChange={(url) => updateHero('image', url)}
          folder="hero"
          previewClass="w-full h-48 object-cover rounded border border-gray-700"
        />
      </div>

      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg border-b border-gray-800 pb-3">Payment Methods</h2>
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <div>
            <p className="font-medium text-white">Cash on Delivery (COD)</p>
            <p className="text-sm text-gray-400">Allow customers to pay using COD.</p>
          </div>
          <button 
            type="button"
            onClick={() => updateGeneral('enableCOD', !general.enableCOD)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${general.enableCOD !== false ? 'bg-gold' : 'bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${general.enableCOD !== false ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="admin-btn">{saving ? 'Saving...' : 'Save Design'}</button>
    </div>
  );
}

function AdminDesign() {
  return (
    <AdminGuard>
      <AdminLayout title="Design & Branding">
        <DesignEditor />
      </AdminLayout>
    </AdminGuard>
  );
}
AdminDesign.displayName = 'AdminPage';
export default AdminDesign;
