import React, { useState, useEffect } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { getSiteSettings, updateSiteSettings } from '../../lib/db';
import { useSiteSettings } from '../../context/SiteSettingsContext';

function PoliciesEditor() {
  const { refresh } = useSiteSettings();
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('footer');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  if (!settings) return <p className="animate-pulse text-gray-500">Loading...</p>;

  const updateFooter = (field, value) =>
    setSettings((s) => ({ ...s, footer: { ...s.footer, [field]: value } }));
  const updatePolicy = (key, field, value) =>
    setSettings((s) => ({ ...s, policies: { ...s.policies, [key]: { ...s.policies[key], [field]: value } } }));
  const updateFeature = (index, field, value) => {
    const features = [...settings.features];
    features[index] = { ...features[index], [field]: value };
    setSettings((s) => ({ ...s, features }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSiteSettings({
      footer: settings.footer,
      policies: settings.policies,
      features: settings.features,
      contact: settings.contact,
    });
    await refresh();
    setSaving(false);
    alert('Saved!');
  };

  const tabs = [
    { id: 'footer', label: 'Footer' },
    { id: 'refund', label: 'Refund Policy' },
    { id: 'shipping', label: 'Shipping Policy' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'features', label: 'Trust Badges' },
    { id: 'contact', label: 'Contact Page' },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === t.id ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card space-y-4 mb-8">
        {activeTab === 'footer' && (
          <>
            <div>
              <label className="admin-label">Footer Description</label>
              <textarea value={settings.footer.description} onChange={(e) => updateFooter('description', e.target.value)} rows={4} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Copyright Text</label>
              <input value={settings.footer.copyright} onChange={(e) => updateFooter('copyright', e.target.value)} className="admin-input" />
            </div>
          </>
        )}

        {['refund', 'shipping', 'privacy'].includes(activeTab) && (
          <>
            <div>
              <label className="admin-label">Title</label>
              <input value={settings.policies[activeTab]?.title || ''} onChange={(e) => updatePolicy(activeTab, 'title', e.target.value)} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Content (HTML allowed)</label>
              <textarea value={settings.policies[activeTab]?.content || ''} onChange={(e) => updatePolicy(activeTab, 'content', e.target.value)} rows={15} className="admin-input font-mono text-sm" />
            </div>
          </>
        )}

        {activeTab === 'features' && settings.features?.map((f, i) => (
          <div key={i} className="p-4 bg-gray-800/50 rounded-lg space-y-3">
            <input value={f.title} onChange={(e) => updateFeature(i, 'title', e.target.value)} className="admin-input" placeholder="Title" />
            <textarea value={f.description} onChange={(e) => updateFeature(i, 'description', e.target.value)} rows={2} className="admin-input" placeholder="Description" />
          </div>
        ))}

        {activeTab === 'contact' && (
          <>
            <div>
              <label className="admin-label">Contact Page Title</label>
              <input value={settings.contact?.title || ''} onChange={(e) => setSettings((s) => ({ ...s, contact: { ...s.contact, title: e.target.value } }))} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Contact Page Description</label>
              <textarea value={settings.contact?.description || ''} onChange={(e) => setSettings((s) => ({ ...s, contact: { ...s.contact, description: e.target.value } }))} rows={3} className="admin-input" />
            </div>
          </>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="admin-btn">{saving ? 'Saving...' : 'Save Changes'}</button>
    </div>
  );
}

function AdminPolicies() {
  return (
    <AdminGuard>
      <AdminLayout title="Policies & Footer">
        <PoliciesEditor />
      </AdminLayout>
    </AdminGuard>
  );
}
AdminPolicies.displayName = 'AdminPage';
export default AdminPolicies;
