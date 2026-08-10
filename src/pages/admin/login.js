import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHead from '../../components/PageHead';

export default function AdminLogin() {
  const [email, setEmail] = useState('abcdef@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [submitting, setSubmitting] = useState(false);
  const { login, error, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/admin/dashboard');
  }, [user, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    if (result.success) router.push('/admin/dashboard');
    setSubmitting(false);
  };

  return (
    <>
      <PageHead title="Admin Login" />
      <div className="min-h-screen flex items-center justify-center bg-charcoal py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full relative z-10"
        >
          <div className="text-center mb-10">
            <p className="luxury-subheading text-gold mb-4">Administration</p>
            <h1 className="font-serif text-3xl text-white font-medium tracking-wide">ShopHub</h1>
          </div>

          <div className="bg-charcoal border border-white/10 p-10 shadow-luxury-lg">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 border border-gold/30 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-gold" strokeWidth={1.25} />
              </div>
              <p className="text-white/50 text-sm font-light">Secure owner access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-300 px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-wide text-gold mb-2">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-wide text-gold mb-2">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="admin-input" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={submitting} className="admin-btn w-full uppercase tracking-wide">
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-8">
              <Link href="/" className="text-white/30 hover:text-gold text-sm font-light transition-colors">&larr; Return to Storefront</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

AdminLogin.displayName = 'AdminPage';


