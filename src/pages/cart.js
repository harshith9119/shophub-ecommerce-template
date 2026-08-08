import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHead from '../components/PageHead';
import { FadeIn } from '../components/motion/Reveal';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { formatPrice } from '../lib/utils';
import SiteImage from '../components/SiteImage';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();
  const { settings } = useSiteSettings();
  const shipping = settings.general?.shippingCharge || 150;
  const total = subtotal + (items.length ? shipping : 0);

  return (
    <>
      <PageHead title="Your Bag" />
      <div className="bg-page min-h-screen transition-colors duration-500">
        <Navbar />

        <main className="luxury-container pt-32 pb-20 md:pt-40">
          <FadeIn>
            <p className="luxury-subheading mb-3">Shopping</p>
            <h1 className="font-serif text-4xl md:text-5xl text-emerald dark:text-gold-light font-medium mb-14 flex items-center gap-4">
              Your Bag
              <span className="text-lg text-muted font-sans font-light">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            </h1>
          </FadeIn>

          {items.length === 0 ? (
            <FadeIn>
              <div className="text-center py-24 border border-soft bg-surface">
                <ShoppingBag className="w-12 h-12 text-cream mx-auto mb-6" strokeWidth={1} />
                <p className="font-serif text-2xl text-emerald dark:text-gold-light mb-3">Your bag is empty</p>
                <p className="text-muted font-light mb-10">Discover our curated collection of premium sarees</p>
                <Link href="/catalog" className="luxury-btn inline-flex">
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                {items.map((item, i) => (
                  <FadeIn key={item.id} delay={i * 0.08}>
                    <div className="flex gap-6 bg-surface border border-soft p-5 md:p-6 group hover:border-gold/30 transition-colors duration-500">
                      <div className="w-24 md:w-32 aspect-[3/4] flex-shrink-0 overflow-hidden bg-surface-alt">
                        <SiteImage src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-serif text-lg text-emerald dark:text-gold-light mb-2 leading-snug">{item.title}</h3>
                          <p className="font-sans font-semibold text-body">{formatPrice(item.salePrice)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-cream">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-cream transition-colors">
                              <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-cream transition-colors">
                              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted hover:text-red-500 p-2 transition-colors">
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center font-sans font-semibold text-body">
                        {formatPrice(item.salePrice * item.quantity)}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.2}>
                <div className="bg-surface border border-soft p-8 sticky top-32">
                  <h2 className="font-serif text-xl text-emerald dark:text-gold-light mb-8">Order Summary</h2>
                  <div className="space-y-4 mb-8 pb-8 border-b border-cream">
                    <div className="flex justify-between text-sm font-light text-muted">
                      <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-light text-muted">
                      <span>Shipping</span><span>{formatPrice(shipping)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xl font-sans font-semibold text-body mb-8">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                  <Link href="/checkout" className="luxury-btn w-full text-center block">
                    Proceed to Checkout
                  </Link>
                  <Link href="/catalog" className="block text-center mt-4 text-[11px] uppercase tracking-wide text-muted hover:text-emerald transition-colors">
                    Continue Shopping
                  </Link>
                </div>
              </FadeIn>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
