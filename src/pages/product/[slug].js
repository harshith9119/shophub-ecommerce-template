import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import PageHead from '../../components/PageHead';
import SectionHeader from '../../components/ui/SectionHeader';
import { FadeIn } from '../../components/motion/Reveal';
import { getProductBySlug, getAllProducts } from '../../lib/db';
import { useCart } from '../../context/CartContext';
import { formatPrice, calcDiscount } from '../../lib/utils';
import { optimizeImageUrl } from '../../lib/optimizeImage';
import SiteImage from '../../components/SiteImage';
import { SEED_PRODUCTS } from '../../lib/seedProducts';

export default function ProductPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [[page, direction], setPage] = useState([0, 0]);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug).then((p) => {
      setProduct(p || SEED_PRODUCTS.find((s) => s.slug === slug) || null);
    });
    getAllProducts().then((all) => {
      const list = all.length ? all : SEED_PRODUCTS;
      setRelated(list.filter((p) => p.slug !== slug).slice(0, 4));
    });
  }, [slug]);

  if (!product && slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-page">
        <p className="font-serif text-2xl text-emerald">Piece not found</p>
        <Link href="/catalog" className="luxury-link">Back to Collection</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const discount = calcDiscount(product.salePrice, product.regularPrice);
  const soldOut = product.status === 'Sold out';
  
  const activeImageIndex = Math.abs(page % images.length);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const nextImage = () => paginate(1);
  const prevImage = () => paginate(-1);
  const setExactImage = (index) => {
    setPage([index, index > activeImageIndex ? 1 : -1]);
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const handleAdd = () => {
    if (soldOut) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <>
      <PageHead title={product.title} description={product.description} />
      <div className="bg-page min-h-screen transition-colors duration-500">
        <Navbar />

        <main className="luxury-container pt-32 pb-20 md:pt-40">
          <FadeIn>
            <Link href="/catalog" className="inline-flex items-center gap-2 text-muted hover:text-emerald text-[11px] font-sans uppercase tracking-wide mb-10 transition-colors">
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Collection
            </Link>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery */}
            <FadeIn direction="right">
              <div className="sticky top-32">
                <div className="relative w-full overflow-hidden group rounded-xl">
                  <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] flex items-center justify-center bg-surface/30 dark:bg-black/20">
                    <AnimatePresence initial={false} custom={direction}>
                      <motion.div
                        key={page}
                        custom={direction}
                        variants={{
                          enter: (direction) => ({
                            x: direction > 0 ? '100%' : '-100%',
                            opacity: 0,
                            scale: 0.95
                          }),
                          center: {
                            zIndex: 1,
                            x: 0,
                            opacity: 1,
                            scale: 1
                          },
                          exit: (direction) => ({
                            zIndex: 0,
                            x: direction < 0 ? '100%' : '-100%',
                            opacity: 0,
                            scale: 0.95
                          })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 },
                          scale: { duration: 0.4 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                          const swipe = swipePower(offset.x, velocity.x);
                          if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                          } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                      >
                        <SiteImage
                          src={images[activeImageIndex]}
                          alt={product.title}
                          className="w-full h-full object-contain pointer-events-none"
                          width={960}
                          context="product"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/80 rounded-full flex items-center justify-center text-charcoal dark:text-cream opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/80 rounded-full flex items-center justify-center text-charcoal dark:text-cream opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
                        aria-label="Next image"
                      >
                        <ChevronLeft className="w-5 h-5 rotate-180" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 mt-4">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setExactImage(i)}
                        className={`w-20 h-24 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                          activeImageIndex === i ? 'ring-2 ring-gold ring-offset-2 ring-offset-page' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <SiteImage src={img} alt="" className="w-full h-full object-cover object-top pointer-events-none" width={160} context="thumb" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Details */}
            <FadeIn direction="left" delay={0.15}>
              <div className="lg:pt-8">
                {product.category && (
                  <p className="luxury-subheading mb-4">{product.category}</p>
                )}
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-emerald font-medium leading-tight mb-6">
                  {product.title}
                </h1>

                {product.rating && (
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'text-cream'}`} strokeWidth={0} />
                    ))}
                    <span className="text-sm text-muted ml-2 font-light">({product.reviewCount || 0} reviews)</span>
                  </div>
                )}

                <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-cream">
                  <span className="font-sans text-3xl font-semibold text-body">{formatPrice(product.salePrice)}</span>
                  {product.regularPrice > product.salePrice && (
                    <>
                      <span className="text-lg text-muted line-through font-light">{formatPrice(product.regularPrice)}</span>
                      <span className="bg-gold/10 text-gold-dark text-[10px] font-sans font-semibold uppercase tracking-wide px-3 py-1.5">
                        Save {formatPrice(discount)}
                      </span>
                    </>
                  )}
                </div>

                {soldOut ? (
                  <span className="inline-block bg-charcoal/10 dark:bg-white/10 text-body text-[10px] font-sans font-semibold uppercase tracking-luxury px-5 py-3 mb-8">
                    Sold Out
                  </span>
                ) : (
                  <>
                    <div className="flex items-center gap-6 mb-8">
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wide text-muted">Quantity</span>
                      <div className="flex items-center border border-cream">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-cream transition-colors">
                          <Minus className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <span className="px-6 py-3 font-sans font-medium min-w-[3rem] text-center">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:bg-cream transition-colors">
                          <Plus className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleAdd}
                        className={`luxury-btn flex-1 ${added ? 'bg-emerald-light' : ''}`}
                      >
                        {added ? <><Check className="w-4 h-4" /> Added to Bag</> : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
                      </motion.button>
                      <Link href="/cart" className="luxury-btn-outline flex-1 text-center">View Bag</Link>
                    </div>
                  </>
                )}

                {product.fullDescription && (
                  <div className="prose-policy border-t border-cream pt-10" dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
                )}
              </div>
            </FadeIn>
          </div>

          {related.length > 0 && (
            <section className="mt-28 pt-20 border-t border-cream">
              <FadeIn>
                <SectionHeader eyebrow="You May Also Love" title="Complete the Look" align="center" />
              </FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {related.map((p, i) => (
                  <ProductCard key={p.id || p.slug} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
