import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, Truck } from 'lucide-react';
import AdminGuard from '../../components/AdminGuard';
import AdminLayout from '../../components/AdminLayout';
import { getSiteSettings, updateSiteSettings } from '../../lib/db';
import { useSiteSettings } from '../../context/SiteSettingsContext';

function CouponsContent() {
  const { refresh } = useSiteSettings();
  const [settings, setSettings] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    id: '',
    code: '',
    type: 'percentage',
    value: 0,
    minPurchase: 0,
    active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
      setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      code: form.code.toUpperCase().replace(/\s+/g, ''),
      value: Number(form.value) || 0,
      minPurchase: Number(form.minPurchase) || 0,
    };
    
    if (!payload.code) return alert('Code is required');

    const newCoupons = editingId 
      ? coupons.map(c => c.id === editingId ? payload : c)
      : [...coupons, { ...payload, id: Date.now().toString() }];
      
    try {
      await updateSiteSettings({ ...settings, coupons: newCoupons });
      await refresh();
      setCoupons(newCoupons);
      setEditingId(null);
      resetForm();
    } catch (e) {
      console.error(e);
      alert('Error saving coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    const newCoupons = coupons.filter(c => c.id !== id);
    try {
      await updateSiteSettings({ ...settings, coupons: newCoupons });
      await refresh();
      setCoupons(newCoupons);
    } catch (e) {
      console.error(e);
      alert('Error deleting coupon');
    }
  };

  const resetForm = () => {
    setForm({ id: '', code: '', type: 'percentage', value: 0, minPurchase: 0, active: true });
    setEditingId(null);
  };

  const editCoupon = (coupon) => {
    setEditingId(coupon.id);
    setForm({ ...coupon });
  };

  if (loading) return <AdminLayout title="Coupons"><div className="p-8 text-center text-gray-400">Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Discount Coupons">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="admin-card sticky top-24">
            <h2 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-gold" />
              {editingId ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  value={form.code} 
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. SUMMER20"
                  className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white placeholder-gray-600 focus:border-gold focus:ring-1 focus:ring-gold outline-none" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Discount Type</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              {form.type !== 'free_shipping' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Discount Value {form.type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input 
                    type="number" 
                    value={form.value} 
                    onChange={e => setForm({...form, value: e.target.value})}
                    min="0"
                    max={form.type === 'percentage' ? 100 : undefined}
                    className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none" 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Purchase (₹) <span className="text-gray-500 font-normal">(Optional)</span></label>
                <input 
                  type="number" 
                  value={form.minPurchase} 
                  onChange={e => setForm({...form, minPurchase: e.target.value})}
                  min="0"
                  className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none" 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={form.active} 
                  onChange={e => setForm({...form, active: e.target.checked})}
                  className="rounded border-gray-700 text-gold focus:ring-gold bg-gray-900"
                />
                <label htmlFor="active" className="text-sm text-gray-300 cursor-pointer">Coupon is Active</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button type="submit" className="flex-1 bg-gold hover:bg-gold-light text-black font-medium py-2 rounded transition-colors">
                  {editingId ? 'Update' : 'Add Coupon'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-4 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="admin-card">
            <h2 className="font-bold text-lg text-white mb-6">Active & Past Coupons</h2>
            
            {coupons.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-900/30 rounded-lg border border-dashed border-gray-800">
                <Tag className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No coupons created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map(coupon => (
                  <div key={coupon.id} className={`p-4 rounded-lg border ${coupon.active ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-900/50 border-gray-800 opacity-60'} flex flex-wrap items-center gap-4`}>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${coupon.active ? 'bg-gold/20 text-gold' : 'bg-gray-800 text-gray-500'}`}>
                        {coupon.type === 'percentage' ? <Percent className="w-5 h-5" /> : coupon.type === 'free_shipping' ? <Truck className="w-5 h-5" /> : <span className="font-serif font-bold text-lg">₹</span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white tracking-wider">{coupon.code}</h3>
                          {!coupon.active && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Inactive</span>}
                        </div>
                        <p className="text-sm text-gray-400">
                          {coupon.type === 'percentage' ? `${coupon.value}% OFF` : coupon.type === 'free_shipping' ? 'FREE SHIPPING' : `₹${coupon.value} OFF`}
                          {coupon.minPurchase > 0 && ` • Min ₹${coupon.minPurchase}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => editCoupon(coupon)} className="p-2 text-gray-400 hover:text-gold hover:bg-gray-800 rounded transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminCouponsPage() {
  return <AdminGuard><CouponsContent /></AdminGuard>;
}
