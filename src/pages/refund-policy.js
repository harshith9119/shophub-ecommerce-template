import React from 'react';
import Navbar from '../components/Navbar';
import PageHead from '../components/PageHead';
import { FadeIn } from '../components/motion/Reveal';
import { useSiteSettings } from '../context/SiteSettingsContext';

function PolicyPage({ policyKey, title }) {
  const { settings } = useSiteSettings();
  const policy = settings.policies?.[policyKey] || {};

  return (
    <>
      <PageHead title={policy.title || title} />
      <div className="bg-ivory min-h-screen">
        <Navbar />
        <div className="pt-32 pb-12 md:pt-40 bg-emerald text-white">
          <div className="luxury-container">
            <FadeIn>
              <p className="luxury-subheading text-gold-light mb-3">Legal</p>
              <h1 className="font-serif text-4xl md:text-5xl font-medium">{policy.title || title}</h1>
            </FadeIn>
          </div>
        </div>
        <main className="luxury-container luxury-section max-w-3xl">
          <FadeIn delay={0.15}>
            <div className="prose-policy bg-white border border-cream p-8 md:p-12" dangerouslySetInnerHTML={{ __html: policy.content || '<p>Policy content coming soon.</p>' }} />
          </FadeIn>
        </main>
      </div>
    </>
  );
}

export function RefundPolicy() { return <PolicyPage policyKey="refund" title="Refund Policy" />; }
export function ShippingPolicy() { return <PolicyPage policyKey="shipping" title="Shipping Policy" />; }
export function PrivacyPolicy() { return <PolicyPage policyKey="privacy" title="Privacy Policy" />; }

export default RefundPolicy;
