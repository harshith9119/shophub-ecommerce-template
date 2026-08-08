import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User, Package, MapPin, LogOut, Edit2, Save, Heart, Settings } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PageHead from '../../components/PageHead';
import { FadeIn } from '../../components/motion/Reveal';
import { useUserAuth } from '../../context/UserAuthContext';
import { getOrdersByUser } from '../../lib/db';
import { formatPrice, ORDER_STATUS } from '../../lib/utils';

function ProfileGuard({ children }) {
  const { isLoggedIn, loading } = useUserAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !isLoggedIn) router.replace('/login');
  }, [loading, isLoggedIn, router]);
  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return children;
}

function ProfileContent() {
  const { user, profile, logout, updateProfile } = useUserAuth();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
    if (user) getOrdersByUser(user.id, profile?.phone).then(setOrders);
  }, [user, profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'account', label: 'Account', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <>
      <PageHead title="My Profile" />
      <div className="bg-page min-h-screen">
        <Navbar />
        <main className="luxury-container pt-32 pb-20 md:pt-40">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="luxury-subheading mb-2">My Account</p>
                <h1 className="font-serif text-3xl md:text-4xl text-emerald dark:text-gold-light font-medium">{profile?.name || 'Welcome'}</h1>
                <p className="text-muted font-light mt-2">{profile?.email || user?.email}</p>
                {profile?.phone && <p className="text-muted font-light text-sm">+91 {profile.phone}</p>}
              </div>
              <button onClick={logout} className="luxury-btn-outline inline-flex items-center gap-2 self-start">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </FadeIn>

          <div className="flex flex-wrap gap-2 mb-10 border-b border-soft pb-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-wide transition-all ${tab === id ? 'bg-emerald dark:bg-gold dark:text-charcoal text-white' : 'text-muted hover:text-emerald dark:hover:text-gold'}`}>
                <Icon className="w-4 h-4" strokeWidth={1.5} /> {label}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            <FadeIn>
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-surface border border-soft">
                  <Package className="w-10 h-10 text-muted mx-auto mb-4" />
                  <p className="font-serif text-xl text-emerald dark:text-gold-light mb-2">No orders yet</p>
                  <Link href="/catalog" className="luxury-link">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                    return (
                      <div key={order.id} className="bg-surface border border-soft p-6">
                        <div className="flex flex-wrap justify-between gap-4 mb-4">
                          <div>
                            <p className="font-sans font-semibold text-body">{order.orderNumber}</p>
                            <p className="text-muted text-xs mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold uppercase px-3 py-1 rounded ${st.color}`}>{st.label}</span>
                            <p className="font-semibold text-body mt-2">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                        <p className="text-muted text-sm">{order.items?.length} item(s) · {order.paymentMethod?.toUpperCase()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </FadeIn>
          )}

          {tab === 'wishlist' && (
            <FadeIn>
              <div className="text-center py-20 bg-surface border border-soft">
                <Heart className="w-10 h-10 text-muted mx-auto mb-4" />
                <p className="font-serif text-xl text-emerald dark:text-gold-light mb-2">Your wishlist is empty</p>
                <Link href="/catalog" className="luxury-link">Browse Collection</Link>
              </div>
            </FadeIn>
          )}

          {(tab === 'account' || tab === 'address') && (
            <FadeIn>
              <div className="bg-surface border border-soft p-8 max-w-xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-xl text-emerald dark:text-gold-light">{tab === 'account' ? 'Account Details' : 'Delivery Address'}</h2>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-emerald dark:text-gold-light hover:text-gold">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  )}
                </div>
                {saved && <p className="text-green-600 dark:text-green-400 text-sm mb-4">Profile updated successfully.</p>}
                <form onSubmit={handleSave} className="space-y-5">
                  {tab === 'account' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Full Name</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!editing} required className="w-full px-5 py-3 bg-surface-alt text-body border border-soft disabled:opacity-70 focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Email</label>
                        <input type="email" value={form.email} disabled className="w-full px-5 py-3 bg-soft text-body border border-soft opacity-70" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Phone</label>
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} disabled={!editing} maxLength={10} className="w-full px-5 py-3 bg-surface-alt text-body border border-soft disabled:opacity-70 focus:outline-none focus:border-gold" />
                      </div>
                    </>
                  )}
                  {tab === 'address' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Address</label>
                        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={!editing} rows={3} className="w-full px-5 py-3 bg-surface-alt text-body border border-soft disabled:opacity-70 focus:outline-none focus:border-gold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">City</label>
                          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={!editing} className="w-full px-5 py-3 bg-surface-alt text-body border border-soft disabled:opacity-70 focus:outline-none focus:border-gold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">State</label>
                          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} disabled={!editing} className="w-full px-5 py-3 bg-surface-alt text-body border border-soft disabled:opacity-70 focus:outline-none focus:border-gold" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wide text-muted mb-2">Pincode</label>
                        <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} disabled={!editing} maxLength={6} className="w-full px-5 py-3 bg-surface-alt text-body border border-soft disabled:opacity-70 focus:outline-none focus:border-gold" />
                      </div>
                    </>
                  )}
                  {editing && (
                    <div className="flex gap-3 pt-4">
                      <button type="submit" disabled={saving} className="luxury-btn flex items-center gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</button>
                      <button type="button" onClick={() => setEditing(false)} className="luxury-btn-outline">Cancel</button>
                    </div>
                  )}
                </form>
              </div>
            </FadeIn>
          )}
        </main>
      </div>
    </>
  );
}

export default function Profile() {
  return <ProfileGuard><ProfileContent /></ProfileGuard>;
}
