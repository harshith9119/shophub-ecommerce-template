import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import PageHead from '../components/PageHead';
import { FadeIn } from '../components/motion/Reveal';
import { useUserAuth } from '../context/UserAuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

const inputClass = 'w-full px-5 py-4 bg-surface-alt dark:bg-surface border border-soft text-body placeholder-subtle/50 text-sm font-light focus:outline-none focus:border-gold transition-colors';

export default function Login() {
  const router = useRouter();
  const { signIn, signUp, resendConfirmation, error, setError, isLoggedIn } = useUserAuth();
  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    address: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    if (router.query.tab === 'register') setTab('register');
  }, [router.query.tab]);

  useEffect(() => {
    if (isLoggedIn) router.replace('/profile');
  }, [isLoggedIn, router]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setShowResend(false);
    const result = await signIn(signInForm.email, signInForm.password);
    if (result.success) router.push('/profile');
    else if (result.needsEmailConfirm) setShowResend(true);
    setLoading(false);
  };

  const handleResend = async () => {
    if (!signInForm.email) {
      setError('Enter your email address first.');
      return;
    }
    setResending(true);
    const result = await resendConfirmation(signInForm.email);
    if (result.success) {
      setMessage('Confirmation email sent! Check your inbox and spam folder.');
      setShowResend(false);
    }
    setResending(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (registerForm.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const result = await signUp(registerForm);
    if (result.success) {
      if (result.needsEmailConfirm) {
        setMessage('Account created! Check your email to confirm, then sign in.');
        setTab('signin');
      } else {
        router.push('/profile');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <PageHead title={tab === 'register' ? 'Create Account' : 'Sign In'} />
      <div className="bg-page min-h-screen transition-colors duration-500">
        <Navbar />
        <main className="luxury-container pt-36 pb-24 md:pt-44 flex justify-center">
          <FadeIn className="w-full max-w-lg">
            <div className="text-center mb-10">
              <p className="luxury-subheading mb-3">Welcome to ShopHub</p>
              <h1 className="font-serif text-3xl md:text-4xl text-emerald dark:text-gold-light font-medium">
                {tab === 'register' ? 'Create Account' : 'Sign In'}
              </h1>
            </div>

            {!isSupabaseConfigured() && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-300 text-sm font-light">
                Supabase is not connected. Add <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and your anon key to <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1">.env.local</code>.
              </div>
            )}

            <div className="flex mb-8 border border-soft shadow-sm overflow-hidden">
              {['signin', 'register'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setError(null); setMessage(''); }}
                  className={`flex-1 py-4 text-[11px] font-sans font-semibold uppercase tracking-luxury transition-all duration-300 ${
                    tab === t 
                      ? 'bg-emerald text-white dark:bg-gold dark:text-charcoal' 
                      : 'bg-surface text-subtle hover:text-emerald dark:hover:text-gold-light hover:bg-surface-alt/50'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <div className="bg-surface border border-soft p-8 md:p-10 shadow-luxury transition-all duration-500">
              {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm font-light">{error}</div>}
              {message && <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-gold-light text-sm font-light">{message}</div>}

              {tab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Email Address</label>
                    <input type="email" required value={signInForm.email} onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })} className={inputClass} placeholder="Enter your email" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Password</label>
                    <input type="password" required value={signInForm.password} onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })} className={inputClass} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                  </div>
                  <button type="submit" disabled={loading || !isSupabaseConfigured()} className="luxury-btn w-full disabled:opacity-50 mt-2">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                  {showResend && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="w-full text-xs text-emerald dark:text-gold-light hover:text-gold hover:underline mt-2 font-medium transition-colors"
                    >
                      {resending ? 'Sending...' : 'Resend confirmation email'}
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Full Name *</label>
                    <input required value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} className={inputClass} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Email Address *</label>
                    <input type="email" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className={inputClass} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Phone Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-surface-alt border border-r-0 border-soft text-sm text-subtle font-light font-mono">+91</span>
                      <input type="tel" required maxLength={10} pattern="[0-9]{10}" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={`${inputClass} rounded-none`} placeholder="9876543210" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Password *</label>
                      <input type="password" required minLength={8} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className={inputClass} placeholder="Min. 8 chars" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Confirm *</label>
                      <input type="password" required value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} className={inputClass} placeholder="Repeat password" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Delivery Address</label>
                    <textarea value={registerForm.address} onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Street, landmark, etc." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">City</label>
                      <input value={registerForm.city} onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })} className={inputClass} placeholder="City name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">State</label>
                      <input value={registerForm.state} onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })} className={inputClass} placeholder="State" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-luxury text-subtle mb-2.5">Pincode</label>
                    <input value={registerForm.pincode} onChange={(e) => setRegisterForm({ ...registerForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} maxLength={6} className={inputClass} placeholder="600001" />
                  </div>
                  <button type="submit" disabled={loading || !isSupabaseConfigured()} className="luxury-btn w-full mt-2 disabled:opacity-50">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>

            <p className="text-center mt-8 text-sm text-subtle font-light">
              Store owner? <Link href="/admin/login" className="text-emerald dark:text-gold-light hover:text-gold font-medium transition-colors">Admin login</Link>
            </p>
          </FadeIn>
        </main>
      </div>
    </>
  );
}


