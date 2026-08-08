import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHead from '../components/PageHead';
import { FadeIn } from '../components/motion/Reveal';

export default function OrderConfirmation() {
  const router = useRouter();
  const orderNumber = router.query.order;

  return (
    <>
      <PageHead title="Order Confirmed" />
      <div className="bg-ivory min-h-screen">
        <Navbar />
        <main className="luxury-container pt-32 pb-24 md:pt-40 flex flex-col items-center text-center max-w-lg mx-auto">
          <FadeIn>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 border-2 border-gold rounded-full flex items-center justify-center mb-10"
            >
              <Check className="w-10 h-10 text-gold" strokeWidth={1.5} />
            </motion.div>
            <p className="luxury-subheading mb-4">Thank You</p>
            <h1 className="font-serif text-4xl text-emerald font-medium mb-4">Order Placed</h1>
            <p className="text-muted font-light mb-6">Your exquisite selection is being prepared with care.</p>
            {orderNumber && (
              <p className="text-lg mb-10">
                Order <span className="font-sans font-semibold text-gold">{orderNumber}</span>
              </p>
            )}
            <p className="text-sm text-muted font-light mb-12 leading-relaxed">
              We will contact you shortly to confirm. For any queries, reach us on WhatsApp or email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/catalog" className="luxury-btn flex-1 text-center">Continue Shopping</Link>
              <Link href="/contact" className="luxury-btn-outline flex-1 text-center">Contact Us</Link>
            </div>
          </FadeIn>
        </main>
      </div>
    </>
  );
}
