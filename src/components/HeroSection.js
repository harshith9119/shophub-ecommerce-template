import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SiteImage from './SiteImage';

export default function HeroSection({ hero }) {
  const titleLines = (hero.title || 'WEAR WHAT\nSTANDS OUT').split('\n');

  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden bg-charcoal">
      {/* Background Media & Premium Overlays */}
      <div className="absolute inset-0">
        <SiteImage
          src={hero.image}
          alt="ShopHub â€” designer saree collection"
          className="w-full h-full object-cover object-top animate-ken-burns scale-105"
          priority
          width={1280}
          context="hero"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030605]/85 via-transparent to-[#030605]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030605]/95 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
      </div>

      {/* Fine-Art Border Framing Overlay */}
      <div className="absolute inset-5 md:inset-8 border border-gold/10 pointer-events-none hidden sm:block z-20" />
      <div className="absolute inset-6 md:inset-9 border border-gold/5 pointer-events-none hidden sm:block z-20" />

      {/* Gold corner accents */}
      <div className="absolute top-32 left-10 md:left-14 w-12 h-12 border-l border-t border-gold/30 hidden sm:block z-20" />
      <div className="absolute top-32 right-10 md:right-14 w-12 h-12 border-r border-t border-gold/30 hidden sm:block z-20" />
      <div className="absolute bottom-10 left-10 md:left-14 w-12 h-12 border-l border-b border-gold/30 hidden sm:block z-20" />
      <div className="absolute bottom-10 right-10 md:right-14 w-12 h-12 border-r border-b border-gold/30 hidden sm:block z-20" />

      <div className="relative z-10 luxury-container pb-24 md:pb-36 pt-36 md:pt-44 w-full">
        <div className="max-w-3xl relative">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] md:text-xs font-sans font-semibold uppercase tracking-[0.35em] text-gold mb-5"
          >
            {hero.subtitle || 'Elegance In Every Drape'}
          </motion.p>

          <h1 className="font-serif text-white leading-[1] mb-6">
            {titleLines.map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white/95"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/75 font-light text-sm sm:text-base md:text-lg max-w-lg mb-10 leading-relaxed font-sans"
          >
            {hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-4"
          >
            <Link href={hero.buttonLink || '/catalog'} className="relative luxury-btn-gold group overflow-hidden">
              {/* Golden shimmer sweep effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-1/2 -skew-x-12 -translate-x-full animate-shimmer-sweep" />
              <span className="relative flex items-center gap-2">
                {hero.buttonText || 'Explore Collection'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" strokeWidth={1.5} />
              </span>
            </Link>
            <Link 
              href="/catalog?category=Silk" 
              className="luxury-btn-outline border-white/20 text-white/90 hover:bg-white hover:text-[#064e3b] hover:border-white backdrop-blur-[2px] transition-all duration-500 rounded-none"
            >
              Premium Silk
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2.5"
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-semibold font-sans">Discover</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent opacity-80" />
        </motion.div>
      </div>
    </section>
  );
}


