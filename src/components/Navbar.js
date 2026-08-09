import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import MarqueeBar from './ui/MarqueeBar';
import SiteImage from './SiteImage';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ transparent = false }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const { isLoggedIn, profile } = useUserAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const { general } = settings;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Collection' },
    { href: '/contact', label: 'Contact' },
  ];

  const isHome = router.pathname === '/';
  const navDark = scrolled || !isHome || !transparent;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <MarqueeBar text={general.shippingBanner?.replace(//g, '').trim()} />

      <nav
        className={`transition-all duration-700 ${
          navDark ? 'glass-nav shadow-sm py-3' : 'bg-transparent py-5 md:py-6'
        }`}
      >
        <div className="luxury-container flex justify-between items-center">
          {/* Left — desktop links */}
          <div className="hidden lg:flex items-center gap-10 flex-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-[11px] font-sans font-medium uppercase tracking-wide transition-colors duration-300 ${
                  navDark
                    ? 'text-charcoal dark:text-ivory/90 hover:text-gold'
                    : 'text-white/90 hover:text-gold-light'
                } ${router.pathname === href ? 'text-gold' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`lg:hidden p-2 transition-colors ${navDark ? 'text-charcoal dark:text-ivory' : 'text-white'}`}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Center logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center group whitespace-nowrap">
            {general.logoUrl ? (
              <SiteImage src={general.logoUrl} alt={general.brandName} className="h-8 md:h-10 object-contain" priority />
            ) : (
              <span
                className={`font-serif text-[15px] sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-[0.12em] whitespace-nowrap transition-colors duration-300 ${
                  navDark ? 'text-emerald dark:text-gold-light group-hover:text-gold' : 'text-white group-hover:text-gold-light'
                }`}
              >
                {general.brandName || 'ShopHub'}
              </span>
            )}
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-1 justify-end">
            {/* Desktop-only theme, search, account */}
            <div className="hidden lg:block">
              <ThemeToggle lightNav={!navDark} />
            </div>
            
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`hidden lg:block p-2.5 transition-colors duration-300 ${navDark ? 'text-charcoal dark:text-ivory/90 hover:text-gold' : 'text-white hover:text-gold-light'}`}
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            <Link
              href={isLoggedIn ? '/profile' : '/login'}
              className={`hidden lg:block p-2.5 transition-colors duration-300 ${navDark ? 'text-charcoal dark:text-ivory/90 hover:text-gold' : 'text-white hover:text-gold-light'}`}
              aria-label="Account"
              title={isLoggedIn ? profile?.name || 'My Profile' : 'Login'}
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>

            {/* Cart — visible everywhere */}
            <Link
              href="/cart"
              className={`relative p-2.5 transition-colors duration-300 ${navDark ? 'text-charcoal dark:text-ivory/90 hover:text-gold' : 'text-white hover:text-gold-light'}`}
              aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>

        {/* Search bar (Desktop) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-soft hidden lg:block"
            >
              <form onSubmit={handleSearch} className="luxury-container py-4 flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search our collection..."
                  className="flex-1 px-5 py-3 bg-surface-alt border border-soft text-body text-sm font-light focus:outline-none focus:border-gold transition-colors"
                  autoFocus
                />
                <button type="submit" className="luxury-btn px-8 py-3">
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[75%] max-w-[290px] bg-page z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-5 border-b border-soft">
                <span className="font-serif text-lg text-emerald dark:text-gold-light tracking-wider font-semibold">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="p-1">
                  <X className="w-5 h-5 text-body" strokeWidth={1.5} />
                </button>
              </div>

              {/* Mobile Search inside Drawer */}
              <div className="p-4 border-b border-soft bg-surface-alt/40">
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collection..."
                    className="w-full pl-3 pr-10 py-2 bg-surface border border-soft text-body text-xs rounded-none font-light focus:outline-none focus:border-gold transition-colors"
                  />
                  <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-subtle hover:text-gold transition-colors" aria-label="Submit search">
                    <Search className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </form>
              </div>

              <nav className="flex-1 p-6 space-y-5 overflow-y-auto">
                {links.map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block font-serif text-xl tracking-wide transition-colors ${
                        router.pathname === href ? 'text-gold' : 'text-emerald dark:text-gold-light hover:text-gold'
                      }`}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: links.length * 0.05 }}
                >
                  <Link
                    href={isLoggedIn ? '/profile' : '/login'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block font-serif text-xl tracking-wide transition-colors ${
                      router.pathname === (isLoggedIn ? '/profile' : '/login') ? 'text-gold' : 'text-emerald dark:text-gold-light hover:text-gold'
                    }`}
                  >
                    {isLoggedIn ? 'My Profile' : 'Login / Register'}
                  </Link>
                </motion.div>

                {/* Appearance section inside drawer */}
                <div className="pt-5 border-t border-soft/50 flex items-center justify-between">
                  <span className="text-[11px] font-sans uppercase tracking-wider text-subtle font-medium">Appearance</span>
                  <ThemeToggle />
                </div>
              </nav>

              <div className="p-6 border-t border-soft bg-surface-alt/30">
                <p className="text-[9px] uppercase tracking-luxury text-subtle mb-1">Contact Support</p>
                <p className="text-xs text-body font-light break-all">{general.supportEmail}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}


