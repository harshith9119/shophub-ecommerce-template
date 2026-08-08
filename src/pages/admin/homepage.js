import React, { useState, useEffect } from 'react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { getSiteSettings, updateSiteSettings, getAllProducts } from '../../lib/db';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { ProductMultiSelect, ProductSingleSelect } from '../../components/admin/ProductSelector';

function HomepageEditor() {
  const { refresh } = useSiteSettings();
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
    getAllProducts().then(setProducts);
  }, []);

  if (!settings) return <p className="animate-pulse text-gray-500">Loading...</p>;

  const hp = settings.homepage || {};

  const update = (field, value) => setSettings((s) => ({ ...s, homepage: { ...s.homepage, [field]: value } }));
  
  const updateAbout = (index, field, value) => {
    const sections = [...(hp.aboutSections || [])];
    sections[index] = { ...sections[index], [field]: value };
    update('aboutSections', sections);
  };
  const updateLookbook = (index, field, value) => {
    const items = [...(hp.lookbookItems || [])];
    items[index] = { ...items[index], [field]: value };
    update('lookbookItems', items);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSiteSettings({ homepage: settings.homepage });
    await refresh();
    setSaving(false);
    alert('Homepage saved!');
  };

  const toggles = [
    ['showBestSellers', 'Best Sellers Section'],
    ['showNewArrivals', 'New Arrivals Section'],
    ['showLookbook', 'Lookbook Section'],
    ['showCompare', 'Compare Section'],
    ['showAbout', 'About Section'],
    ['showNewsletter', 'Newsletter Section'],
    ['showProductOfWeek', 'Product of the Week Section'],
    ['showForMoments', 'For Your Moments Section'],
    ['showLimitedPicks', 'Limited Picks Banner'],
    ['showBeyondFashion', 'Beyond Fashion Split'],
    ['showStory', 'Story Section'],
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg">Section Visibility</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {toggles.map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-gray-300 cursor-pointer">
              <input type="checkbox" checked={hp[key] !== false} onChange={(e) => update(key, e.target.checked)} className="rounded" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg">Section Titles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['bestSellersTitle', 'Best Sellers Title'],
            ['newArrivalsTitle', 'New Arrivals Title'],
            ['newArrivalsSubtitle', 'New Arrivals Subtitle'],
            ['forMomentsTitle', 'For Your Moments Title'],
            ['forMomentsSubtitle', 'For Your Moments Subtitle'],
            ['lookbookTitle', 'Lookbook Title'],
            ['compareTitle', 'Compare Title'],
            ['compareSubtitle', 'Compare Subtitle'],
            ['aboutTitle', 'About Title'],
            ['marqueeText', 'Marquee Banner Text'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="admin-label">{label}</label>
              <input value={hp[key] || ''} onChange={(e) => update(key, e.target.value)} className="admin-input" />
            </div>
          ))}
        </div>
      </div>

      <ProductMultiSelect
        title="Best Sellers Products"
        description='Select the products you want to feature in the Best Sellers section. If none are selected, products with the "Best Seller" tag will be shown by default.'
        products={products}
        selectedIds={hp.bestSellersProducts}
        onChange={(ids) => update('bestSellersProducts', ids)}
      />

      <ProductMultiSelect
        title="New Arrivals Products"
        description='Select the products you want to feature in the New Arrivals section. If none are selected, products with the "New Arrival" tag will be shown by default.'
        products={products}
        selectedIds={hp.newArrivalsProducts}
        onChange={(ids) => update('newArrivalsProducts', ids)}
      />

      <ProductMultiSelect
        title="For Your Moments Products"
        description='Select the products you want to feature in the "For Your Moments" section. If none are selected, products with the "Featured" tag will be shown by default.'
        products={products}
        selectedIds={hp.forMomentsProducts}
        onChange={(ids) => update('forMomentsProducts', ids)}
      />

      <ProductSingleSelect
        title="Product of the Week"
        description="Select a single product to highlight as Product of the Week."
        products={products}
        selectedId={hp.productOfWeek}
        onChange={(id) => update('productOfWeek', id)}
      />

      <ProductMultiSelect
        title="Compare Section Products"
        description="Select exactly 2 products to feature in the Compare section. If less than 2 are selected, the first 2 products in your catalog will be used."
        products={products}
        selectedIds={hp.compareProducts}
        onChange={(ids) => update('compareProducts', ids)}
        max={2}
      />

      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg">Story Sections</h2>
        {(hp.storySections || []).map((s, i) => (
          <div key={i} className="p-4 bg-gray-800/50 rounded-lg space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm">Story {i + 1}</h3>
              <button 
                onClick={() => {
                  const newItems = [...hp.storySections];
                  newItems.splice(i, 1);
                  update('storySections', newItems);
                }}
                className="text-red-400 text-xs hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <input value={s.title || ''} onChange={(e) => {
              const newItems = [...(hp.storySections || [])];
              newItems[i] = { ...newItems[i], title: e.target.value };
              update('storySections', newItems);
            }} className="admin-input" placeholder="Title" />
            <textarea value={s.text || ''} onChange={(e) => {
              const newItems = [...(hp.storySections || [])];
              newItems[i] = { ...newItems[i], text: e.target.value };
              update('storySections', newItems);
            }} rows={3} className="admin-input" placeholder="Text" />
          </div>
        ))}
        <button 
          onClick={() => update('storySections', [...(hp.storySections || []), { num: `0${(hp.storySections?.length || 0) + 1}`, title: '', text: '' }])}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          + Add Story Section
        </button>
      </div>

      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg">About Sections</h2>
        {(hp.aboutSections || []).map((s, i) => (
          <div key={i} className="p-4 bg-gray-800/50 rounded-lg space-y-3">
            <input value={s.title} onChange={(e) => updateAbout(i, 'title', e.target.value)} className="admin-input" placeholder="Title" />
            <textarea value={s.text} onChange={(e) => updateAbout(i, 'text', e.target.value)} rows={3} className="admin-input" placeholder="Text" />
          </div>
        ))}
        <button 
          onClick={() => update('aboutSections', [...(hp.aboutSections || []), { title: '', text: '' }])}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          + Add About Section
        </button>
      </div>

      <div className="admin-card space-y-4">
        <h2 className="font-bold text-lg">Lookbook Items</h2>
        {(hp.lookbookItems || []).map((item, i) => (
          <div key={i} className="p-4 bg-gray-800/50 rounded-lg space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm">Item {i + 1}</h3>
              <button 
                onClick={() => {
                  const newItems = [...hp.lookbookItems];
                  newItems.splice(i, 1);
                  update('lookbookItems', newItems);
                }}
                className="text-red-400 text-xs hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <input value={item.title} onChange={(e) => updateLookbook(i, 'title', e.target.value)} className="admin-input" placeholder="Title" />
            <input value={item.subtitle} onChange={(e) => updateLookbook(i, 'subtitle', e.target.value)} className="admin-input" placeholder="Subtitle" />
            <ImageUploadField
              label="Lookbook Image"
              value={item.image}
              onChange={(url) => updateLookbook(i, 'image', url)}
              folder={`lookbook/${i + 1}`}
              previewClass="w-full h-40 object-cover rounded border border-gray-700"
            />
            <input value={item.link} onChange={(e) => updateLookbook(i, 'link', e.target.value)} className="admin-input" placeholder="Link" />
          </div>
        ))}
        <button 
          onClick={() => update('lookbookItems', [...(hp.lookbookItems || []), { title: '', subtitle: '', link: '', image: '' }])}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          + Add Lookbook Item
        </button>
      </div>

      <button onClick={handleSave} disabled={saving} className="admin-btn">{saving ? 'Saving...' : 'Save Homepage'}</button>
    </div>
  );
}

function AdminHomepage() {
  return (
    <AdminGuard>
      <AdminLayout title="Homepage Editor">
        <HomepageEditor />
      </AdminLayout>
    </AdminGuard>
  );
}
AdminHomepage.displayName = 'AdminPage';
export default AdminHomepage;
