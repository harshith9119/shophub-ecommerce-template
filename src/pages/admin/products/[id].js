import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminGuard from '../../../components/AdminGuard';
import AdminLayout from '../../../components/AdminLayout';
import ImageUploadField from '../../../components/admin/ImageUploadField';
import { getProductById, addProduct, updateProduct } from '../../../lib/db';
import { slugify } from '../../../lib/utils';

const EMPTY = {
  title: '', slug: '', description: '', fullDescription: '', salePrice: '', regularPrice: '',
  category: 'Silk', status: 'Available', image: '', images: [], tags: '',
  featured: false, bestSeller: false, newArrival: false, rating: 5, reviewCount: 0,
};

function ProductFormContent() {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === 'new';
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || isNew) return;
    getProductById(id).then((p) => {
      if (p) setForm({ ...EMPTY, ...p, tags: (p.tags || []).join(', '), salePrice: p.salePrice, regularPrice: p.regularPrice });
      setLoading(false);
    });
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && isNew ? { slug: slugify(value) } : {}),
    }));
  };

  const handlePrimaryImage = (url) => {
    setForm((prev) => ({
      ...prev,
      image: url,
      images: prev.images?.includes(url) ? prev.images : [...(prev.images || []), url],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      salePrice: Number(form.salePrice),
      regularPrice: Number(form.regularPrice),
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      slug: form.slug || slugify(form.title),
    };
    try {
      if (isNew) {
        const { id: newId } = await addProduct(data);
        router.push(`/admin/products/${newId}`);
      } else {
        await updateProduct(id, data);
        alert('Product saved!');
      }
    } catch (err) {
      alert(err.message || 'Failed to save. Check Supabase connection and that you are logged in as admin.');
    }
    setSaving(false);
  };

  if (loading) return <AdminLayout title="Loading..."><p className="animate-pulse text-gray-500">Loading...</p></AdminLayout>;

  const productSlug = form.slug || slugify(form.title) || 'misc';

  return (
    <AdminLayout title={isNew ? 'Add New Saree' : 'Edit Product'}>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg border-b border-gray-800 pb-3">Basic Info</h2>
          <div>
            <label className="admin-label">Title</label>
            <input name="title" required value={form.title} onChange={handleChange} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">URL Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Short Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Full Description (HTML allowed)</label>
            <textarea name="fullDescription" rows={8} value={form.fullDescription} onChange={handleChange} className="admin-input font-mono text-sm" />
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg border-b border-gray-800 pb-3">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Sale Price (₹)</label>
              <input name="salePrice" type="number" required value={form.salePrice} onChange={handleChange} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Regular Price (₹)</label>
              <input name="regularPrice" type="number" value={form.regularPrice} onChange={handleChange} className="admin-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="admin-input">
                {['Silk', 'Organza', 'Chinon', 'Linen', 'Chiffon', 'Designer'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="admin-input">
                <option value="Available">Available</option>
                <option value="Sold out">Sold out</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg border-b border-gray-800 pb-3">Images</h2>
          <ImageUploadField
            label="Primary Image"
            value={form.image}
            onChange={handlePrimaryImage}
            type="product"
            productSlug={productSlug}
            previewClass="w-32 h-40 object-cover rounded border border-gray-700"
            hint="JPG, PNG, or WebP up to 8 MB. Auto-uploads to Supabase CDN when you save the product."
          />
          {(form.images || []).length > 1 && (
            <div>
              <label className="admin-label">Gallery ({form.images.length} images)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-16 h-20 object-cover rounded border border-gray-700" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-bold text-lg border-b border-gray-800 pb-3">Display Options</h2>
          <div className="flex flex-wrap gap-6">
            {['featured', 'bestSeller', 'newArrival'].map((field) => (
              <label key={field} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input type="checkbox" name={field} checked={form[field]} onChange={handleChange} className="rounded" />
                {field === 'bestSeller' ? 'Best Seller' : field === 'newArrival' ? 'New Arrival' : 'Featured'}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Rating (1-5)</label>
              <input name="rating" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={handleChange} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Review Count</label>
              <input name="reviewCount" type="number" value={form.reviewCount} onChange={handleChange} className="admin-input" />
            </div>
          </div>
          <div>
            <label className="admin-label">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="admin-input" placeholder="Silk, Wedding, Festive" />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="admin-btn">{saving ? 'Saving...' : 'Save Product'}</button>
          <button type="button" onClick={() => router.back()} className="admin-btn-secondary">Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}

function AdminProductEdit() {
  return <AdminGuard><ProductFormContent /></AdminGuard>;
}
AdminProductEdit.displayName = 'AdminPage';
export default AdminProductEdit;
