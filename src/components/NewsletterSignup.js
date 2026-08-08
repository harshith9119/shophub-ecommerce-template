import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeNewsletter } from '../lib/db';
import { FadeIn } from './motion/Reveal';
import SectionHeader from './ui/SectionHeader';

export default function NewsletterSignup({ title, subtitle }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const result = await subscribeNewsletter(email);
      setStatus(result.duplicate ? 'already' : 'success');
      if (!result.duplicate) setEmail('');
    } catch {
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <section className="relative overflow-hidden bg-emerald">
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="luxury-container luxury-section relative z-10">
        <FadeIn>
          <SectionHeader
            eyebrow="Stay Connected"
            title={title || 'Join the ShopHub Family'}
            subtitle={subtitle || 'Be the first to discover new arrivals, festive collections, exclusive offers, and timeless sarees curated with elegance.'}
            light
            align="center"
          />
        </FadeIn>

        <FadeIn delay={0.2}>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white placeholder-white/40 font-light focus:outline-none focus:border-gold transition-colors backdrop-blur-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-gold text-white text-[11px] font-sans font-semibold uppercase tracking-wide hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Subscribe'}
            </motion.button>
          </form>

          {status === 'success' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold-light text-center mt-6 text-sm font-light">
              Welcome to the family. Thank you for subscribing.
            </motion.p>
          )}
          {status === 'already' && (
            <p className="text-white/60 text-center mt-6 text-sm font-light">You are already part of our family.</p>
          )}
          {status === 'error' && (
            <p className="text-red-300 text-center mt-6 text-sm">Something went wrong. Please try again.</p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}


