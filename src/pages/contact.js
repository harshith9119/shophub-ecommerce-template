import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHead from '../components/PageHead';
import { FadeIn } from '../components/motion/Reveal';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Contact() {
  const { settings } = useSiteSettings();
  const { general, contact } = settings;
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:${general.supportEmail}?subject=Contact from ${form.name}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <PageHead title="Contact" />
      <div className="bg-ivory min-h-screen">
        <Navbar />

        <div className="pt-32 pb-16 md:pt-40 bg-emerald text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-20" />
          <div className="luxury-container relative z-10">
            <FadeIn>
              <p className="luxury-subheading text-gold-light mb-4">Get in Touch</p>
              <h1 className="font-serif text-4xl md:text-6xl font-medium">{contact.title || 'Contact Us'}</h1>
              <p className="text-white/60 font-light mt-4 max-w-lg">{contact.description}</p>
            </FadeIn>
          </div>
        </div>

        <main className="luxury-container luxury-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <FadeIn direction="right">
              <div className="space-y-10">
                {[
                  { icon: Mail, label: 'Email', value: general.supportEmail, href: `mailto:${general.supportEmail}` },
                  general.phone && { icon: Phone, label: 'Phone', value: general.phone, href: `tel:${general.phone}` },
                  { icon: MapPin, label: 'Location', value: general.address || 'India' },
                ].filter(Boolean).map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-5 group">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500 flex-shrink-0">
                      <Icon className="w-5 h-5" strokeWidth={1.25} />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans font-semibold uppercase tracking-luxury text-gold mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-charcoal font-light hover:text-emerald transition-colors">{value}</a>
                      ) : (
                        <p className="text-charcoal font-light">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {contact.showForm !== false && (
              <FadeIn direction="left" delay={0.15}>
                <form onSubmit={handleSubmit} className="bg-white border border-cream p-8 md:p-10">
                  {sent ? (
                    <p className="text-emerald font-serif text-xl text-center py-12">Thank you — your email client should open shortly.</p>
                  ) : (
                    <>
                      <h2 className="font-serif text-2xl text-emerald mb-8">Send a Message</h2>
                      <div className="space-y-5">
                        {['name', 'email'].map((field) => (
                          <div key={field}>
                            <label className="block text-[10px] font-sans font-semibold uppercase tracking-wide text-muted mb-2">{field === 'name' ? 'Name' : 'Email'}</label>
                            <input type={field === 'email' ? 'email' : 'text'} required value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="w-full px-5 py-4 bg-ivory border border-cream text-sm font-light focus:outline-none focus:border-gold transition-colors" />
                          </div>
                        ))}
                        <div>
                          <label className="block text-[10px] font-sans font-semibold uppercase tracking-wide text-muted mb-2">Message</label>
                          <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-5 py-4 bg-ivory border border-cream text-sm font-light focus:outline-none focus:border-gold transition-colors" />
                        </div>
                      </div>
                      <button type="submit" className="luxury-btn w-full mt-8 flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" strokeWidth={1.5} /> Send Message
                      </button>
                    </>
                  )}
                </form>
              </FadeIn>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
