import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHead from '../components/PageHead';
import { FadeIn } from '../components/motion/Reveal';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useUserAuth } from '../context/UserAuthContext';
import { createOrder } from '../lib/db';
import { openRazorpayCheckout } from '../lib/payments';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSetupStatus } from '../lib/setupStatus';
import { formatPrice, PAYMENT_METHODS } from '../lib/utils';
import SiteImage from '../components/SiteImage';

const inputClass = 'w-full px-5 py-4 bg-surface-alt border border-soft text-body text-sm font-light focus:outline-none focus:border-gold transition-colors';

export default function Checkout() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const { user, profile } = useUserAuth();
  const shipping = settings.general?.shippingCharge || 150;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', paymentMethod: 'cod', notes: '',
  });
  
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null); // { code, amount, type }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState({
    supabase: isSupabaseConfigured(),
    supabaseLive: isSupabaseConfigured(),
    razorpay: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
  });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setError('');
    
    if (!couponCode) return;
    
    const activeCoupons = settings?.coupons?.filter(c => c.active) || [];
    const matched = activeCoupons.find(c => c.code === couponCode.toUpperCase());
    
    if (!matched) {
      setDiscountInfo(null);
      setError('Invalid or expired coupon code.');
      return;
    }
    
    if (matched.minPurchase > subtotal) {
      setDiscountInfo(null);
      setError(`This coupon requires a minimum purchase of ₹${matched.minPurchase}`);
      return;
    }
    
    let amount = 0;
    if (matched.type === 'percentage') {
      amount = Math.round((subtotal * matched.value) / 100);
    } else if (matched.type === 'fixed') {
      amount = matched.value;
    } else if (matched.type === 'free_shipping') {
      amount = shipping; // We handle free shipping by discounting the shipping amount
    }
    
    setDiscountInfo({ code: matched.code, amount, type: matched.type });
  };
  
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountInfo(null);
  };

  const currentTotal = subtotal + shipping - (discountInfo?.amount || 0);

  useEffect(() => {
    let cancelled = false;

    const loadServices = async () => {
      try {
        const res = await fetch('/api/setup/status');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setServices(data);
          return;
        }
      } catch {
        // API unavailable on static export (Vercel) — fall back to client check
      }

      try {
        const data = await getSetupStatus();
        if (!cancelled) setServices(data);
      } catch {
        if (!cancelled) setServices({ supabase: false, supabaseLive: false, razorpay: false });
      }
    };

    loadServices();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone?.replace('+91', '') || prev.phone,
        address: profile.address || prev.address,
        city: profile.city || prev.city,
        state: profile.state || prev.state,
        pincode: profile.pincode || prev.pincode,
      }));
    }
  }, [profile, user]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ivory">
        <p className="font-serif text-xl text-emerald dark:text-gold-light">Your bag is empty</p>
        <Link href="/catalog" className="luxury-link">Continue Shopping</Link>
      </div>
    );
  }

  useEffect(() => {
    if (settings.general && settings.general.enableCOD === false && form.paymentMethod === 'cod') {
      setForm(prev => ({ ...prev, paymentMethod: 'razorpay' }));
    }
  }, [settings.general?.enableCOD]);

  const activePaymentMethods = PAYMENT_METHODS.filter((m) => {
    if (m.id === 'cod' && settings.general?.enableCOD === false) return false;
    return true;
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const buildOrderData = (orderNumber) => {
    let finalNotes = form.notes || '';
    if (discountInfo) {
      finalNotes = `[DISCOUNT APPLIED: ${discountInfo.code} for ₹${discountInfo.amount}] ` + finalNotes;
    }

    return {
      ...form,
      notes: finalNotes.trim(),
      userId: user?.id || null,
      items: items.map((i) => ({ id: i.id, title: i.title, salePrice: i.salePrice, quantity: i.quantity, image: i.image })),
      subtotal,
      shipping,
      discountAmount: discountInfo?.amount || 0,
      discountCode: discountInfo?.code || null,
      total: currentTotal,
      orderNumber,
    };
  };

  const handleCodOrder = async (orderNumber) => {
    const result = await createOrder({
      ...buildOrderData(orderNumber),
      paymentStatus: 'cod',
      status: 'pending',
    });
    clearCart();
    router.push(`/order-confirmation?order=${result.orderNumber}`);
  };

  const handleRazorpayOrder = async (orderNumber) => {
    const paymentRes = await fetch('/api/payments/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: currentTotal * 100,
        orderNumber: orderNumber,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
      }),
    });

    const paymentData = await paymentRes.json();
    if (!paymentRes.ok) {
      throw new Error(paymentData.error || 'Online payment is not available yet.');
    }

    await openRazorpayCheckout({
      keyId: paymentData.keyId,
      amount: paymentData.amount,
      orderNumber: orderNumber,
      razorpayOrderId: paymentData.razorpayOrderId,
      customer: { name: form.name, email: form.email, phone: form.phone },
      onSuccess: async (response) => {
        // Create order ONLY when payment is successful
        const orderResult = await createOrder({
          ...buildOrderData(orderNumber),
          paymentStatus: 'paid',
          status: 'processing',
        });
        
        const verifyRes = await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...response,
            orderId: orderResult.id,
          }),
        });
        if (!verifyRes.ok) throw new Error('Payment verification failed');
        clearCart();
        router.push(`/order-confirmation?order=${orderResult.orderNumber}&paid=1`);
      },
      onFailure: () => {
        setError('Payment was not completed. Please try again.');
        setLoading(false);
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!services.supabase || !services.supabaseLive) {
      setError(
        services.supabase
          ? 'Database tables are not set up yet. Run supabase/schema.sql in your Supabase SQL Editor.'
          : 'Store database is not connected yet. Please contact the store owner or try again later.'
      );
      setLoading(false);
      return;
    }

    if (form.paymentMethod === 'razorpay' && !services.razorpay) {
      setError('Online payment is not set up yet. Please choose Cash on Delivery.');
      setLoading(false);
      return;
    }

    const orderNumber = `PS${Date.now().toString().slice(-8)}`;

    try {
      if (form.paymentMethod === 'razorpay') {
        await handleRazorpayOrder(orderNumber);
      } else {
        await handleCodOrder(orderNumber);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again or contact us on WhatsApp.');
      setLoading(false);
    }
  };

  return (
    <>
      <PageHead title="Checkout" />
      <div className="bg-page min-h-screen transition-colors duration-500">
        <Navbar />
        <main className="luxury-container pt-32 pb-20 md:pt-40">
          <FadeIn>
            <p className="luxury-subheading mb-3">Secure Checkout</p>
            <h1 className="font-serif text-4xl md:text-5xl text-emerald dark:text-gold-light font-medium mb-14">Complete Your Order</h1>
          </FadeIn>

          {(!services.supabase || !services.supabaseLive) && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 text-amber-900 text-sm font-light">
              {services.supabase ? (
                <>
                  <strong className="font-medium">Database tables missing.</strong> Supabase is connected but the orders table is not ready. Run <code className="text-xs bg-amber-100 px-1">supabase/schema.sql</code> in the Supabase SQL Editor, then try again.
                </>
              ) : (
                <>
                  <strong className="font-medium">Database not connected.</strong> Add Supabase keys to your environment variables (local: <code className="text-xs bg-amber-100 px-1">.env.local</code>, production: Vercel → Settings → Environment Variables), then redeploy.
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-8">
              <FadeIn>
                <div className="bg-surface border border-soft p-8">
                  <h2 className="font-serif text-xl text-emerald dark:text-gold-light mb-8">Shipping Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { name: 'name', label: 'Full Name', type: 'text' },
                      { name: 'email', label: 'Email', type: 'email' },
                      { name: 'phone', label: 'Phone', type: 'tel' },
                      { name: 'pincode', label: 'Pincode', type: 'text' },
                      { name: 'city', label: 'City', type: 'text' },
                      { name: 'state', label: 'State', type: 'text' },
                    ].map(({ name, label, type }) => (
                      <div key={name}>
                        <label className="block text-[10px] font-sans font-semibold uppercase tracking-wide text-muted mb-2">{label}</label>
                        <input type={type} name={name} required value={form[name]} onChange={handleChange} className={inputClass} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <label className="block text-[10px] font-sans font-semibold uppercase tracking-wide text-muted mb-2">Full Address</label>
                    <textarea name="address" required rows={3} value={form.address} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="mt-5">
                    <label className="block text-[10px] font-sans font-semibold uppercase tracking-wide text-muted mb-2">Order Notes (optional)</label>
                    <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="bg-surface border border-soft p-8">
                  <h2 className="font-serif text-xl text-emerald dark:text-gold-light mb-8">Payment Method</h2>
                  <div className="space-y-3">
                    {activePaymentMethods.map((m) => {
                      const disabled = m.requiresOnline && !services.razorpay;
                      return (
                        <label
                          key={m.id}
                          className={`flex items-start gap-4 p-5 border transition-all duration-300 ${
                            disabled ? 'opacity-50 cursor-not-allowed border-cream' :
                            form.paymentMethod === m.id ? 'border-gold bg-gold/5 cursor-pointer' : 'border-cream hover:border-gold/40 cursor-pointer'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={m.id}
                            checked={form.paymentMethod === m.id}
                            onChange={handleChange}
                            disabled={disabled}
                            className="mt-1 accent-emerald"
                          />
                          <div>
                            <p className="font-sans text-sm font-medium text-body">{m.label}</p>
                            <p className="text-muted text-xs font-light mt-1">
                              {disabled ? 'Not configured yet — add Razorpay keys to .env.local' : m.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.2} className="lg:col-span-2">
              <div className="bg-surface border border-soft p-8 sticky top-32">
                <h2 className="font-serif text-xl text-emerald dark:text-gold-light mb-8">Order Summary</h2>
                <div className="space-y-4 mb-6 max-h-52 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-16 flex-shrink-0 overflow-hidden bg-surface-alt">
                        <SiteImage src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-light line-clamp-2 text-body">{item.title}</p>
                        <p className="text-muted text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.salePrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Discount Code Section */}
                <div className="border-t border-cream pt-6 mb-6">
                  {!discountInfo ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Discount Code" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)}
                        className={`${inputClass} !py-3 flex-1 uppercase`}
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        type="button" 
                        className="px-6 bg-emerald dark:bg-gold-light text-white dark:text-charcoal font-medium text-sm transition-opacity hover:opacity-90"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gold/10 border border-gold/30 p-3 rounded text-sm">
                      <div className="flex items-center gap-2 text-emerald dark:text-gold-light font-medium">
                        <Tag className="w-4 h-4" />
                        <span>{discountInfo.code}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveCoupon} 
                        className="text-muted hover:text-red-500 text-xs uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-cream pt-6 mb-8">
                  <div className="flex justify-between text-sm font-light text-muted"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-sm font-light text-muted"><span>Shipping</span><span>{formatPrice(shipping)}</span></div>
                  {discountInfo && (
                    <div className="flex justify-between text-sm font-medium text-emerald dark:text-gold-light">
                      <span>Discount ({discountInfo.code})</span>
                      <span>-{formatPrice(discountInfo.amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-sans font-semibold text-body pt-3"><span>Total</span><span>{formatPrice(currentTotal)}</span></div>
                </div>
                {error && <p className="text-red-500 text-sm mb-4 font-light">{error}</p>}
                <button type="submit" disabled={loading || !services.supabase || !services.supabaseLive} className="luxury-btn w-full disabled:opacity-50">
                  {loading ? 'Processing...' : form.paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                </button>
              </div>
            </FadeIn>
          </form>
        </main>
      </div>
    </>
  );
}
