import React from 'react';
import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';
import { FadeIn } from './motion/Reveal';
import { useSiteSettings } from '../context/SiteSettingsContext';
import MarqueeBar from './ui/MarqueeBar';

export default function Footer() {
  const { settings } = useSiteSettings();
  const { general, footer, homepage } = settings;

  const policyLinks = [
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/shipping-policy', label: 'Shipping' },
    { href: '/privacy-policy', label: 'Privacy' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <footer className="mt-auto bg-charcoal text-white">
      <MarqueeBar
        text={homepage?.marqueeText || '🚚 Standard Shipping ₹150 on All Orders'}
        className="bg-gold-dark"
      />

      <div className="luxury-container luxury-section pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <FadeIn className="lg:col-span-1">
            <h2 className="font-serif text-2xl md:text-3xl tracking-[0.12em] text-white mb-6">
              {general.brandName}
            </h2>
            <p className="text-white/50 font-light text-sm leading-relaxed mb-6">
              {footer.description}
            </p>
            <div className="flex gap-4">
              <a
                href={`https://wa.me/${general.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </FadeIn>

          {/* Quick links */}
          <FadeIn delay={0.1}>
            <h3 className="text-[10px] font-sans font-semibold uppercase tracking-luxury text-gold mb-6">Explore</h3>
            <ul className="space-y-3">
              {['/', '/catalog', '/contact'].map((href) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-gold text-sm font-light transition-colors duration-300">
                    {href === '/' ? 'Home' : href === '/catalog' ? 'Collection' : 'Contact'}
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Policies */}
          <FadeIn delay={0.2}>
            <h3 className="text-[10px] font-sans font-semibold uppercase tracking-luxury text-gold mb-6">Policies</h3>
            <ul className="space-y-3">
              {policyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-gold text-sm font-light transition-colors duration-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Contact */}
          <FadeIn delay={0.3}>
            <h3 className="text-[10px] font-sans font-semibold uppercase tracking-luxury text-gold mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <a href={`mailto:${general.supportEmail}`} className="text-white/50 hover:text-gold text-sm font-light transition-colors">
                  {general.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-white/50 text-sm font-light">{general.address || 'India'}</span>
              </li>
            </ul>
          </FadeIn>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-[10px] uppercase tracking-luxury">{footer.copyright}</p>
          <p className="text-white/30 text-[10px] font-light">Crafted with elegance for every drape</p>
        </div>
      </div>
    </footer>
  );
}
