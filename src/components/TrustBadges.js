import React from 'react';
import { Truck, Shield, Headphones, CreditCard } from 'lucide-react';
import { StaggerContainer, StaggerItem } from './motion/Reveal';
import { useSiteSettings } from '../context/SiteSettingsContext';

const ICONS = { truck: Truck, shield: Shield, headphones: Headphones, 'credit-card': CreditCard };

export default function TrustBadges() {
  const { settings } = useSiteSettings();
  const features = settings.features || [];

  return (
    <section className="luxury-section bg-cream border-y border-cream">
      <div className="luxury-container">
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] || Shield;
            return (
              <StaggerItem key={i}>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 border border-gold/30 text-gold mb-5 group-hover:bg-gold group-hover:text-white transition-all duration-500">
                    <Icon className="w-6 h-6" strokeWidth={1.25} />
                  </div>
                  <h3 className="font-sans text-[10px] font-semibold uppercase tracking-luxury text-emerald mb-3">{f.title}</h3>
                  <p className="text-muted text-sm font-light leading-relaxed">{f.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
