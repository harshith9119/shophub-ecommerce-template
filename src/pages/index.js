import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import NewsletterSignup from '../components/NewsletterSignup';
import TrustBadges from '../components/TrustBadges';
import PageHead from '../components/PageHead';
import SectionHeader from '../components/ui/SectionHeader';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/motion/Reveal';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getAllProducts } from '../lib/db';
import { formatPrice } from '../lib/utils';
import SiteImage from '../components/SiteImage';
import { SEED_PRODUCTS } from '../lib/seedProducts';

export default function Home() {
  const { settings } = useSiteSettings();
  const { hero, homepage } = settings;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAllProducts().then((data) => setProducts(data.length ? data : SEED_PRODUCTS));
  }, []);

  const getProductsByIds = (ids, fallbackFilter, limit) => {
    if (ids && ids.length > 0) {
      return ids.map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, limit);
    }
    return products.filter(fallbackFilter).slice(0, limit);
  };

  const bestSellers = getProductsByIds(homepage.bestSellersProducts, (p) => p.bestSeller, 6);
  const newArrivals = getProductsByIds(homepage.newArrivalsProducts, (p) => p.newArrival, 4);
  const forMoments = getProductsByIds(homepage.forMomentsProducts, (p) => p.featured, 6);
  const productOfWeek = homepage.productOfWeek ? products.find(p => p.id === homepage.productOfWeek) : (products.find((p) => p.bestSeller) || products[0]);
  const compareProducts = getProductsByIds(homepage.compareProducts, () => true, 2);

  return (
    <>
      <PageHead preloadImage={hero?.image} />
      <div className="bg-page min-h-screen transition-colors duration-500">
        <Navbar transparent />

        <HeroSection hero={hero} general={settings.general} />

        {/* Limited Picks — editorial banner */}
        {homepage.showLimitedPicks !== false && (
        <section className="relative bg-[#050c09] text-white overflow-hidden py-16 md:py-24 border-y border-gold/15">
          <div className="absolute inset-0 bg-grain opacity-[0.12] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="luxury-container relative z-10 text-center">
            <FadeIn>
              <p className="text-[10px] md:text-xs font-sans font-semibold uppercase tracking-[0.35em] text-gold mb-4">
                {hero.secondaryTitle || 'Limited Picks'}
              </p>
              
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-white mb-6">
                {hero.secondarySubtitle || 'Just For You'}
              </h2>

              <div className="flex items-center justify-center gap-3 my-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/30"></div>
                <span className="text-gold text-xs">◆</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/30"></div>
              </div>

              <p className="text-white/70 font-light text-xs sm:text-sm max-w-lg mx-auto mb-8 leading-relaxed font-sans">
                Indulge in our exclusively curated master drapes. Each handpicked piece represents absolute refinement, crafted for celebrations that demand nothing less than royalty.
              </p>

              <Link 
                href="/catalog" 
                className="inline-flex items-center gap-2.5 px-7 py-3 bg-gold hover:bg-gold-light text-charcoal font-sans font-semibold text-[10px] uppercase tracking-luxury transition-all duration-300 rounded-none shadow-md"
              >
                View Collection
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            </FadeIn>
          </div>
        </section>
        )}

        {/* Beyond Fashion split */}
        {homepage.showBeyondFashion !== false && (
        <section className="luxury-section bg-page">
          <div className="luxury-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="right">
                <p className="luxury-subheading mb-4">Beyond Fashion</p>
                <h2 className="luxury-heading mb-6">Styles That Speak Royalty</h2>
                <p className="text-muted font-light leading-relaxed mb-8 max-w-md">
                  Our aim: bringing you elegant, handpicked sarees with timeless charm — curated for the woman who chooses grace over excess.
                </p>
                <Link href="/catalog" className="luxury-btn">
                  Find Your Style
                </Link>
              </FadeIn>
              <FadeIn direction="left" delay={0.2}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SiteImage
                    src={hero.image}
                    alt="Premium saree"
                    className="w-full h-full object-cover object-top"
                    width={960}
                    context="gallery"
                  />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-gold/40 hidden md:block" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
        )}

        {/* Best Sellers */}
        {homepage.showBestSellers && bestSellers.length > 0 && (
          <section className="luxury-section bg-surface">
            <div className="luxury-container">
              <FadeIn>
                <SectionHeader
                  eyebrow="Timeless Elegance"
                  title={homepage.bestSellersTitle?.replace(/★/g, '').trim() || 'Best Selling'}
                  subtitle="Handpicked masterpieces woven with tradition, adorned for your most cherished moments."
                />
              </FadeIn>
              <div className="product-grid">
                {bestSellers.map((p, i) => (
                  <ProductCard key={p.id || p.slug} product={p} showRating index={i} />
                ))}
              </div>
              <FadeIn delay={0.3}>
                <div className="text-center mt-16">
                  <Link href="/catalog" className="luxury-btn-outline">View All Designs</Link>
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Lookbook */}
        {homepage.showLookbook && homepage.lookbookItems?.length > 0 && (
          <section className="relative bg-gradient-to-b from-[#030605] to-[#06120e] text-white overflow-hidden py-24 md:py-32 border-t border-gold/15">
            <div className="absolute inset-0 bg-grain opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.05)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="luxury-container mb-16">
              <FadeIn>
                <SectionHeader
                  eyebrow="Curated Collections"
                  title={homepage.lookbookTitle || 'Lookbook'}
                  subtitle="Discover sarees crafted for weddings, festivals, and every celebration."
                  light
                />
              </FadeIn>
            </div>

            <div className="luxury-container">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
                {homepage.lookbookItems.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.15}>
                    <Link href={item.link || '/catalog'} className="group relative block aspect-[4/5] overflow-hidden border border-gold/10 hover:border-gold/35 transition-all duration-700 shadow-luxury">
                      {/* Inner gold card borders for a framed, premium editorial effect */}
                      <div className="absolute inset-3 border border-gold/5 z-20 pointer-events-none group-hover:border-gold/25 transition-colors duration-500" />
                      <div className="absolute top-4 left-4 w-3.5 h-3.5 border-l border-t border-gold/20 z-20 group-hover:border-gold/45 transition-colors duration-500" />
                      <div className="absolute top-4 right-4 w-3.5 h-3.5 border-r border-t border-gold/20 z-20 group-hover:border-gold/45 transition-colors duration-500" />
                      <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-l border-b border-gold/20 z-20 group-hover:border-gold/45 transition-colors duration-500" />
                      <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-r border-b border-gold/20 z-20 group-hover:border-gold/45 transition-colors duration-500" />

                      <SiteImage src={item.image} alt={item.title} className="w-full h-full object-cover object-top transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]" width={800} context="gallery" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030605] via-charcoal/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-30">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-gold mb-2 font-semibold font-sans">{item.subtitle}</p>
                        <h3 className="font-serif text-xl md:text-2xl font-light tracking-wide text-white group-hover:text-gold-light transition-colors duration-500">{item.title}</h3>
                        <span className="inline-flex items-center gap-1.5 mt-3.5 text-[9px] uppercase tracking-luxury text-gold-light/70 group-hover:text-gold transition-colors duration-300 font-sans font-medium">
                          Explore Collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {homepage.showNewArrivals && newArrivals.length > 0 && (
          <section className="luxury-section bg-surface-alt">
            <div className="luxury-container">
              <FadeIn>
                <SectionHeader
                  eyebrow={homepage.newArrivalsSubtitle || 'Just For You'}
                  title={homepage.newArrivalsTitle || 'New Arrivals'}
                />
              </FadeIn>
              <div className="product-grid">
                {newArrivals.map((p, i) => (
                  <ProductCard key={p.id || p.slug} product={p} showRating index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* For Your Moments */}
        {homepage.showForMoments !== false && forMoments.length > 0 && (
          <section className="luxury-section bg-page">
            <div className="luxury-container">
              <FadeIn>
                <SectionHeader 
                  eyebrow={homepage.forMomentsSubtitle || 'Celebrate Life'} 
                  title={homepage.forMomentsTitle || 'For Your Moments'} 
                />
              </FadeIn>
              <div className="product-grid">
                {forMoments.map((p, i) => (
                  <ProductCard key={p.id || p.slug} product={p} showRating index={i} />
                ))}
              </div>
              <FadeIn delay={0.2}>
                <div className="text-center mt-16">
                  <Link href="/catalog" className="luxury-btn">Discover More</Link>
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Compare Section */}
        {homepage.showCompare && compareProducts.length >= 2 && (
          <section className="luxury-section bg-surface">
            <div className="luxury-container">
              <FadeIn>
                <SectionHeader
                  title={homepage.compareTitle || 'Compare & Choose'}
                  subtitle={homepage.compareSubtitle}
                />
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                {compareProducts.map((p, i) => (
                  <FadeIn key={p.id || p.slug} delay={i * 0.15}>
                    <Link href={`/product/${p.slug || p.id}`} className="group block relative overflow-hidden">
                      <div className="aspect-[3/4] overflow-hidden">
                        <SiteImage src={p.image} alt={p.title} className="w-full h-full object-cover object-top transition-transform duration-[1.2s] group-hover:scale-105" width={800} context="gallery" />
                      </div>
                      <div className="absolute inset-0 bg-emerald/0 group-hover:bg-emerald/20 transition-colors duration-500 flex items-end">
                        <div className="w-full p-8 bg-gradient-to-t from-charcoal/90 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-gold text-[10px] uppercase tracking-luxury mb-2">I Like This Color</p>
                          <h3 className="font-serif text-xl text-white mb-2">{p.title}</h3>
                          <span className="text-white/70 text-sm">{formatPrice(p.salePrice)} — View Product →</span>
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Story sections */}
        {homepage.showStory !== false && (
        <section className="luxury-section bg-surface-alt">
          <div className="luxury-container max-w-4xl">
            <StaggerContainer className="space-y-16">
              {(homepage.storySections && homepage.storySections.length > 0 ? homepage.storySections : [
                { num: '01', title: 'Handpicked Collections', text: 'Every saree at ShopHub is carefully chosen to celebrate grace, tradition, and modern femininity. From subtle everyday drapes to statement festive pieces, our collections are designed to make every woman feel effortlessly elegant.' },
                { num: '02', title: 'For Every Celebration', text: "Whether it's a wedding, festive gathering, evening celebration, or a simple special moment, ShopHub brings sarees that become part of your memories, confidence, and personal style." },
              ]).map((s, idx) => (
                <StaggerItem key={s.num || idx}>
                  <div className="flex gap-8 items-start">
                    <span className="font-serif text-5xl text-gold/30 font-light flex-shrink-0">{s.num || `0${idx + 1}`}</span>
                    <div>
                      <h3 className="font-serif text-2xl text-emerald mb-4">{s.title}</h3>
                      <p className="text-muted font-light leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
        )}

        {/* Product of the Week */}
        {homepage.showProductOfWeek && productOfWeek && (
          <section className="luxury-section bg-charcoal text-white overflow-hidden">
            <div className="luxury-container">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <FadeIn direction="right">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <SiteImage src={productOfWeek.image} alt={productOfWeek.title} className="w-full h-full object-cover object-top" width={960} context="gallery" priority />
                    <div className="absolute top-6 left-6 bg-gold text-white text-[9px] font-sans font-semibold uppercase tracking-luxury px-4 py-2">
                      Selection of the Week
                    </div>
                  </div>
                </FadeIn>
                <FadeIn direction="left" delay={0.2}>
                  <p className="luxury-subheading text-gold-light mb-4">Our Selection</p>
                  <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6 leading-tight">{productOfWeek.title}</h2>
                  <p className="text-white/60 font-light leading-relaxed mb-8">{productOfWeek.description?.slice(0, 220)}...</p>
                  <div className="flex items-baseline gap-4 mb-10">
                    <span className="font-sans text-2xl font-semibold text-gold">{formatPrice(productOfWeek.salePrice)}</span>
                    {productOfWeek.regularPrice > productOfWeek.salePrice && (
                      <span className="text-white/40 line-through font-light">{formatPrice(productOfWeek.regularPrice)}</span>
                    )}
                  </div>
                  <Link href={`/product/${productOfWeek.slug || productOfWeek.id}`} className="luxury-btn-gold">
                    Shop This Saree
                  </Link>
                </FadeIn>
              </div>
            </div>
          </section>
        )}

        {/* About */}
        {homepage.showAbout && homepage.aboutSections?.length > 0 && (
          <section className="luxury-section bg-page">
            <div className="luxury-container">
              <FadeIn>
                <SectionHeader
                  eyebrow="About ShopHub"
                  title={homepage.aboutTitle || 'Elegance in Every Drape'}
                />
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                {homepage.aboutSections.map((s, i) => (
                  <FadeIn key={i} delay={i * 0.12}>
                    <div className="text-center md:text-left border-t border-gold/30 pt-8">
                      <h3 className="font-sans text-[10px] font-semibold uppercase tracking-luxury text-gold mb-4">{s.title}</h3>
                      <p className="text-muted font-light leading-relaxed text-sm">{s.text}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        <TrustBadges />
        {homepage.showNewsletter && <NewsletterSignup />}
      </div>
    </>
  );
}


